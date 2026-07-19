'use client';

import React from 'react';
import { useAppState } from '@/store';

export default function SceneControls() {
  const { state, dispatch } = useAppState();
  const { scene, speed } = state;



  return (
    <div className="section">
      <div className="section-title">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
        Settings
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Speed */}
        <div className="slider-control" id="speed-control">
          <div className="slider-header">
            <span className="slider-label">Animation Speed</span>
            <span className="slider-value">{speed.toFixed(1)}×</span>
          </div>
          <input
            type="range"
            min="0.3"
            max="3"
            step="0.1"
            value={speed}
            onChange={(e) => dispatch({ speed: parseFloat(e.target.value) })}
          />
        </div>

        {/* Background Gradient Checkbox */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }} id="bg-gradient-checkbox">
          <input
            type="checkbox"
            id="enable-gradient"
            checked={scene.bgGradient || false}
            onChange={(e) => dispatch({ scene: { bgGradient: e.target.checked } })}
            style={{
              width: 15,
              height: 15,
              cursor: 'pointer'
            }}
          />
          <label htmlFor="enable-gradient" style={{ fontSize: 12, color: 'var(--text-secondary)', cursor: 'pointer', userSelect: 'none' }}>
            Enable Background Gradient
          </label>
        </div>



        {/* Background Color */}
        <div className="color-control" id="bg-color-control">
          <label>{scene.bgGradient ? 'Gradient Start' : 'Background Color'}</label>
          <div className="color-swatch" style={{ backgroundColor: scene.bgColor || '#1c1a16' }}>
            <input
              type="color"
              value={scene.bgColor || '#1c1a16'}
              onChange={(e) => dispatch({ scene: { bgColor: e.target.value } })}
            />
          </div>
        </div>

        {/* Gradient End Color */}
        {scene.bgGradient && (
          <div className="color-control" id="bg-color-2-control">
            <label>Gradient End</label>
            <div className="color-swatch" style={{ backgroundColor: scene.bgColor2 || '#0b0a09' }}>
              <input
                type="color"
                value={scene.bgColor2 || '#0b0a09'}
                onChange={(e) => dispatch({ scene: { bgColor2: e.target.value } })}
              />
            </div>
          </div>
        )}

        {/* Ambient Light */}
        <div className="slider-control" id="ambient-control">
          <div className="slider-header">
            <span className="slider-label">Ambient Light</span>
            <span className="slider-value">{scene.ambientIntensity.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={scene.ambientIntensity}
            onChange={(e) => dispatch({ scene: { ambientIntensity: parseFloat(e.target.value) } })}
          />
        </div>

        {/* Directional Light */}
        <div className="color-control" id="directional-color-control">
          <label>Directional Light</label>
          <div className="color-swatch" style={{ backgroundColor: scene.directionalColor || '#ffffff' }}>
            <input
              type="color"
              value={scene.directionalColor || '#ffffff'}
              onChange={(e) => dispatch({ scene: { directionalColor: e.target.value } })}
            />
          </div>
        </div>

        <div className="slider-control" id="directional-intensity-control">
          <div className="slider-header">
            <span className="slider-label">Directional Intensity</span>
            <span className="slider-value">{scene.directionalIntensity.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0"
            max="2"
            step="0.01"
            value={scene.directionalIntensity}
            onChange={(e) => dispatch({ scene: { directionalIntensity: parseFloat(e.target.value) } })}
          />
        </div>



        {/* Camera Zoom */}
        <div className="slider-control" id="zoom-control">
          <div className="slider-header">
            <span className="slider-label">Camera Zoom</span>
            <span className="slider-value">{scene.zoom ? scene.zoom.toFixed(2) : '1.00'}x</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.05"
            value={scene.zoom || 1.0}
            onChange={(e) => dispatch({ scene: { zoom: parseFloat(e.target.value) } })}
          />
        </div>

        {/* Texts Management */}
        <div style={{ marginTop: 16, borderTop: '1px solid var(--border-color)', paddingTop: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Text Overlays</span>
            <button
              onClick={() => {
                const newText = {
                  id: Math.random().toString(36).substring(7),
                  text: 'New Text',
                  position: [0, 1.5, 0] as [number, number, number],
                  rotation: [0, 0, 0] as [number, number, number],
                  color: '#ffffff',
                  fontSize: 0.5,
                  animationType: 'none' as any,
                };
                dispatch({ scene: { texts: [...(scene.texts || []), newText] } });
              }}
              style={{
                background: 'var(--accent-color)',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                padding: '4px 8px',
                fontSize: 12,
                cursor: 'pointer'
              }}
            >
              + Add Text
            </button>
          </div>

          {(scene.texts || []).map((t, index) => (
            <div key={t.id} style={{ background: 'rgba(255,255,255,0.02)', padding: 12, borderRadius: 6, marginBottom: 12, border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Text {index + 1}</span>
                <button
                  onClick={() => {
                    const newTexts = (scene.texts || []).filter(text => text.id !== t.id);
                    dispatch({ scene: { texts: newTexts } });
                  }}
                  style={{ background: 'none', border: 'none', color: '#ff4444', fontSize: 12, cursor: 'pointer' }}
                >
                  Remove
                </button>
              </div>

              {/* Text Input */}
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
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  padding: '6px',
                  borderRadius: 4,
                  fontSize: 12,
                  marginBottom: 8
                }}
              />

              {/* Color */}
              <div className="color-control" style={{ marginBottom: 8 }}>
                <label>Color</label>
                <div className="color-swatch" style={{ backgroundColor: t.color }}>
                  <input
                    type="color"
                    value={t.color}
                    onChange={(e) => {
                      const newTexts = [...(scene.texts || [])];
                      newTexts[index] = { ...t, color: e.target.value };
                      dispatch({ scene: { texts: newTexts } });
                    }}
                  />
                </div>
              </div>

              {/* Font Size */}
              <div className="slider-control" style={{ marginBottom: 8 }}>
                <div className="slider-header">
                  <span className="slider-label">Size</span>
                  <span className="slider-value">{t.fontSize.toFixed(2)}</span>
                </div>
                <input
                  type="range" min="0.1" max="2" step="0.1" value={t.fontSize}
                  onChange={(e) => {
                    const newTexts = [...(scene.texts || [])];
                    newTexts[index] = { ...t, fontSize: parseFloat(e.target.value) };
                    dispatch({ scene: { texts: newTexts } });
                  }}
                />
              </div>

              {/* Position X */}
              <div className="slider-control" style={{ marginBottom: 8 }}>
                <div className="slider-header">
                  <span className="slider-label">Pos X</span>
                  <span className="slider-value">{t.position[0].toFixed(2)}</span>
                </div>
                <input
                  type="range" min="-3" max="3" step="0.1" value={t.position[0]}
                  onChange={(e) => {
                    const newTexts = [...(scene.texts || [])];
                    newTexts[index] = { ...t, position: [parseFloat(e.target.value), t.position[1], t.position[2]] };
                    dispatch({ scene: { texts: newTexts } });
                  }}
                />
              </div>

              {/* Position Y */}
              <div className="slider-control" style={{ marginBottom: 8 }}>
                <div className="slider-header">
                  <span className="slider-label">Pos Y</span>
                  <span className="slider-value">{t.position[1].toFixed(2)}</span>
                </div>
                <input
                  type="range" min="-3" max="3" step="0.1" value={t.position[1]}
                  onChange={(e) => {
                    const newTexts = [...(scene.texts || [])];
                    newTexts[index] = { ...t, position: [t.position[0], parseFloat(e.target.value), t.position[2]] };
                    dispatch({ scene: { texts: newTexts } });
                  }}
                />
              </div>

              {/* Rotation Z */}
              <div className="slider-control">
                <div className="slider-header">
                  <span className="slider-label">Rotation</span>
                  <span className="slider-value">{(t.rotation[2] * (180 / Math.PI)).toFixed(0)}°</span>
                </div>
                <input
                  type="range" min={-Math.PI} max={Math.PI} step="0.1" value={t.rotation[2]}
                  onChange={(e) => {
                    const newTexts = [...(scene.texts || [])];
                    newTexts[index] = { ...t, rotation: [t.rotation[0], t.rotation[1], parseFloat(e.target.value)] };
                    dispatch({ scene: { texts: newTexts } });
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
