'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';

export type RotateDirection = 'top' | 'right' | 'bottom' | 'left';
export type StaggerFrom = 'first' | 'last' | 'center' | 'random';

export interface Text3DFlipProps {
  text?: string;
  flippedText?: string; // optional different text shown on flip
  color?: string;
  flipColor?: string;
  fontSize?: number;
  fontFamily?: string;
  staggerDuration?: number;
  staggerFrom?: StaggerFrom;
  rotateDirection?: RotateDirection;
  speed?: number;
  autoPlay?: boolean;
  isLoop?: boolean;
  className?: string;
}

const ROTATION_MAP: Record<RotateDirection, string> = {
  top: 'rotateX(180deg)',
  right: 'rotateY(180deg)',
  bottom: 'rotateX(-180deg)',
  left: 'rotateY(-180deg)',
};

export default function Text3DFlip({
  text = 'Stay hungry, stay foolish',
  flippedText = '',
  color = '#ffffff',
  flipColor = '#a855f7',
  fontSize = 36,
  fontFamily = '"Plus Jakarta Sans", sans-serif',
  staggerFrom = 'first',
  rotateDirection = 'top',
  speed = 1,
  autoPlay = true,
  isLoop = true,
  className = '',
}: Text3DFlipProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const words = useMemo(() => text.split(' '), [text]);
  const flippedWords = useMemo(() => (flippedText || text).split(' '), [flippedText, text]);
  const allChars = useMemo(() => {
    const chars: { char: string; wordIdx: number; charIdx: number; globalIdx: number }[] = [];
    let globalIdx = 0;
    words.forEach((word, wordIdx) => {
      Array.from(word).forEach((char, charIdx) => {
        chars.push({ char, wordIdx, charIdx, globalIdx });
        globalIdx++;
      });
    });
    return chars;
  }, [words]);

  const totalChars = allChars.length;
  const safeSpeed = Math.max(0.1, speed);
  const fixedStagger = 0.035 / safeSpeed;

  const getDelay = useCallback((index: number) => {
    switch (staggerFrom) {
      case 'first': return index * fixedStagger;
      case 'last': return (totalChars - 1 - index) * fixedStagger;
      case 'center': return Math.abs(Math.floor(totalChars / 2) - index) * fixedStagger;
      case 'random': return (index % 5) * 0.04 / safeSpeed;
      default: return index * fixedStagger;
    }
  }, [fixedStagger, staggerFrom, totalChars, safeSpeed]);

  const maxDelay = (totalChars > 0 ? totalChars - 1 : 0) * fixedStagger;
  const flipDuration = maxDelay + 0.6 / safeSpeed;
  const holdDuration = 1.4 / safeSpeed;

  // Auto-play animation cycle
  useEffect(() => {
    if (!autoPlay) return;
    let isActive = true;

    const runCycle = () => {
      if (!isActive) return;
      setIsFlipped(true);

      if (!isLoop) return;

      timeoutRef.current = setTimeout(() => {
        if (!isActive) return;
        setIsFlipped(false);

        timeoutRef.current = setTimeout(() => {
          if (!isActive) return;
          runCycle();
        }, (flipDuration + holdDuration) * 1000);
      }, (flipDuration + holdDuration) * 1000);
    };

    timeoutRef.current = setTimeout(runCycle, 400 / safeSpeed);

    return () => {
      isActive = false;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [autoPlay, safeSpeed, isLoop, flipDuration, holdDuration]);

  const springTransition = {
    type: 'spring' as const,
    damping: 30,
    stiffness: 300,
  };

  return (
    <div
      className={className}
      onMouseEnter={() => !autoPlay && setIsFlipped(true)}
      onMouseLeave={() => !autoPlay && setIsFlipped(false)}
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.3em',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
        perspective: '800px',
        fontSize: `${fontSize}px`,
        fontFamily,
        fontWeight: 700,
      }}
    >
      {words.map((word, wordIdx) => (
        <span key={wordIdx} style={{ display: 'inline-flex' }}>
          {Array.from(word).map((char, charIdx) => {
            const globalIdx = allChars.findIndex(
              (c) => c.wordIdx === wordIdx && c.charIdx === charIdx
            );
            const delay = getDelay(globalIdx);
            // Get the flipped character
            const flippedWord = flippedWords[wordIdx] || '';
            const flippedChar = Array.from(flippedWord)[charIdx] || char;

            return (
              <motion.span
                key={`${wordIdx}-${charIdx}`}
                animate={{
                  transform: isFlipped ? ROTATION_MAP[rotateDirection] : 'rotateX(0deg) rotateY(0deg)',
                }}
                transition={{ ...springTransition, delay }}
                style={{
                  display: 'inline-block',
                  transformStyle: 'preserve-3d',
                  position: 'relative',
                  color,
                  whiteSpace: 'pre',
                }}
              >
                {/* Front face */}
                <span style={{
                  backfaceVisibility: 'hidden',
                  display: 'inline-block',
                }}>
                  {char}
                </span>
                {/* Back face (flip color) */}
                <span style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  color: flipColor,
                  backfaceVisibility: 'hidden',
                  transform: rotateDirection === 'top' || rotateDirection === 'bottom'
                    ? 'rotateX(180deg)' : 'rotateY(180deg)',
                  display: 'inline-block',
                }}>
                  {flippedChar}
                </span>
              </motion.span>
            );
          })}
          {wordIdx < words.length - 1 && <span style={{ whiteSpace: 'pre' }}> </span>}
        </span>
      ))}
    </div>
  );
}
