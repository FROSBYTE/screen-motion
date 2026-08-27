'use client';

import React from 'react';
import { motion, useMotionValue, animate } from 'motion/react';
import { useEffect, useState, useRef } from 'react';

export interface CountUpProps {
  to?: number;
  from?: number;
  duration?: number;
  delay?: number;
  direction?: 'up' | 'down';
  className?: string;
  speed?: number;
  separator?: string;
  color?: string;
  isBold?: boolean;
  isItalic?: boolean;
  fontFamily?: string;
  fontSize?: number;
  layerDuration?: number;
  localTime?: number;
  layerStartTime?: number;
}

export default function CountUp({
  to = 100,
  from = 0,
  duration = 2,
  delay = 0,
  direction = 'up',
  className = '',
  speed = 1,
  separator = '',
  color = '#ffffff',
  isBold = true,
  isItalic = false,
  fontFamily = '"Plus Jakarta Sans", sans-serif',
  fontSize = 64,
  layerDuration,
  localTime,
  layerStartTime = 0,
}: CountUpProps) {
  const startVal = direction === 'up' ? from : to;
  const targetVal = direction === 'up' ? to : from;
  const [liveDisplayValue, setLiveDisplayValue] = useState(startVal);
  const motionValue = useMotionValue(startVal);

  useEffect(() => {
    if (localTime !== undefined) return;
    motionValue.set(startVal);
    setLiveDisplayValue(startVal);

    const targetDuration = layerDuration ? layerDuration * 0.75 : (duration || 2);
    const effectiveAnimDuration = Math.max(0.1, targetDuration / Math.max(0.2, speed || 1));

    const controls = animate(motionValue, targetVal, {
      duration: effectiveAnimDuration,
      delay: (delay || 0) / Math.max(0.2, speed || 1),
      ease: 'easeOut',
      onUpdate: (latest) => {
        setLiveDisplayValue(Math.round(latest));
      },
    });

    return () => controls.stop();
  }, [to, from, duration, delay, direction, speed, layerDuration, localTime]);

  let displayValue = liveDisplayValue;
  if (localTime !== undefined) {
    const elapsed = Math.max(0, localTime - layerStartTime - (delay || 0) / Math.max(0.2, speed || 1));
    const targetDuration = layerDuration ? layerDuration * 0.75 : (duration || 2);
    const effectiveAnimDuration = Math.max(0.1, targetDuration / Math.max(0.2, speed || 1));
    const progress = Math.min(1, Math.max(0, elapsed / effectiveAnimDuration));
    const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
    displayValue = Math.round(startVal + (targetVal - startVal) * eased);
  }

  const formattedValue = separator
    ? displayValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, separator)
    : displayValue.toString();

  return (
    <motion.span
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: delay / speed }}
      style={{
        display: 'inline-block',
        fontVariantNumeric: 'tabular-nums',
        color,
        fontWeight: isBold ? 800 : 400,
        fontStyle: isItalic ? 'italic' : 'normal',
        fontFamily,
        fontSize: `${fontSize}px`,
      }}
    >
      {formattedValue}
    </motion.span>
  );
}
