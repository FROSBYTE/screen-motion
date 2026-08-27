"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import { useRef } from "react";

export interface PerCharacterRiseProps {
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

const DURATION_S = 0.7;
const MS = 1000;
// Apple's clean tvOS-style ease-out.
const EASE = [0.2, 0.8, 0.2, 1] as const;

/**
 * PerCharacterRise — letters slide up from below with no blur, crisp and
 * deliberate. Apple's clean tvOS-style reveal. From the animate-text catalog
 * (`per-character-rise`). Best on 40px+ headlines.
 */
export default function PerCharacterRise({
  children,
  className = "",
  delay = 0,
  stagger = 24,
  speed = 1,
  triggerOnView = false,
  localTime,
  layerStartTime = 0,
}: PerCharacterRiseProps) {
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
      <span aria-label={children} className={className} ref={ref}>
        {characters.map((char, index) => {
          if (char === "\n") return <br key={index} />;
          const charStart = baseDelayS + index * staggerS;
          const charElapsed = Math.max(0, elapsed - charStart);
          const progress = Math.min(1, Math.max(0, charElapsed / animDur));
          const eased = 1 - Math.pow(1 - progress, 3);
          const opacity = eased;
          const y = (1 - eased) * 32;

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
              {char === " " ? "\u00A0" : char}
            </span>
          );
        })}
      </span>
    );
  }

  return (
    <span aria-label={children} className={className} ref={ref}>
      {characters.map((char, index) => {
        if (char === "\n") {
          return <br key={index} />;
        }
        return (
          <motion.span
            animate={play ? { opacity: 1, y: 0 } : undefined}
            aria-hidden="true"
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 32 }}
            // biome-ignore lint/suspicious/noArrayIndexKey: characters have no stable id
            key={index}
            style={{ display: "inline-block", whiteSpace: "pre" }}
            transition={
              shouldReduceMotion
                ? { duration: 0 }
                : {
                    duration: DURATION_S / speed,
                    delay: delay / MS + (index * (stagger / speed)) / MS,
                    ease: EASE,
                  }
            }
          >
            {char === " " ? " " : char}
          </motion.span>
        );
      })}
    </span>
  );
}
