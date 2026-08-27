'use client';

import React from 'react';
import { useAlignmentGuides } from '@/context/AlignmentContext';

export default function AlignmentGuidesOverlay() {
  const { activeGuides } = useAlignmentGuides();

  if (!activeGuides || activeGuides.length === 0) return null;

  const hasVerticalCenter = activeGuides.some(
    (g) => g.type === 'vertical' && g.snapType === 'canvas-center'
  );
  const hasHorizontalCenter = activeGuides.some(
    (g) => g.type === 'horizontal' && g.snapType === 'canvas-center'
  );
  const isPerfectCenter = hasVerticalCenter && hasHorizontalCenter;

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 999,
        overflow: 'hidden',
      }}
    >
      {activeGuides.map((guide) => {
        const isCanvas = guide.snapType === 'canvas-center';
        const strokeColor = isCanvas ? '#ec4899' : '#3b82f6';
        const glowColor = isCanvas ? 'rgba(236, 72, 153, 0.6)' : 'rgba(59, 130, 246, 0.6)';

        if (guide.type === 'vertical') {
          return (
            <React.Fragment key={guide.id}>
              {/* Vertical Guide Line */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  left: `${guide.positionPercent}%`,
                  width: '1px',
                  backgroundColor: strokeColor,
                  boxShadow: `0 0 6px ${glowColor}, 0 0 12px ${glowColor}`,
                  transform: 'translateX(-50%)',
                  transition: 'opacity 0.1s ease-in-out',
                }}
              />
              {/* Top and Bottom Endpoint Dots */}
              <div
                style={{
                  position: 'absolute',
                  top: '12px',
                  left: `${guide.positionPercent}%`,
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: strokeColor,
                  boxShadow: `0 0 8px ${strokeColor}`,
                  transform: 'translate(-50%, -50%)',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: '12px',
                  left: `${guide.positionPercent}%`,
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: strokeColor,
                  boxShadow: `0 0 8px ${strokeColor}`,
                  transform: 'translate(-50%, 50%)',
                }}
              />
            </React.Fragment>
          );
        }

        if (guide.type === 'horizontal') {
          return (
            <React.Fragment key={guide.id}>
              {/* Horizontal Guide Line */}
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: `${guide.positionPercent}%`,
                  height: '1px',
                  backgroundColor: strokeColor,
                  boxShadow: `0 0 6px ${glowColor}, 0 0 12px ${glowColor}`,
                  transform: 'translateY(-50%)',
                  transition: 'opacity 0.1s ease-in-out',
                }}
              />
              {/* Left and Right Endpoint Dots */}
              <div
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: `${guide.positionPercent}%`,
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: strokeColor,
                  boxShadow: `0 0 8px ${strokeColor}`,
                  transform: 'translate(-50%, -50%)',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: `${guide.positionPercent}%`,
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: strokeColor,
                  boxShadow: `0 0 8px ${strokeColor}`,
                  transform: 'translate(50%, -50%)',
                }}
              />
            </React.Fragment>
          );
        }

        return null;
      })}

      {/* Perfect Center Intersection Glow Badge */}
      {isPerfectCenter && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(236, 72, 153, 0.4) 0%, rgba(236, 72, 153, 0) 70%)',
            border: '1.5px solid #ec4899',
            boxShadow: '0 0 16px #ec4899',
            animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite',
          }}
        >
          <div
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: '#ffffff',
            }}
          />
        </div>
      )}
    </div>
  );
}
