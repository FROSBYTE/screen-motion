'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Download, Film, X, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import BasicDropdown from '@/components/ui/smoothui/basic-dropdown';
import { useMGState, getSceneDuration } from '../store';

interface ExportVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ExportVideoModal({ isOpen, onClose }: ExportVideoModalProps) {
  const { state, seekTo, play, pause, getSceneAtTime } = useMGState();
  const { scenes } = state;

  const fps = 30;
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
      const imageCache = new Map<string, HTMLImageElement>();

      const getOrLoadImage = (url: string): HTMLImageElement | null => {
        if (!url) return null;
        let img = imageCache.get(url);
        if (!img) {
          img = new Image();
          img.crossOrigin = 'anonymous';
          img.src = url;
          imageCache.set(url, img);
        }
        return img.complete && img.naturalWidth > 0 ? img : null;
      };

  const drawCoverImage = (ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number) => {
    const imgRatio = img.naturalWidth / img.naturalHeight;
    const containerRatio = w / h;
    let sw = img.naturalWidth;
    let sh = img.naturalHeight;
    let sx = 0;
    let sy = 0;

    if (imgRatio > containerRatio) {
      sw = sh * containerRatio;
      sx = (img.naturalWidth - sw) / 2;
    } else {
      sh = sw / containerRatio;
      sy = (img.naturalHeight - sh) / 2;
    }

    ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
  };

      // Helper to compute accumulated opacity across parent hierarchy up to wrapper
      const getAccumulatedOpacity = (el: HTMLElement, wrapperEl: HTMLElement) => {
        let accum = 1;
        let curr: HTMLElement | null = el;
        while (curr && curr !== wrapperEl) {
          const op = parseFloat(window.getComputedStyle(curr).opacity || '1');
          accum *= op;
          curr = curr.parentElement;
        }
        return accum;
      };

