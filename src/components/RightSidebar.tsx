'use client';

import React, { useState } from 'react';
import { useAppState } from '@/store';
import { TEMPLATES, TemplateName, Orientation, DeviceType } from '@/types';
import type { TextAnimationType } from '@/types';
import SceneControls from './SceneControls';

export default function RightSidebar() {
  const { state, dispatch } = useAppState();
  const [activeTab, setActiveTab] = useState<'animations' | 'texts' | 'scenes'>('animations');

  const handleOrientationChange = (orient: 'horizontal' | 'vertical') => {
    const orientationVal: Orientation = orient === 'horizontal' ? 'landscape' : 'portrait';
    dispatch({ orientation: orientationVal });
  };

  const currentOrientation = state.orientation === 'landscape' ? 'horizontal' : 'vertical';



  return (
    <div className="right-sidebar" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header Tabs */}
      <div className="sidebar-header" style={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-evenly', padding: '8px 12px', gap: '4px' }}>
        <h2 
          className="sidebar-title" 
          style={{ flex: 1, textAlign: 'center', cursor: 'pointer', padding: '8px 12px', borderRadius: '8px', background: activeTab === 'animations' ? 'rgba(0,0,0,0.12)' : 'transparent', color: activeTab === 'animations' ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: activeTab === 'animations' ? 700 : 600, transition: 'all 0.2s ease', margin: 0 }}
          onClick={() => setActiveTab('animations')}
        >
          Animations
        </h2>

        <h2 
          className="sidebar-title" 
          style={{ flex: 1, textAlign: 'center', cursor: 'pointer', padding: '8px 12px', borderRadius: '8px', background: activeTab === 'scenes' ? 'rgba(0,0,0,0.12)' : 'transparent', color: activeTab === 'scenes' ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: activeTab === 'scenes' ? 700 : 600, transition: 'all 0.2s ease', margin: 0 }}
          onClick={() => setActiveTab('scenes')}
        >
          Scenes
        </h2>
      </div>

      {activeTab === 'animations' && (
        <div className="tab-content-animate" style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
        <div style={{ width: '100%', height: 2, background: 'var(--border-color)', marginBottom: 16 }} />
        
        {/* Sub-selector for Mobile (iOS vs Android) */}
        <div style={{ padding: '0 12px 16px 12px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: 8, color: 'var(--text-secondary)' }}>PLATFORM</label>
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              style={{
                flex: 1,
                fontSize: '14.5px',
                padding: '11px',
                borderRadius: '9999px',
                cursor: 'pointer',
                border: '1px solid var(--border-color)',
                background: state.device === 'ios' ? 'var(--accent-primary)' : 'transparent',
                color: state.device === 'ios' ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: 600,
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
              onClick={() => dispatch({ device: 'ios' })}
            >
              <svg viewBox="0 0 384 512" width="14" height="14" fill="currentColor"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/></svg>
              iPhone
            </button>
            <button
              style={{
                flex: 1,
                fontSize: '14.5px',
                padding: '11px',
                borderRadius: '9999px',
                cursor: 'pointer',
                border: '1px solid var(--border-color)',
                background: state.device === 'android' ? 'var(--accent-primary)' : 'transparent',
                color: state.device === 'android' ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: 600,
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
              onClick={() => dispatch({ device: 'android' })}
            >
              <svg viewBox="0 0 576 512" width="14" height="14" fill="currentColor"><path d="M420.55,301.93a24,24,0,1,1,24-24,24,24,0,0,1-24,24m-265.1,0a24,24,0,1,1,24-24,24,24,0,0,1-24,24m273.7-144.48,47.94-83a10,10,0,1,0-17.27-10h0l-48.54,84.07a301.25,301.25,0,0,0-246.56,0L116.18,64.45a10,10,0,1,0-17.27,10h0l48,83.24C73.68,196.83,24,266.79,24,352H552c0-85.21-49.68-155.17-122.85-194.55"/></svg>
              Android
            </button>
          </div>
        </div>

        <div style={{ width: '100%', height: 2, background: 'var(--border-color)', marginBottom: 16 }} />

        {/* Color & Orientation Selector */}
        <div style={{ display: 'flex', alignItems: 'stretch', justifyContent: 'space-between', padding: '0 12px' }}>
          {/* Device Color Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)' }}>DEVICE COLOR</span>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {['#FF5252', '#448AFF', '#69F0AE', '#FFD740'].map((color, i) => (
                <button 
                  key={i} 
                  title="Device Color" 
                  onClick={() => dispatch({ deviceColor: color })}
                  style={{ 
                    width: 28, height: 28, borderRadius: '50%', background: color, cursor: 'pointer',
                    border: state.deviceColor === color ? '2px solid var(--text-primary)' : '1px solid rgba(0,0,0,0.1)',
                    transform: state.deviceColor === color ? 'scale(1.15)' : 'scale(1)',
                    transition: 'all 0.2s ease'
                  }} 
                />
              ))}
            </div>
          </div>
          
          <div style={{ width: 1, background: 'var(--border-color)', margin: '0 12px', alignSelf: 'stretch' }} />
          
          {/* Shape Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)' }}>SHAPE</span>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <button
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  background: currentOrientation === 'vertical' ? 'var(--bg-card-hover)' : 'transparent',
                  border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer',
                  color: currentOrientation === 'vertical' ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontWeight: 600, fontSize: '13.5px', padding: '6px 12px'
                }}
                onClick={() => handleOrientationChange('vertical')}
              >
                <div style={{ width: 14, height: 22, border: `2px dashed currentColor`, borderRadius: 4, opacity: currentOrientation === 'vertical' ? 1 : 0.5 }} />
                Vertical
              </button>
              <button
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  background: currentOrientation === 'horizontal' ? 'var(--bg-card-hover)' : 'transparent',
                  border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer',
                  color: currentOrientation === 'horizontal' ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontWeight: 600, fontSize: '13.5px', padding: '6px 12px'
                }}
                onClick={() => handleOrientationChange('horizontal')}
              >
                <div style={{ width: 22, height: 14, border: `2px dashed currentColor`, borderRadius: 4, opacity: currentOrientation === 'horizontal' ? 1 : 0.5 }} />
                Horizontal
              </button>
            </div>
          </div>
        </div>
        
        <div style={{ width: '100%', height: 2, background: 'var(--border-color)', marginTop: 16, marginBottom: 16 }} />

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
                className={`animation-card-device-mock ${state.device}`}
                style={{
                  transform: isActive ? 'scale(1.05)' : 'none',
                  borderColor: isActive ? '#000000' : '#111827',
                  animation: isActive ? `card-anim-${t.id} 3s infinite ease-in-out` : 'none'
                }}
              />
            </div>
          );
        })}
      </div>

      {/* CSS keyframe styles injection for animation cards (declared once) */}
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
        </div>
      )}



      {activeTab === 'scenes' && (
        <div className="tab-content-animate" style={{ padding: 0, flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <SceneControls />
        </div>
      )}
    </div>
  );
}
