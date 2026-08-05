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
  fontSize = 14,
  borderRadius = 8,
  isBold = false,
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
    itemsRef.current = normalizedItems;
    if (visibleItems.length > 0) {
      setVisibleItems(normalizedItems.slice(0, Math.max(visibleItems.length, normalizedItems.length)));
    } else {
      setVisibleItems([]);
      setCurrentIndex(0);
    }
  }, [itemsKey]);

  useEffect(() => {
    if (currentIndex >= itemsRef.current.length) return;

    const timer = setTimeout(() => {
      setVisibleItems((prev) => [...prev, itemsRef.current[currentIndex]]);
      setCurrentIndex((i) => i + 1);
    }, (400 / speed));

    return () => clearTimeout(timer);
  }, [currentIndex, speed]);

  return (
    <div className={className} style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', maxWidth: '320px' }}>
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
              fontFamily: '"Plus Jakarta Sans", sans-serif',
            }}
          >
            {item}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
