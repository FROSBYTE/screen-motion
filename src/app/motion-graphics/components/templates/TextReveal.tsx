'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';

export interface TextRevealProps {
  text?: string;
  speed?: number;
  color?: string;
  revealColor?: string;
  fontSize?: number;
  fontFamily?: string;
  isBold?: boolean;
  isItalic?: boolean;
  className?: string;
  layerDuration?: number;
  localTime?: number;
  layerStartTime?: number;
}

export default function TextReveal({
  text = 'Reveal This Text',
  speed = 1,
  color = '#ffffff',
  revealColor = '#FF9137',
  fontSize = 48,
  fontFamily = '"Plus Jakarta Sans", sans-serif',
  isBold = true,
  isItalic = false,
  className = '',
  layerDuration,
  localTime,
  layerStartTime = 0,
}: TextRevealProps) {
  const words = text.split(' ');
  const safeSpeed = Math.max(0.1, speed);
  const totalDuration = 0.6 / safeSpeed;
  const stagger = 0.08 / safeSpeed;

  return (
    <div className={className} style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3em', justifyContent: 'center', alignItems: 'center' }}>
      {words.map((word, i) => {
        if (localTime !== undefined) {
          const elapsed = Math.max(0, localTime - layerStartTime);
          const wordElapsed = Math.max(0, elapsed - i * stagger);
          const t = Math.min(1, wordElapsed / totalDuration);
          let leftPercent = 0;
          let widthPercent = 0;
          let textOpacity = 0;

          if (wordElapsed > 0) {
            if (t < 0.5) {
              const subT = t / 0.5;
              leftPercent = 0;
              widthPercent = subT * 100;
              textOpacity = 0;
            } else {
              const subT = (t - 0.5) / 0.5;
              leftPercent = subT * 100;
              widthPercent = (1 - subT) * 100;
              textOpacity = 1;
            }
          }

          return (
            <span key={`${word}-${i}`} style={{ display: 'inline-block', overflow: 'hidden', position: 'relative' }}>
              {/* Reveal block */}
              <span
                style={{
                  position: 'absolute',
                  top: 0,
                  left: `${leftPercent.toFixed(1)}%`,
                  width: `${widthPercent.toFixed(1)}%`,
                  height: '100%',
                  background: revealColor,
                  zIndex: 1,
                }}
              />
              {/* Text */}
              <span
                style={{
                  display: 'inline-block',
                  color,
                  fontSize: `${fontSize}px`,
                  fontFamily,
                  fontWeight: isBold ? 800 : 400,
                  fontStyle: isItalic ? 'italic' : 'normal',
                  position: 'relative',
                  zIndex: 0,
                  opacity: textOpacity,
                }}
              >
                {word}
              </span>
            </span>
          );
        }

        return (
          <span key={`${word}-${i}`} style={{ display: 'inline-block', overflow: 'hidden', position: 'relative' }}>
            {/* Reveal block that sweeps across */}
            <motion.span
              initial={{ left: 0, width: 0 }}
              animate={{ left: ['0%', '0%', '100%'], width: ['0%', '100%', '0%'] }}
              transition={{
                duration: totalDuration,
                delay: i * stagger,
                ease: [0.65, 0, 0.35, 1],
                times: [0, 0.5, 1],
              }}
              style={{
                position: 'absolute',
                top: 0,
                height: '100%',
                background: revealColor,
                zIndex: 1,
              }}
            />
            {/* Text that fades in after reveal block passes */}
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                duration: 0.01,
                delay: i * stagger + totalDuration * 0.5,
              }}
              style={{
                display: 'inline-block',
                color,
                fontSize: `${fontSize}px`,
                fontFamily,
                fontWeight: isBold ? 800 : 400,
                fontStyle: isItalic ? 'italic' : 'normal',
                position: 'relative',
                zIndex: 0,
              }}
            >
              {word}
            </motion.span>
          </span>
        );
      })}
    </div>
  );
}
