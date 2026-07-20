'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAppState } from '@/store';
import { Resolution, TEMPLATES } from '@/types';
import { AnimatedTabs, TabItem } from '@/components/ui/animated-tabs';

export default function FloatingTopBar() {
  const { state, dispatch, uploadScreenshot, undo, redo, canUndo, canRedo } = useAppState();
  const { resolution, exportStatus, exportProgress, screenshotUrl, screenshot, scene } = state;

  const [activeTab, setActiveTab] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close the active tab drawer when clicking outside the top panel bar or drawer
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
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

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadScreenshot(file);
    }
    e.target.value = '';
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
      const stream = canvas.captureStream(30);
      
      let mimeType = 'video/webm;codecs=vp9';
      if (typeof MediaRecorder !== 'undefined') {
        if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = 'video/webm;codecs=vp8';
        if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = 'video/webm';
        if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = '';
      }

      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType || 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mockup-${state.template}-${Date.now()}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        dispatch({ exportStatus: 'done', exportProgress: 100 });
        setTimeout(() => {
          dispatch({ exportStatus: 'idle', exportProgress: 0 });
        }, 3000);
      };

      recorder.start();
      dispatch({ exportStatus: 'rendering', exportProgress: 10 });

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
        recorder.stop();
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
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      ),
    },
  ];

  return (
    <div ref={panelRef}>
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={handleFileChange}
        hidden
      />

      {/* Top Panel Bar */}
      <div className="top-panel-bar" style={{ display: 'flex', gap: '8px' }}>
        <AnimatedTabs
          tabs={tabs}
          value={activeTab}
          onValueChange={setActiveTab}
          variant="segment"
        />
      </div>

      {/* Dropdown Contents Drawer */}
      {activeTab && (
        <div className="top-panel-drawer">
          {/* Media Content */}
          {activeTab === 'media' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {screenshotUrl ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <img
                    src={screenshotUrl}
                    alt="Preview"
                    style={{ width: '100%', height: '140px', borderRadius: 8, objectFit: 'cover', border: '1px solid var(--border-color)' }}
                  />
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {screenshot?.name}
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      className="show-more-btn"
                      onClick={handleUploadClick}
                      style={{ padding: '6px 12px', fontSize: 12, flex: 1 }}
                    >
                      Replace
                    </button>
                    <button
                      className="show-more-btn"
                      onClick={() => {
                        dispatch({ screenshot: null, screenshotUrl: null, screenshotOrientation: null, orientationMismatch: false });
                        setActiveTab(null);
                      }}
                      style={{ padding: '6px 12px', fontSize: 12, color: 'var(--error)', borderColor: 'rgba(248, 113, 113, 0.2)' }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '12px 0' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)', textAlign: 'center' }}>
                    No media uploaded. Add a screenshot to display on the 3D device mockup.
                  </span>
                  <button
                    className="show-more-btn"
                    onClick={handleUploadClick}
                    style={{ background: '#000000', color: '#ffffff', border: 'none', padding: '8px 16px' }}
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>
                    <span>Exporting Video</span>
                    <span>{exportProgress}%</span>
                  </div>
                  <div style={{ width: '100%', height: 6, background: 'var(--border-color)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: `${exportProgress}%`, height: '100%', background: '#000000', borderRadius: 3 }} />
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '6px 0' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    Export your 3D mockup animation into a high-quality video file.
                  </span>
                  <button
                    className="show-more-btn"
                    onClick={handleExport}
                    disabled={!canExport}
                    style={{
                      width: '100%',
                      background: '#000000',
                      color: '#ffffff',
                      border: 'none',
                      padding: '10px 16px',
                      opacity: canExport ? 1 : 0.5,
                      cursor: canExport ? 'pointer' : 'not-allowed',
                    }}
                  >
                    Export MP4 Video
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
