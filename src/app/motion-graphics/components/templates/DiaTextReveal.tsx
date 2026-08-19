'use client';

import React from 'react';
import DiaTextRevealUI from '@/components/ui/dia-text-reveal';

export interface DiaTextRevealTemplateProps {
  text?: string | string[];
  colors?: string[];
  textColor?: string;
  duration?: number;
  speed?: number;
  fontSize?: number;
  fontFamily?: string;
  repeat?: boolean;
  repeatDelay?: number;
  className?: string;
}

const DEFAULT_DIA_COLORS = ['#c679c4', '#fa3d1d', '#ffb005', '#e1e1fe', '#0358f7'];

export default function DiaTextReveal({
  text = 'Design Systems',
  colors = DEFAULT_DIA_COLORS,
  textColor = '#ffffff',
  duration = 1.5,
  speed = 1,
  fontSize = 36,
  fontFamily = '"Plus Jakarta Sans", sans-serif',
  repeat = true,
  repeatDelay = 0.5,
  className = '',
}: DiaTextRevealTemplateProps) {
  const parsedText: string | string[] = Array.isArray(text)
    ? text
    : typeof text === 'string' && text.includes('\n')
    ? text.split('\n').map((s) => s.trim()).filter(Boolean)
    : text;

  const effectiveDuration = (duration || 1.5) / (speed || 1);

  return (
    <div
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: `${fontSize}px`,
        fontFamily,
        fontWeight: 700,
      }}
    >
      <DiaTextRevealUI
        text={parsedText}
        colors={colors && colors.length > 0 ? colors : DEFAULT_DIA_COLORS}
        textColor={textColor}
        duration={effectiveDuration}
        repeat={repeat}
        repeatDelay={repeatDelay}
        startOnView={false}
      />
    </div>
  );
}