      // Helper to apply ancestor CSS clipPath (clip-wipe, iris, iris-click transitions)
      const applyAncestorClip = (el: HTMLElement, wrapperEl: HTMLElement, ctx: CanvasRenderingContext2D, targetWidth: number, targetHeight: number) => {
        let curr: HTMLElement | null = el;
        while (curr && curr !== wrapperEl) {
          const style = window.getComputedStyle(curr);
          const clipPath = style.clipPath;
          if (clipPath && clipPath !== 'none') {
            if (clipPath.includes('inset')) {
              const match = clipPath.match(/inset\(([^)]+)\)/);
              if (match) {
                const parts = match[1].trim().split(/\s+/);
                const topStr = parts[0] || '0';
                const rightStr = parts[1] || topStr;
                const bottomStr = parts[2] || topStr;
                const leftStr = parts[3] || rightStr;

                const parseVal = (str: string, maxDim: number) => {
                  if (str.endsWith('%')) return (parseFloat(str) / 100) * maxDim;
                  return parseFloat(str) || 0;
                };

                const top = parseVal(topStr, targetHeight);
                const right = parseVal(rightStr, targetWidth);
                const bottom = parseVal(bottomStr, targetHeight);
                const left = parseVal(leftStr, targetWidth);

                ctx.beginPath();
                ctx.rect(left, top, Math.max(0, targetWidth - left - right), Math.max(0, targetHeight - top - bottom));
                ctx.clip();
              }
            } else if (clipPath.includes('circle')) {
              const match = clipPath.match(/circle\(([^)]+)\)/);
              if (match) {
                const content = match[1];
                const radiusMatch = content.match(/([0-9.]+)%/);
                const atMatch = content.match(/at\s+([0-9.]+)%\s+([0-9.]+)%/);
                if (radiusMatch) {
                  const rPercent = parseFloat(radiusMatch[1]);
                  const r = (rPercent / 100) * targetWidth;
                  const cxPercent = atMatch ? parseFloat(atMatch[1]) : 50;
                  const cyPercent = atMatch ? parseFloat(atMatch[2]) : 50;
                  const cx = (cxPercent / 100) * targetWidth;
                  const cy = (cyPercent / 100) * targetHeight;

                  ctx.beginPath();
                  ctx.arc(cx, cy, Math.max(0, r), 0, Math.PI * 2);
                  ctx.clip();
                }
              }
            }
          }
          curr = curr.parentElement;
        }
      };

      // 4. Deterministic frame renderer for ultra-smooth 60fps video export
      const renderSingleFrame = (timeSec: number) => {
        seekTo(timeSec);
        const currentSceneInfo = getSceneAtTime(timeSec);
        const bgColor = currentSceneInfo?.scene.bgColor || '#0f0f0f';

        // 1. Fill background color & draw scene background image
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, targetWidth, targetHeight);

        if (currentSceneInfo?.scene.bgImage) {
          const bgImg = getOrLoadImage(currentSceneInfo.scene.bgImage);
          if (bgImg) {
            ctx.save();
            drawCoverImage(ctx, bgImg, 0, 0, targetWidth, targetHeight);
            ctx.restore();
          }
        }

        // 2. Synchronous DOM layer compositor
        const containerRect = wrapper.getBoundingClientRect();
        if (containerRect.width > 0 && containerRect.height > 0) {
          const scaleX = targetWidth / containerRect.width;
          const scaleY = targetHeight / containerRect.height;
          const elements = Array.from(wrapper.querySelectorAll('*')) as HTMLElement[];

          elements.forEach((el) => {
            if (el === wrapper || el.tagName === 'CANVAS' || el.tagName === 'SCRIPT' || el.tagName === 'STYLE') return;

            const rect = el.getBoundingClientRect();
            if (rect.width <= 0 || rect.height <= 0) return;

            const opacity = getAccumulatedOpacity(el, wrapper);
            const style = window.getComputedStyle(el);
            if (style.visibility === 'hidden' || style.display === 'none' || opacity <= 0.01) return;

            const isFullWrapper = rect.width >= containerRect.width - 2 && rect.height >= containerRect.height - 2;

            if (!isFullWrapper && style.backgroundColor && style.backgroundColor !== 'rgba(0, 0, 0, 0)' && style.backgroundColor !== 'transparent') {
              const x = (rect.left - containerRect.left) * scaleX;
              const y = (rect.top - containerRect.top) * scaleY;
              const w = rect.width * scaleX;
              const h = rect.height * scaleY;
              const borderRadius = parseFloat(style.borderRadius || '0') * scaleY;

              ctx.save();
              ctx.globalAlpha = opacity;
              applyAncestorClip(el, wrapper, ctx, targetWidth, targetHeight);
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

            if (style.backgroundImage && style.backgroundImage !== 'none') {
              const match = style.backgroundImage.match(/url\(["']?([^"']+)["']?\)/);
              if (match && match[1]) {
                const imgUrl = match[1];
                const bgImg = getOrLoadImage(imgUrl);
                if (bgImg) {
                  const x = (rect.left - containerRect.left) * scaleX;
                  const y = (rect.top - containerRect.top) * scaleY;
                  const w = rect.width * scaleX;
                  const h = rect.height * scaleY;
                  const borderRadius = parseFloat(style.borderRadius || '0') * scaleY;

                  ctx.save();
                  ctx.globalAlpha = opacity;
                  applyAncestorClip(el, wrapper, ctx, targetWidth, targetHeight);
                  if (borderRadius > 0) {
                    ctx.beginPath();
                    if (typeof (ctx as any).roundRect === 'function') {
                      (ctx as any).roundRect(x, y, w, h, borderRadius);
                    } else {
                      ctx.rect(x, y, w, h);
                    }
                    ctx.clip();
                  }
                  drawCoverImage(ctx, bgImg, x, y, w, h);
                  ctx.restore();
                }
              }
            }

            if (el.tagName === 'VIDEO') {
              const videoEl = el as HTMLVideoElement;
              if (videoEl.readyState >= 1) {
                const x = (rect.left - containerRect.left) * scaleX;
                const y = (rect.top - containerRect.top) * scaleY;
                const w = rect.width * scaleX;
                const h = rect.height * scaleY;
                const borderRadius = parseFloat(style.borderRadius || '0') * scaleY;

                ctx.save();
                ctx.globalAlpha = opacity;
                applyAncestorClip(el, wrapper, ctx, targetWidth, targetHeight);
                if (borderRadius > 0) {
                  ctx.beginPath();
                  if (typeof (ctx as any).roundRect === 'function') {
                    (ctx as any).roundRect(x, y, w, h, borderRadius);
                  } else {
                    ctx.rect(x, y, w, h);
                  }
                  ctx.clip();
                }
                ctx.drawImage(videoEl, x, y, w, h);
                ctx.restore();
              }
            }

            if (el.tagName === 'IMG') {
              const imgEl = el as HTMLImageElement;
              if (imgEl.complete && imgEl.naturalWidth > 0) {
                const x = (rect.left - containerRect.left) * scaleX;
                const y = (rect.top - containerRect.top) * scaleY;
                const w = rect.width * scaleX;
                const h = rect.height * scaleY;
                const borderRadius = parseFloat(style.borderRadius || '0') * scaleY;

                ctx.save();
                ctx.globalAlpha = opacity;
                applyAncestorClip(el, wrapper, ctx, targetWidth, targetHeight);
                if (borderRadius > 0) {
                  ctx.beginPath();
                  if (typeof (ctx as any).roundRect === 'function') {
                    (ctx as any).roundRect(x, y, w, h, borderRadius);
                  } else {
                    ctx.rect(x, y, w, h);
                  }
                  ctx.clip();
                }
                ctx.drawImage(imgEl, x, y, w, h);
                ctx.restore();
              }
            }

            if (el.tagName === 'svg' || el.tagName === 'SVG') {
              try {
                const svgEl = el as unknown as SVGElement;
                const svgString = new XMLSerializer().serializeToString(svgEl);
                const svgUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgString);
                const svgImg = getOrLoadImage(svgUrl);
                if (svgImg) {
                  const x = (rect.left - containerRect.left) * scaleX;
                  const y = (rect.top - containerRect.top) * scaleY;
                  const w = rect.width * scaleX;
                  const h = rect.height * scaleY;

                  ctx.save();
                  ctx.globalAlpha = opacity;
                  applyAncestorClip(el, wrapper, ctx, targetWidth, targetHeight);
                  ctx.drawImage(svgImg, x, y, w, h);
                  ctx.restore();
                }
              } catch {
                // ignore SVG error
              }
            }

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
                ctx.globalAlpha = opacity;
                applyAncestorClip(el, wrapper, ctx, targetWidth, targetHeight);
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

        // 3. Render WebGL 3D Canvas (Phone Device 3D canvas, etc.)
        const webglCanvases = Array.from(wrapper.querySelectorAll('canvas')) as HTMLCanvasElement[];
        webglCanvases.forEach((webglCanvas) => {
          if (webglCanvas && webglCanvas !== compositeCanvas) {
            try {
              const opacity = getAccumulatedOpacity(webglCanvas, wrapper);
              if (opacity <= 0.01) return;

              ctx.save();
              ctx.globalAlpha = opacity;
              applyAncestorClip(webglCanvas, wrapper, ctx, targetWidth, targetHeight);
              ctx.drawImage(webglCanvas, 0, 0, targetWidth, targetHeight);
              ctx.restore();
            } catch {
              // ignore WebGL draw error
            }
          }
        });
      };

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      const filename = `motion-graphic-${Date.now()}.mp4`;
      setExportedFileName(filename);

      recorder.onstop = () => {
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

      // Reset & step frame by frame for ultra-smooth 60fps export
      pause();
      seekTo(0);

      const totalFrames = Math.ceil(totalDuration * fps);
      const frameStep = 1 / fps;
      let currentFrame = 0;

      recorder.start();

      const stepFrame = () => {
        if (currentFrame > totalFrames) {
          if (recorder.state === 'recording') {
            recorder.stop();
          }
          return;
        }

        const timeSec = Math.min(currentFrame * frameStep, totalDuration);
        renderSingleFrame(timeSec);

        const videoTrack = stream.getVideoTracks()[0];
        if (videoTrack && 'requestFrame' in videoTrack) {
          (videoTrack as any).requestFrame();
        }

        const p = Math.min(Math.floor((currentFrame / totalFrames) * 90) + 10, 99);
        setProgress(p);
        setStatusText(`Rendering MP4 Video (${p}%)`);

        currentFrame++;
        setTimeout(stepFrame, 1000 / (fps * 1.5));
      };

      setTimeout(stepFrame, 100);

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
        background: '#222831',
        border: '1px solid #393E46',
        borderRadius: '18px',
        boxShadow: '0 25px 80px rgba(0, 0, 0, 0.85)',
        overflow: 'hidden',
        color: '#EEEEEE',
        fontFamily: '"Plus Jakarta Sans", sans-serif',
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid #393E46',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#222831',
        }}>
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#EEEEEE' }}>
            Export Video
          </h3>
          {!isExporting && (
            <button
              onClick={handleClose}
              className="mg-btn-interactive"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted, #a0aab5)',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#ffffff';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-muted, #a0aab5)';
                e.currentTarget.style.background = 'transparent';
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
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', fontSize: '13px' }}>
                <span style={{ color: '#a0aab5', fontWeight: 500 }}>Duration</span>
                <span style={{ color: '#EEEEEE', fontWeight: 600 }}>{totalDuration.toFixed(1)}s</span>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '12px', color: '#a0aab5', fontWeight: 500, display: 'block', marginBottom: '6px' }}>
                  Resolution
                </label>
                <BasicDropdown
                  items={[
                    { id: '1080p', label: '1080p (Full HD)' },
                    { id: '720p', label: '720p (HD)' },
                  ]}
                  value={resolution}
                  onChange={(val) => setResolution(val as any)}
                />
              </div>

              <button
                onClick={handleExport}
                className="mg-btn-interactive"
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#000000',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 2px 10px rgba(255, 255, 255, 0.15)',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(255, 255, 255, 0.35)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 2px 10px rgba(255, 255, 255, 0.15)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <Download size={15} /> Export Video
              </button>
            </>
          )}

          {/* Export Progress */}
          {isExporting && (
            <div style={{ textAlign: 'center', padding: '24px 12px 16px' }}>
              <div style={{ width: '48px', height: '48px', margin: '0 auto 16px auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 size={42} className="animate-spin" style={{ color: '#FFFFFF' }} />
              </div>

              <h4 style={{ margin: '0', fontSize: '15px', fontWeight: 700, color: '#EEEEEE' }}>
                Rendering Video
              </h4>

              <div style={{
                width: '100%',
                height: '6px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '3px',
                overflow: 'hidden',
                marginTop: '20px',
              }}>
                <div style={{
                  height: '100%',
                  width: `${progress}%`,
                  background: '#FFFFFF',
                  borderRadius: '3px',
                  transition: 'width 0.2s ease',
                }} />
              </div>
            </div>
          )}

          {/* Export Complete View */}
          {!isExporting && downloadUrl && (
            <div style={{ textAlign: 'center', padding: '24px 12px 16px' }}>
              <div style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
              }}>
                <CheckCircle2 size={26} />
              </div>

              <h4 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: 700, color: '#EEEEEE' }}>
                Export Complete
              </h4>

              <div style={{ display: 'flex', gap: '10px' }}>
                <a
                  href={downloadUrl}
                  download={exportedFileName}
                  className="mg-btn-interactive"
                  style={{
                    flex: 1,
                    padding: '11px',
                    background: '#FFFFFF',
                    borderRadius: '8px',
                    color: '#000000',
                    fontSize: '13px',
                    fontWeight: 800,
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'all 0.15s ease',
                    boxShadow: '0 2px 8px rgba(255, 255, 255, 0.15)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 14px rgba(255, 255, 255, 0.35)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(255, 255, 255, 0.15)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <Download size={14} /> Download Video
                </a>
                <button
                  onClick={handleClose}
                  className="mg-btn-interactive"
                  style={{
                    padding: '11px 20px',
                    background: 'var(--bg-input, #141414)',
                    border: '1px solid var(--border-color, rgba(255, 255, 255, 0.15))',
                    borderRadius: '8px',
                    color: '#EEEEEE',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'var(--bg-input, #141414)';
                    e.currentTarget.style.borderColor = 'var(--border-color, rgba(255, 255, 255, 0.15))';
                  }}
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
