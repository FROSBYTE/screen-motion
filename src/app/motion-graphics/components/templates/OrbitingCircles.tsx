'use client';

import React from 'react';
import { motion } from 'motion/react';

export interface OrbitItem {
  imageUrl?: string;
  emoji?: string; // fallback if no image
}

export interface OrbitingCirclesProps {
  items?: OrbitItem[];
  radius?: number;
  speed?: number;
  iconSize?: number;
  orbitColor?: string;
  className?: string;
}

const DEFAULT_ITEMS: OrbitItem[] = [
  { emoji: '⚛️' },
  { emoji: '▲' },
  { emoji: '🔷' },
  { emoji: '🟢' },
  { emoji: '⚡' },
  { emoji: '🔮' },
];

export default function OrbitingCircles({
  items = DEFAULT_ITEMS,
  radius = 100,
  speed = 1,
  iconSize = 36,
  orbitColor = 'rgba(255,255,255,0.1)',
  className = '',
}: OrbitingCirclesProps) {
  const duration = 20 / speed;

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        width: `${radius * 2 + iconSize}px`,
        height: `${radius * 2 + iconSize}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Orbit ring */}
      <div style={{
        position: 'absolute',
        width: `${radius * 2}px`,
        height: `${radius * 2}px`,
        borderRadius: '50%',
        border: `1px solid ${orbitColor}`,
      }} />

      {/* Center dot */}
      <div style={{
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        background: orbitColor,
      }} />

      {/* Orbiting items */}
      {items.map((item, i) => (
        <motion.div
          key={`orbit-${i}`}
          animate={{ rotate: 360 }}
          transition={{
            duration,
            repeat: Infinity,
            ease: 'linear',
            delay: -(duration * (i / items.length)),
          }}
          style={{
            position: 'absolute',
            width: `${radius * 2}px`,
            height: `${radius * 2}px`,
            top: '50%',
            left: '50%',
            marginTop: `-${radius}px`,
            marginLeft: `-${radius}px`,
            pointerEvents: 'none',
          }}
        >
          <div style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: `translateX(-50%)`,
            width: `${iconSize}px`,
            height: `${iconSize}px`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            overflow: 'hidden',
          }}>
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration, repeat: Infinity, ease: 'linear', delay: -(duration * (i / items.length)) }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}
            >
              {item.imageUrl ? (
                <img src={item.imageUrl} alt="" style={{ width: '70%', height: '70%', objectFit: 'contain' }} />
              ) : (
                <span style={{ fontSize: `${iconSize * 0.6}px` }}>{item.emoji || '⚡'}</span>
              )}
            </motion.div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
