'use client';

import React from 'react';
import { motion } from 'motion/react';

export interface SkeletonShimmerProps {
  lines?: number;
  showAvatar?: boolean;
  showImage?: boolean;
  baseColor?: string;
  shimmerColor?: string;
  speed?: number;
  borderRadius?: number;
  className?: string;
}

function ShimmerBar({ width, height, baseColor, shimmerColor, speed, borderRadius, delay = 0 }: {
  width: string; height: string; baseColor: string; shimmerColor: string; speed: number; borderRadius: number; delay?: number;
}) {
  const duration = 1.5 / speed;
  return (
    <div style={{
      width,
      height,
      borderRadius: `${borderRadius}px`,
      background: baseColor,
      position: 'relative',
      overflow: 'hidden',
    }}>
      <motion.div
        animate={{ x: ['-100%', '200%'] }}
        transition={{ duration, repeat: Infinity, ease: 'easeInOut', delay }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '50%',
          height: '100%',
          background: `linear-gradient(90deg, transparent, ${shimmerColor}, transparent)`,
        }}
      />
    </div>
  );
}

export default function SkeletonShimmer({
  lines = 3,
  showAvatar = true,
  showImage = false,
  baseColor = 'rgba(255,255,255,0.08)',
  shimmerColor = 'rgba(255,255,255,0.15)',
  speed = 1,
  borderRadius = 6,
  className = '',
}: SkeletonShimmerProps) {
  return (
    <div className={className} style={{ width: '100%', maxWidth: '320px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Header with avatar */}
      {showAvatar && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ShimmerBar
            width="40px" height="40px"
            baseColor={baseColor} shimmerColor={shimmerColor}
            speed={speed} borderRadius={20}
          />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <ShimmerBar
              width="60%" height="12px"
              baseColor={baseColor} shimmerColor={shimmerColor}
              speed={speed} borderRadius={borderRadius} delay={0.1}
            />
            <ShimmerBar
              width="40%" height="10px"
              baseColor={baseColor} shimmerColor={shimmerColor}
              speed={speed} borderRadius={borderRadius} delay={0.2}
            />
          </div>
        </div>
      )}

      {/* Image placeholder */}
      {showImage && (
        <ShimmerBar
          width="100%" height="140px"
          baseColor={baseColor} shimmerColor={shimmerColor}
          speed={speed} borderRadius={borderRadius} delay={0.15}
        />
      )}

      {/* Text lines */}
      {Array.from({ length: lines }).map((_, i) => {
        const widths = ['100%', '90%', '75%', '85%', '60%'];
        return (
          <ShimmerBar
            key={i}
            width={widths[i % widths.length]}
            height="12px"
            baseColor={baseColor}
            shimmerColor={shimmerColor}
            speed={speed}
            borderRadius={borderRadius}
            delay={i * 0.1}
          />
        );
      })}
    </div>
  );
}
