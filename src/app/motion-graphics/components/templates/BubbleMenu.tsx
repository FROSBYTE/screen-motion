'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export interface BubbleMenuItem {
  label: string;
  color: string;
  imageUrl?: string; // optional image URL; if absent, shows first letter of label
}

export interface BubbleMenuProps {
  items?: BubbleMenuItem[];
  speed?: number;
  menuBg?: string;
  radius?: number;
  bubbleSize?: number;
  className?: string;
}

const DEFAULT_ITEMS: BubbleMenuItem[] = [
  { label: 'Home', color: '#6366f1' },
  { label: 'About', color: '#8b5cf6' },
  { label: 'Work', color: '#a855f7' },
  { label: 'Blog', color: '#d946ef' },
  { label: 'Contact', color: '#ec4899' },
];

export default function BubbleMenu({
  items = DEFAULT_ITEMS,
  speed = 1,
  menuBg = 'transparent',
  radius = 90,
  bubbleSize = 44,
  className = '',
}: BubbleMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsOpen(true), 500 / speed);
    return () => clearTimeout(timer);
  }, [speed]);

  const staggerDelay = 0.12 / speed;
  const duration = 0.5 / speed;

  return (
    <div className={className} style={{ position: 'relative', width: `${radius * 2 + bubbleSize + 20}px`, height: `${radius * 2 + bubbleSize + 20}px`, display: 'flex', alignItems: 'center', justifyContent: 'center', background: menuBg, borderRadius: '50%' }}>
      {/* Center anchor point (background only, no toggle button) */}
      <div style={{
        width: `${bubbleSize * 0.3}px`,
        height: `${bubbleSize * 0.3}px`,
        borderRadius: '50%',
        background: 'rgba(0,0,0,0.1)',
        zIndex: 5,
      }} />

      {/* Bubbles */}
      <AnimatePresence>
        {isOpen && items.map((item, index) => {
          const angle = (index / items.length) * 360 - 90;
          const x = Math.cos((angle * Math.PI) / 180) * radius;
          const y = Math.sin((angle * Math.PI) / 180) * radius;

          return (
            <motion.div
              key={index}
              initial={{ scale: 0, x: 0, y: 0, opacity: 0 }}
              animate={{ scale: 1, x, y, opacity: 1 }}
              exit={{ scale: 0, x: 0, y: 0, opacity: 0 }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 20,
                delay: index * staggerDelay,
                duration,
              }}
              style={{
                position: 'absolute',
                width: `${bubbleSize}px`,
                height: `${bubbleSize}px`,
                borderRadius: '50%',
                background: item.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
                overflow: 'hidden',
              }}
            >
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.label}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                />
              ) : (
                <span style={{ fontSize: `${bubbleSize * 0.4}px`, lineHeight: 1, color: '#fff', fontWeight: 700 }}>
                  {item.label.charAt(0)}
                </span>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
