"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import { useRef } from "react";

export interface ScaleDownFadeProps {
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

const DURATION_S = 0.52;
const MS = 1000;
const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * ScaleDownFade — subtle premium settle-in where the text enters slightly
 * scaled up and drifts down to its natural size. The whole text animates as
 * a single element. From the animate-text catalog (`scale-down-fade`).
 * Safe default for product UIs where copy should feel polished but not animated.
 */
export default function ScaleDownFade({
  children,
  className = "",
  delay = 0,
  speed = 1,
  triggerOnView = false,
  localTime,
  layerStartTime = 0,
}: ScaleDownFadeProps) {
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
    const y = (1 - eased) * 8;
    const scale = 1.04 - eased * 0.04;

    return (
      <span
        aria-label={children}
        className={className}
        ref={ref}
        style={{
          display: "inline-block",
          opacity,
          transform: `translateY(${y.toFixed(2)}px) scale(${scale.toFixed(3)})`,
        }}
      >
        {children}
      </span>
    );
  }

  return (
    <motion.span
      animate={play ? { opacity: 1, y: 0, scale: 1 } : undefined}
      aria-label={children}
      className={className}
      initial={
        shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 8, scale: 1.04 }
      }
      ref={ref}
      style={{ display: "inline-block" }}
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
  );
}
