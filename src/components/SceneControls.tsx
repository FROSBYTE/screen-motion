'use client';

import React, { useState } from 'react';
import { useAppState } from '@/store';
import { Play, ChevronDown, ChevronRight, Bold, Trash2, RotateCcw, Ban } from 'lucide-react';
import BasicDropdown from './ui/smoothui/basic-dropdown';

const animationItems = [
  { id: 'none', label: 'None' },
  { id: 'text-animate', label: 'Text Animate' },
  { id: 'typing-animation', label: 'Typing Animation' },
  { id: 'dia-text-reveal', label: 'Text Reveal' },
  { id: 'blur-out-up', label: 'Blur Out Up' },
  { id: 'bottom-up-letters', label: 'Bottom Up Letters' },
  { id: 'depth-parallax-words', label: 'Depth Parallax Words' },
  { id: 'fade-through', label: 'Fade Through' },
  { id: 'focus-blur-resolve', label: 'Focus Blur Resolve' },
  { id: 'kinetic-center-build', label: 'Kinetic Center Build' },
  { id: 'line-by-line-slide', label: 'Line by Line Slide' },
  { id: 'mask-reveal-up', label: 'Mask Reveal Up' },
  { id: 'micro-scale-fade', label: 'Micro Scale Fade' },
  { id: 'per-character-rise', label: 'Per Character Rise' },
  { id: 'per-word-crossfade', label: 'Per Word Crossfade' },
  { id: 'reveal-text', label: 'Reveal Text' },
  { id: 'scale-down-fade', label: 'Scale Down Fade' },
];

const BG_PRESETS = [
  { id: 'none', label: 'None', url: null },
  { id: 'bg1', label: 'BG 01', url: '/Background_Images/BG01.png' },
  { id: 'bg2', label: 'BG 02', url: '/Background_Images/BG02.png' },
  { id: 'bg3', label: 'BG 03', url: '/Background_Images/BG03.jpeg' },
  { id: 'bg4', label: 'BG 04', url: '/Background_Images/BG04.jpeg' },
  { id: 'bg5', label: 'BG 05', url: '/Background_Images/BG05.jpeg' },
];

