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
  layerDuration?: number;
  localTime?: number;
  layerStartTime?: number;
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
  layerDuration,
  localTime,
  layerStartTime = 0,
}: FolderProps) {
  const safeSpeed = Math.max(0.1, speed);
  const w = 120 * size;
  const h = 80 * size;
  const tabW = 40 * size;
  const tabH = 12 * size;
  const paperMargin = 6 * size;
  const duration = 0.4 / safeSpeed;

  if (localTime !== undefined) {
    const elapsed = Math.max(0, localTime - layerStartTime);

    const tabT = Math.min(1, Math.max(0, (elapsed - 0.1 / safeSpeed) / duration));
    const tabScaleX = 1 - Math.pow(1 - tabT, 3);

    const backT = Math.min(1, Math.max(0, (elapsed - 0.2 / safeSpeed) / duration));
    const backEased = 1 - Math.pow(1 - backT, 3);
    const backOpacity = backEased * 0.85;
    const backY = (1 - backEased) * 10;

    const frontT = Math.min(1, Math.max(0, (elapsed - 0.8 / safeSpeed) / duration));
    const frontEased = 1 - Math.pow(1 - frontT, 3);
    const frontOpacity = frontEased * 0.95;
    const frontY = (1 - frontEased) * 10;

    return (
      <div className={className} style={{ position: 'relative', width: `${w}px`, height: `${h + tabH}px` }}>
        {/* Folder tab */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: `${12 * size}px`,
            width: `${tabW}px`,
            height: `${tabH}px`,
            background: color,
            borderRadius: `${4 * size}px ${4 * size}px 0 0`,
            transformOrigin: 'left',
            transform: `scaleX(${tabScaleX.toFixed(2)})`,
          }}
        />

        {/* Folder back */}
        <div
          style={{
            position: 'absolute',
            top: `${tabH}px`,
            left: 0,
            width: `${w}px`,
            height: `${h}px`,
            background: color,
            borderRadius: `${6 * size}px`,
            opacity: backOpacity.toFixed(2),
            transform: `translateY(${backY.toFixed(1)}px)`,
          }}
        />

        {/* Paper items */}
        {items.slice(0, 3).map((item, i) => {
          const paperT = Math.min(1, Math.max(0, (elapsed - (0.4 + i * 0.15) / safeSpeed) / duration));
          const paperEased = 1 - Math.pow(1 - paperT, 3);
          const paperOpacity = paperEased;
          const paperY = (1 - paperEased) * 20;

          return (
            <div
              key={i}
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
                opacity: paperOpacity.toFixed(2),
                transform: `translateY(${paperY.toFixed(1)}px)`,
              }}
            >
              {item.text}
            </div>
          );
        })}

        {/* Folder front */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: `${w}px`,
            height: `${h * 0.4}px`,
            background: color,
            borderRadius: `0 0 ${6 * size}px ${6 * size}px`,
            opacity: frontOpacity.toFixed(2),
            transform: `translateY(${frontY.toFixed(1)}px)`,
            filter: 'brightness(1.1)',
          }}
        />
      </div>
    );
  }

  return (
    <div className={className} style={{ position: 'relative', width: `${w}px`, height: `${h + tabH}px` }}>
      {/* Folder tab */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration, delay: 0.1 / safeSpeed }}
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
        transition={{ duration, delay: 0.2 / safeSpeed }}
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
          transition={{ duration, delay: (0.4 + i * 0.15) / safeSpeed, type: 'spring', stiffness: 200, damping: 15 }}
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
        transition={{ duration, delay: 0.8 / safeSpeed }}
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
