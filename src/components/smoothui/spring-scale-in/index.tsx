"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import { useRef } from "react";

/**
 * SpringScaleIn — per-word scale-in with a soft overshoot, iOS app icon-style pop.
 * From the animate-text catalog (`spring-scale-in`).
 */
export interface SpringScaleInProps {
  children: string;
  className?: string;
  /** Delay before the animation starts, in milliseconds. */
  delay?: number;
  /** Per-word stagger, in milliseconds. */
  stagger?: number;
  /** Animation speed multiplier. */
  speed?: number;
  /** Animate only once the text scrolls into view. */
  triggerOnView?: boolean;
  localTime?: number;
  layerStartTime?: number;
  layerDuration?: number;
}

const DURATION_S = 0.36;
const MS = 1000;
const EASE = [0.34, 1.56, 0.64, 1] as const;

export default function SpringScaleIn({
  children,
  className = "",
  delay = 0,
  stagger = 95,
  speed = 1,
  triggerOnView = false,
  localTime,
  layerStartTime = 0,
}: SpringScaleInProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const shouldReduceMotion = useReducedMotion();
  const play = (!triggerOnView || inView) && !shouldReduceMotion;
  const words = (children || "").split(" ");

  if (localTime !== undefined) {
    const elapsed = Math.max(0, localTime - layerStartTime);
    const animDur = DURATION_S / Math.max(0.1, speed);
    const staggerS = (stagger / Math.max(0.1, speed)) / MS;
    const baseDelayS = delay / MS;

    return (
      <span aria-label={children} className={className} ref={ref} style={{ display: "inline-block" }}>
        {words.map((word, index) => {
          const wordStart = baseDelayS + index * staggerS;
          const wordElapsed = Math.max(0, elapsed - wordStart);
          const progress = Math.min(1, Math.max(0, wordElapsed / animDur));
          const eased = 1 - Math.pow(1 - progress, 3);
          const opacity = eased;
          const scale = 0.7 + eased * 0.3;

          return (
            <span key={index} style={{ display: "inline-block" }}>
              <span
                aria-hidden="true"
                style={{
                  display: "inline-block",
                  whiteSpace: "pre",
                  opacity,
                  transform: `scale(${scale.toFixed(3)})`,
                }}
              >
                {word}
              </span>
              {index < words.length - 1 && (
                <span
                  aria-hidden="true"
                  style={{ display: "inline-block", whiteSpace: "pre" }}
                >
                  {" "}
                </span>
              )}
            </span>
          );
        })}
      </span>
    );
  }

  return (
    <span aria-label={children} className={className} ref={ref} style={{ display: "inline-block" }}>
      {words.map((word, index) => (
        <span key={index} style={{ display: "inline-block" }}>
          <motion.span
            animate={play ? { opacity: 1, scale: 1 } : undefined}
            aria-hidden="true"
            initial={
              shouldReduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.7 }
            }
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
            {word}
          </motion.span>
          {index < words.length - 1 && (
            <span
              aria-hidden="true"
              style={{ display: "inline-block", whiteSpace: "pre" }}
            >
              {" "}
            </span>
          )}
        </span>
      ))}
    </span>
  );
}
