'use client';

import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    if (state.selectedTextId) {
      setIsTextsExpanded(true);
      setExpandedCards(prev => ({ ...prev, [state.selectedTextId!]: true }));
    }
  }, [state.selectedTextId]);

  const toggleCard = (id: string) => {
    setExpandedCards(prev => ({ ...prev, [id]: !prev[id] }));
  };



  return (
    <div className="section">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Top 2-Column Grid: Animation Speed & Zoom Sliders */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {/* Animation Speed */}
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

          {/* Camera Zoom */}
          <div className="slider-control" id="zoom-control">
            <div className="slider-header">
              <span className="slider-label">Zoom</span>
              <span className="slider-value">{(scene.zoom || 1.0).toFixed(2)}x</span>
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

        {/* 2-Column Grid Layout for Ambient & Directional Light Sliders */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '12px' }}>
          {/* Left Column: Ambient Light */}
          <div className="slider-control" id="ambient-control">
            <div className="slider-header">
              <span className="slider-label">Ambient</span>
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

          {/* Right Column: Directional Light */}
          <div className="slider-control" id="directional-intensity-control">
            <div className="slider-header">
              <span className="slider-label">Directional</span>
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
            onClick={() => dispatch({ scene: { offsetX: 0, offsetY: 0, rotationX: 0, rotationY: 0 } })}
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

        {/* 2-Column Grid Layout for Device Settings (Pos X & Pos Y on Left, Rot X & Rot Y on Right) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '12px' }}>
          {/* Left Column: Position Controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Pos X */}
            <div className="slider-control" id="offset-x-control">
              <div className="slider-header">
                <span className="slider-label">Pos X</span>
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

            {/* Pos Y */}
            <div className="slider-control" id="offset-y-control">
              <div className="slider-header">
                <span className="slider-label">Pos Y</span>
                <span className="slider-value">{scene.offsetY ? scene.offsetY.toFixed(2) : '0.00'}</span>
              </div>
              <input
                type="range"
                min="-3"
                max="3"
                step="0.05"
                value={scene.offsetY || 0}
                onChange={(e) => dispatch({ scene: { offsetY: parseFloat(e.target.value) } })}
              />
            </div>
          </div>

          {/* Right Column: Rotation Controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Rot X */}
            <div className="slider-control" id="rotation-x-control">
              <div className="slider-header">
                <span className="slider-label">Rot X</span>
                <span className="slider-value">{(scene.rotationX ?? 0).toFixed(0)}°</span>
              </div>
              <input
                type="range"
                min="-180"
                max="180"
                step="1"
                value={scene.rotationX ?? 0}
                onChange={(e) => dispatch({ scene: { rotationX: parseFloat(e.target.value) } })}
              />
            </div>

            {/* Rot Y */}
            <div className="slider-control" id="rotation-y-control">
              <div className="slider-header">
                <span className="slider-label">Rot Y</span>
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
          </div>
        </div>


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
                    <div key={t.id} style={{ background: 'rgba(255,255,255,0.02)', padding: 12, borderRadius: 8, border: '1px solid var(--border-color)' }}>
                      {/* Card Header Row */}
                      <div 
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: expandedCards[t.id] ? 12 : 0, cursor: 'pointer' }}
                        onClick={() => toggleCard(t.id)}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {expandedCards[t.id] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                          <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '120px' }}>
                            {t.text || 'Empty Text'}
                          </span>
                        </div>

                        {/* Top-Right Header Actions: Reset | Color Swatch | Play Preview | Delete */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }} onClick={(e) => e.stopPropagation()}>
                          {/* Reset Text Card Settings */}
                          <button
                            onClick={() => {
                              const newTexts = [...(scene.texts || [])];
                              newTexts[index] = {
                                ...t,
                                position: [0, 0, 1],
                                rotation: [0, 0, 0],
                                fontSize: 10,
                                color: '#000000',
                                animationSpeed: 1,
                                delay: 0,
                                isBold: false,
                              };
                              dispatch({ scene: { texts: newTexts } });
                            }}
                            title="Reset Text Settings to Default"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: 26,
                              height: 26,
                              borderRadius: '4px',
                              border: '1px solid var(--border-color)',
                              background: 'var(--bg-secondary)',
                              color: 'var(--text-secondary)',
                              cursor: 'pointer'
                            }}
                          >
                            <RotateCcw size={13} />
                          </button>

                          {/* Color Picker Swatch */}
                          <div 
                            className="color-swatch" 
                            style={{ 
                              backgroundColor: t.color, 
                              width: 22, 
                              height: 22, 
                              borderRadius: 4, 
                              overflow: 'hidden', 
                              border: '1px solid var(--border-color)', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              cursor: 'pointer'
                            }}
                            title="Text Color"
                          >
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

                          {/* Play Animation Preview */}
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
                              width: 26,
                              height: 26,
                              borderRadius: '4px',
                              border: '1px solid var(--border-color)',
                              background: 'var(--bg-secondary)',
                              color: 'var(--text-primary)',
                              cursor: 'pointer'
                            }}
                          >
                            <Play size={13} />
                          </button>

                          {/* Delete Text Overlay */}
                          <button
                            onClick={() => {
                              const newTexts = (scene.texts || []).filter(text => text.id !== t.id);
                              dispatch({ scene: { texts: newTexts } });
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: 26,
                              height: 26,
                              borderRadius: '4px',
                              border: '1px solid rgba(255, 68, 68, 0.3)',
                              background: 'rgba(255, 68, 68, 0.08)',
                              color: '#ff4444',
                              cursor: 'pointer'
                            }}
                            title="Delete Text"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      {expandedCards[t.id] && (
                        <>
                          {/* Textarea Input */}
                          <textarea
                            value={t.text}
                            onChange={(e) => {
                              const newTexts = [...(scene.texts || [])];
                              newTexts[index] = { ...t, text: e.target.value, textUpdatedAt: Date.now() };
                              dispatch({ scene: { texts: newTexts } });
                            }}
                            rows={2}
                            style={{
                              width: '100%',
                              minHeight: '48px',
                              resize: 'vertical',
                              background: 'var(--bg-secondary)',
                              border: '1px solid var(--border-color)',
                              color: 'var(--text-primary)',
                              padding: '6px 8px',
                              borderRadius: 6,
                              fontSize: 12,
                              marginBottom: 10,
                              fontFamily: 'inherit',
                              lineHeight: '1.4'
                            }}
                          />
                          {/* Animation Dropdown Row */}
                          <div style={{ marginBottom: 8 }} id="animation-dropdown-container">
                            <BasicDropdown
                              items={animationItems}
                              value={t.animationType}
                              onChange={(value) => {
                                const newTexts = [...(scene.texts || [])];
                                newTexts[index] = { ...t, animationType: value as any, previewTrigger: Date.now() };
                                dispatch({ scene: { texts: newTexts } });
                              }}
                            />
                          </div>

                          {/* Font Family Dropdown | Bold Toggle [B] | Layer Z [LAY] */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                            {/* Font Family Dropdown */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <BasicDropdown
                                items={[
                                  { id: '"Plus Jakarta Sans", "Google Sans", sans-serif', label: 'Google Sans' },
                                  { id: '"Inter", sans-serif', label: 'Inter' },
                                  { id: '"Outfit", sans-serif', label: 'Outfit' },
                                  { id: '"Poppins", sans-serif', label: 'Poppins' },
                                  { id: '"Space Grotesk", sans-serif', label: 'Space Grotesk' },
                                  { id: '"Playfair Display", serif', label: 'Playfair Display' },
                                  { id: '"Bricolage Grotesk", sans-serif', label: 'Bricolage Grotesk' },
                                  { id: '"Roboto", sans-serif', label: 'Roboto' }
                                ]}
                                value={t.fontFamily || '"Plus Jakarta Sans", "Google Sans", sans-serif'}
                                onChange={(value) => {
                                  const newTexts = [...(scene.texts || [])];
                                  newTexts[index] = { ...t, fontFamily: value };
                                  dispatch({ scene: { texts: newTexts } });
                                }}
                                placeholder="Font Family"
                              />
                            </div>

                            {/* Bold Toggle [B] */}
                            <button
                              onClick={() => {
                                const newTexts = [...(scene.texts || [])];
                                newTexts[index] = { ...t, isBold: !t.isBold };
                                dispatch({ scene: { texts: newTexts } });
                              }}
                              title="Toggle Bold"
                              style={{ 
                                padding: '6px 10px', 
                                borderRadius: 6, 
                                border: '1px solid var(--border-color)', 
                                background: t.isBold ? 'var(--accent-primary)' : 'var(--bg-secondary)', 
                                color: t.isBold ? '#ffffff' : 'var(--text-secondary)', 
                                cursor: 'pointer', 
                                fontSize: 12, 
                                fontWeight: 700, 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              B
                            </button>

                            {/* Layer Pos Z Input */}
                            <div 
                              style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 4, 
                                padding: '4px 8px', 
                                background: 'var(--bg-secondary)', 
                                borderRadius: 6, 
                                border: '1px solid var(--border-color)' 
                              }}
                            >
                              <span style={{ fontSize: 10, color: 'var(--text-secondary)', fontWeight: 600 }}>LAY</span>
                              <input
                                type="number"
                                min="-10"
                                max="10"
                                step="1"
                                value={Math.round(t.position[2] || 0)}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value, 10) || 0;
                                  const newTexts = [...(scene.texts || [])];
                                  newTexts[index] = { ...t, position: [t.position[0], t.position[1], val] };
                                  dispatch({ scene: { texts: newTexts } });
                                }}
                                style={{
                                  width: 28,
                                  border: 'none',
                                  background: 'transparent',
                                  color: 'var(--text-primary)',
                                  fontSize: 12,
                                  fontWeight: 600,
                                  textAlign: 'center',
                                  outline: 'none'
                                }}
                              />
                            </div>
                          </div>

                          {/* Spacious & Comfortable Full-Width Sliders */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
                            {/* Size Slider */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                              <span style={{ fontSize: 12, color: 'var(--text-secondary)', minWidth: '55px', fontWeight: 500 }}>Size</span>
                              <input
                                type="range" min="1" max="20" step="0.1" value={t.fontSize}
                                onChange={(e) => {
                                  const newTexts = [...(scene.texts || [])];
                                  newTexts[index] = { ...t, fontSize: parseFloat(e.target.value) };
                                  dispatch({ scene: { texts: newTexts } });
                                }}
                                style={{ flex: 1, height: 4, accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
                              />
                              <span style={{ fontSize: 12, color: 'var(--text-primary)', width: '36px', textAlign: 'right', fontWeight: 500 }}>{t.fontSize.toFixed(1)}</span>
                            </div>

                            {/* Speed Slider */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                              <span style={{ fontSize: 12, color: 'var(--text-secondary)', minWidth: '55px', fontWeight: 500 }}>Speed</span>
                              <input
                                type="range" min="0.1" max="1.9" step="0.1" value={t.animationSpeed ?? 1}
                                onChange={(e) => {
                                  const newTexts = [...(scene.texts || [])];
                                  newTexts[index] = { ...t, animationSpeed: parseFloat(e.target.value) };
                                  dispatch({ scene: { texts: newTexts } });
                                }}
                                style={{ flex: 1, height: 4, accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
                              />
                              <span style={{ fontSize: 12, color: 'var(--text-primary)', width: '36px', textAlign: 'right', fontWeight: 500 }}>{(t.animationSpeed ?? 1).toFixed(1)}x</span>
                            </div>

                            {/* Delay Slider */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                              <span style={{ fontSize: 12, color: 'var(--text-secondary)', minWidth: '55px', fontWeight: 500 }}>Delay</span>
                              <input
                                type="range" min="0" max="10" step="0.1" value={t.delay || 0}
                                onChange={(e) => {
                                  const newTexts = [...(scene.texts || [])];
                                  newTexts[index] = { ...t, delay: parseFloat(e.target.value) };
                                  dispatch({ scene: { texts: newTexts } });
                                }}
                                style={{ flex: 1, height: 4, accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
                              />
                              <span style={{ fontSize: 12, color: 'var(--text-primary)', width: '36px', textAlign: 'right', fontWeight: 500 }}>{(t.delay || 0).toFixed(1)}s</span>
                            </div>

                            {/* Rotation Slider */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                              <span style={{ fontSize: 12, color: 'var(--text-secondary)', minWidth: '55px', fontWeight: 500 }}>Rotation</span>
                              <input
                                type="range" min="-180" max="180" step="1" 
                                value={Math.round((((Array.isArray(t.rotation) ? t.rotation[2] : t.rotation) || 0) * 180) / Math.PI)}
                                onDoubleClick={() => {
                                  const newTexts = [...(scene.texts || [])];
                                  newTexts[index] = { ...t, rotation: [0, 0, 0] };
                                  dispatch({ scene: { texts: newTexts } });
                                }}
                                onChange={(e) => {
                                  const degrees = parseFloat(e.target.value);
                                  const radians = Math.abs(degrees) <= 3 ? 0 : (degrees * Math.PI) / 180;
                                  const newTexts = [...(scene.texts || [])];
                                  const rotX = Array.isArray(t.rotation) ? t.rotation[0] : 0;
                                  const rotY = Array.isArray(t.rotation) ? t.rotation[1] : 0;
                                  newTexts[index] = { ...t, rotation: [rotX, rotY, radians] };
                                  dispatch({ scene: { texts: newTexts } });
                                }}
                                style={{ flex: 1, height: 4, accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
                              />
                              <span 
                                onClick={() => {
                                  const newTexts = [...(scene.texts || [])];
                                  const rotX = Array.isArray(t.rotation) ? t.rotation[0] : 0;
                                  const rotY = Array.isArray(t.rotation) ? t.rotation[1] : 0;
                                  newTexts[index] = { ...t, rotation: [rotX, rotY, 0] };
                                  dispatch({ scene: { texts: newTexts } });
                                }}
                                title="Click to reset rotation to 0°"
                                style={{ fontSize: 12, color: 'var(--text-primary)', width: '36px', textAlign: 'right', cursor: 'pointer', userSelect: 'none', fontWeight: 500 }}
                              >
                                {Math.round((((Array.isArray(t.rotation) ? t.rotation[2] : t.rotation) || 0) * 180) / Math.PI)}°
                              </span>
                            </div>
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
                      fontFamily: 'sans-serif',
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
                    Add Text
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
                  fontFamily: 'sans-serif',
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
                Add Text
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
