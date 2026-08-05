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
  className?: string;
}

export default function TextReveal({
  text = 'Reveal This Text',
  speed = 1,
  color = '#ffffff',
  revealColor = '#a855f7',
  fontSize = 32,
  fontFamily = '"Plus Jakarta Sans", sans-serif',
  className = '',
}: TextRevealProps) {
  const words = text.split(' ');
  const totalDuration = 0.6 / speed;
  const stagger = 0.08 / speed;

  return (
    <div className={className} style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3em', justifyContent: 'center', alignItems: 'center' }}>
      {words.map((word, i) => (
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
              fontWeight: 700,
              position: 'relative',
              zIndex: 0,
            }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </div>
  );
}
