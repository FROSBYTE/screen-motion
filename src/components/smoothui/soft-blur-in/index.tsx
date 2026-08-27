"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import { useRef } from "react";

export interface SoftBlurInProps {
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
  localTime?: number;
  layerStartTime?: number;
  layerDuration?: number;
}

const DURATION_S = 0.52;
const MS = 1000;
// Apple's signature ease-out.
const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * SoftBlurIn — per-character fade-in with a gentle blur and upward motion,
 * Apple's signature hero-title reveal. From the animate-text catalog
 * (`soft-blur-in`). Best on hero titles 48px+ over solid backgrounds.
 */
export default function SoftBlurIn({
  children,
  className = "",
  delay = 0,
  stagger = 25,
  speed = 1,
  triggerOnView = false,
  localTime,
  layerStartTime = 0,
}: SoftBlurInProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const shouldReduceMotion = useReducedMotion();
  const play = (!triggerOnView || inView) && !shouldReduceMotion;
  const characters = Array.from(children || "");

  if (localTime !== undefined) {
    const elapsed = Math.max(0, localTime - layerStartTime);
    const animDur = DURATION_S / Math.max(0.1, speed);
    const staggerS = (stagger / Math.max(0.1, speed)) / MS;
    const baseDelayS = delay / MS;

    return (
      <span aria-label={children} className={className} ref={ref} style={{ display: "inline-block" }}>
        {characters.map((char, index) => {
          if (char === "\n") return <br key={index} />;
          const charStart = baseDelayS + index * staggerS;
          const charElapsed = Math.max(0, elapsed - charStart);
          const progress = Math.min(1, Math.max(0, charElapsed / animDur));
          const eased = 1 - Math.pow(1 - progress, 3);
          const opacity = eased;
          const y = (1 - eased) * 16;

          return (
            <span
              aria-hidden="true"
              key={index}
              style={{
                display: "inline-block",
                whiteSpace: "pre",
                opacity,
                transform: `translateY(${y.toFixed(2)}px)`,
              }}
            >
              {char === " " ? "\u00A0" : String(char)}
            </span>
          );
        })}
      </span>
    );
  }

  return (
    <span aria-label={children} className={className} ref={ref} style={{ display: "inline-block" }}>
      {characters.map((char, index) => (
        <motion.span
          animate={play ? { filter: "blur(0px)", opacity: 1, y: 0 } : undefined}
          aria-hidden="true"
          initial={
            shouldReduceMotion
              ? { opacity: 1 }
              : { filter: "blur(12px)", opacity: 0, y: 16 }
          }
          key={index}
          style={{ display: "inline-block", whiteSpace: "pre" }}
          transition={
            shouldReduceMotion
              ? { duration: 0 }
              : {
                  delay: delay / MS + (index * (stagger / speed)) / MS,
                  duration: DURATION_S / speed,
                  ease: EASE,
                }
          }
        >
          {char === " " ? "\u00A0" : String(char)}
        </motion.span>
      ))}
    </span>
  );
}
