'use client';

import React, { useState } from 'react';
import { useAppState } from '@/store';
import { TEMPLATES, TemplateName, Orientation, DeviceType } from '@/types';
import type { TextAnimationType } from '@/types';

export default function RightSidebar() {
  const { state, dispatch } = useAppState();
  const [activeTab, setActiveTab] = useState<'animations' | 'texts'>('animations');

  const handleOrientationChange = (orient: 'horizontal' | 'vertical') => {
    const orientationVal: Orientation = orient === 'horizontal' ? 'landscape' : 'portrait';
    dispatch({ orientation: orientationVal });
  };

  const currentOrientation = state.orientation === 'landscape' ? 'horizontal' : 'vertical';

  const addAnimatedText = (type: TextAnimationType) => {
    const newText = {
      id: Math.random().toString(36).substring(7),
      text: 'Animated Text',
      position: [0, 1.5, 0] as [number, number, number],
      rotation: [0, 0, 0] as [number, number, number],
      color: '#ffffff',
      fontSize: 0.5,
      animationType: type,
    };
    dispatch({ scene: { texts: [...(state.scene.texts || []), newText] } });
  };

  return (
    <div className="right-sidebar" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header Tabs */}
      <div className="sidebar-header" style={{ display: 'flex', gap: 16 }}>
        <h2 
          className="sidebar-title" 
          style={{ cursor: 'pointer', opacity: activeTab === 'animations' ? 1 : 0.5 }}
          onClick={() => setActiveTab('animations')}
        >
          Animations
        </h2>
        <h2 
          className="sidebar-title" 
          style={{ cursor: 'pointer', opacity: activeTab === 'texts' ? 1 : 0.5 }}
          onClick={() => setActiveTab('texts')}
        >
          Texts
        </h2>
      </div>

      {activeTab === 'animations' && (
        <>
          {/* Tabs */}
          <div className="sidebar-tabs-container">
        {/* Sub-selector for Mobile (iOS vs Android) */}
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
          <button
            style={{
              flex: 1,
              fontSize: '11px',
              padding: '8px 12px',
              borderRadius: '6px',
              cursor: 'pointer',
              border: '1px solid var(--border-color)',
              background: state.device === 'ios' ? 'var(--accent-primary)' : 'transparent',
              color: state.device === 'ios' ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontWeight: 600,
              transition: 'all 0.15s ease'
            }}
            onClick={() => dispatch({ device: 'ios' })}
          >
            iPhone
          </button>
          <button
            style={{
              flex: 1,
              fontSize: '11px',
              padding: '8px 12px',
              borderRadius: '6px',
              cursor: 'pointer',
              border: '1px solid var(--border-color)',
              background: state.device === 'android' ? 'var(--accent-primary)' : 'transparent',
              color: state.device === 'android' ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontWeight: 600,
              transition: 'all 0.15s ease'
            }}
            onClick={() => dispatch({ device: 'android' })}
          >
            Android
          </button>
        </div>

        {/* Orientation Tabs */}
        <div className="orientation-tabs">
          <button
            className={`orientation-tab-btn${currentOrientation === 'horizontal' ? ' active' : ''}`}
            onClick={() => handleOrientationChange('horizontal')}
          >
            Horizontal
          </button>
          <button
            className={`orientation-tab-btn${currentOrientation === 'vertical' ? ' active' : ''}`}
            onClick={() => handleOrientationChange('vertical')}
          >
            Vertical
          </button>
        </div>
      </div>

      {/* Animation Cards Grid */}
      <div className="animations-scroll-area">
        {TEMPLATES.map((t) => {
          const isActive = state.template === t.id;
          return (
            <div
              key={t.id}
              className={`animation-preview-card${isActive ? ' active' : ''}`}
              onClick={() => dispatch({ template: t.id })}
            >
              {/* Checkmark when active */}
              {isActive && (
                <div className="animation-card-checkmark">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
              )}

              {/* Dynamic device mockup that animates depending on card type */}
              <div 
                className="animation-card-device-mock" 
                style={{
                  transform: isActive ? 'scale(1.05)' : 'none',
                  borderColor: isActive ? '#000000' : '#111827',
                  animation: isActive ? `card-anim-${t.id} 3s infinite ease-in-out` : 'none'
                }}
              />

              {/* CSS keyframe styles injection for each type of animation card */}
              <style jsx>{`
                @keyframes card-anim-orbit {
                  0%, 100% { transform: rotateY(0deg) rotateX(0deg); }
                  50% { transform: rotateY(45deg) rotateX(10deg); }
                }
                @keyframes card-anim-float {
                  0%, 100% { transform: translateY(0px) rotate(0deg); }
                  50% { transform: translateY(-8px) rotate(2deg); }
                }
                @keyframes card-anim-flip {
                  0%, 100% { transform: rotateY(0deg); }
                  50% { transform: rotateY(180deg); }
                }
                @keyframes card-anim-rise {
                  0%, 100% { transform: translateY(12px) scale(0.9); opacity: 0.7; }
                  50% { transform: translateY(0px) scale(1); opacity: 1; }
                }
                @keyframes card-anim-zoom-rotate {
                  0%, 100% { transform: scale(0.8) rotate(0deg); }
                  50% { transform: scale(1.1) rotate(15deg); }
                }
                @keyframes card-anim-tilt-shift {
                  0%, 100% { transform: skewX(0deg) rotate(0deg); }
                  50% { transform: skewX(8deg) rotate(-5deg); }
                }
              `}</style>

              {/* "..." menu button */}
              <button
                className="animation-card-menu-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  dispatch({ error: `Animation: ${t.name} (${t.duration}s loop)` });
                }}
              >
                ...
              </button>
            </div>
          );
        })}
      </div>
      </>
      )}

      {activeTab === 'texts' && (
        <div className="animations-scroll-area">
          {[
            { id: 'fade', name: 'Fade', desc: 'Opacity oscillates' },
            { id: 'slide-up', name: 'Slide Up', desc: 'Moves vertically' },
            { id: 'typewriter', name: 'Typewriter', desc: 'Reveals characters' },
            { id: 'scale', name: 'Scale Pulse', desc: 'Grows and shrinks' },
          ].map((t) => (
            <div
              key={t.id}
              className="animation-preview-card"
              onClick={() => addAnimatedText(t.id as TextAnimationType)}
              style={{ display: 'flex', flexDirection: 'column', padding: '12px 16px', gap: 4 }}
            >
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{t.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{t.desc}</div>
              <div style={{ marginTop: 8, fontSize: 11, color: 'var(--accent-color)' }}>+ Click to add</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
