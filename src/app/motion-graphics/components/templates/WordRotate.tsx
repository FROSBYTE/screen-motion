'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export interface WordRotateItem {
  text: string;
  isBold?: boolean;
  isItalic?: boolean;
  fontFamily?: string;
}

export interface WordRotateProps {
  items?: (WordRotateItem | string)[];
  speed?: number;
  color?: string;
  fontSize?: number;
  fontFamily?: string;
  isBold?: boolean;
  isItalic?: boolean;
  className?: string;
  isLoop?: boolean;
  layerDuration?: number;
}

const DEFAULT_ITEMS: WordRotateItem[] = [
  { text: 'Innovative' },
  { text: 'Creative' },
  { text: 'Powerful' },
  { text: 'Beautiful' },
];

export default function WordRotate({
  items = DEFAULT_ITEMS,
  speed = 1,
  color = '#ffffff',
  fontSize = 32,
  fontFamily = '"Plus Jakarta Sans", sans-serif',
  isBold = true,
  isItalic = false,
  className = '',
  isLoop = true,
  layerDuration,
}: WordRotateProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const wordCount = Math.max(1, items.length);
    const targetCycleMs = layerDuration ? (layerDuration * 1000 * 0.85) / wordCount : 2000;
    const intervalMs = Math.max(250, targetCycleMs / Math.max(0.5, speed));

    const interval = setInterval(() => {
      setIndex((prev) => {
        if (!isLoop && prev >= items.length - 1) {
          return prev;
        }
        return (prev + 1) % items.length;
      });
    }, intervalMs);
    return () => clearInterval(interval);
  }, [items.length, speed, layerDuration, isLoop]);

  const currentRaw = items[index] || items[0] || 'Word';
  const currentText = typeof currentRaw === 'string' ? currentRaw : currentRaw?.text || 'Word';
  const resolvedIsBold = typeof currentRaw === 'object' && currentRaw.isBold !== undefined ? currentRaw.isBold : isBold;
  const resolvedIsItalic = typeof currentRaw === 'object' && currentRaw.isItalic !== undefined ? currentRaw.isItalic : isItalic;
  const resolvedFontFamily = typeof currentRaw === 'object' && currentRaw.fontFamily ? currentRaw.fontFamily : fontFamily;

  return (
    <div className={className} style={{ display: 'inline-flex', overflow: 'hidden', position: 'relative', height: `${fontSize * 1.3}px`, verticalAlign: 'bottom' }}>
      <AnimatePresence mode="wait">
        <motion.span
          key={index}
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '-100%', opacity: 0 }}
          transition={{ duration: 0.3 / Math.max(0.1, speed), ease: 'easeInOut' }}
          style={{
            display: 'inline-block',
            color,
            whiteSpace: 'nowrap',
            fontSize: `${fontSize}px`,
            fontWeight: resolvedIsBold ? 800 : 400,
            fontStyle: resolvedIsItalic ? 'italic' : 'normal',
            fontFamily: resolvedFontFamily,
            lineHeight: 1.3,
          }}
        >
          {currentText}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
