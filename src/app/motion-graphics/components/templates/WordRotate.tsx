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
  items?: WordRotateItem[];
  speed?: number;
  color?: string;
  fontSize?: number;
  className?: string;
}

const DEFAULT_ITEMS: WordRotateItem[] = [
  { text: 'Innovative', isBold: true },
  { text: 'Creative', isBold: true },
  { text: 'Powerful', isBold: true },
  { text: 'Beautiful', isBold: true },
];

export default function WordRotate({
  items = DEFAULT_ITEMS,
  speed = 1,
  color = '#ffffff',
  fontSize = 32,
  className = '',
}: WordRotateProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % items.length);
    }, 2000 / speed);
    return () => clearInterval(interval);
  }, [items.length, speed]);

  const currentRaw = items[index] || items[0] || 'Word';
  const currentText = typeof currentRaw === 'string' ? currentRaw : currentRaw?.text || 'Word';
  const isBold = typeof currentRaw === 'object' ? currentRaw.isBold ?? true : true;
  const isItalic = typeof currentRaw === 'object' ? currentRaw.isItalic ?? false : false;
  const fontFamily = typeof currentRaw === 'object' ? currentRaw.fontFamily || '"Plus Jakarta Sans", sans-serif' : '"Plus Jakarta Sans", sans-serif';

  return (
    <div className={className} style={{ display: 'inline-flex', overflow: 'hidden', position: 'relative', height: `${fontSize * 1.3}px`, verticalAlign: 'bottom' }}>
      <AnimatePresence mode="wait">
        <motion.span
          key={index}
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '-100%', opacity: 0 }}
          transition={{ duration: 0.3 / speed, ease: 'easeInOut' }}
          style={{
            display: 'inline-block',
            color,
            whiteSpace: 'nowrap',
            fontSize: `${fontSize}px`,
            fontWeight: isBold ? 800 : 400,
            fontStyle: isItalic ? 'italic' : 'normal',
            fontFamily,
            lineHeight: 1.3,
          }}
        >
          {currentText}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
