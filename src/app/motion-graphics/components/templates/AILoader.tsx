'use client';

import React from 'react';
import { motion } from 'motion/react';

export interface AILoaderProps {
  variant?: 'dots' | 'bar' | 'grid';
  speed?: number;
  color?: string;
  className?: string;
}

const CYCLE_DURATION = 1.8; // seconds

function DotsLoader({ speed, color }: { speed: number; color: string }) {
  const duration = Math.max(0.1, CYCLE_DURATION / speed);
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

function BarLoader({ speed, color }: { speed: number; color: string }) {
  const duration = Math.max(0.1, CYCLE_DURATION / speed);
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

function GridLoader({ speed, color }: { speed: number; color: string }) {
  const duration = Math.max(0.1, CYCLE_DURATION / speed);
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
}: AILoaderProps) {
  const safeSpeed = Math.max(0.1, speed || 1);
  return (
    <div key={`${variant}-${safeSpeed}-${color}`} className={className} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }} role="status" aria-label="Loading">
      {variant === 'dots' && <DotsLoader speed={safeSpeed} color={color} />}
      {variant === 'bar' && <BarLoader speed={safeSpeed} color={color} />}
      {variant === 'grid' && <GridLoader speed={safeSpeed} color={color} />}
    </div>
  );
}
