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
  fontSize = 48,
}: CountUpProps) {
  const [displayValue, setDisplayValue] = useState(direction === 'up' ? from : to);
  const motionValue = useMotionValue(direction === 'up' ? from : to);

  const isMountedRef = useRef(false);

  useEffect(() => {
    const target = direction === 'up' ? to : from;
    if (isMountedRef.current) {
      setDisplayValue(target);
      motionValue.set(target);
      return;
    }
    isMountedRef.current = true;

    const controls = animate(motionValue, target, {
      duration: duration / speed,
      delay: delay / speed,
      ease: 'easeOut',
      onUpdate: (latest) => {
        setDisplayValue(Math.round(latest));
      },
    });

    return () => controls.stop();
  }, [to, from, duration, delay, direction, speed, motionValue]);

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
