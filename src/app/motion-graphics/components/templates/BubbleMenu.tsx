'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export interface BubbleMenuItem {
  imageUrl?: string;
  imageAssetId?: string;
}

export interface BubbleMenuProps {
  items?: BubbleMenuItem[];
  speed?: number;
  menuBg?: string;
  radius?: number;
  bubbleSize?: number;
  centerImageUrl?: string;
  centerBg?: string;
  centerSize?: number;
  className?: string;
  layerDuration?: number;
  localTime?: number;
  layerStartTime?: number;
}

const DEFAULT_ITEMS: BubbleMenuItem[] = [
  { imageUrl: undefined },
  { imageUrl: undefined },
  { imageUrl: undefined },
  { imageUrl: undefined },
  { imageUrl: undefined },
];

export default function BubbleMenu({
  items = DEFAULT_ITEMS,
  speed = 1,
  menuBg = 'transparent',
  radius = 130,
  bubbleSize = 58,
  centerImageUrl,
  centerBg = 'transparent',
  centerSize,
  className = '',
  layerDuration,
  localTime,
  layerStartTime = 0,
}: BubbleMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const safeSpeed = Math.max(0.1, speed);

  useEffect(() => {
    if (localTime !== undefined) return;
    const timer = setTimeout(() => setIsOpen(true), 500 / safeSpeed);
    return () => clearTimeout(timer);
  }, [safeSpeed, localTime]);

  const staggerDelay = 0.12 / safeSpeed;
  const duration = 0.5 / safeSpeed;

  const effectiveCenterSize = centerSize ?? bubbleSize;

  return (
    <div className={className} style={{ position: 'relative', width: `${radius * 2 + bubbleSize + 20}px`, height: `${radius * 2 + bubbleSize + 20}px`, display: 'flex', alignItems: 'center', justifyContent: 'center', background: menuBg, borderRadius: '50%' }}>
      {/* Center anchor circle (supports image attachment) */}
      <div style={{
        position: 'relative',
        width: `${effectiveCenterSize}px`,
        height: `${effectiveCenterSize}px`,
        borderRadius: '50%',
        background: centerImageUrl ? 'transparent' : (centerBg === 'transparent' ? 'rgba(255, 255, 255, 0.05)' : centerBg),
        border: centerImageUrl ? 'none' : '1px dashed rgba(255, 255, 255, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        boxShadow: centerImageUrl ? 'none' : '0 2px 10px rgba(0,0,0,0.2)',
        zIndex: 5,
      }}>
        {centerImageUrl ? (
          <img
            src={centerImageUrl}
            alt="Center"
            style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '50%' }}
          />
        ) : null}
      </div>

      {/* Deterministic Bubbles */}
      {localTime !== undefined ? (
        items.map((item, index) => {
          const elapsed = Math.max(0, localTime - layerStartTime);
          const openDelay = 0.5 / safeSpeed;
          const bubbleElapsed = Math.max(0, elapsed - openDelay - index * staggerDelay);
          if (bubbleElapsed <= 0) return null;

          const t = Math.min(1, bubbleElapsed / duration);
          const eased = 1 - Math.pow(1 - t, 3);
          const angle = (index / items.length) * 360 - 90;
          const x = Math.cos((angle * Math.PI) / 180) * radius * eased;
          const y = Math.sin((angle * Math.PI) / 180) * radius * eased;

          return (
            <div
              key={index}
              style={{
                position: 'absolute',
                width: `${bubbleSize}px`,
                height: `${bubbleSize}px`,
                borderRadius: '50%',
                background: item.imageUrl ? 'transparent' : 'rgba(255, 255, 255, 0.08)',
                border: item.imageUrl ? 'none' : '1px solid rgba(255, 255, 255, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: item.imageUrl ? 'none' : '0 2px 12px rgba(0,0,0,0.3)',
                zIndex: 4,
                overflow: 'hidden',
                transform: `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) scale(${eased.toFixed(2)})`,
                opacity: eased.toFixed(2),
              }}
            >
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={`Bubble ${index + 1}`}
                  style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '50%' }}
                />
              ) : (
                <span style={{ fontSize: `${bubbleSize * 0.35}px`, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>
                  {index + 1}
                </span>
              )}
            </div>
          );
        })
      ) : (
        /* Live Framer Motion Bubbles */
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
                  background: item.imageUrl ? 'transparent' : 'rgba(255, 255, 255, 0.08)',
                  border: item.imageUrl ? 'none' : '1px solid rgba(255, 255, 255, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: item.imageUrl ? 'none' : '0 2px 12px rgba(0,0,0,0.3)',
                  zIndex: 4,
                  overflow: 'hidden',
                }}
              >
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={`Bubble ${index + 1}`}
                    style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '50%' }}
                  />
                ) : (
                  <span style={{ fontSize: `${bubbleSize * 0.35}px`, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>
                    {index + 1}
                  </span>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      )}
    </div>
  );
}
