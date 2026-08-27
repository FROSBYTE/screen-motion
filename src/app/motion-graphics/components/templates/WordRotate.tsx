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
  localTime?: number;
  layerStartTime?: number;
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
  fontSize = 48,
  fontFamily = '"Plus Jakarta Sans", sans-serif',
  isBold = true,
  isItalic = false,
  className = '',
  isLoop = true,
  layerDuration,
  localTime,
  layerStartTime = 0,
}: WordRotateProps) {
  const [liveIndex, setLiveIndex] = useState(0);

  useEffect(() => {
    if (localTime !== undefined) return;
    const wordCount = Math.max(1, items.length);
    const targetCycleMs = layerDuration ? (layerDuration * 1000 * 0.85) / wordCount : 2000;
    const intervalMs = Math.max(250, targetCycleMs / Math.max(0.5, speed));

    const interval = setInterval(() => {
      setLiveIndex((prev) => {
        if (!isLoop && prev >= items.length - 1) {
          return prev;
        }
        return (prev + 1) % items.length;
      });
    }, intervalMs);
    return () => clearInterval(interval);
  }, [items.length, speed, layerDuration, isLoop, localTime]);

  const wordCount = Math.max(1, items.length);
  const targetCycleSec = (layerDuration ? (layerDuration * 0.85) / wordCount : 2) / Math.max(0.5, speed);
  const intervalSec = Math.max(0.25, targetCycleSec);

  let activeIndex = liveIndex;
  let deterministicY: number | null = null;
  let deterministicOpacity: number | null = null;

  if (localTime !== undefined) {
    const elapsed = Math.max(0, localTime - layerStartTime);
    const rawCycle = elapsed / intervalSec;
    const currentStep = Math.floor(rawCycle);
    activeIndex = isLoop ? (currentStep % wordCount) : Math.min(currentStep, wordCount - 1);

    const stepProgress = elapsed % intervalSec;
    const transitionDur = Math.min(0.3 / Math.max(0.1, speed), intervalSec * 0.4);
    if (stepProgress < transitionDur) {
      const t = stepProgress / transitionDur;
      const eased = 1 - Math.pow(1 - t, 3);
      deterministicY = (1 - eased) * 100;
      deterministicOpacity = eased;
    } else {
      deterministicY = 0;
      deterministicOpacity = 1;
    }
  }

  const currentRaw = items[activeIndex] || items[0] || 'Word';
  const currentText = typeof currentRaw === 'string' ? currentRaw : currentRaw?.text || 'Word';
  const resolvedIsBold = isBold;
  const resolvedIsItalic = isItalic;
  const resolvedFontFamily = fontFamily;

  if (localTime !== undefined && deterministicY !== null) {
    return (
      <div className={className} style={{ display: 'inline-flex', overflow: 'hidden', position: 'relative', height: `${fontSize * 1.3}px`, verticalAlign: 'bottom' }}>
        <span
          style={{
            display: 'inline-block',
            color,
            whiteSpace: 'nowrap',
            fontSize: `${fontSize}px`,
            fontWeight: resolvedIsBold ? 800 : 400,
            fontStyle: resolvedIsItalic ? 'italic' : 'normal',
            fontFamily: resolvedFontFamily,
            lineHeight: 1.3,
            transform: `translateY(${deterministicY}%)`,
            opacity: deterministicOpacity ?? 1,
          }}
        >
          {currentText}
        </span>
      </div>
    );
  }

  return (
    <div className={className} style={{ display: 'inline-flex', overflow: 'hidden', position: 'relative', height: `${fontSize * 1.3}px`, verticalAlign: 'bottom' }}>
      <AnimatePresence mode="wait">
        <motion.span
          key={activeIndex}
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
