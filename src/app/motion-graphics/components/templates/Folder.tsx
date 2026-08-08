'use client';

import React from 'react';
import { motion } from 'motion/react';

export interface FolderDocItem {
  text: string;
  bgColor?: string;
  textColor?: string;
}

export interface FolderProps {
  color?: string;
  size?: number;
  items?: FolderDocItem[];
  speed?: number;
  className?: string;
}

const DEFAULT_ITEMS: FolderDocItem[] = [
  { text: 'Doc 1', bgColor: '#ffffff', textColor: '#333333' },
  { text: 'Doc 2', bgColor: '#ffffff', textColor: '#333333' },
  { text: 'Doc 3', bgColor: '#ffffff', textColor: '#333333' },
];

export default function Folder({
  color = '#5227ff',
  size = 1.5,
  items = DEFAULT_ITEMS,
  speed = 1,
  className = '',
}: FolderProps) {
  const w = 120 * size;
  const h = 80 * size;
  const tabW = 40 * size;
  const tabH = 12 * size;
  const paperMargin = 6 * size;
  const duration = 0.4 / speed;

  return (
    <div className={className} style={{ position: 'relative', width: `${w}px`, height: `${h + tabH}px` }}>
      {/* Folder tab */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration, delay: 0.1 / speed }}
        style={{
          position: 'absolute',
          top: 0,
          left: `${12 * size}px`,
          width: `${tabW}px`,
          height: `${tabH}px`,
          background: color,
          borderRadius: `${4 * size}px ${4 * size}px 0 0`,
          transformOrigin: 'left',
        }}
      />

      {/* Folder back */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration, delay: 0.2 / speed }}
        style={{
          position: 'absolute',
          top: `${tabH}px`,
          left: 0,
          width: `${w}px`,
          height: `${h}px`,
          background: color,
          borderRadius: `${6 * size}px`,
          opacity: 0.85,
        }}
      />

      {/* Paper items */}
      {items.slice(0, 3).map((item, i) => (
        <motion.div
          key={i}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration, delay: (0.4 + i * 0.15) / speed, type: 'spring', stiffness: 200, damping: 15 }}
          style={{
            position: 'absolute',
            top: `${tabH + paperMargin + i * (16 * size)}px`,
            left: `${paperMargin}px`,
            right: `${paperMargin}px`,
            height: `${18 * size}px`,
            background: item.bgColor || '#ffffff',
            borderRadius: `${3 * size}px`,
            boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            paddingLeft: `${8 * size}px`,
            fontSize: `${10 * size}px`,
            color: item.textColor || '#333333',
            fontWeight: 500,
          }}
        >
          {item.text}
        </motion.div>
      ))}

      {/* Folder front (slightly transparent) */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration, delay: 0.8 / speed }}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: `${w}px`,
          height: `${h * 0.4}px`,
          background: color,
          borderRadius: `0 0 ${6 * size}px ${6 * size}px`,
          opacity: 0.95,
          filter: 'brightness(1.1)',
        }}
      />
    </div>
  );
}
