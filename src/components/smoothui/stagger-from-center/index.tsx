"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import { useRef } from "react";

export interface StaggerFromCenterProps {
  children: string;
  className?: string;
  /** Delay before the animation starts, in milliseconds. */
  delay?: number;
  /** Per-step stagger between characters, in milliseconds. */
  stagger?: number;
  /** Animation speed multiplier. */
  speed?: number;
  /** Animate only once the text scrolls into view. */
  triggerOnView?: boolean;
  localTime?: number;
  layerStartTime?: number;
  layerDuration?: number;
}

const DURATION_S = 0.62;
const MS = 1000;
// Apple-ish ease-out for center-out reveal.
const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * StaggerFromCenter — characters reveal from the center outward to
 * emphasize the keyword core. Delay is computed by distance from center,
 * not linear index. From the animate-text catalog (`stagger-from-center`).
 */
export default function StaggerFromCenter({
  children,
  className = "",
  delay = 0,
  stagger = 22,
  speed = 1,
  triggerOnView = false,
  localTime,
  layerStartTime = 0,
}: StaggerFromCenterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const shouldReduceMotion = useReducedMotion();
  const play = (!triggerOnView || inView) && !shouldReduceMotion;
  const characters = Array.from(children || "");
  const center = (characters.length - 1) / 2;

  if (localTime !== undefined) {
    const elapsed = Math.max(0, localTime - layerStartTime);
    const animDur = DURATION_S / Math.max(0.1, speed);
    const staggerS = (stagger / Math.max(0.1, speed)) / MS;
    const baseDelayS = delay / MS;

    return (
      <span aria-label={children} className={className} ref={ref} style={{ display: "inline-block" }}>
        {characters.map((char, index) => {
          if (char === "\n") return <br key={index} />;
          const distance = Math.abs(index - center);
          const charStart = baseDelayS + distance * staggerS;
          const charElapsed = Math.max(0, elapsed - charStart);
          const progress = Math.min(1, Math.max(0, charElapsed / animDur));
          const eased = 1 - Math.pow(1 - progress, 3);
          const opacity = eased;
          const y = (1 - eased) * 12;

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
      {characters.map((char, index) => {
        if (char === "\n") return <br key={index} />;
        const distance = Math.abs(index - center);
        return (
          <motion.span
            animate={
              play ? { filter: "blur(0px)", opacity: 1, y: 0 } : undefined
            }
            aria-hidden="true"
            initial={
              shouldReduceMotion
                ? { opacity: 1 }
                : { filter: "blur(3px)", opacity: 0, y: 12 }
            }
            key={index}
            style={{ display: "inline-block", whiteSpace: "pre" }}
            transition={
              shouldReduceMotion
                ? { duration: 0 }
                : {
                    delay: delay / MS + (distance * (stagger / speed)) / MS,
                    duration: DURATION_S / speed,
                    ease: EASE,
                  }
            }
          >
            {char === " " ? "\u00A0" : String(char)}
          </motion.span>
        );
      })}
    </span>
  );
}
