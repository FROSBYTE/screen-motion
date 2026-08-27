'use client';

import React, { useState, useEffect } from 'react';
import { useAppState } from '@/store';
import { Play, ChevronDown, ChevronRight, Bold, Trash2, RotateCcw, Ban, Sliders, Layers, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import BasicDropdown from '../../smoothui/basic-dropdown';
import SceneOverlaysPanel from './SceneOverlaysPanel';

const animationItems = [
  { id: 'none', label: 'None (Static)' },
  { id: 'bottom-up-letters', label: 'Bottom Up Letters' },
  { id: 'kinetic-center-build', label: 'Kinetic Center Build' },
  { id: 'line-by-line-slide', label: 'Line By Line Slide' },
  { id: 'mask-reveal-up', label: 'Mask Reveal Up' },
  { id: 'reveal-text', label: 'Reveal Text' },
  { id: 'short-slide-down', label: 'Short Slide Down' },
];

const imageAnimationItems = [
  { id: 'none', label: 'None (Static)' },
  { id: 'fade-in-out', label: 'Fade In/Out' },
  { id: 'bounce', label: 'Bounce' },
  { id: 'spin', label: 'Spin' },
];

const BG_PRESETS = [
  { id: 'none', label: 'None', url: null },
  { id: 'bg-01', label: 'BG 01', url: '/Background_Images/bg-01.svg' },
  { id: 'bg-02', label: 'BG 02', url: '/Background_Images/bg-02.svg' },
  { id: 'bg-05', label: 'BG 05', url: '/Background_Images/bg-05.svg' },
  { id: 'bg-06', label: 'BG 06', url: '/Background_Images/bg-06.svg' },
  { id: 'bg-07', label: 'BG 07', url: '/Background_Images/bg-07.svg' },
  { id: 'bg-08', label: 'BG 08', url: '/Background_Images/bg-08.svg' },
  { id: 'bg-09', label: 'BG 09', url: '/Background_Images/bg-09.svg' },
  { id: 'bg-10', label: 'BG 10', url: '/Background_Images/bg-10.svg' },
  { id: 'bg-11', label: 'BG 11', url: '/Background_Images/bg-11.svg' },
  { id: 'bg-12', label: 'BG 12', url: '/Background_Images/bg-12.svg' },
  { id: 'bg-13', label: 'BG 13', url: '/Background_Images/bg-13.svg' },
  { id: 'bg-14', label: 'BG 14', url: '/Background_Images/bg-14.svg' },
];

export default function SceneControls() {
  const { state, dispatch } = useAppState();
  const { scene, speed } = state;
  const [activeSubTab, setActiveSubTab] = useState<'general' | 'components'>('general');
  const [isTextsExpanded, setIsTextsExpanded] = useState(true);
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
  const [isImagesExpanded, setIsImagesExpanded] = useState(true);
  const [expandedImageCards, setExpandedImageCards] = useState<Record<string, boolean>>({});
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state.selectedTextId) {
      setActiveSubTab('components');
      if (scene.texts?.some(t => t.id === state.selectedTextId)) {
        setIsTextsExpanded(true);
        setExpandedCards(prev => ({ ...prev, [state.selectedTextId!]: true }));
      }
      if (scene.images?.some(img => img.id === state.selectedTextId)) {
        setIsImagesExpanded(true);
        setExpandedImageCards(prev => ({ ...prev, [state.selectedTextId!]: true }));
      }
    }
  }, [state.selectedTextId, scene.texts, scene.images]);

  const toggleCard = (id: string) => {
    setExpandedCards(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleImageCard = (id: string) => {
    setExpandedImageCards(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const newId = Math.random().toString(36).substring(7);
      const newImg = {
        id: newId,
        url,
        position: [0, 0, 1] as [number, number, number],
        rotation: [0, 0, 0] as [number, number, number],
        scale: 1,
        animationType: 'none' as any,
        animationSpeed: 1,
        order: (scene.texts?.length || 0) + (scene.images?.length || 0),
      };
      dispatch({ scene: { images: [...(scene.images || []), newImg] } });
      setExpandedImageCards(prev => ({ ...prev, [newId]: true }));
      setIsImagesExpanded(true);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };



  return (
    <div className="section">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Top 2-Column Grid: Animation Speed & Zoom Sliders */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {/* Animation Speed */}
          <div className="slider-control" id="speed-control">
            <div className="slider-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="slider-label" style={{ fontSize: '14.5px', fontWeight: 700 }}>Device Animation Speed</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span className="slider-value" style={{ fontSize: '14.5px', fontWeight: 700 }}>{speed.toFixed(1)}×</span>
                <button
                  type="button"
                  onClick={() => dispatch({ speed: 1.0 })}
                  title="Reset Device Animation Speed to 1.0×"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-secondary, #6b7280)',
                    cursor: 'pointer',
                    padding: '2px',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: speed !== 1.0 ? 1 : 0.35,
                    transition: 'all 0.15s ease',
                  }}
                >
                  <RotateCcw size={12} />
                </button>
              </div>
            </div>
            <input
              type="range"
              min="0.1"
              max="3"
              step="0.1"
              value={speed}
              onChange={(e) => dispatch({ speed: parseFloat(e.target.value) })}
            />
          </div>

          {/* Camera Zoom */}
          <div className="slider-control" id="zoom-control">
            <div className="slider-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="slider-label" style={{ fontSize: '14.5px', fontWeight: 700 }}>Zoom</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span className="slider-value" style={{ fontSize: '14.5px', fontWeight: 700 }}>{(scene.zoom || 1.0).toFixed(2)}x</span>
                <button
                  type="button"
                  onClick={() => dispatch({ scene: { zoom: 1.0 } })}
                  title="Reset Zoom to 1.0x"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-secondary, #6b7280)',
                    cursor: 'pointer',
                    padding: '2px',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: (scene.zoom || 1.0) !== 1.0 ? 1 : 0.35,
                    transition: 'all 0.15s ease',
                  }}
                >
                  <RotateCcw size={12} />
                </button>
              </div>
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

        <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" style={{ display: 'none' }} />

        {/* Sub-tab Bar: General vs Components */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '6px',
          background: 'rgba(0, 0, 0, 0.05)',
          padding: '4px',
          borderRadius: '10px',
          marginTop: '4px',
          border: '1px solid var(--border-color, rgba(0, 0, 0, 0.08))',
        }}>
          <button
            type="button"
            onClick={() => setActiveSubTab('general')}
            style={{
              padding: '8px 12px',
              borderRadius: '7px',
              border: 'none',
              background: activeSubTab === 'general' ? 'var(--bg-secondary, #ffffff)' : 'transparent',
              color: activeSubTab === 'general' ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontWeight: activeSubTab === 'general' ? 700 : 600,
              fontSize: '12.5px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: activeSubTab === 'general' ? '0 1px 4px rgba(0,0,0,0.12)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <Sliders size={14} />
            General
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('components')}
            style={{
              padding: '8px 12px',
              borderRadius: '7px',
              border: 'none',
              background: activeSubTab === 'components' ? 'var(--bg-secondary, #ffffff)' : 'transparent',
              color: activeSubTab === 'components' ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontWeight: activeSubTab === 'components' ? 700 : 600,
              fontSize: '12.5px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: activeSubTab === 'components' ? '0 1px 4px rgba(0,0,0,0.12)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <Layers size={14} />
            Components
          </button>
        </div>

        {/* General Sub-tab Content: Background & Lighting + Device Settings */}
        {activeSubTab === 'general' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Sub-section Header: Background & Lighting */}
            <div style={{
              marginTop: "12px",
              marginBottom: "12px",
              paddingTop: "12px",
              borderTop: "1px solid var(--border-color, rgba(0, 0, 0, 0.08))",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}>
              <h4 style={{
                fontSize: "12.2px",
                fontWeight: 800,
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
                  <span style={{ fontSize: '11.6px', fontWeight: 700, color: 'var(--text-secondary)' }}>Gradient</span>
                  <div style={{ width: '32px', height: '18px', borderRadius: '99px', background: scene.bgGradient ? '#111827' : 'rgba(0,0,0,0.15)', position: 'relative', transition: 'all 0.2s' }}>
                    <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: '#fff', transform: scene.bgGradient ? 'translateX(16px)' : 'translateX(2px)', top: '2px', position: 'absolute', transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)' }} />
                  </div>
                </div>

                {/* Reset Background & Lighting Settings Button */}
                <button
                  onClick={() => dispatch({
                    scene: {
                      bgColor: '#000000',
                      bgColor2: '#ffffff',
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
                      background: preset.url ? `url(${preset.url}) center/cover no-repeat` : 'linear-gradient(135deg, #000000 0%, #ffffff 100%)',
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
                      <Ban size={16} color="rgba(255,255,255,0.7)" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Background Color / Gradient Top */}
            <div className="color-control" id="bg-color-control">
              <label>{scene.bgGradient ? 'Gradient Top' : 'Background Color'}</label>
              <div className="color-swatch" style={{ backgroundColor: scene.bgColor || '#000000' }}>
                <input
                  type="color"
                  value={scene.bgColor || '#000000'}
                  onChange={(e) => dispatch({ scene: { bgColor: e.target.value } })}
                />
              </div>
            </div>

            {/* Gradient Bottom Color */}
            {scene.bgGradient && (
              <div className="color-control" id="bg-color-2-control">
                <label>Gradient Bottom</label>
                <div className="color-swatch" style={{ backgroundColor: scene.bgColor2 || '#ffffff' }}>
                  <input
                    type="color"
                    value={scene.bgColor2 || '#ffffff'}
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
                <div className="slider-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span className="slider-label">Ambient</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span className="slider-value">{scene.ambientIntensity.toFixed(2)}</span>
                    <button
                      type="button"
                      onClick={() => dispatch({ scene: { ambientIntensity: 1.0 } })}
                      title="Reset Ambient Light to 1.0"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-secondary, #6b7280)',
                        cursor: 'pointer',
                        padding: '2px',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: scene.ambientIntensity !== 1.0 ? 1 : 0.35,
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <RotateCcw size={12} />
                    </button>
                  </div>
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
                <div className="slider-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span className="slider-label">Directional</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span className="slider-value">{scene.directionalIntensity.toFixed(2)}</span>
                    <button
                      type="button"
                      onClick={() => dispatch({ scene: { directionalIntensity: 1.0 } })}
                      title="Reset Directional Light to 1.0"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-secondary, #6b7280)',
                        cursor: 'pointer',
                        padding: '2px',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: scene.directionalIntensity !== 1.0 ? 1 : 0.35,
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <RotateCcw size={12} />
                    </button>
                  </div>
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
              marginTop: "12px",
              marginBottom: "12px",
              paddingTop: "12px",
              borderTop: "1px solid var(--border-color, rgba(0, 0, 0, 0.08))",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}>
              <h4 style={{
                fontSize: "12.2px",
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "var(--text-secondary, #6b7280)",
                margin: 0
              }}>
                Device Settings
              </h4>

              <button
                onClick={() => dispatch({ scene: { offsetX: 0, offsetY: 0, rotationX: 0, rotationY: 0 } })}
                title="Reset All Device Position & Rotation"
                aria-label="Reset All Device Position & Rotation"
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
                  <div className="slider-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span className="slider-label">Pos X</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span className="slider-value">{scene.offsetX ? scene.offsetX.toFixed(2) : '0.00'}</span>
                      <button
                        type="button"
                        onClick={() => dispatch({ scene: { offsetX: 0 } })}
                        title="Reset Pos X to 0.00"
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-secondary, #6b7280)',
                          cursor: 'pointer',
                          padding: '2px',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          opacity: (scene.offsetX || 0) !== 0 ? 1 : 0.35,
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <RotateCcw size={12} />
                      </button>
                    </div>
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
                  <div className="slider-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span className="slider-label">Pos Y</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span className="slider-value">{scene.offsetY ? scene.offsetY.toFixed(2) : '0.00'}</span>
                      <button
                        type="button"
                        onClick={() => dispatch({ scene: { offsetY: 0 } })}
                        title="Reset Pos Y to 0.00"
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-secondary, #6b7280)',
                          cursor: 'pointer',
                          padding: '2px',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          opacity: (scene.offsetY || 0) !== 0 ? 1 : 0.35,
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <RotateCcw size={12} />
                      </button>
                    </div>
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
                  <div className="slider-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span className="slider-label">Rot X</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span className="slider-value">{(scene.rotationX ?? 0).toFixed(0)}°</span>
                      <button
                        type="button"
                        onClick={() => dispatch({ scene: { rotationX: 0 } })}
                        title="Reset Rot X to 0°"
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-secondary, #6b7280)',
                          cursor: 'pointer',
                          padding: '2px',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          opacity: (scene.rotationX ?? 0) !== 0 ? 1 : 0.35,
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <RotateCcw size={12} />
                      </button>
                    </div>
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
                  <div className="slider-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span className="slider-label">Rot Y</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span className="slider-value">{scene.rotationY ? scene.rotationY.toFixed(0) : '0'}°</span>
                      <button
                        type="button"
                        onClick={() => dispatch({ scene: { rotationY: 0 } })}
                        title="Reset Rot Y to 0°"
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-secondary, #6b7280)',
                          cursor: 'pointer',
                          padding: '2px',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          opacity: (scene.rotationY || 0) !== 0 ? 1 : 0.35,
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <RotateCcw size={12} />
                      </button>
                    </div>
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
          </div>
        )}

                {/* Components Sub-tab Content: Overlays */}
        {activeSubTab === 'components' && (
          <SceneOverlaysPanel fileInputRef={fileInputRef} />
        )}

      </div>
    </div>
  );
}
