'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export interface AnimatedListProps {
  items?: any[];
  speed?: number;
  className?: string;
  itemBg?: string;
  textColor?: string;
  fontSize?: number;
  borderRadius?: number;
  isBold?: boolean;
  isItalic?: boolean;
  fontFamily?: string;
  layerDuration?: number;
  localTime?: number;
  layerStartTime?: number;
}

function parseItemToString(item: any): string {
  if (typeof item === 'string') return item;
  if (typeof item === 'number' || typeof item === 'boolean') return String(item);
  if (typeof item === 'object' && item !== null) {
    if (typeof item.text === 'string') return item.text;
    if (typeof item.value === 'string') return item.value;
    if (typeof item.label === 'string') return item.label;
    const values = Object.values(item);
    if (values.length > 0 && values.every((v) => typeof v === 'string' && v.length <= 1)) {
      return values.join('');
    }
    return Object.values(item).map(String).join(' ');
  }
  return String(item ?? '');
}

export default function AnimatedList({
  items = ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5'],
  speed = 1,
  className = '',
  itemBg = '#ffffff',
  textColor = '#000000',
  fontSize = 16,
  borderRadius = 10,
  isBold = false,
  isItalic = false,
  fontFamily = '"Plus Jakarta Sans", sans-serif',
  layerDuration,
  localTime,
  layerStartTime = 0,
}: AnimatedListProps) {
  const normalizedItems = useMemo(() => {
    const raw = Array.isArray(items) ? items : typeof items === 'object' && items !== null ? Object.values(items) : [items];
    return raw.map(parseItemToString);
  }, [items]);

  const [visibleItems, setVisibleItems] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsRef = useRef(normalizedItems);

  const itemsKey = useMemo(() => JSON.stringify(normalizedItems), [normalizedItems]);

  useEffect(() => {
    if (localTime !== undefined) return;
    itemsRef.current = normalizedItems;
    if (visibleItems.length > 0) {
      setVisibleItems(normalizedItems.slice(0, Math.max(visibleItems.length, normalizedItems.length)));
    } else {
      setVisibleItems([]);
      setCurrentIndex(0);
    }
  }, [itemsKey, localTime]);

  useEffect(() => {
    if (localTime !== undefined) return;
    if (currentIndex >= itemsRef.current.length) return;

    const timer = setTimeout(() => {
      setVisibleItems((prev) => [...prev, itemsRef.current[currentIndex]]);
      setCurrentIndex((i) => i + 1);
    }, (400 / Math.max(0.1, speed)));

    return () => clearTimeout(timer);
  }, [currentIndex, speed, localTime]);

  if (localTime !== undefined) {
    const elapsed = Math.max(0, localTime - layerStartTime);
    const itemInterval = 0.4 / Math.max(0.1, speed);
    const visibleCount = Math.min(normalizedItems.length, Math.floor(elapsed / itemInterval) + 1);
    const displayedItems = normalizedItems.slice(0, visibleCount);

    return (
      <div className={className} style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', maxWidth: '480px' }}>
        {displayedItems.map((item, index) => {
          const itemTime = index * itemInterval;
          const itemAge = Math.max(0, elapsed - itemTime);
          const animDur = 0.3 / Math.max(0.1, speed);
          const t = Math.min(1, itemAge / animDur);
          const eased = 1 - Math.pow(1 - t, 3);
          const opacity = eased;
          const x = (1 - eased) * -20;

          return (
            <div
              key={index}
              style={{
                opacity,
                transform: `translateX(${x}px)`,
                padding: '10px 16px',
                background: itemBg,
                borderRadius: `${borderRadius}px`,
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                fontSize: `${fontSize}px`,
                color: textColor,
                fontWeight: isBold ? 800 : 500,
                fontStyle: isItalic ? 'italic' : 'normal',
                fontFamily,
              }}
            >
              {item}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className={className} style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', maxWidth: '480px' }}>
      <AnimatePresence>
        {visibleItems.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20, height: 0 }}
            animate={{ opacity: 1, x: 0, height: 'auto' }}
            exit={{ opacity: 0, x: 20, height: 0 }}
            transition={{ duration: 0.3 / speed, ease: 'easeOut' }}
            style={{
              padding: '10px 16px',
              background: itemBg,
              borderRadius: `${borderRadius}px`,
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              fontSize: `${fontSize}px`,
              color: textColor,
              fontWeight: isBold ? 800 : 500,
              fontStyle: isItalic ? 'italic' : 'normal',
              fontFamily,
            }}
          >
            {item}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
