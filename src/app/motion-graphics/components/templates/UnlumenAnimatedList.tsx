'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export interface NotificationItem {
  title: string;
  description: string;
  bgColor?: string;
  titleColor?: string;
  descriptionColor?: string;
  accentColor?: string;
}

export interface UnlumenAnimatedListProps {
  items?: NotificationItem[];
  count?: number; // how many notifications to show (cycles/limits from items)
  speed?: number;
  isBold?: boolean;
  isItalic?: boolean;
  fontFamily?: string;
  className?: string;
  layerDuration?: number;
  localTime?: number;
  layerStartTime?: number;
}

const DEFAULT_ITEMS: NotificationItem[] = [
  { title: 'New notification', description: 'You have a new message', bgColor: 'rgba(255,255,255,0.05)', titleColor: '#ffffff', descriptionColor: 'rgba(255,255,255,0.5)', accentColor: '#6366f1' },
  { title: 'Payment received', description: '$250.00 from client', bgColor: 'rgba(255,255,255,0.05)', titleColor: '#ffffff', descriptionColor: 'rgba(255,255,255,0.5)', accentColor: '#6366f1' },
  { title: 'Task completed', description: 'Design review finished', bgColor: 'rgba(255,255,255,0.05)', titleColor: '#ffffff', descriptionColor: 'rgba(255,255,255,0.5)', accentColor: '#6366f1' },
  { title: 'New follower', description: 'Someone followed you', bgColor: 'rgba(255,255,255,0.05)', titleColor: '#ffffff', descriptionColor: 'rgba(255,255,255,0.5)', accentColor: '#6366f1' },
  { title: 'Update available', description: 'Version 2.0 is ready', bgColor: 'rgba(255,255,255,0.05)', titleColor: '#ffffff', descriptionColor: 'rgba(255,255,255,0.5)', accentColor: '#6366f1' },
];

export default function UnlumenAnimatedList({
  items = DEFAULT_ITEMS,
  count,
  speed = 1,
  isBold = true,
  isItalic = false,
  fontFamily = '"Plus Jakarta Sans", sans-serif',
  className = '',
  layerDuration,
  localTime,
  layerStartTime = 0,
}: UnlumenAnimatedListProps) {
  const safeSpeed = Math.max(0.1, speed || 1);
  const effectiveItems = typeof count === 'number' ? items.slice(0, count) : items;
  const [visibleItems, setVisibleItems] = useState<typeof effectiveItems>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsKey = JSON.stringify(effectiveItems);
  const itemsRef = useRef(effectiveItems);

  useEffect(() => {
    if (localTime !== undefined) return;
    itemsRef.current = effectiveItems;
    setVisibleItems([]);
    setCurrentIndex(0);
  }, [itemsKey, safeSpeed, localTime]);

  useEffect(() => {
    if (localTime !== undefined) return;
    if (currentIndex >= itemsRef.current.length) return;
    const timer = setTimeout(() => {
      setVisibleItems((prev) => [itemsRef.current[currentIndex], ...prev]);
      setCurrentIndex((i) => i + 1);
    }, 800 / safeSpeed);
    return () => clearTimeout(timer);
  }, [currentIndex, safeSpeed, localTime]);

  if (localTime !== undefined) {
    const elapsed = Math.max(0, localTime - layerStartTime);
    const itemInterval = 0.8 / safeSpeed;
    const visibleCount = Math.min(effectiveItems.length, Math.floor(elapsed / itemInterval) + 1);
    const displayedItems = effectiveItems.slice(0, visibleCount).reverse();

    return (
      <div className={className} style={{ width: '100%', maxWidth: '480px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {displayedItems.map((item, index) => {
          // The most recent item is index 0 in the reversed list
          const originalIndex = visibleCount - 1 - index;
          const itemTime = originalIndex * itemInterval;
          const itemAge = Math.max(0, elapsed - itemTime);
          const animDur = 0.3 / safeSpeed;
          const t = Math.min(1, itemAge / animDur);
          const eased = 1 - Math.pow(1 - t, 3);
          const opacity = eased;
          const y = (1 - eased) * -20;

          return (
            <div
              key={index}
              style={{
                opacity,
                transform: `translateY(${y}px)`,
                padding: '14px 18px',
                background: item.bgColor || 'rgba(255,255,255,0.05)',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.08)',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
              }}
            >
              <div style={{
                width: '10px', height: '10px', borderRadius: '50%',
                background: item.accentColor || '#6366f1', flexShrink: 0,
              }} />
              <div>
                <div style={{ fontSize: '15px', fontWeight: isBold ? 800 : 500, fontStyle: isItalic ? 'italic' : 'normal', fontFamily, color: item.titleColor || '#ffffff', marginBottom: '2px' }}>{item.title}</div>
                <div style={{ fontSize: '13px', fontStyle: isItalic ? 'italic' : 'normal', fontFamily, color: item.descriptionColor || 'rgba(255,255,255,0.5)' }}>{item.description}</div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className={className} style={{ width: '100%', maxWidth: '480px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <AnimatePresence initial={false}>
        {visibleItems.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 / safeSpeed, ease: [0.25, 0.46, 0.45, 0.94] }}
            layout={false}
            style={{
              padding: '14px 18px',
              background: item.bgColor || 'rgba(255,255,255,0.05)',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
            }}
          >
            <div style={{
              width: '10px', height: '10px', borderRadius: '50%',
              background: item.accentColor || '#6366f1', flexShrink: 0,
            }} />
            <div>
              <div style={{ fontSize: '15px', fontWeight: isBold ? 800 : 500, fontStyle: isItalic ? 'italic' : 'normal', fontFamily, color: item.titleColor || '#ffffff', marginBottom: '2px' }}>{item.title}</div>
              <div style={{ fontSize: '13px', fontStyle: isItalic ? 'italic' : 'normal', fontFamily, color: item.descriptionColor || 'rgba(255,255,255,0.5)' }}>{item.description}</div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
