'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAppState } from '@/store';
import { TEMPLATES } from '@/types';
import { AnimatedTabs, TabItem } from '@/components/ui/animated-tabs';

export default function FloatingTopBar() {
  const { state, dispatch, uploadScreenshot, uploadCloseScreenshot } = useAppState();
  const { resolution, exportStatus, exportProgress, screenshotUrl, screenshot, closeScreenshotUrl, closeScreenshot } = state;

  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [duoMediaTab, setDuoMediaTab] = useState<'open' | 'close'>('open');
  const [exportFps, setExportFps] = useState<30 | 60>(60);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const closeFileInputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const isPickingFileRef = useRef(false);

  // Reset file picking flag when window regains focus after native file dialog closes
  useEffect(() => {
    function handleWindowFocus() {
      setTimeout(() => {
        isPickingFileRef.current = false;
      }, 500);
    }
    window.addEventListener('focus', handleWindowFocus);
    return () => {
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, []);

  // Close the active tab drawer when clicking outside the top panel bar or drawer
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (isPickingFileRef.current) return;
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setActiveTab(null);
      }
    }
    if (activeTab) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeTab]);

  const isExporting = exportStatus === 'rendering' || exportStatus === 'encoding';
  const canExport = !isExporting;

  const handleUploadClick = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    isPickingFileRef.current = true;
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadScreenshot(file);
    }
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      uploadScreenshot(file);
    }
  };

  const handleCloseUploadClick = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    isPickingFileRef.current = true;
    closeFileInputRef.current?.click();
  };

  const handleCloseFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadCloseScreenshot(file);
    }
    e.target.value = '';
  };

  const handleCloseDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      uploadCloseScreenshot(file);
    }
  };

  const handleExport = async () => {
    if (!canExport) return;

    dispatch({ exportStatus: 'rendering', exportProgress: 0 });

    try {
      const canvas = document.querySelector('#preview-3d canvas') as HTMLCanvasElement;
      if (!canvas) {
        throw new Error('Canvas element not found');
      }

      const templateConfig = TEMPLATES.find((t) => t.id === state.template) || { duration: 3 };
      const deviceDurationSec = (templateConfig.duration || 3) / (state.speed || 1);

      // Compute maximum text animation completion time (delay + duration)
      let maxTextDurationSec = 0;
      const ENABLED_ANIMATIONS = new Set(['bottom-up-letters', 'kinetic-center-build', 'line-by-line-slide', 'mask-reveal-up', 'reveal-text', 'short-slide-down', 'blur-out-up', 'soft-blur-in', 'spring-scale-in', 'stagger-from-center', 'depth-parallax-words', 'fade-through', 'focus-blur-resolve', 'micro-scale-fade', 'scale-down-fade', 'per-character-rise', 'per-word-crossfade', 'text-reveal', 'dia-text-reveal', 'typing-animation', 'text-animate']);
      (state.scene.texts || []).forEach((t) => {
        if (t.animationType && t.animationType !== 'none') {
          const delaySec = t.delay || 0;
          const speed = t.animationSpeed ?? 1;
          const textStr = (t.text || '').trim();
          
          const legacyMap: Record<string, string> = { 'fade': 'fade-through', 'slide-up': 'mask-reveal-up', 'typewriter': 'typing-animation', 'scale': 'micro-scale-fade' };
          const effectiveType = legacyMap[t.animationType!] || t.animationType;
          if (!ENABLED_ANIMATIONS.has(effectiveType)) return;
          
          const durationMap: Record<string, number> = {
            'dia-text-reveal': 3.0,
            'typing-animation': textStr.length * 0.1,
            'text-animate': 2.0 + (0.3 * speed),
          };
          
          const maxStagger = Math.max(textStr.length * 0.025 + 0.7, (textStr.split(/\\s+/).length) * 0.07 + 0.7, (textStr.split('\\n').length) * 0.09 + 0.76, 0.6);
          const animDurSec = (durationMap[effectiveType] || maxStagger) / speed;
          
          const endTimeSec = delaySec + animDurSec;
          if (endTimeSec > maxTextDurationSec) {
            maxTextDurationSec = endTimeSec;
          }
        }
      });

      (state.scene.images || []).forEach((img) => {
        if (img.animationType && img.animationType !== 'none') {
          const delaySec = img.delay || 0;
          const speed = img.animationSpeed ?? 1;
          let animDurSec = 1.0 / speed;
          if (img.animationType === 'bounce') {
            animDurSec = 1.2 / speed;
          } else if (img.animationType === 'spin') {
            animDurSec = 1.5 / speed;
          }
          const endTimeSec = delaySec + animDurSec;
          if (endTimeSec > maxTextDurationSec) {
            maxTextDurationSec = endTimeSec;
          }
        }
      });

      // Dynamic total export duration: max of device motion vs overlay animation completion
      const totalExportDurationSec = Math.max(deviceDurationSec, maxTextDurationSec);
      const actualDurationMs = totalExportDurationSec * 1000;

      // Create offscreen composite canvas to merge 3D Canvas + Text Overlays
      const compositeCanvas = document.createElement('canvas');
      compositeCanvas.width = canvas.width;
      compositeCanvas.height = canvas.height;
      const ctx = compositeCanvas.getContext('2d')!;

      // Internal canvas recording stream (no browser permissions or screen record prompts required)
      const stream = compositeCanvas.captureStream(exportFps);
      
      let mimeType = 'video/mp4;codecs=avc1.42E01E';
      if (typeof MediaRecorder !== 'undefined') {
        if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = 'video/mp4';
        if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = 'video/webm;codecs=h264';
        if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = 'video/webm;codecs=vp9';
        if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = 'video/webm';
        if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = '';
      }

      const targetBitrate = state.resolution === '4k' ? 45_000_000 : 18_000_000;

      const recorder = new MediaRecorder(
        stream,
        mimeType
          ? { mimeType, videoBitsPerSecond: targetBitrate }
          : { videoBitsPerSecond: targetBitrate }
      );

      const chunks: Blob[] = [];

      let animFrameId: number;
      const startExportTime = Date.now();

      const renderCompositeFrame = () => {
        // 1. Clear offscreen composite canvas and draw 3D WebGL Canvas
        ctx.clearRect(0, 0, compositeCanvas.width, compositeCanvas.height);
        ctx.drawImage(canvas, 0, 0, compositeCanvas.width, compositeCanvas.height);

        // 2. Render Text and Image Overlays in correct layer order directly onto composite 2D Canvas context
        const container = document.querySelector('#preview-3d') as HTMLElement;
        if (container) {
          const hasTexts = state.scene.texts && state.scene.texts.length > 0;
          const hasImages = state.scene.images && state.scene.images.length > 0;
          if (hasTexts || hasImages) {
            const containerRect = container.getBoundingClientRect();
            const scaleX = compositeCanvas.width / containerRect.width;
            const scaleY = compositeCanvas.height / containerRect.height;

            const textEls = Array.from(container.querySelectorAll('#text-overlay-layer > div')) as HTMLElement[];
            const imgEls = Array.from(container.querySelectorAll('#image-overlay-layer > div')) as HTMLElement[];
            
            const allElements = [...textEls, ...imgEls].sort((a, b) => {
              const orderA = parseFloat(a.getAttribute('data-order') || '0');
              const orderB = parseFloat(b.getAttribute('data-order') || '0');
              return orderA - orderB;
            });

            allElements.forEach((htmlEl) => {
              const type = htmlEl.getAttribute('data-overlay-type');

              // Check outer element transform rotation
              const outerStyle = window.getComputedStyle(htmlEl);
              let rotation = 0;
              if (outerStyle.transform && outerStyle.transform !== 'none') {
                try {
                  const matrix = new DOMMatrix(outerStyle.transform);
                  rotation = Math.atan2(matrix.b, matrix.a);
                } catch (e) {
                  // Ignore DOMMatrix parsing errors
                }
              }

              if (type === 'image' || htmlEl.parentElement?.id === 'image-overlay-layer') {
                const imgEl = htmlEl.querySelector('img') as HTMLImageElement;
                if (!imgEl || !imgEl.complete || imgEl.naturalWidth === 0) return;

                const imgStyle = window.getComputedStyle(imgEl);
                let currentOpacity = parseFloat(imgStyle.opacity || '1');
                let currentEl: HTMLElement | null = imgEl;

                while (currentEl && currentEl !== htmlEl.parentElement) {
                  if (currentEl !== imgEl) {
                    const pStyle = window.getComputedStyle(currentEl);
                    currentOpacity *= parseFloat(pStyle.opacity || '1');
                  }
                  currentEl = currentEl.parentElement;
                }

                if (imgStyle.visibility === 'hidden' || currentOpacity <= 0) return;

                const rect = imgEl.getBoundingClientRect();
                const centerX = (rect.left + rect.width / 2 - containerRect.left) * scaleX;
                const centerY = (rect.top + rect.height / 2 - containerRect.top) * scaleY;
                const drawWidth = rect.width * scaleX;
                const drawHeight = rect.height * scaleY;

                ctx.save();
                ctx.translate(centerX, centerY);
                if (rotation !== 0) ctx.rotate(rotation);
                ctx.globalAlpha = currentOpacity;
                if (imgStyle.filter && imgStyle.filter !== 'none') {
                  ctx.filter = imgStyle.filter;
                }
                ctx.drawImage(imgEl, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
                ctx.restore();
              } else {
                const textInner = htmlEl.querySelector('div') as HTMLElement;
                if (!textInner) return;

                const pendingSpan = textInner.querySelector('[data-delay-pending="true"]');
                if (pendingSpan) return;

                const drawTextNodes = (node: Node) => {
                  if (node.nodeType === Node.TEXT_NODE) {
                    const text = node.textContent?.trim();
                    if (!text) return;

                    const parent = node.parentElement;
                    if (!parent) return;

                    const style = window.getComputedStyle(parent);
                    let currentOpacity = parseFloat(style.opacity || '1');
                    let currentEl: HTMLElement | null = parent;

                    while (currentEl && currentEl !== htmlEl.parentElement) {
                      if (currentEl !== parent) {
                        const pStyle = window.getComputedStyle(currentEl);
                        currentOpacity *= parseFloat(pStyle.opacity || '1');
                      }
                      currentEl = currentEl.parentElement;
                    }

                    if (style.visibility === 'hidden' || currentOpacity <= 0) return;

                    const rect = parent.getBoundingClientRect();
                    const centerX = (rect.left + rect.width / 2 - containerRect.left) * scaleX;
                    const centerY = (rect.top + rect.height / 2 - containerRect.top) * scaleY;

                    ctx.save();
                    ctx.translate(centerX, centerY);
                    if (rotation !== 0) ctx.rotate(rotation);
                    ctx.globalAlpha = currentOpacity;
                    if (style.filter && style.filter !== 'none') {
                      ctx.filter = style.filter;
                    }

                    const fontSize = parseFloat(style.fontSize || '16') * scaleY;
                    const fontFamily = style.fontFamily || 'sans-serif';
                    const fontWeight = style.fontWeight || '700';
                    const fontStyle = style.fontStyle || 'normal';
                    ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
                    ctx.fillStyle = style.color || '#ffffff';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';

                    const lines = text.split('\n');
                    const lineHeight = fontSize * 1.2;
                    const startY = -((lines.length - 1) * lineHeight) / 2;

                    lines.forEach((line, idx) => {
                      ctx.fillText(line, 0, startY + idx * lineHeight);
                    });

                    ctx.restore();
                  } else if (node.nodeType === Node.ELEMENT_NODE) {
                    node.childNodes.forEach(drawTextNodes);
                  }
                };

                drawTextNodes(textInner);
              }
            });
          }
        }

        animFrameId = requestAnimationFrame(renderCompositeFrame);
      };

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        cancelAnimationFrame(animFrameId);
        stream.getTracks().forEach((t) => t.stop());

        const blob = new Blob(chunks, { type: 'video/mp4' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `screen-motion-${state.resolution}-${state.template}-${Date.now()}.mp4`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);


        dispatch({ exportStatus: 'done', exportProgress: 100 });
        setTimeout(() => {
          dispatch({ exportStatus: 'idle', exportProgress: 0 });
        }, 3000);
      };

      // Reset UI selections and trigger scene preview restart
      dispatch({ 
        selectedTextId: null, 
        previewTrigger: Date.now(), 
        exportStatus: 'rendering', 
        exportProgress: 0 
      });

      // Start recording immediately after React completes rendering frame 0
      requestAnimationFrame(() => {
        recorder.start();
        renderCompositeFrame();

        const updateInterval = 100;
        let elapsed = 0;
        const interval = setInterval(() => {
          elapsed += updateInterval;
          const progress = Math.min(Math.floor((elapsed / actualDurationMs) * 90) + 10, 99);
          dispatch({
            exportStatus: elapsed < actualDurationMs * 0.7 ? 'rendering' : 'encoding',
            exportProgress: progress,
          });
        }, updateInterval);

        setTimeout(() => {
          clearInterval(interval);
          if (recorder.state === 'recording') {
            recorder.stop();
          }
        }, actualDurationMs);
      });

    } catch (err) {
      console.error(err);
      dispatch({ exportStatus: 'error', exportProgress: 0 });
    }
  };

  const tabs: TabItem[] = [
    {
      id: 'media',
      label: 'Media',
      icon: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
      ),
    },
    {
      id: 'export',
      label: 'Export',
      icon: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      ),
    },
  ];

  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFSChange = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fsEl = document.fullscreenElement || (document as any).webkitFullscreenElement;
      setIsFullscreen(!!fsEl);
    };
    document.addEventListener('fullscreenchange', handleFSChange);
    document.addEventListener('webkitfullscreenchange', handleFSChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFSChange);
      document.removeEventListener('webkitfullscreenchange', handleFSChange);
    };
  }, []);

  const handlePreview = () => {
    dispatch({ previewTrigger: Date.now() });
  };

  return (
    <div
      ref={panelRef}
      className="floating-top-bar-wrapper"
      style={{
        position: isFullscreen ? 'fixed' : 'absolute',
        top: '24px',
        left: 0,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        pointerEvents: 'none',
      }}
    >
      {/* Sleek Minimalist Floating Top Panel Bar */}
      <div 
        className="top-panel-bar"
        onMouseDown={(e) => e.stopPropagation()}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          backgroundColor: 'rgba(255, 255, 255, 0.88)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          padding: '3px 4px',
          borderRadius: '9999px',
          border: '1px solid rgba(255, 255, 255, 0.5)',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.04)',
          transition: 'all 0.2s ease',
          maxWidth: '100%',
          pointerEvents: 'auto',
        }}
      >
        {/* File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,video/mp4,video/webm,video/quicktime"
          onChange={handleFileChange}
          style={{ display: 'none', pointerEvents: 'auto' }}
        />

        {/* Close Screen File Input */}
        <input
          ref={closeFileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,video/mp4,video/webm,video/quicktime"
          onChange={handleCloseFileChange}
          style={{ display: 'none', pointerEvents: 'auto' }}
        />

        {/* Minimal Play Preview Button */}
        <button
          onClick={handlePreview}
          title="Play Animation Preview"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            backgroundColor: '#0f172a',
            color: '#ffffff',
            border: 'none',
            borderRadius: '9999px',
            padding: '6px 14px',
            fontSize: '12.5px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          className="hover:bg-slate-800 active:scale-[0.97]"
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
          Preview
        </button>

        <AnimatedTabs
          tabs={tabs}
          value={activeTab}
          onValueChange={setActiveTab}
          variant="segment"
        />
      </div>

      {/* Dropdown Contents Drawer */}
      {activeTab && (
        <div 
          className="top-panel-drawer"
          onMouseDown={(e) => e.stopPropagation()}
          style={{
            marginTop: '8px',
            width: '290px',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            borderRadius: '18px',
            border: '1px solid rgba(0, 0, 0, 0.08)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.12), 0 1px 3px rgba(0, 0, 0, 0.05)',
            padding: '16px',
            zIndex: 40,
            pointerEvents: 'auto',
          }}
        >
          {/* Media Content */}
          {activeTab === 'media' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* iPhone Duo Dynamic Sync Header */}
              {state.device === 'iphone-duo' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingBottom: 8, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Screen Sync
                    </span>
                    <button
                      type="button"
                      onClick={() => dispatch({ useSameImageForClose: !(state.useSameImageForClose ?? true) })}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        background: (state.useSameImageForClose ?? true) ? 'rgba(59, 130, 246, 0.1)' : 'rgba(0, 0, 0, 0.04)',
                        border: `1px solid ${(state.useSameImageForClose ?? true) ? 'rgba(59, 130, 246, 0.3)' : 'rgba(0,0,0,0.1)'}`,
                        borderRadius: '16px',
                        padding: '2px 8px',
                        cursor: 'pointer',
                      }}
                    >
                      <span style={{ fontSize: 10.5, fontWeight: 700, color: (state.useSameImageForClose ?? true) ? '#2563eb' : '#64748b' }}>
                        Dynamic (Same)
                      </span>
                      <div style={{
                        width: 22,
                        height: 12,
                        borderRadius: 6,
                        background: (state.useSameImageForClose ?? true) ? '#2563eb' : 'rgba(156, 163, 175, 0.5)',
                        position: 'relative',
                        transition: 'background 0.2s ease',
                      }}>
                        <div style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: '#fff',
                          position: 'absolute',
                          top: 2,
                          left: (state.useSameImageForClose ?? true) ? 12 : 2,
                          transition: 'left 0.2s ease',
                        }} />
                      </div>
                    </button>
                  </div>

                  {state.useSameImageForClose === false && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, background: 'rgba(0,0,0,0.04)', padding: 3, borderRadius: 8 }}>
                      <button
                        type="button"
                        onClick={() => setDuoMediaTab('open')}
                        style={{
                          padding: '5px 8px',
                          fontSize: 11,
                          fontWeight: 700,
                          borderRadius: 6,
                          border: 'none',
                          cursor: 'pointer',
                          background: duoMediaTab === 'open' ? '#ffffff' : 'transparent',
                          color: duoMediaTab === 'open' ? '#0f172a' : '#64748b',
                          boxShadow: duoMediaTab === 'open' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        Open (180°)
                      </button>
                      <button
                        type="button"
                        onClick={() => setDuoMediaTab('close')}
                        style={{
                          padding: '5px 8px',
                          fontSize: 11,
                          fontWeight: 700,
                          borderRadius: 6,
                          border: 'none',
                          cursor: 'pointer',
                          background: duoMediaTab === 'close' ? '#ffffff' : 'transparent',
                          color: duoMediaTab === 'close' ? '#0f172a' : '#64748b',
                          boxShadow: duoMediaTab === 'close' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        Close (0°)
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* View when in Separate mode and 'Close' tab is selected */}
              {state.device === 'iphone-duo' && state.useSameImageForClose === false && duoMediaTab === 'close' ? (
                closeScreenshotUrl ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {state.closeMediaType === 'video' ? (
                      <video
                        src={closeScreenshotUrl}
                        muted
                        loop
                        autoPlay
                        playsInline
                        style={{ width: '100%', height: '130px', borderRadius: 10, objectFit: 'cover', border: '1px solid rgba(0,0,0,0.1)' }}
                      />
                    ) : (
                      <img
                        src={closeScreenshotUrl}
                        alt="Close Screen Preview"
                        style={{ width: '100%', height: '130px', borderRadius: 10, objectFit: 'cover', border: '1px solid rgba(0,0,0,0.1)' }}
                      />
                    )}
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {closeScreenshot?.name || 'Cover Screen Image'}
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        className="show-more-btn"
                        onClick={handleCloseUploadClick}
                        style={{ padding: '6px 12px', fontSize: 12, flex: 1, borderRadius: 8, fontWeight: 600 }}
                      >
                        Replace
                      </button>
                      <button
                        className="show-more-btn"
                        onClick={() => {
                          dispatch({ closeScreenshot: null, closeScreenshotUrl: null, closeMediaType: 'image' });
                        }}
                        style={{ padding: '6px 12px', fontSize: 12, color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)', borderRadius: 8, fontWeight: 600 }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onDragOver={handleDragOver}
                    onDrop={handleCloseDrop}
                    onClick={handleCloseUploadClick}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 8,
                      padding: '12px 8px',
                      border: '1.5px dashed rgba(0, 0, 0, 0.15)',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      backgroundColor: 'rgba(0, 0, 0, 0.02)',
                    }}
                    className="hover:bg-slate-100/80"
                  >
                    <img
                      src="/Drag_And_Drop.png"
                      alt="Drag and drop screenshot"
                      style={{ width: '100%', maxHeight: '110px', objectFit: 'contain', borderRadius: '8px', pointerEvents: 'none' }}
                    />
                    <span style={{ fontSize: 12, color: '#64748b', textAlign: 'center', pointerEvents: 'none' }}>
                      Upload media for the folded Cover Screen (0°).
                    </span>
                    <button
                      className="show-more-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCloseUploadClick();
                      }}
                      style={{ background: '#0f172a', color: '#ffffff', border: 'none', padding: '8px 16px', borderRadius: 8, fontWeight: 600, fontSize: 12, cursor: 'pointer' }}
                    >
                      Upload Close Media
                    </button>
                  </div>
                )
              ) : (
                /* Default / Open Screen Media View */
                screenshotUrl ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {state.mediaType === 'video' ? (
                      <video
                        src={screenshotUrl}
                        muted
                        loop
                        autoPlay
                        playsInline
                        style={{ width: '100%', height: '130px', borderRadius: 10, objectFit: 'cover', border: '1px solid rgba(0,0,0,0.1)' }}
                      />
                    ) : (
                      <img
                        src={screenshotUrl}
                        alt="Preview"
                        style={{ width: '100%', height: '130px', borderRadius: 10, objectFit: 'cover', border: '1px solid rgba(0,0,0,0.1)' }}
                      />
                    )}
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {screenshot?.name || (state.device === 'iphone-duo' && state.useSameImageForClose === false ? 'Inner Screen Media' : 'Active Media')}
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        className="show-more-btn"
                        onClick={handleUploadClick}
                        style={{ padding: '6px 12px', fontSize: 12, flex: 1, borderRadius: 8, fontWeight: 600 }}
                      >
                        Replace
                      </button>
                      <button
                        className="show-more-btn"
                        onClick={() => {
                          dispatch({ screenshot: null, screenshotUrl: null, screenshotOrientation: null, mediaType: 'image', orientationMismatch: false });
                          setActiveTab(null);
                        }}
                        style={{ padding: '6px 12px', fontSize: 12, color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)', borderRadius: 8, fontWeight: 600 }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={handleUploadClick}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 8,
                      padding: '12px 8px',
                      border: '1.5px dashed rgba(0, 0, 0, 0.15)',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      backgroundColor: 'rgba(0, 0, 0, 0.02)',
                    }}
                    className="hover:bg-slate-100/80"
                  >
                    <img
                      src="/Drag_And_Drop.png"
                      alt="Drag and drop screenshot"
                      style={{ width: '100%', maxHeight: '110px', objectFit: 'contain', borderRadius: '8px', pointerEvents: 'none' }}
                    />
                    <span style={{ fontSize: 12, color: '#64748b', textAlign: 'center', pointerEvents: 'none' }}>
                      {state.device === 'iphone-duo' && state.useSameImageForClose === false
                        ? 'Upload media for the inner dual screen (180°).'
                        : 'Click or drag & drop a screenshot or video to display on the 3D device mockup.'}
                    </span>
                    <button
                      className="show-more-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUploadClick();
                      }}
                      style={{ background: '#0f172a', color: '#ffffff', border: 'none', padding: '8px 16px', borderRadius: 8, fontWeight: 600, fontSize: 12, cursor: 'pointer' }}
                    >
                      {state.device === 'iphone-duo' && state.useSameImageForClose === false ? 'Upload Open Media' : 'Upload Media'}
                    </button>
                  </div>
                )
              )}
            </div>
          )}

          {/* Export Content */}
          {activeTab === 'export' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {isExporting ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '6px 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, color: '#1e293b' }}>
                    <span>Exporting Video</span>
                    <span>{exportProgress}%</span>
                  </div>
                  <div style={{ width: '100%', height: 6, background: 'rgba(0,0,0,0.08)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: `${exportProgress}%`, height: '100%', background: '#0f172a', borderRadius: 3 }} />
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '4px 0' }}>
                  <span style={{ fontSize: 12, color: '#64748b' }}>
                    Export your 3D mockup animation into a high-quality MP4 video file.
                  </span>

                  {/* Resolution Selector Pills */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Resolution Quality
                    </label>
                    <div style={{ display: 'flex', gap: 4, backgroundColor: 'rgba(0,0,0,0.04)', padding: 3, borderRadius: 8 }}>
                      <button
                        onClick={() => dispatch({ resolution: '1080p' })}
                        style={{
                          flex: 1,
                          padding: '6px 10px',
                          borderRadius: 6,
                          fontSize: 12,
                          fontWeight: 600,
                          border: 'none',
                          cursor: 'pointer',
                          backgroundColor: resolution === '1080p' ? '#0f172a' : 'transparent',
                          color: resolution === '1080p' ? '#ffffff' : '#64748b',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        1080p Full HD
                      </button>
                      <button
                        onClick={() => dispatch({ resolution: '4k' })}
                        style={{
                          flex: 1,
                          padding: '6px 10px',
                          borderRadius: 6,
                          fontSize: 12,
                          fontWeight: 600,
                          border: 'none',
                          cursor: 'pointer',
                          backgroundColor: resolution === '4k' ? '#0f172a' : 'transparent',
                          color: resolution === '4k' ? '#ffffff' : '#64748b',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        4K Ultra HD
                      </button>
                    </div>
                  </div>

                  {/* FPS Selector Pills */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Frame Rate (FPS)
                    </label>
                    <div style={{ display: 'flex', gap: 4, backgroundColor: 'rgba(0,0,0,0.04)', padding: 3, borderRadius: 8 }}>
                      <button
                        onClick={() => setExportFps(30)}
                        style={{
                          flex: 1,
                          padding: '6px 10px',
                          borderRadius: 6,
                          fontSize: 12,
                          fontWeight: 600,
                          border: 'none',
                          cursor: 'pointer',
                          backgroundColor: exportFps === 30 ? '#0f172a' : 'transparent',
                          color: exportFps === 30 ? '#ffffff' : '#64748b',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        30 FPS
                      </button>
                      <button
                        onClick={() => setExportFps(60)}
                        style={{
                          flex: 1,
                          padding: '6px 10px',
                          borderRadius: 6,
                          fontSize: 12,
                          fontWeight: 600,
                          border: 'none',
                          cursor: 'pointer',
                          backgroundColor: exportFps === 60 ? '#0f172a' : 'transparent',
                          color: exportFps === 60 ? '#ffffff' : '#64748b',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        60 FPS
                      </button>
                    </div>
                  </div>

                  <button
                    className="show-more-btn"
                    onClick={handleExport}
                    disabled={!canExport}
                    style={{
                      width: '100%',
                      background: '#0f172a',
                      color: '#ffffff',
                      border: 'none',
                      padding: '9px 16px',
                      borderRadius: 8,
                      fontWeight: 600,
                      fontSize: 12.5,
                      opacity: canExport ? 1 : 0.5,
                      cursor: canExport ? 'pointer' : 'not-allowed',
                      marginTop: 4
                    }}
                  >
                    Export {resolution === '4k' ? '4K' : '1080p'} MP4 ({exportFps} FPS)
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
