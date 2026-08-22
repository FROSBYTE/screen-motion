'use client';

import React from 'react';
import { motion } from 'motion/react';

export interface AILoaderProps {
  variant?: 'dots' | 'bar' | 'grid';
  speed?: number;
  color?: string;
  className?: string;
  layerDuration?: number;
  localTime?: number;
  layerStartTime?: number;
}

const CYCLE_DURATION = 1.8; // seconds

function DotsLoader({ speed, color, localTime, layerStartTime = 0 }: { speed: number; color: string; localTime?: number; layerStartTime?: number }) {
  const duration = Math.max(0.1, CYCLE_DURATION / speed);

  if (localTime !== undefined) {
    const elapsed = Math.max(0, localTime - layerStartTime);
    return (
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        {[0, 1, 2].map((i) => {
          const dotTime = elapsed + (i * duration) / 3;
          const t = (dotTime % duration) / duration;
          const wave = 0.5 + 0.5 * Math.sin(t * Math.PI * 2 - Math.PI / 2);
          const scale = 1 + 0.4 * wave;
          const opacity = 0.4 + 0.6 * wave;
          return (
            <div
              key={i}
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: color,
                transform: `scale(${scale.toFixed(2)})`,
                opacity: opacity.toFixed(2),
              }}
            />
          );
        })}
      </div>
    );
  }

  return (
    <div key={`dots-${speed}`} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.4, 1, 0.4],
          }}
          transition={{
            duration,
            repeat: Infinity,
            delay: (i * duration) / 3,
            ease: 'easeInOut',
          }}
          style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: color,
          }}
        />
      ))}
    </div>
  );
}

function BarLoader({ speed, color, localTime, layerStartTime = 0 }: { speed: number; color: string; localTime?: number; layerStartTime?: number }) {
  const duration = Math.max(0.1, CYCLE_DURATION / speed);

  if (localTime !== undefined) {
    const elapsed = Math.max(0, localTime - layerStartTime);
    const t = (elapsed % duration) / duration;
    const x = -100 + t * 300;
    return (
      <div style={{ width: '120px', height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.1)', overflow: 'hidden', position: 'relative' }}>
        <div
          style={{
            position: 'absolute',
            width: '50%',
            height: '100%',
            borderRadius: '2px',
            background: color,
            transform: `translateX(${x.toFixed(1)}%)`,
          }}
        />
      </div>
    );
  }

  return (
    <div key={`bar-${speed}`} style={{ width: '120px', height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.1)', overflow: 'hidden', position: 'relative' }}>
      <motion.div
        animate={{ x: ['-100%', '200%'] }}
        transition={{ duration, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          width: '50%',
          height: '100%',
          borderRadius: '2px',
          background: color,
        }}
      />
    </div>
  );
}

function GridLoader({ speed, color, localTime, layerStartTime = 0 }: { speed: number; color: string; localTime?: number; layerStartTime?: number }) {
  const duration = Math.max(0.1, CYCLE_DURATION / speed);

  if (localTime !== undefined) {
    const elapsed = Math.max(0, localTime - layerStartTime);
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
        {Array.from({ length: 9 }).map((_, i) => {
          const cellTime = elapsed + (i * duration) / 9;
          const t = (cellTime % duration) / duration;
          const wave = 0.5 + 0.5 * Math.sin(t * Math.PI * 2 - Math.PI / 2);
          const scale = 0.8 + 0.2 * wave;
          const opacity = 0.2 + 0.8 * wave;
          return (
            <div
              key={i}
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '2px',
                background: color,
                transform: `scale(${scale.toFixed(2)})`,
                opacity: opacity.toFixed(2),
              }}
            />
          );
        })}
      </div>
    );
  }

  return (
    <div key={`grid-${speed}`} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
      {Array.from({ length: 9 }).map((_, i) => (
        <motion.div
          key={i}
          animate={{
            opacity: [0.2, 1, 0.2],
            scale: [0.8, 1, 0.8],
          }}
          transition={{
            duration,
            repeat: Infinity,
            delay: (i * duration) / 9,
            ease: 'easeInOut',
          }}
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '2px',
            background: color,
          }}
        />
      ))}
    </div>
  );
}

export default function AILoader({
  variant = 'dots',
  speed = 1,
  color = '#ffffff',
  className = '',
  layerDuration,
  localTime,
  layerStartTime = 0,
}: AILoaderProps) {
  const safeSpeed = Math.max(0.1, speed || 1);
  return (
    <div key={`${variant}-${safeSpeed}-${color}`} className={className} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }} role="status" aria-label="Loading">
      {variant === 'dots' && <DotsLoader speed={safeSpeed} color={color} localTime={localTime} layerStartTime={layerStartTime} />}
      {variant === 'bar' && <BarLoader speed={safeSpeed} color={color} localTime={localTime} layerStartTime={layerStartTime} />}
      {variant === 'grid' && <GridLoader speed={safeSpeed} color={color} localTime={localTime} layerStartTime={layerStartTime} />}
    </div>
  );
}
