"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

export interface FadeThroughProps {
  className?: string;
  /** Interval between phrase transitions, in milliseconds. */
  interval?: number;
  phrases?: string[];
  children?: string;
  speed?: number;
  localTime?: number;
  layerStartTime?: number;
  layerDuration?: number;
}

const ENTER_DURATION_S = 0.42;
const EXIT_DURATION_S = 0.26;
const ENTER_EASE = [0.2, 0, 0, 1] as const;
const EXIT_EASE = [0.4, 0, 1, 1] as const;

/**
 * FadeThrough — Material-style phrase cycling: old text fades out,
 * new text fades in with a soft delay. From the animate-text catalog
 * (`fade-through`). Best for hero copy swaps and rotating taglines.
 */
export default function FadeThrough({
  phrases: phrasesProp,
  children,
  className = "",
  interval = 2500,
  speed = 1,
  localTime,
  layerStartTime = 0,
}: FadeThroughProps) {
  const shouldReduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);

  const phrases = phrasesProp ?? (children ? [children] : []);

  useEffect(() => {
    if (localTime !== undefined || shouldReduceMotion || !phrases || phrases.length <= 1) {
      return;
    }
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % (phrases.length || 1));
    }, interval / speed);
    return () => clearInterval(id);
  }, [shouldReduceMotion, phrases, interval, speed, localTime]);

  if (localTime !== undefined) {
    const elapsed = Math.max(0, localTime - layerStartTime);
    const cycleDuration = interval / (1000 * Math.max(0.1, speed));
    const idx = phrases.length > 0 ? Math.floor(elapsed / cycleDuration) % phrases.length : 0;
    const cycleElapsed = elapsed % cycleDuration;
    const enterDur = ENTER_DURATION_S / Math.max(0.1, speed);
    const progress = Math.min(1, Math.max(0, cycleElapsed / enterDur));
    const eased = 1 - Math.pow(1 - progress, 3);
    const opacity = eased;
    const y = (1 - eased) * 6;

    return (
      <span
        aria-live="polite"
        className={className}
        style={{ display: "inline-block", position: "relative", whiteSpace: "pre-wrap" }}
      >
        <span
          style={{
            display: "inline-block",
            opacity,
            transform: `translateY(${y.toFixed(2)}px)`,
            whiteSpace: "pre-wrap",
          }}
        >
          {phrases[idx] ?? ""}
        </span>
      </span>
    );
  }

  const current = phrases[index] ?? "";

  return (
    <span
      aria-live="polite"
      className={className}
      style={{ display: "inline-block", position: "relative", whiteSpace: "pre-wrap" }}
    >
      <AnimatePresence mode="wait">
        <motion.span
          animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
          exit={{
            opacity: 0,
            y: -4,
            scale: 1,
            filter: "blur(0px)",
            transition: { duration: EXIT_DURATION_S / speed, ease: EXIT_EASE },
          }}
          initial={
            shouldReduceMotion
              ? { opacity: 1 }
              : { opacity: 0, y: 6, scale: 0.99, filter: "blur(2px)" }
          }
          key={index}
          style={{ display: "inline-block", whiteSpace: "pre-wrap" }}
          transition={
            shouldReduceMotion
              ? { duration: 0 }
              : { duration: ENTER_DURATION_S / speed, ease: ENTER_EASE }
          }
        >
          {current}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
