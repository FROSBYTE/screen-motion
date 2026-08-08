'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Download, Film, X, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { useMGState, getSceneDuration } from '../store';

interface ExportVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ExportVideoModal({ isOpen, onClose }: ExportVideoModalProps) {
  const { state, seekTo, play, pause, getSceneAtTime } = useMGState();
  const { scenes } = state;

  const [fps, setFps] = useState<number>(60);
  const [resolution, setResolution] = useState<'1080p' | '720p'>('1080p');

  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [exportedFileName, setExportedFileName] = useState('');

  const stateRef = useRef(state);
  stateRef.current = state;
  const animFrameIdRef = useRef<number | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);

  // Total project duration in seconds
  const totalDuration = useMemo(() => {
    const dur = scenes.reduce((sum, s) => sum + getSceneDuration(s), 0);
    return Math.max(dur, 2);
  }, [scenes]);

  // Reset state whenever modal is opened
  useEffect(() => {
    if (isOpen) {
      setDownloadUrl(null);
      setIsExporting(false);
      setProgress(0);
      setStatusText('');
    }
  }, [isOpen]);

  const handleClose = () => {
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }
    if (recorderRef.current && recorderRef.current.state === 'recording') {
      try {
        recorderRef.current.stop();
      } catch {
        // ignore recorder stop error
      }
    }
    pause();
    setDownloadUrl(null);
    setIsExporting(false);
    setProgress(0);
    setStatusText('');
    onClose();
  };

  if (!isOpen) return null;

  const handleExport = async () => {
    setIsExporting(true);
    setProgress(0);
    setStatusText('Preparing video recording stream...');
    setDownloadUrl(null);

    const wrapper = (document.querySelector('[data-motion-canvas-wrapper]') ||
      document.querySelector('[data-motion-canvas]')) as HTMLElement | null;

    if (!wrapper) {
      alert('Could not find motion canvas element.');
      setIsExporting(false);
      return;
    }

    try {
      const targetWidth = resolution === '1080p' ? 1920 : 1280;
      const targetHeight = resolution === '1080p' ? 1080 : 720;
      const actualDurationMs = totalDuration * 1000;

      // 1. Create offscreen composite canvas for stream capture
      const compositeCanvas = document.createElement('canvas');
      compositeCanvas.width = targetWidth;
      compositeCanvas.height = targetHeight;
      const ctx = compositeCanvas.getContext('2d')!;

      // 2. Capture canvas stream at target FPS
      const stream = compositeCanvas.captureStream(fps);

      // 3. Determine supported MP4 / WebM MIME type
      let mimeType = 'video/mp4;codecs=avc1.42E01E';
      if (typeof MediaRecorder !== 'undefined') {
        if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = 'video/mp4';
        if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = 'video/webm;codecs=h264';
        if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = 'video/webm;codecs=vp9';
        if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = 'video/webm';
        if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = '';
      }

      const targetBitrate = resolution === '1080p' ? 18_000_000 : 8_000_000;

      const recorder = new MediaRecorder(
        stream,
        mimeType
          ? { mimeType, videoBitsPerSecond: targetBitrate }
          : { videoBitsPerSecond: targetBitrate }
      );
      recorderRef.current = recorder;

      const chunks: Blob[] = [];
      let animFrameId: number;

      // 4. Synchronous real-time frame renderer
      const renderCompositeFrame = () => {
        const currentMs = stateRef.current.currentTime;
        const currentSceneInfo = getSceneAtTime(currentMs);
        const bgColor = currentSceneInfo?.scene.bgColor || '#0f0f0f';

        // 1. Fill background color
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, targetWidth, targetHeight);

        // 2. Synchronous DOM layer compositor (draws DOM backgrounds & text BEFORE WebGL canvas overlay)
        const containerRect = wrapper.getBoundingClientRect();
        if (containerRect.width > 0 && containerRect.height > 0) {
          const scaleX = targetWidth / containerRect.width;
          const scaleY = targetHeight / containerRect.height;

          // Find all visible element nodes in the canvas
          const elements = Array.from(wrapper.querySelectorAll('*')) as HTMLElement[];

          elements.forEach((el) => {
            // Skip canvas and wrapper container itself
            if (el === wrapper || el.tagName === 'CANVAS' || el.tagName === 'SCRIPT' || el.tagName === 'STYLE') return;

            const rect = el.getBoundingClientRect();
            if (rect.width <= 0 || rect.height <= 0) return;

            const style = window.getComputedStyle(el);
            if (style.visibility === 'hidden' || style.display === 'none' || parseFloat(style.opacity || '1') <= 0) return;

            // Skip full-screen container wrappers so background rects don't overwrite 3D overlays
            const isFullWrapper = rect.width >= containerRect.width - 2 && rect.height >= containerRect.height - 2;

            // Draw background fill for pills/cards/containers
            if (!isFullWrapper && style.backgroundColor && style.backgroundColor !== 'rgba(0, 0, 0, 0)' && style.backgroundColor !== 'transparent') {
              const x = (rect.left - containerRect.left) * scaleX;
              const y = (rect.top - containerRect.top) * scaleY;
              const w = rect.width * scaleX;
              const h = rect.height * scaleY;
              const borderRadius = parseFloat(style.borderRadius || '0') * scaleY;

              ctx.save();
              ctx.fillStyle = style.backgroundColor;
              if (style.border && style.border !== 'none') {
                ctx.strokeStyle = style.borderColor || 'rgba(255,255,255,0.1)';
                ctx.lineWidth = parseFloat(style.borderWidth || '1') * scaleY;
              }
              if (borderRadius > 0) {
                ctx.beginPath();
                if (typeof (ctx as any).roundRect === 'function') {
                  (ctx as any).roundRect(x, y, w, h, borderRadius);
                } else {
                  ctx.rect(x, y, w, h);
                }
                ctx.fill();
              } else {
                ctx.fillRect(x, y, w, h);
              }
              ctx.restore();
            }

            // Draw text for text elements
            const hasDirectTextNode = Array.from(el.childNodes).some(
              (n) => n.nodeType === Node.TEXT_NODE && (n.textContent || '').trim().length > 0
            );

            if (hasDirectTextNode) {
              const textContent = Array.from(el.childNodes)
                .filter((n) => n.nodeType === Node.TEXT_NODE)
                .map((n) => n.textContent)
                .join('')
                .trim();

              if (textContent) {
                const x = (rect.left + rect.width / 2 - containerRect.left) * scaleX;
                const y = (rect.top + rect.height / 2 - containerRect.top) * scaleY;

                const fontSize = Math.max(10, parseFloat(style.fontSize || '16') * scaleY);
                const fontFamily = style.fontFamily || '"Plus Jakarta Sans", sans-serif';
                const fontWeight = style.fontWeight || '700';
                const fontStyle = style.fontStyle || 'normal';

                ctx.save();
                ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
                ctx.fillStyle = style.color || '#ffffff';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(textContent, x, y);
                ctx.restore();
              }
            }
          });
        }

        // 3. Render ALL 3D WebGL Canvases ON TOP of scene background & DOM elements (Phone Device 3D Canvas, Drei Canvas, etc.)
        const webglCanvases = Array.from(wrapper.querySelectorAll('canvas')) as HTMLCanvasElement[];
        webglCanvases.forEach((webglCanvas) => {
          if (webglCanvas && webglCanvas !== compositeCanvas) {
            try {
              ctx.drawImage(webglCanvas, 0, 0, targetWidth, targetHeight);
            } catch {
              // ignore WebGL draw error
            }
          }
        });

        animFrameId = requestAnimationFrame(renderCompositeFrame);
        animFrameIdRef.current = animFrameId;
      };

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      const filename = `motion-graphic-${Date.now()}.mp4`;
      setExportedFileName(filename);

      recorder.onstop = () => {
        cancelAnimationFrame(animFrameId);
        stream.getTracks().forEach((t) => t.stop());

        const blob = new Blob(chunks, { type: 'video/mp4' });
        const url = URL.createObjectURL(blob);
        setDownloadUrl(url);

        // Auto trigger download
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        setStatusText('MP4 Export Complete!');
        setIsExporting(false);
      };

      // Reset to start time 0 and trigger playback
      pause();
      seekTo(0);

      // Give React 100ms to render frame 0 before starting recorder
      setTimeout(() => {
        play();
        recorder.start();
        renderCompositeFrame();

        const updateInterval = 100;
        let elapsed = 0;

        const interval = setInterval(() => {
          elapsed += updateInterval;
          const p = Math.min(Math.floor((elapsed / actualDurationMs) * 90) + 10, 99);
          setProgress(p);
          setStatusText(`Rendering Motion Graphic... ${p}%`);
        }, updateInterval);

        setTimeout(() => {
          clearInterval(interval);
          pause();
          if (recorder.state === 'recording') {
            recorder.stop();
          }
        }, actualDurationMs + 400);
      }, 100);

    } catch (err) {
      console.error('Export video error:', err);
      alert('An error occurred during video export. Please try again.');
      setIsExporting(false);
      pause();
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      background: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '460px',
        background: '#181824',
        border: '1px solid #2a2a3c',
        borderRadius: '18px',
        boxShadow: '0 25px 80px rgba(0, 0, 0, 0.85)',
        overflow: 'hidden',
        color: '#f8fafc',
        fontFamily: '"Plus Jakarta Sans", sans-serif',
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid #222232',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#181824',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Film size={18} style={{ color: '#facc15' }} />
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#f8fafc' }}>
              Export MP4 Video
            </h3>
          </div>
          {!isExporting && (
            <button
              onClick={handleClose}
              style={{
                background: '#222232',
                border: '1px solid #2a2a3c',
                color: '#f8fafc',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Body */}
        <div style={{ padding: '20px' }}>
          {!isExporting && !downloadUrl && (
            <>
              {/* Project Info */}
              <div style={{
                background: 'rgba(250, 204, 21, 0.08)',
                border: '1px solid rgba(250, 204, 21, 0.25)',
                borderRadius: '10px',
                padding: '12px 14px',
                marginBottom: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <div>
                  <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '2px', fontWeight: 600 }}>
                    PROJECT DURATION
                  </span>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#f8fafc' }}>
                    {totalDuration.toFixed(1)} seconds ({scenes.length} Scenes)
                  </span>
                </div>
                <Sparkles size={20} style={{ color: '#facc15' }} />
              </div>

              {/* Format Indicator */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  VIDEO FORMAT
                </label>
                <div style={{
                  padding: '10px 14px',
                  background: '#222232',
                  border: '1px solid #2a2a3c',
                  borderRadius: '8px',
                  color: '#f8fafc',
                  fontSize: '13px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#facc15' }} />
                  MP4 Video (.mp4)
                </div>
              </div>

              {/* Resolution & FPS */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '22px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                    RESOLUTION
                  </label>
                  <select
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value as any)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      background: '#222232',
                      border: '1px solid #2a2a3c',
                      borderRadius: '8px',
                      color: '#f8fafc',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      outline: 'none',
                    }}
                  >
                    <option value="1080p" style={{ background: '#222232', color: '#f8fafc' }}>1080p (Full HD)</option>
                    <option value="720p" style={{ background: '#222232', color: '#f8fafc' }}>720p (HD)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                    FRAME RATE
                  </label>
                  <select
                    value={fps}
                    onChange={(e) => setFps(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '10px',
                      background: '#222232',
                      border: '1px solid #2a2a3c',
                      borderRadius: '8px',
                      color: '#f8fafc',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      outline: 'none',
                    }}
                  >
                    <option value={60} style={{ background: '#222232', color: '#f8fafc' }}>60 FPS (Smooth)</option>
                    <option value={30} style={{ background: '#222232', color: '#f8fafc' }}>30 FPS (Standard)</option>
                  </select>
                </div>
              </div>

              {/* Export Button */}
              <button
                onClick={handleExport}
                style={{
                  width: '100%',
                  padding: '13px',
                  background: 'linear-gradient(135deg, #facc15 0%, #eab308 100%)',
                  border: 'none',
                  borderRadius: '10px',
                  color: '#0f172a',
                  fontSize: '14px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 20px rgba(234, 179, 8, 0.35)',
                }}
              >
                <Download size={16} /> Export MP4 Video
              </button>
            </>
          )}

          {/* Export Progress */}
          {isExporting && (
            <div style={{ textAlign: 'center', padding: '20px 10px' }}>
              <div style={{ position: 'relative', width: '70px', height: '70px', margin: '0 auto 16px auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 size={48} className="animate-spin" style={{ color: '#facc15' }} />
                <span style={{ position: 'absolute', fontSize: '13px', fontWeight: 800, color: '#f8fafc' }}>{progress}%</span>
              </div>

              <h4 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: 700, color: '#f8fafc' }}>
                Rendering MP4 Video...
              </h4>
              <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>{statusText}</p>

              <div style={{
                width: '100%',
                height: '8px',
                background: '#222232',
                borderRadius: '4px',
                overflow: 'hidden',
                marginTop: '20px',
              }}>
                <div style={{
                  height: '100%',
                  width: `${progress}%`,
                  background: 'linear-gradient(90deg, #facc15, #eab308)',
                  borderRadius: '4px',
                  transition: 'width 0.2s ease',
                }} />
              </div>
            </div>
          )}

          {/* Export Complete View */}
          {!isExporting && downloadUrl && (
            <div style={{ textAlign: 'center', padding: '16px 10px' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 14px auto',
              }}>
                <CheckCircle2 size={28} />
              </div>

              <h4 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: 700, color: '#f8fafc' }}>
                MP4 Export Complete!
              </h4>
              <p style={{ margin: '0 0 16px 0', fontSize: '12px', color: '#94a3b8' }}>
                Your MP4 video <strong style={{ color: '#f8fafc' }}>{exportedFileName}</strong> has been downloaded.
              </p>

              <div style={{ display: 'flex', gap: '10px' }}>
                <a
                  href={downloadUrl}
                  download={exportedFileName}
                  style={{
                    flex: 1,
                    padding: '11px',
                    background: 'linear-gradient(135deg, #facc15 0%, #eab308 100%)',
                    borderRadius: '8px',
                    color: '#0f172a',
                    fontSize: '13px',
                    fontWeight: 800,
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 16px rgba(234, 179, 8, 0.35)',
                  }}
                >
                  <Download size={14} /> Download Again
                </a>
                <button
                  onClick={() => setDownloadUrl(null)}
                  style={{
                    flex: 1,
                    padding: '11px',
                    background: '#222232',
                    border: '1px solid #2a2a3c',
                    borderRadius: '8px',
                    color: '#f8fafc',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Change FPS / Settings
                </button>
                <button
                  onClick={handleClose}
                  style={{
                    padding: '11px 16px',
                    background: '#272730',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
