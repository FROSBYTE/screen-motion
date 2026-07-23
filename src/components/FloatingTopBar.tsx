'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAppState } from '@/store';
import { TEMPLATES } from '@/types';
import { AnimatedTabs, TabItem } from '@/components/ui/animated-tabs';
import { trackMixpanelEvent } from '@/lib/mixpanel';

export default function FloatingTopBar() {
  const { state, dispatch, uploadScreenshot } = useAppState();
  const { resolution, exportStatus, exportProgress, screenshotUrl, screenshot } = state;

  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [exportFps, setExportFps] = useState<30 | 60>(60);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
  const canExport = !!screenshotUrl && !isExporting;

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

  const handleExport = async () => {
    if (!canExport) return;

    dispatch({ exportStatus: 'rendering', exportProgress: 0 });

    try {
      const canvas = document.querySelector('#preview-3d canvas') as HTMLCanvasElement;
      if (!canvas) {
        throw new Error('Canvas element not found');
      }

      const templateConfig = TEMPLATES.find((t) => t.id === state.template) || { duration: 3 };
      const baseDuration = templateConfig.duration || 3;
      const actualDurationMs = (baseDuration / state.speed) * 1000;

      const chunks: Blob[] = [];
      const stream = canvas.captureStream(exportFps);
      
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

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/mp4' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `screen-motion-${state.resolution}-${state.template}-${Date.now()}.mp4`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        trackMixpanelEvent('export_completed', {
          template: state.template,
          device: state.device,
          resolution: state.resolution,
          orientation: state.orientation,
          speed: state.speed,
          duration_seconds: Number((actualDurationMs / 1000).toFixed(1)),
        });

        dispatch({ exportStatus: 'done', exportProgress: 100 });
        setTimeout(() => {
          dispatch({ exportStatus: 'idle', exportProgress: 0 });
        }, 3000);
      };

      dispatch({ previewTrigger: Date.now(), exportStatus: 'rendering', exportProgress: 5 });
      recorder.start();

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
          accept="image/png,image/jpeg,image/webp"
          onChange={handleFileChange}
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
              {screenshotUrl ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <img
                    src={screenshotUrl}
                    alt="Preview"
                    style={{ width: '100%', height: '130px', borderRadius: 10, objectFit: 'cover', border: '1px solid rgba(0,0,0,0.1)' }}
                  />
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {screenshot?.name}
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
                        dispatch({ screenshot: null, screenshotUrl: null, screenshotOrientation: null, orientationMismatch: false });
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
                    Click or drag & drop a screenshot to display on the 3D device mockup.
                  </span>
                  <button
                    className="show-more-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUploadClick();
                    }}
                    style={{ background: '#0f172a', color: '#ffffff', border: 'none', padding: '8px 16px', borderRadius: 8, fontWeight: 600, fontSize: 12, cursor: 'pointer' }}
                  >
                    Upload Screenshot
                  </button>
                </div>
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
