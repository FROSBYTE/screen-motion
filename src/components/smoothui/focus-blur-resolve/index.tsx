"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import { useRef } from "react";

export interface FocusBlurResolveProps {
  children: string;
  className?: string;
  /** Delay before the animation starts, in milliseconds. */
  delay?: number;
  /** Animation speed multiplier. */
  speed?: number;
  /** Animate only once the text scrolls into view. */
  triggerOnView?: boolean;
  localTime?: number;
  layerStartTime?: number;
  layerDuration?: number;
}

const DURATION_S = 0.76;
const MS = 1000;
// Smooth deceleration — premium focus-pull ease-out.
const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * FocusBlurResolve — whole-text entrance that pulls from heavy blur to crisp,
 * with a subtle upward drift and scale settle. Ideal for hero headlines and
 * section titles where the moment of resolution feels intentional.
 * From the animate-text catalog (`focus-blur-resolve`).
 */
export default function FocusBlurResolve({
  children,
  className = "",
  delay = 0,
  speed = 1,
  triggerOnView = false,
  localTime,
  layerStartTime = 0,
}: FocusBlurResolveProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const shouldReduceMotion = useReducedMotion();
  const play = (!triggerOnView || inView) && !shouldReduceMotion;

  if (localTime !== undefined) {
    const elapsed = Math.max(0, localTime - layerStartTime);
    const animDur = DURATION_S / Math.max(0.1, speed);
    const baseDelayS = delay / MS;
    const itemElapsed = Math.max(0, elapsed - baseDelayS);
    const progress = Math.min(1, Math.max(0, itemElapsed / animDur));
    const eased = 1 - Math.pow(1 - progress, 3);
    const opacity = eased;
    const y = (1 - eased) * 14;

    return (
      <span aria-label={children} className={className} ref={ref} style={{ display: "inline-block", whiteSpace: "pre-wrap" }}>
        <span
          aria-hidden="true"
          style={{
            display: "inline-block",
            opacity,
            transform: `translateY(${y.toFixed(2)}px)`,
            whiteSpace: "pre-wrap",
          }}
        >
          {children}
        </span>
      </span>
    );
  }

  return (
    <span aria-label={children} className={className} ref={ref} style={{ display: "inline-block", whiteSpace: "pre-wrap" }}>
      <motion.span
        animate={
          play ? { opacity: 1, y: 0, filter: "blur(0px)", scale: 1 } : undefined
        }
        aria-hidden="true"
        initial={
          shouldReduceMotion
            ? { opacity: 1, y: 0, filter: "blur(0px)", scale: 1 }
            : { opacity: 0, y: 14, filter: "blur(14px)", scale: 1.01 }
        }
        style={{ display: "inline-block", whiteSpace: "pre-wrap" }}
        transition={
          shouldReduceMotion
            ? { duration: 0 }
            : {
                duration: DURATION_S / speed,
                delay: delay / MS,
                ease: EASE,
              }
        }
      >
        {children}
      </motion.span>
    </span>
  );
}
