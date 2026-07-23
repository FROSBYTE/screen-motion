'use client';

import React from 'react';
import { useProgress } from '@react-three/drei';

export default function ModelLoaderOverlay() {
  const { active, progress, loaded, total } = useProgress();
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    if (active) {
      setVisible(true);
    } else {
      // Delay hiding to allow 100% progress animation to finish smoothly
      const timer = setTimeout(() => {
        setVisible(false);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [active]);

  if (!visible && progress === 100) return null;

  const roundedProgress = Math.min(100, Math.round(progress || 0));

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 40,
        background: 'rgba(12, 12, 18, 0.75)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        opacity: active ? 1 : 0,
        transition: 'opacity 0.5s ease, backdrop-filter 0.5s ease',
        pointerEvents: active ? 'auto' : 'none',
        borderRadius: 'inherit',
      }}
    >
      <div
        style={{
          width: '280px',
          padding: '24px',
          background: 'rgba(255, 255, 255, 0.08)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '24px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          textAlign: 'center',
        }}
      >
        {/* Animated Icon & Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#ffffff' }}>
          <div
            style={{
              width: '20px',
              height: '20px',
              border: '2.5px solid rgba(255, 255, 255, 0.2)',
              borderTopColor: '#818cf8',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }}
          />
          <span style={{ fontSize: '14px', fontWeight: 600, letterSpacing: '0.02em' }}>
            Loading 3D Scene
          </span>
        </div>

        {/* Loading Slider / Progress Bar Track */}
        <div
          style={{
            width: '100%',
            height: '8px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '10px',
            overflow: 'hidden',
            position: 'relative',
            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.3)',
          }}
        >
          <div
            style={{
              width: `${roundedProgress}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)',
              borderRadius: '10px',
              transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 0 14px rgba(168, 85, 247, 0.7)',
            }}
          />
        </div>

        {/* Footer Info */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            color: 'rgba(255, 255, 255, 0.65)',
            fontSize: '12px',
            fontWeight: 500,
          }}
        >
          <span>{total > 0 ? `${loaded} / ${total} assets` : 'Preparing assets...'}</span>
          <span style={{ fontWeight: 700, color: '#ffffff', fontFamily: 'monospace', fontSize: '13px' }}>
            {roundedProgress}%
          </span>
        </div>
      </div>

      <style jsx global>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
