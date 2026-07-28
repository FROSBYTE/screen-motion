'use client';

import React, { useState } from 'react';
import { useAppState } from '@/store';
import { TEMPLATES, TemplateName, Orientation, DeviceType } from '@/types';
import type { TextAnimationType } from '@/types';
import { Settings } from 'lucide-react';
import SceneControls from './SceneControls';

function TemplatePreviewCard({ t, isActive, dispatch, device }: { t: any, isActive: boolean, dispatch: any, device: string }) {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [error, setError] = React.useState(false);

  return (
    <div
      className={`animation-preview-card${isActive ? ' active' : ''}`}
      onClick={() => dispatch({ template: t.id })}
      onMouseEnter={() => {
        if (videoRef.current) {
          videoRef.current.play().catch(() => {});
        }
      }}
      onMouseLeave={() => {
        if (videoRef.current) {
          videoRef.current.pause();
          videoRef.current.currentTime = 0;
        }
      }}
    >
      {/* Checkmark when active */}
      {isActive && (
        <div className="animation-card-checkmark">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
      )}

      {/* Video Background (Thumbnail on rest, Plays on hover) */}
      {!error && (
        <video
          ref={videoRef}
          src={`/animation-card-videos/${t.id}-template.webm`}
          preload="auto"
          muted
          loop
          playsInline
          onError={() => setError(true)}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.3s ease',
            zIndex: 0,
          }}
        />
      )}

      {/* Generic fallback mockup if video doesn't exist */}
      {error && (
        <div 
          className={`animation-card-device-mock ${device}`}
          style={{
            borderColor: isActive ? '#000000' : '#111827',
            animation: `card-anim-${t.id} ${t.duration || 3}s infinite ease-in-out`
          }}
        />
      )}

      {/* Centered Animation Title */}
      <span className="animation-card-title" style={{ 
        zIndex: 1, 
        color: '#ffffff',
        fontSize: '16.2px',
        textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000, 0px 4px 12px rgba(0,0,0,0.8)'
      }}>
        {t.name}
      </span>
    </div>
  );
}

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
      <div className="sidebar-header" style={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-evenly', padding: '10px 14px', gap: '6px', flexShrink: 0 }}>
        <h2 
          className="sidebar-title" 
          style={{ flex: 1, textAlign: 'center', cursor: 'pointer', padding: '8px 12px', borderRadius: '8px', background: activeTab === 'animations' ? 'rgba(0,0,0,0.12)' : 'transparent', color: activeTab === 'animations' ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: activeTab === 'animations' ? 700 : 600, fontSize: '13.5px', whiteSpace: 'nowrap', transition: 'all 0.2s ease', margin: 0 }}
          onClick={() => setActiveTab('animations')}
        >
          Animations
        </h2>

        <h2 
          className="sidebar-title" 
          style={{ flex: 1, textAlign: 'center', cursor: 'pointer', padding: '8px 12px', borderRadius: '8px', background: activeTab === 'scenes' ? 'rgba(0,0,0,0.12)' : 'transparent', color: activeTab === 'scenes' ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: activeTab === 'scenes' ? 700 : 600, fontSize: '13.5px', whiteSpace: 'nowrap', transition: 'all 0.2s ease', margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
          onClick={() => setActiveTab('scenes')}
        >
          <Settings size={15} strokeWidth={2} />
          Settings
        </h2>
      </div>

      {activeTab === 'animations' && (
        <div className="tab-content-animate" style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
        <div className="sidebar-divider" style={{ width: '100%', height: 1, background: 'var(--border-color)', marginBottom: 12 }} />
        
        <div className="sidebar-controls-container">
          {/* Sub-selector for Mobile (iOS vs Android) */}
          <div className="platform-selector-box" style={{ padding: '0 12px 12px 12px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, marginBottom: 6, color: 'var(--text-secondary)', letterSpacing: '0.04em' }}>PLATFORM</label>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                className="platform-btn"
                style={{
                  flex: 1,
                  fontSize: '13px',
                  padding: '8px 12px',
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
                <svg viewBox="0 0 384 512" width="13" height="13" fill="currentColor"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/></svg>
                iPhone
              </button>
              <button
                className="platform-btn"
                style={{
                  flex: 1,
                  fontSize: '13px',
                  padding: '8px 12px',
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
                <svg viewBox="0 0 576 512" width="13" height="13" fill="currentColor"><path d="M420.55,301.93a24,24,0,1,1,24-24,24,24,0,0,1-24,24m-265.1,0a24,24,0,1,1,24-24,24,24,0,0,1-24,24m273.7-144.48,47.94-83a10,10,0,1,0-17.27-10h0l-48.54,84.07a301.25,301.25,0,0,0-246.56,0L116.18,64.45a10,10,0,1,0-17.27,10h0l48,83.24C73.68,196.83,24,266.79,24,352H552c0-85.21-49.68-155.17-122.85-194.55"/></svg>
                Android
              </button>
            </div>
          </div>

          <div className="sidebar-divider desktop-only-divider" style={{ width: '100%', height: 1, background: 'var(--border-color)', marginBottom: 12 }} />

          {/* Color & Orientation Selector */}
          <div className="options-selector-box" style={{ display: 'flex', flexDirection: 'row', gap: '16px', padding: '0 12px', justifyContent: 'space-between', flexWrap: 'wrap' }}>
            {/* Device Color Selection */}
            <div className="sidebar-device-color-box" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.04em' }}>DEVICE COLOR</span>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {['#333333', '#ffffff', '#6b7280', '#e3d5ca', '#991b1b', '#448AFF', '#69F0AE'].map((color, i) => (
                  <button 
                    key={i} 
                    title={`Device Color ${color}`} 
                    onClick={() => dispatch({ deviceColor: color })}
                    style={{ 
                      width: 24, height: 24, borderRadius: '50%', background: color, cursor: 'pointer',
                      border: state.deviceColor === color ? '2px solid var(--text-primary)' : '1px solid rgba(0,0,0,0.18)',
                      transform: state.deviceColor === color ? 'scale(1.12)' : 'scale(1)',
                      transition: 'all 0.2s ease',
                      boxShadow: color === '#ffffff' ? '0 1px 3px rgba(0,0,0,0.15)' : 'none'
                    }} 
                  />
                ))}
              </div>
            </div>
            
            {/* Shape Section */}
            <div className="sidebar-shape-box" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.04em' }}>SHAPE</span>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    background: currentOrientation === 'vertical' ? 'var(--bg-card-hover)' : 'transparent',
                    border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer',
                    color: currentOrientation === 'vertical' ? 'var(--text-primary)' : 'var(--text-secondary)',
                    fontWeight: 600, fontSize: '12.5px', padding: '5px 10px'
                  }}
                  onClick={() => handleOrientationChange('vertical')}
                >
                  <div style={{ width: 12, height: 18, border: `2px dashed currentColor`, borderRadius: 3, opacity: currentOrientation === 'vertical' ? 1 : 0.5 }} />
                  Vertical
                </button>
                <button
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    background: currentOrientation === 'horizontal' ? 'var(--bg-card-hover)' : 'transparent',
                    border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer',
                    color: currentOrientation === 'horizontal' ? 'var(--text-primary)' : 'var(--text-secondary)',
                    fontWeight: 600, fontSize: '12.5px', padding: '5px 10px'
                  }}
                  onClick={() => handleOrientationChange('horizontal')}
                >
                  <div style={{ width: 18, height: 12, border: `2px dashed currentColor`, borderRadius: 3, opacity: currentOrientation === 'horizontal' ? 1 : 0.5 }} />
                  Horizontal
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="sidebar-divider" style={{ width: '100%', height: 1, background: 'var(--border-color)', marginTop: 12, marginBottom: 12 }} />

      {/* Animation Cards Grid */}
      <div className="animations-scroll-area">
        {TEMPLATES.map((t) => {
          const isActive = state.template === t.id;
          return <TemplatePreviewCard key={t.id} t={t} isActive={isActive} dispatch={dispatch} device={state.device} />;
        })}
      </div>

      {/* CSS keyframe styles injection for animation cards (all 15 templates looping infinitely) */}
      <style jsx>{`
        @keyframes card-anim-orbit {
          0%, 100% { transform: rotateY(0deg) rotateX(0deg); }
          50% { transform: rotateY(45deg) rotateX(15deg); }
        }
        @keyframes card-anim-hero-reveal {
          0%, 100% { transform: scale(0.85) rotate(-5deg); }
          50% { transform: scale(1.15) rotate(0deg); }
        }
        @keyframes card-anim-float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(3deg); }
        }
        @keyframes card-anim-flip {
          0%, 100% { transform: rotateY(0deg); }
          50% { transform: rotateY(180deg); }
        }
        @keyframes card-anim-rise {
          0%, 100% { transform: translateY(10px) scale(0.9); }
          50% { transform: translateY(-4px) scale(1.05); }
        }
        @keyframes card-anim-tilt-shift {
          0%, 100% { transform: rotateX(20deg) rotateY(-15deg); }
          50% { transform: rotateX(-10deg) rotateY(15deg); }
        }
        @keyframes card-anim-bounce-drop {
          0% { transform: translateY(-30px); }
          50%, 100% { transform: translateY(0px); }
        }
        @keyframes card-anim-slide-in {
          0%, 100% { transform: translateX(-12px); }
          50% { transform: translateX(0px); }
        }
        @keyframes card-anim-spiral {
          0%, 100% { transform: rotate(0deg) scale(0.85); }
          50% { transform: rotate(180deg) scale(1.1); }
        }
        @keyframes card-anim-cinematic-pan {
          0% { transform: translateX(-15px) rotateY(-15deg); }
          50%, 100% { transform: translateX(0px) rotateY(0deg); }
        }
        @keyframes card-anim-slow-pan {
          0%, 100% { transform: translateX(-8px); }
          50% { transform: translateX(8px); }
        }

        @keyframes card-anim-horizontal-slide {
          0%, 100% { transform: translateX(12px); }
          50% { transform: translateX(-4px); }
        }
        @keyframes card-anim-infinity-loop {
          0%, 100% { transform: rotate(0deg) translateY(0px) scale(0.9); }
          25% { transform: rotate(10deg) translateY(-6px) scale(1.05); }
          50% { transform: rotate(0deg) translateY(4px) scale(0.95); }
          75% { transform: rotate(-10deg) translateY(-6px) scale(1.05); }
        }
        @keyframes card-anim-dynamic-showcase {
          0%, 100% { transform: rotate(-8px) scale(0.85); }
          50% { transform: rotate(12px) scale(1.1); }
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
