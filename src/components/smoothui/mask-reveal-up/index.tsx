"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import { useRef } from "react";

export interface MaskRevealUpProps {
  /** Text content. Use "\n" to separate lines, or pass `lines` instead. */
  children?: string;
  className?: string;
  /** Delay before the animation starts, in milliseconds. */
  delay?: number;
  /** Explicit line array. Takes precedence over children. */
  lines?: string[];
  /** Per-line stagger, in milliseconds. */
  stagger?: number;
  /** Animation speed multiplier. */
  speed?: number;
  /** Animate only once the text scrolls into view. */
  triggerOnView?: boolean;
}

const DURATION_S = 0.76;
const MS = 1000;
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const SMOOTH_EASE: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];

export default function MaskRevealUp({
  children,
  lines: linesProp,
  className = "",
  delay = 0,
  stagger = 90,
  speed = 1,
  triggerOnView = false,
}: MaskRevealUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const shouldReduceMotion = useReducedMotion();
  const play = (!triggerOnView || inView) && !shouldReduceMotion;

  const lines = linesProp ?? (children ? children.split("\n") : []);
  const label = lines.join(" ");
  const effectiveSpeed = Math.max(speed, 0.3);
  const effectiveEase = speed < 1 ? SMOOTH_EASE : EASE;
  const effectiveStagger = Math.min(stagger / effectiveSpeed, 300);

  return (
    <span
      aria-label={label}
      className={className}
      ref={ref}
      style={{ display: "block" }}
    >
      {lines.map((line, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: lines have no stable id
        <span key={index} style={{ display: "block", overflow: "hidden" }}>
          <motion.span
            animate={
              play ? { opacity: 1, y: 0, filter: "blur(0px)" } : undefined
            }
            aria-hidden="true"
            initial={
              shouldReduceMotion
                ? { opacity: 1 }
                : { opacity: 0, y: 30, filter: "blur(6px)" }
            }
            style={{ display: "block" }}
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
            {line}
          </motion.span>
        </span>
      ))}
    </span>
  );
}
