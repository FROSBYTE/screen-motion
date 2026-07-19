'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAppState } from '@/store';
import { Resolution, TEMPLATES } from '@/types';
import { AnimatedTabs, TabItem } from '@/components/ui/animated-tabs';

export default function FloatingTopBar() {
  const { state, dispatch, uploadScreenshot } = useAppState();
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
      id: 'settings',
      label: 'Settings',
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
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
      <div className="top-panel-bar">
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

          {/* Settings Content */}
          {activeTab === 'settings' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Speed */}
              <div className="slider-control" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-secondary)' }}>
                  <span>Animation Speed</span>
                  <span>{state.speed.toFixed(1)}×</span>
                </div>
                <input
                  type="range"
                  min="0.3"
                  max="3"
                  step="0.1"
                  value={state.speed}
                  onChange={(e) => dispatch({ speed: parseFloat(e.target.value) })}
                  style={{ width: '100%', cursor: 'pointer' }}
                />
              </div>

              {/* Gradient Toggle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="checkbox"
                  id="bar-enable-gradient-tabs"
                  checked={scene.bgGradient || false}
                  onChange={(e) => dispatch({ scene: { bgGradient: e.target.checked } })}
                  style={{ cursor: 'pointer' }}
                />
                <label htmlFor="bar-enable-gradient-tabs" style={{ fontSize: 11, color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  Enable Background Gradient
                </label>
              </div>

              {/* Colors */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Background Color</span>
                <input
                  type="color"
                  value={scene.bgColor || '#ffffff'}
                  onChange={(e) => dispatch({ scene: { bgColor: e.target.value } })}
                  style={{ border: 'none', width: 24, height: 24, cursor: 'pointer', background: 'transparent' }}
                />
              </div>

              {scene.bgGradient && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Gradient End</span>
                  <input
                    type="color"
                    value={scene.bgColor2 || '#e5e7eb'}
                    onChange={(e) => dispatch({ scene: { bgColor2: e.target.value } })}
                    style={{ border: 'none', width: 24, height: 24, cursor: 'pointer', background: 'transparent' }}
                  />
                </div>
              )}

              {/* Ambient Light */}
              <div className="slider-control" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-secondary)' }}>
                  <span>Ambient Light</span>
                  <span>{scene.ambientIntensity.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.05"
                  value={scene.ambientIntensity}
                  onChange={(e) => dispatch({ scene: { ambientIntensity: parseFloat(e.target.value) } })}
                  style={{ width: '100%', cursor: 'pointer' }}
                />
              </div>

              {/* Camera Zoom */}
              <div className="slider-control" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-secondary)' }}>
                  <span>Camera Zoom</span>
                  <span>{scene.zoom ? scene.zoom.toFixed(2) : '1.00'}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.5"
                  step="0.05"
                  value={scene.zoom || 1.0}
                  onChange={(e) => dispatch({ scene: { zoom: parseFloat(e.target.value) } })}
                  style={{ width: '100%', cursor: 'pointer' }}
                />
              </div>

              {/* Resolution */}
              <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                <button
                  style={{
                    flex: 1,
                    fontSize: 11,
                    padding: '6px',
                    borderRadius: 6,
                    cursor: 'pointer',
                    border: '1px solid var(--border-color)',
                    background: resolution === '1080p' ? '#000000' : '#ffffff',
                    color: resolution === '1080p' ? '#ffffff' : '#000000',
                    fontWeight: 600
                  }}
                  onClick={() => dispatch({ resolution: '1080p' })}
                >
                  1080p
                </button>
                <button
                  style={{
                    flex: 1,
                    fontSize: 11,
                    padding: '6px',
                    borderRadius: 6,
                    cursor: 'pointer',
                    border: '1px solid var(--border-color)',
                    background: resolution === '4k' ? '#000000' : '#ffffff',
                    color: resolution === '4k' ? '#ffffff' : '#000000',
                    fontWeight: 600
                  }}
                  onClick={() => dispatch({ resolution: '4k' })}
                >
                  4K
                </button>
              </div>

              {/* Text Animation Speed (only if texts exist) */}
              {(scene.texts && scene.texts.length > 0) && (
                <div className="slider-control" style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-secondary)' }}>
                    <span>Text Anim Speed</span>
                    <span>{scene.textSpeed ? scene.textSpeed.toFixed(1) : '1.0'}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="3"
                    step="0.1"
                    value={scene.textSpeed || 1.0}
                    onChange={(e) => dispatch({ scene: { textSpeed: parseFloat(e.target.value) } })}
                    style={{ width: '100%', cursor: 'pointer' }}
                  />
                </div>
              )}

              {/* Texts Management */}
              <div style={{ marginTop: 8, borderTop: '1px solid var(--border-color)', paddingTop: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-primary)' }}>Text Overlays</span>
                  <button
                    onClick={() => {
                      const newText = {
                        id: Math.random().toString(36).substring(7),
                        text: 'New Text',
                        position: [0, 1.5, 0] as [number, number, number],
                        rotation: [0, 0, 0] as [number, number, number],
                        color: '#ffffff',
                        fontSize: 0.5,
                        animationType: 'none' as any, // Cast avoided by using 'none' as any, or I should import TextAnimationType. Wait, I will just cast it as any to avoid import if not already there, or I can import it.
                      };
                      dispatch({ scene: { texts: [...(scene.texts || []), newText] } });
                    }}
                    style={{
                      background: 'var(--accent-color, #000)',
                      color: 'white',
                      border: 'none',
                      borderRadius: 4,
                      padding: '4px 8px',
                      fontSize: 10,
                      cursor: 'pointer'
                    }}
                  >
                    + Add Text
                  </button>
                </div>

                {(scene.texts || []).map((t, index) => (
                  <div key={t.id} style={{ background: 'rgba(0,0,0,0.02)', padding: 8, borderRadius: 6, marginBottom: 8, border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Text {index + 1}</span>
                      <button
                        onClick={() => {
                          const newTexts = (scene.texts || []).filter(text => text.id !== t.id);
                          dispatch({ scene: { texts: newTexts } });
                        }}
                        style={{ background: 'none', border: 'none', color: '#ff4444', fontSize: 10, cursor: 'pointer' }}
                      >
                        Remove
                      </button>
                    </div>

                    <input
                      type="text"
                      value={t.text}
                      onChange={(e) => {
                        const newTexts = [...(scene.texts || [])];
                        newTexts[index] = { ...t, text: e.target.value };
                        dispatch({ scene: { texts: newTexts } });
                      }}
                      style={{
                        width: '100%',
                        background: 'var(--bg-primary)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-primary)',
                        padding: '4px 6px',
                        borderRadius: 4,
                        fontSize: 11,
                        marginBottom: 6
                      }}
                    />

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>Color</span>
                      <input
                        type="color"
                        value={t.color}
                        onChange={(e) => {
                          const newTexts = [...(scene.texts || [])];
                          newTexts[index] = { ...t, color: e.target.value };
                          dispatch({ scene: { texts: newTexts } });
                        }}
                        style={{ border: 'none', width: 20, height: 20, cursor: 'pointer', background: 'transparent' }}
                      />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 6 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-secondary)' }}>
                        <span>Size</span>
                        <span>{t.fontSize.toFixed(2)}</span>
                      </div>
                      <input
                        type="range" min="0.1" max="2" step="0.1" value={t.fontSize}
                        onChange={(e) => {
                          const newTexts = [...(scene.texts || [])];
                          newTexts[index] = { ...t, fontSize: parseFloat(e.target.value) };
                          dispatch({ scene: { texts: newTexts } });
                        }}
                        style={{ width: '100%', cursor: 'pointer' }}
                      />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 6 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-secondary)' }}>
                        <span>Pos X</span>
                        <span>{t.position[0].toFixed(2)}</span>
                      </div>
                      <input
                        type="range" min="-3" max="3" step="0.1" value={t.position[0]}
                        onChange={(e) => {
                          const newTexts = [...(scene.texts || [])];
                          newTexts[index] = { ...t, position: [parseFloat(e.target.value), t.position[1], t.position[2]] };
                          dispatch({ scene: { texts: newTexts } });
                        }}
                        style={{ width: '100%', cursor: 'pointer' }}
                      />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 6 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-secondary)' }}>
                        <span>Pos Y</span>
                        <span>{t.position[1].toFixed(2)}</span>
                      </div>
                      <input
                        type="range" min="-3" max="3" step="0.1" value={t.position[1]}
                        onChange={(e) => {
                          const newTexts = [...(scene.texts || [])];
                          newTexts[index] = { ...t, position: [t.position[0], parseFloat(e.target.value), t.position[2]] };
                          dispatch({ scene: { texts: newTexts } });
                        }}
                        style={{ width: '100%', cursor: 'pointer' }}
                      />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-secondary)' }}>
                        <span>Rotation</span>
                        <span>{(t.rotation[2] * (180 / Math.PI)).toFixed(0)}°</span>
                      </div>
                      <input
                        type="range" min={-Math.PI} max={Math.PI} step="0.1" value={t.rotation[2]}
                        onChange={(e) => {
                          const newTexts = [...(scene.texts || [])];
                          newTexts[index] = { ...t, rotation: [t.rotation[0], t.rotation[1], parseFloat(e.target.value)] };
                          dispatch({ scene: { texts: newTexts } });
                        }}
                        style={{ width: '100%', cursor: 'pointer' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
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
