'use client';

import React from 'react';
import { useAppState } from '@/store';

export default function SceneControls() {
  const { state, dispatch } = useAppState();
  const { scene, speed } = state;

  const updateScene = (partial: Partial<typeof scene>) => {
    dispatch({ type: 'SET_SCENE', scene: partial });
  };

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
            onChange={(e) => dispatch({ type: 'SET_SPEED', speed: parseFloat(e.target.value) })}
          />
        </div>

        {/* Background Colors */}
        <div className="color-control" id="bg-color1-control">
          <label>Background Color 1</label>
          <div className="color-swatch" style={{ backgroundColor: scene.bgColor1 }}>
            <input
              type="color"
              value={scene.bgColor1}
              onChange={(e) => updateScene({ bgColor1: e.target.value })}
            />
          </div>
        </div>

        <div className="color-control" id="bg-color2-control">
          <label>Background Color 2</label>
          <div className="color-swatch" style={{ backgroundColor: scene.bgColor2 }}>
            <input
              type="color"
              value={scene.bgColor2}
              onChange={(e) => updateScene({ bgColor2: e.target.value })}
            />
          </div>
        </div>

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
            onChange={(e) => updateScene({ ambientIntensity: parseFloat(e.target.value) })}
          />
        </div>

        {/* Directional Light */}
        <div className="color-control" id="directional-color-control">
          <label>Directional Light</label>
          <div className="color-swatch" style={{ backgroundColor: scene.directionalColor }}>
            <input
              type="color"
              value={scene.directionalColor}
              onChange={(e) => updateScene({ directionalColor: e.target.value })}
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
            onChange={(e) => updateScene({ directionalIntensity: parseFloat(e.target.value) })}
          />
        </div>

        {/* Rim Light */}
        <div className="color-control" id="rim-color-control">
          <label>Rim Light</label>
          <div className="color-swatch" style={{ backgroundColor: scene.rimColor }}>
            <input
              type="color"
              value={scene.rimColor}
              onChange={(e) => updateScene({ rimColor: e.target.value })}
            />
          </div>
        </div>

        <div className="slider-control" id="rim-intensity-control">
          <div className="slider-header">
            <span className="slider-label">Rim Intensity</span>
            <span className="slider-value">{scene.rimIntensity.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={scene.rimIntensity}
            onChange={(e) => updateScene({ rimIntensity: parseFloat(e.target.value) })}
          />
        </div>

        {/* Shadow Strength */}
        <div className="slider-control" id="shadow-control">
          <div className="slider-header">
            <span className="slider-label">Shadow Strength</span>
            <span className="slider-value">{scene.shadowStrength.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={scene.shadowStrength}
            onChange={(e) => updateScene({ shadowStrength: parseFloat(e.target.value) })}
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
            onChange={(e) => updateScene({ zoom: parseFloat(e.target.value) })}
          />
        </div>
      </div>
    </div>
  );
}
