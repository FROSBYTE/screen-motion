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
  isBold?: boolean;
  boldLevel?: 'half' | 'full';
  fontWeight?: number;
  isItalic?: boolean;
  staggerDuration?: number;
  staggerFrom?: StaggerFrom;
  rotateDirection?: RotateDirection;
  speed?: number;
  autoPlay?: boolean;
  isLoop?: boolean;
  className?: string;
  layerDuration?: number;
  localTime?: number;
  layerStartTime?: number;
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
  fontSize = 52,
  fontFamily = '"Plus Jakarta Sans", sans-serif',
  isBold = true,
  boldLevel,
  fontWeight,
  isItalic = false,
  staggerFrom = 'first',
  rotateDirection = 'top',
  speed = 1,
  autoPlay = true,
  isLoop = true,
  className = '',
  layerDuration,
  localTime,
  layerStartTime = 0,
}: Text3DFlipProps) {
  const resolvedFontWeight = fontWeight || (isBold ? (boldLevel === 'half' ? 550 : 800) : 300);
  const [isFlipped, setIsFlipped] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const lines = useMemo(() => (text || '').split('\n'), [text]);
  const flippedLines = useMemo(() => (flippedText || text || '').split('\n'), [flippedText, text]);
  const allChars = useMemo(() => {
    const chars: { char: string; lineIdx: number; wordIdx: number; charIdx: number; globalIdx: number }[] = [];
    let globalIdx = 0;
    lines.forEach((line, lineIdx) => {
      const words = line.split(' ');
      words.forEach((word, wordIdx) => {
        Array.from(word).forEach((char, charIdx) => {
          chars.push({ char, lineIdx, wordIdx, charIdx, globalIdx });
          globalIdx++;
        });
      });
    });
    return chars;
  }, [lines]);

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
    if (!autoPlay || localTime !== undefined) return;
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
  }, [autoPlay, safeSpeed, isLoop, flipDuration, holdDuration, localTime]);

  const cycleHalf = flipDuration + holdDuration;
  const cycleTotal = cycleHalf * 2;
  let deterministicRotationAngles: Record<number, number> | null = null;

  if (localTime !== undefined) {
    const elapsed = Math.max(0, localTime - layerStartTime);
    const timeInCycle = isLoop ? (elapsed % cycleTotal) : Math.min(elapsed, cycleHalf);
    const inFirstHalf = timeInCycle < cycleHalf;
    const halfElapsed = inFirstHalf ? timeInCycle : timeInCycle - cycleHalf;

    deterministicRotationAngles = {};
    for (let i = 0; i < totalChars; i++) {
      const delay = getDelay(i);
      const singleFlipDur = 0.6 / safeSpeed;
      const charTime = Math.max(0, halfElapsed - delay);
      const t = Math.min(1, Math.max(0, charTime / singleFlipDur));
      const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

      if (inFirstHalf) {
        deterministicRotationAngles[i] = eased * 180;
      } else {
        deterministicRotationAngles[i] = (1 - eased) * 180;
      }
    }
  }

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
        flexDirection: 'column',
        gap: '0.2em',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
        perspective: '800px',
        fontSize: `${fontSize}px`,
        fontFamily,
        fontWeight: resolvedFontWeight,
        fontStyle: isItalic ? 'italic' : 'normal',
      }}
    >
      {lines.map((line, lineIdx) => {
        const words = line.split(' ');
        const flippedLine = flippedLines[lineIdx] || '';
        const flippedWords = flippedLine.split(' ');
        return (
          <div key={lineIdx} style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3em', justifyContent: 'center', alignItems: 'center' }}>
            {words.map((word, wordIdx) => (
              <span key={wordIdx} style={{ display: 'inline-flex' }}>
                {Array.from(word).map((char, charIdx) => {
                  const globalIdx = allChars.findIndex(
                    (c) => c.lineIdx === lineIdx && c.wordIdx === wordIdx && c.charIdx === charIdx
                  );
                  const delay = getDelay(globalIdx);
                  const flippedWord = flippedWords[wordIdx] || '';
                  const flippedChar = Array.from(flippedWord)[charIdx] || char;

                  const charAngle = deterministicRotationAngles
                    ? deterministicRotationAngles[globalIdx] ?? 0
                    : (isFlipped ? 180 : 0);

                  const rotationTransform =
                    rotateDirection === 'top' || rotateDirection === 'bottom'
                      ? `rotateX(${rotateDirection === 'bottom' ? -charAngle : charAngle}deg)`
                      : `rotateY(${rotateDirection === 'left' ? -charAngle : charAngle}deg)`;

                  if (deterministicRotationAngles) {
                    const isBackFace = charAngle >= 90;
                    const activeChar = isBackFace ? flippedChar : char;
                    const activeColor = isBackFace ? flipColor : color;
                    const cosScale = Math.max(0.05, Math.abs(Math.cos((charAngle * Math.PI) / 180)));
                    const isVertical = rotateDirection === 'top' || rotateDirection === 'bottom';
                    const scaleTransform = isVertical ? `scaleY(${cosScale.toFixed(3)})` : `scaleX(${cosScale.toFixed(3)})`;

                    return (
                      <span
                        key={`${lineIdx}-${wordIdx}-${charIdx}`}
                        style={{
                          display: 'inline-block',
                          position: 'relative',
                          color: activeColor,
                          whiteSpace: 'pre',
                          transform: scaleTransform,
                          transformOrigin: 'center center',
                        }}
                      >
                        {activeChar}
                      </span>
                    );
                  }

                  return (
                    <motion.span
                      key={`${lineIdx}-${wordIdx}-${charIdx}`}
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
      })}
    </div>
  );
}