export default function SceneControls() {
  const { state, dispatch } = useAppState();
  const { scene, speed } = state;
  const [isTextsExpanded, setIsTextsExpanded] = useState(true);
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});

  const toggleCard = (id: string) => {
    setExpandedCards(prev => ({ ...prev, [id]: !prev[id] }));
  };



  return (
    <div className="section">
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

        {/* Sub-section Header: Background & Lighting */}
        <div style={{
          marginTop: "20px",
          marginBottom: "12px",
          paddingTop: "16px",
          borderTop: "1px solid var(--border-color, rgba(0, 0, 0, 0.08))",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}>
          <h4 style={{
            fontSize: "11px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            color: "var(--text-secondary, #6b7280)",
            margin: 0
          }}>
            Background & Lighting
          </h4>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Gradient Toggle */}
            <div 
              style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', userSelect: 'none' }} 
              onClick={() => dispatch({ scene: { bgGradient: !scene.bgGradient } })}
              title="Toggle Background Gradient"
            >
              <span style={{ fontSize: '10.5px', fontWeight: 600, color: 'var(--text-secondary)' }}>Gradient</span>
              <div style={{ width: '32px', height: '18px', borderRadius: '99px', background: scene.bgGradient ? '#111827' : 'rgba(0,0,0,0.15)', position: 'relative', transition: 'all 0.2s' }}>
                <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: '#fff', transform: scene.bgGradient ? 'translateX(16px)' : 'translateX(2px)', top: '2px', position: 'absolute', transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)' }} />
              </div>
            </div>

            {/* Reset Background & Lighting Settings Button */}
            <button
              onClick={() => dispatch({
                scene: {
                  bgColor: '#fcf9ea',
                  bgColor2: '#badfdb',
                  bgGradient: true,
                  bgImage: null,
                  ambientIntensity: 1.0,
                  directionalColor: '#ffffff',
                  directionalIntensity: 1.0,
                  zoom: 1.0,
                }
              })}
              title="Reset Background & Lighting to Default"
              aria-label="Reset Background & Lighting to Default"
              style={{
                background: "transparent",
                border: "none",
                color: "var(--text-secondary, #6b7280)",
                cursor: "pointer",
                padding: "4px",
                borderRadius: "6px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--text-primary, #111827)";
                e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.06)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--text-secondary, #6b7280)";
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </div>

        {/* Background Image Presets Swatches */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', overflowX: 'auto', padding: '2px 0 6px 0' }}>
          {BG_PRESETS.map((preset) => {
            const isSelected = (scene.bgImage || null) === preset.url;
            return (
              <button
                key={preset.id}
                onClick={() => dispatch({ scene: { bgImage: preset.url } })}
                title={preset.label}
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '8px',
                  border: isSelected ? '2px solid var(--text-primary)' : '1px solid var(--border-color)',
                  background: preset.url ? `url(${preset.url}) center/cover no-repeat` : 'linear-gradient(135deg, #fcf9ea 0%, #badfdb 100%)',
                  cursor: 'pointer',
                  flexShrink: 0,
                  position: 'relative',
                  overflow: 'hidden',
                  transform: isSelected ? 'scale(1.08)' : 'scale(1)',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: isSelected ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
                }}
              >
                {!preset.url && (
                  <Ban size={16} color="rgba(0,0,0,0.5)" />
                )}
              </button>
            );
          })}
        </div>

        {/* Background Color / Gradient Top */}
        <div className="color-control" id="bg-color-control">
          <label>{scene.bgGradient ? 'Gradient Top' : 'Background Color'}</label>
          <div className="color-swatch" style={{ backgroundColor: scene.bgColor || '#1c1a16' }}>
            <input
              type="color"
              value={scene.bgColor || '#1c1a16'}
              onChange={(e) => dispatch({ scene: { bgColor: e.target.value } })}
            />
          </div>
        </div>

        {/* Gradient Bottom Color */}
        {scene.bgGradient && (
          <div className="color-control" id="bg-color-2-control">
            <label>Gradient Bottom</label>
            <div className="color-swatch" style={{ backgroundColor: scene.bgColor2 || '#0b0a09' }}>
              <input
                type="color"
                value={scene.bgColor2 || '#0b0a09'}
                onChange={(e) => dispatch({ scene: { bgColor2: e.target.value } })}
              />
            </div>
          </div>
        )}

        {/* Light Color (formerly Directional Light color) */}
        <div className="color-control" id="directional-color-control">
          <label>Light Color</label>
          <div className="color-swatch" style={{ backgroundColor: scene.directionalColor || '#ffffff' }}>
            <input
              type="color"
              value={scene.directionalColor || '#ffffff'}
              onChange={(e) => dispatch({ scene: { directionalColor: e.target.value } })}
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
            max="2"
            step="0.01"
            value={scene.ambientIntensity}
            onChange={(e) => dispatch({ scene: { ambientIntensity: parseFloat(e.target.value) } })}
          />
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
            max="3"
            step="0.05"
            value={scene.zoom || 1.0}
            onChange={(e) => dispatch({ scene: { zoom: parseFloat(e.target.value) } })}
          />
        </div>

        {/* Sub-section Header: Device Settings */}
        <div style={{
          marginTop: "20px",
          marginBottom: "12px",
          paddingTop: "16px",
          borderTop: "1px solid var(--border-color, rgba(0, 0, 0, 0.08))",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}>
          <h4 style={{
            fontSize: "11px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            color: "var(--text-secondary, #6b7280)",
            margin: 0
          }}>
            Device Settings
          </h4>

          <button
            onClick={() => dispatch({ scene: { offsetX: 0, rotationX: -5, rotationY: 0 } })}
            title="Reset Device Position & Rotation"
            aria-label="Reset Device Position & Rotation"
            style={{
              background: "transparent",
              border: "none",
              color: "var(--text-secondary, #6b7280)",
              cursor: "pointer",
              padding: "4px",
              borderRadius: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--text-primary, #111827)";
              e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.06)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--text-secondary, #6b7280)";
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <RotateCcw size={14} />
          </button>
        </div>

        {/* X Position */}
        <div className="slider-control" id="offset-x-control">
          <div className="slider-header">
            <span className="slider-label">X Position</span>
            <span className="slider-value">{scene.offsetX ? scene.offsetX.toFixed(2) : '0.00'}</span>
          </div>
          <input
            type="range"
            min="-3"
            max="3"
            step="0.05"
            value={scene.offsetX || 0}
            onChange={(e) => dispatch({ scene: { offsetX: parseFloat(e.target.value) } })}
          />
        </div>

        {/* X Rotation */}
        <div className="slider-control" id="rotation-x-control">
          <div className="slider-header">
            <span className="slider-label">X Rotation</span>
            <span className="slider-value">{(scene.rotationX ?? -5).toFixed(0)}°</span>
          </div>
          <input
            type="range"
            min="-180"
            max="180"
            step="1"
            value={scene.rotationX ?? -5}
            onChange={(e) => dispatch({ scene: { rotationX: parseFloat(e.target.value) } })}
          />
        </div>

        {/* Y Rotation */}
        <div className="slider-control" id="rotation-y-control">
          <div className="slider-header">
            <span className="slider-label">Y Rotation</span>
            <span className="slider-value">{scene.rotationY ? scene.rotationY.toFixed(0) : '0'}°</span>
          </div>
          <input
            type="range"
            min="-180"
            max="180"
            step="1"
            value={scene.rotationY || 0}
            onChange={(e) => dispatch({ scene: { rotationY: parseFloat(e.target.value) } })}
          />
        </div>

        {/* DISABLED_FEATURE_START: Texts Management Editor */}
        {/* DO NOT DELETE: Keeping this code disabled for future reference or reactivation. */}
        {/*
        <div style={{ marginTop: 16, borderTop: '1px solid var(--border-color)', paddingTop: 16 }}>
          {(scene.texts && scene.texts.length > 0) ? (
            <>
              <div 
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, cursor: 'pointer' }}
                onClick={() => setIsTextsExpanded(!isTextsExpanded)}
              >
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Text Overlays</span>
                <button style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {isTextsExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
              </div>

              {isTextsExpanded && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {(scene.texts || []).map((t, index) => (
                    <div key={t.id} style={{ background: 'rgba(255,255,255,0.02)', padding: 12, borderRadius: 6, border: '1px solid var(--border-color)' }}>
                      <div 
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: expandedCards[t.id] ? 12 : 0, cursor: 'pointer' }}
                        onClick={() => toggleCard(t.id)}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {expandedCards[t.id] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                          <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }}>
                            {t.text || 'Empty Text'}
                          </span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const newTexts = (scene.texts || []).filter(text => text.id !== t.id);
                            dispatch({ scene: { texts: newTexts } });
                          }}
                          style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px', borderRadius: '4px' }}
                          title="Delete Text"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>

                      {expandedCards[t.id] && (
                        <>
                          <textarea
                            value={t.text}
                            onChange={(e) => {
                              const newTexts = [...(scene.texts || [])];
                              newTexts[index] = { ...t, text: e.target.value };
                              dispatch({ scene: { texts: newTexts } });
                            }}
                            rows={2}
                            style={{
                              width: '100%',
                              minHeight: '52px',
                              resize: 'vertical',
                              background: 'var(--bg-secondary)',
                              border: '1px solid var(--border-color)',
                              color: 'var(--text-primary)',
                              padding: '6px 8px',
                              borderRadius: 4,
                              fontSize: 12,
                              marginBottom: 8,
                              fontFamily: 'inherit',
                              lineHeight: '1.4'
                            }}
                          />

                          <div style={{ marginBottom: 8 }} id="animation-dropdown-container">
                            <BasicDropdown
                              label="Animation Type"
                              items={animationItems}
                              value={t.animationType}
                              onChange={(item) => {
                                const newTexts = [...(scene.texts || [])];
                                newTexts[index] = { ...t, animationType: item.id as any };
                                dispatch({ scene: { texts: newTexts } });
                              }}
                            />
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, gap: 12 }}>
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button
                                onClick={() => {
                                  const newTexts = [...(scene.texts || [])];
                                  newTexts[index] = { ...t, isBold: !t.isBold };
                                  dispatch({ scene: { texts: newTexts } });
                                }}
                                style={{ 
                                  padding: '6px 12px', 
                                  borderRadius: 4, 
                                  border: '1px solid var(--border-color)', 
                                  background: t.isBold ? 'var(--accent-primary)' : 'var(--bg-secondary)', 
                                  color: t.isBold ? 'var(--text-primary)' : 'var(--text-secondary)', 
                                  cursor: 'pointer', 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  justifyContent: 'center' 
                                }}
                              >
                                <Bold size={14} />
                              </button>
                              
                              <button
                                onClick={() => {
                                  const newTexts = [...(scene.texts || [])];
                                  newTexts[index] = { ...t, previewTrigger: Date.now() };
                                  dispatch({ scene: { texts: newTexts } });
                                }}
                                title="Preview Animation"
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  padding: '6px 12px',
                                  borderRadius: '4px',
                                  border: '1px solid var(--border-color)',
                                  background: 'var(--bg-secondary)',
                                  color: 'var(--text-primary)',
                                  cursor: 'pointer'
                                }}
                              >
                                <Play size={14} />
                              </button>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Color</span>
                              <div className="color-swatch" style={{ backgroundColor: t.color, width: 24, height: 24, borderRadius: 4, overflow: 'hidden', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <input
                                  type="color"
                                  value={t.color}
                                  onChange={(e) => {
                                    const newTexts = [...(scene.texts || [])];
                                    newTexts[index] = { ...t, color: e.target.value };
                                    dispatch({ scene: { texts: newTexts } });
                                  }}
                                  style={{ opacity: 0, width: '100%', height: '100%', cursor: 'pointer', padding: 0, border: 'none' }}
                                />
                              </div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
                            <span style={{ fontSize: 12, color: 'var(--text-secondary)', minWidth: '45px' }}>Size</span>
                            <input
                              type="range" min="1" max="20" step="0.1" value={t.fontSize}
                              onChange={(e) => {
                                const newTexts = [...(scene.texts || [])];
                                newTexts[index] = { ...t, fontSize: parseFloat(e.target.value) };
                                dispatch({ scene: { texts: newTexts } });
                              }}
                              style={{ flex: 1, height: 4, accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
                            />
                            <span style={{ fontSize: 12, color: 'var(--text-primary)', width: '35px', textAlign: 'right' }}>{t.fontSize.toFixed(1)}</span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
                            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Layer (Pos Z)</span>
                            <input
                              type="number" step="0.1" value={t.position[2]}
                              onChange={(e) => {
                                const newTexts = [...(scene.texts || [])];
                                newTexts[index] = { ...t, position: [t.position[0], t.position[1], parseFloat(e.target.value) || 0] };
                                dispatch({ scene: { texts: newTexts } });
                              }}
                              style={{
                                width: '60px',
                                background: 'var(--bg-secondary)',
                                border: '1px solid var(--border-color)',
                                color: 'var(--text-primary)',
                                padding: '4px 6px',
                                borderRadius: 4,
                                fontSize: 12,
                                textAlign: 'right'
                              }}
                            />
                          </div>

                          {t.animationType !== 'none' && (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
                              <span style={{ fontSize: 12, color: 'var(--text-secondary)', minWidth: '45px' }}>Speed</span>
                              <input
                                type="range" min="0.1" max="5" step="0.1" value={t.animationSpeed ?? 1}
                                onChange={(e) => {
                                  const newTexts = [...(scene.texts || [])];
                                  newTexts[index] = { ...t, animationSpeed: parseFloat(e.target.value) };
                                  dispatch({ scene: { texts: newTexts } });
                                }}
                                style={{ flex: 1, height: 4, accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
                              />
                              <span style={{ fontSize: 12, color: 'var(--text-primary)', width: '35px', textAlign: 'right' }}>{(t.animationSpeed ?? 1).toFixed(1)}x</span>
                            </div>
                          )}

                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 4 }}>
                            <span style={{ fontSize: 12, color: 'var(--text-secondary)', minWidth: '45px' }}>Rotation</span>
                            <input
                              type="range" min={-Math.PI} max={Math.PI} step="0.1" value={t.rotation[2]}
                              onChange={(e) => {
                                const newTexts = [...(scene.texts || [])];
                                newTexts[index] = { ...t, rotation: [t.rotation[0], t.rotation[1], parseFloat(e.target.value)] };
                                dispatch({ scene: { texts: newTexts } });
                              }}
                              style={{ flex: 1, height: 4, accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
                            />
                            <span style={{ fontSize: 12, color: 'var(--text-primary)', width: '35px', textAlign: 'right' }}>{(t.rotation[2] * (180 / Math.PI)).toFixed(0)}°</span>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                  
                  <button
                    onClick={() => {
                      const newId = Math.random().toString(36).substring(7);
                      const newText = {
                        id: newId,
                        text: 'New Text',
                        position: [0, 0, 1] as [number, number, number],
                        rotation: [0, 0, 0] as [number, number, number],
                        color: '#000000',
                        fontSize: 10,
                        animationType: 'none' as any,
                        animationSpeed: 1,
                        isBold: true
                      };
                      dispatch({ scene: { texts: [...(scene.texts || []), newText] } });
                      setExpandedCards(prev => ({ ...prev, [newId]: true }));
                      setIsTextsExpanded(true);
                    }}
                    style={{
                      background: 'transparent',
                      color: 'var(--text-primary)',
                      border: '1px dashed var(--border-color)',
                      borderRadius: 8,
                      padding: '12px 16px',
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      transition: 'all 0.2s ease',
                      marginTop: 8
                    }}
                    onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--text-primary)'}
                    onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
                  >
                    NEW TXT
                  </button>
                </div>
              )}
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button
                onClick={() => {
                  const newId = Math.random().toString(36).substring(7);
                  const newText = {
                    id: newId,
                    text: 'New Text',
                    position: [0, 0, 1] as [number, number, number],
                    rotation: [0, 0, 0] as [number, number, number],
                    color: '#000000',
                    fontSize: 10,
                    animationType: 'none' as any,
                    animationSpeed: 1,
                    isBold: true
                  };
                  dispatch({ scene: { texts: [...(scene.texts || []), newText] } });
                  setExpandedCards(prev => ({ ...prev, [newId]: true }));
                  setIsTextsExpanded(true);
                }}
                style={{
                  background: 'transparent',
                  color: 'var(--text-primary)',
                  border: '1px dashed var(--border-color)',
                  borderRadius: 8,
                  padding: '12px 16px',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  transition: 'all 0.2s ease',
                  marginTop: 8
                }}
                onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--text-primary)'}
                onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
              >
                NEW TXT
              </button>
            </div>
          )}
        </div>
        */}
        {/* DISABLED_FEATURE_END: Texts Management Editor */}
      </div>
    </div>
  );
}
