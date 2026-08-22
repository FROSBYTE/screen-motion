'use client';

import React from 'react';
import { motion } from 'motion/react';

export interface SkeletonShimmerProps {
  lines?: number;
  showAvatar?: boolean;
  showImage?: boolean;
  color?: string;
  baseColor?: string;
  shimmerColor?: string;
  speed?: number;
  borderRadius?: number;
  className?: string;
  layerDuration?: number;
  localTime?: number;
  layerStartTime?: number;
}

function parseShimmerColors(color?: string, baseColor?: string, shimmerColor?: string) {
  if (color) {
    const clean = color.startsWith('#') ? color : '#ffffff';
    let r = 255, g = 255, b = 255;
    if (clean.length === 7) {
      r = parseInt(clean.slice(1, 3), 16) || 255;
      g = parseInt(clean.slice(3, 5), 16) || 255;
      b = parseInt(clean.slice(5, 7), 16) || 255;
    } else if (clean.length === 4) {
      r = parseInt(clean[1] + clean[1], 16) || 255;
      g = parseInt(clean[2] + clean[2], 16) || 255;
      b = parseInt(clean[3] + clean[3], 16) || 255;
    }
    return {
      effectiveBase: `rgba(${r}, ${g}, ${b}, 0.12)`,
      effectiveShimmer: `rgba(${r}, ${g}, ${b}, 0.32)`,
    };
  }
  return {
    effectiveBase: baseColor || 'rgba(255,255,255,0.08)',
    effectiveShimmer: shimmerColor || 'rgba(255,255,255,0.18)',
  };
}

function ShimmerBar({ width, height, baseColor, shimmerColor, speed, borderRadius, delay = 0, localTime, layerStartTime = 0 }: {
  width: string; height: string; baseColor: string; shimmerColor: string; speed: number; borderRadius: number; delay?: number; localTime?: number; layerStartTime?: number;
}) {
  const duration = 1.5 / Math.max(0.1, speed);
  const deterministicX = localTime !== undefined
    ? -100 + (((Math.max(0, localTime - layerStartTime + delay)) % duration) / duration) * 300
    : null;

  return (
    <div style={{
      width,
      height,
      borderRadius: `${borderRadius}px`,
      background: baseColor,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {deterministicX !== null ? (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '50%',
            height: '100%',
            background: `linear-gradient(90deg, transparent, ${shimmerColor}, transparent)`,
            transform: `translateX(${deterministicX}%)`,
          }}
        />
      ) : (
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
      )}
    </div>
  );
}

export default function SkeletonShimmer({
  lines = 3,
  showAvatar = true,
  showImage = false,
  color = '#ffffff',
  baseColor,
  shimmerColor,
  speed = 1,
  borderRadius = 6,
  className = '',
  layerDuration,
  localTime,
  layerStartTime = 0,
}: SkeletonShimmerProps) {
  const { effectiveBase, effectiveShimmer } = parseShimmerColors(color, baseColor, shimmerColor);
  return (
    <div className={className} style={{ width: '100%', maxWidth: '320px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Header with avatar */}
      {showAvatar && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ShimmerBar
            width="40px" height="40px"
            baseColor={effectiveBase} shimmerColor={effectiveShimmer}
            speed={speed} borderRadius={20}
            localTime={localTime} layerStartTime={layerStartTime}
          />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <ShimmerBar
              width="60%" height="12px"
              baseColor={effectiveBase} shimmerColor={effectiveShimmer}
              speed={speed} borderRadius={borderRadius} delay={0.1}
              localTime={localTime} layerStartTime={layerStartTime}
            />
            <ShimmerBar
              width="40%" height="10px"
              baseColor={effectiveBase} shimmerColor={effectiveShimmer}
              speed={speed} borderRadius={borderRadius} delay={0.2}
              localTime={localTime} layerStartTime={layerStartTime}
            />
          </div>
        </div>
      )}

      {/* Image placeholder */}
      {showImage && (
        <ShimmerBar
          width="100%" height="120px"
          baseColor={effectiveBase} shimmerColor={effectiveShimmer}
          speed={speed} borderRadius={borderRadius} delay={0.15}
          localTime={localTime} layerStartTime={layerStartTime}
        />
      )}

      {/* Text lines */}
      {Array.from({ length: lines }).map((_, i) => (
        <ShimmerBar
          key={i}
          width={i === lines - 1 ? '70%' : '100%'}
          height="12px"
          baseColor={effectiveBase}
          shimmerColor={effectiveShimmer}
          speed={speed}
          borderRadius={borderRadius}
          delay={i * 0.1}
          localTime={localTime}
          layerStartTime={layerStartTime}
        />
      ))}
    </div>
  );
}
