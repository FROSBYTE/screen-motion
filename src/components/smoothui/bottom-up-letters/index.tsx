"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import { useRef, useEffect } from "react";

export interface BottomUpLettersProps {
  children: string;
  className?: string;
  /** Delay before the animation starts, in milliseconds. */
  delay?: number;
  /** Per-character stagger, in milliseconds. */
  stagger?: number;
  /** Animation speed multiplier. */
  speed?: number;
  /** Animate only once the text scrolls into view. */
  triggerOnView?: boolean;
}

const DURATION_S = 0.4;
const MS = 1000;
const EASE: [number, number, number, number] = [0.18, 1, 0.32, 1];
const SMOOTH_EASE: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];

export default function BottomUpLetters({
  children,
  className = "",
  delay = 0,
  stagger = 88,
  speed = 1,
  triggerOnView = false,
}: BottomUpLettersProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const shouldReduceMotion = useReducedMotion();
  const play = (!triggerOnView || inView) && !shouldReduceMotion;
  const isMountedRef = useRef(false);
  useEffect(() => {
    isMountedRef.current = true;
  }, []);

  const characters = Array.from(children);
  const effectiveSpeed = Math.max(speed, 0.3);
  const effectiveEase = speed < 1 ? SMOOTH_EASE : EASE;
  const effectiveStagger = Math.min(stagger / effectiveSpeed, 250);

  return (
    <span aria-label={children} className={className} ref={ref}>
      {characters.map((char, index) => (
        <motion.span
          animate={play ? { opacity: 1, y: 0 } : undefined}
          aria-hidden="true"
          initial={isMountedRef.current ? false : (shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 46 })}
          // biome-ignore lint/suspicious/noArrayIndexKey: characters have no stable id
          key={index}
          style={{ display: "inline-block", whiteSpace: "pre" }}
          transition={
            shouldReduceMotion
              ? { duration: 0 }
              : {
                  duration: DURATION_S / effectiveSpeed,
                  delay: delay / MS + (index * effectiveStagger) / MS,
                  ease: effectiveEase,
                }
          }
        >
          {char === " " ? " " : char}
        </motion.span>
      ))}
    </span>
  );
}
