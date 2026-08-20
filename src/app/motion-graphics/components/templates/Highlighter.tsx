'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';

export type HighlighterAction = 'highlight' | 'underline' | 'box' | 'circle' | 'strike-through';

export interface HighlighterProps {
  text?: string;
  highlightWords?: string; // comma-separated words/phrases to highlight
  action?: HighlighterAction;
  color?: string;
  textColor?: string;
  highlightTextColor?: string;
  strokeWidth?: number;
  animationDuration?: number;
  speed?: number;
  fontSize?: number;
  className?: string;
  layerDuration?: number;
  localTime?: number;
  layerStartTime?: number;
}

function AnnotationMark({ action, color, strokeWidth, triggered, effectiveDuration, deterministicProgress }: {
  action: HighlighterAction; color: string; strokeWidth: number; triggered: boolean; effectiveDuration: number; deterministicProgress?: number | null;
}) {
  if (deterministicProgress !== undefined && deterministicProgress !== null) {
    const p = deterministicProgress;
    switch (action) {
      case 'highlight':
        return (
          <span
            style={{
              position: 'absolute', bottom: 0, left: 0, height: '40%',
              width: `${(p * 100).toFixed(1)}%`,
              background: color, opacity: 0.5, borderRadius: '2px', zIndex: 0,
            }}
          />
        );
      case 'underline':
        return (
          <span
            style={{
              position: 'absolute', bottom: '-2px', left: 0, height: `${strokeWidth}px`,
              width: `${(p * 100).toFixed(1)}%`,
              background: color, borderRadius: '1px', zIndex: 0,
            }}
          />
        );
      case 'box':
        return (
          <span
            style={{
              position: 'absolute', inset: `-${strokeWidth + 2}px`, border: `${strokeWidth}px solid ${color}`, borderRadius: '4px', zIndex: 0,
              opacity: p,
              transform: `scale(${(0.9 + p * 0.1).toFixed(2)})`,
            }}
          />
        );
      case 'circle':
        return (
          <span
            style={{
              position: 'absolute', inset: `-${strokeWidth + 4}px`, border: `${strokeWidth}px solid ${color}`, borderRadius: '50%', zIndex: 0,
              opacity: p,
              transform: `scale(${(0.8 + p * 0.2).toFixed(2)})`,
            }}
          />
        );
      case 'strike-through':
        return (
          <span
            style={{
              position: 'absolute', top: '50%', left: 0, height: `${strokeWidth}px`,
              width: `${(p * 100).toFixed(1)}%`,
              background: color, transform: 'translateY(-50%)', zIndex: 2,
            }}
          />
        );
      default:
        return null;
    }
  }

  switch (action) {
    case 'highlight':
      return (
        <motion.span
          initial={{ width: 0 }}
          animate={triggered ? { width: '100%' } : { width: 0 }}
          transition={{ duration: effectiveDuration, ease: [0.65, 0, 0.35, 1] }}
          style={{ position: 'absolute', bottom: 0, left: 0, height: '40%', background: color, opacity: 0.5, borderRadius: '2px', zIndex: 0 }}
        />
      );
    case 'underline':
      return (
        <motion.span
          initial={{ width: 0 }}
          animate={triggered ? { width: '100%' } : { width: 0 }}
          transition={{ duration: effectiveDuration, ease: [0.65, 0, 0.35, 1] }}
          style={{ position: 'absolute', bottom: '-2px', left: 0, height: `${strokeWidth}px`, background: color, borderRadius: '1px', zIndex: 0 }}
        />
      );
    case 'box':
      return (
        <motion.span
          initial={{ opacity: 0, scale: 0.9 }}
          animate={triggered ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
          transition={{ duration: effectiveDuration, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{ position: 'absolute', inset: `-${strokeWidth + 2}px`, border: `${strokeWidth}px solid ${color}`, borderRadius: '4px', zIndex: 0 }}
        />
      );
    case 'circle':
      return (
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          animate={triggered ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
          transition={{ duration: effectiveDuration, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{ position: 'absolute', inset: `-${strokeWidth + 4}px`, border: `${strokeWidth}px solid ${color}`, borderRadius: '50%', zIndex: 0 }}
        />
      );
    case 'strike-through':
      return (
        <motion.span
          initial={{ width: 0 }}
          animate={triggered ? { width: '100%' } : { width: 0 }}
          transition={{ duration: effectiveDuration, ease: [0.65, 0, 0.35, 1] }}
          style={{ position: 'absolute', top: '50%', left: 0, height: `${strokeWidth}px`, background: color, transform: 'translateY(-50%)', zIndex: 2 }}
        />
      );
    default:
      return null;
  }
}

export default function Highlighter({
  text = 'My name is World',
  highlightWords = 'World',
  action = 'highlight',
  color = '#ffd1dc',
  textColor = '#ffffff',
  highlightTextColor = '',
  strokeWidth = 2,
  animationDuration = 600,
  speed = 1,
  fontSize = 32,
  className = '',
  layerDuration,
  localTime,
  layerStartTime = 0,
}: HighlighterProps) {
  const [triggered, setTriggered] = useState(false);
  const effectiveDuration = animationDuration / speed / 1000;

  useEffect(() => {
    if (localTime !== undefined) return;
    const timer = setTimeout(() => setTriggered(true), 100);
    return () => clearTimeout(timer);
  }, [localTime]);

  const deterministicProgress = localTime !== undefined
    ? (() => {
        const elapsed = Math.max(0, localTime - layerStartTime);
        const animStart = 0.1;
        const animT = Math.max(0, Math.min(1, (elapsed - animStart) / Math.max(0.01, effectiveDuration)));
        return 1 - Math.pow(1 - animT, 3);
      })()
    : null;

  // Parse highlight words
  const wordsToHighlight = highlightWords.split(',').map((w) => w.trim()).filter(Boolean);

  // Build segments: split text by highlight words while preserving order
  const buildSegments = (): { text: string; isHighlighted: boolean }[] => {
    if (wordsToHighlight.length === 0) return [{ text, isHighlighted: false }];

    const segments: { text: string; isHighlighted: boolean }[] = [];
    let remaining = text;

    while (remaining.length > 0) {
      let earliestIndex = Infinity;
      let earliestWord = '';

      for (const word of wordsToHighlight) {
        const idx = remaining.toLowerCase().indexOf(word.toLowerCase());
        if (idx !== -1 && idx < earliestIndex) {
          earliestIndex = idx;
          earliestWord = word;
        }
      }

      if (earliestIndex === Infinity) {
        segments.push({ text: remaining, isHighlighted: false });
        break;
      }

      if (earliestIndex > 0) {
        segments.push({ text: remaining.slice(0, earliestIndex), isHighlighted: false });
      }
      segments.push({ text: remaining.slice(earliestIndex, earliestIndex + earliestWord.length), isHighlighted: true });
      remaining = remaining.slice(earliestIndex + earliestWord.length);
    }

    return segments;
  };

  const segments = buildSegments();

  return (
    <span className={className} style={{ fontSize: `${fontSize}px`, fontWeight: 700, color: textColor, display: 'inline' }}>
      {segments.map((seg, i) => (
        seg.isHighlighted ? (
          <span key={i} style={{ position: 'relative', display: 'inline-block', color: highlightTextColor || textColor }}>
            <AnnotationMark
              action={action}
              color={color}
              strokeWidth={strokeWidth}
              triggered={triggered}
              effectiveDuration={effectiveDuration}
              deterministicProgress={deterministicProgress}
            />
            <span style={{ position: 'relative', zIndex: 1 }}>{seg.text}</span>
          </span>
        ) : (
          <span key={i}>{seg.text}</span>
        )
      ))}
    </span>
  );
}
