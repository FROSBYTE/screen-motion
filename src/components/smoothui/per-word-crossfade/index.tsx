"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import { useRef } from "react";

export interface PerWordCrossfadeProps {
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

const DURATION_S = 0.7;
const MS = 1000;
// Calm keynote ease-out.
const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * PerWordCrossfade — per-word fade-in with a subtle upward drift,
 * calm keynote rhythm. From the animate-text catalog
 * (`per-word-crossfade`).
 */
export default function PerWordCrossfade({
  children,
  className = "",
  delay = 0,
  stagger = 70,
  speed = 1,
  triggerOnView = false,
  localTime,
  layerStartTime = 0,
}: PerWordCrossfadeProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const shouldReduceMotion = useReducedMotion();
  const play = (!triggerOnView || inView) && !shouldReduceMotion;
  const lines = (children || "").split("\n");

  if (localTime !== undefined) {
    const elapsed = Math.max(0, localTime - layerStartTime);
    const animDur = DURATION_S / Math.max(0.1, speed);
    const staggerS = (stagger / Math.max(0.1, speed)) / MS;
    const baseDelayS = delay / MS;

    let globalWordIndex = 0;

    return (
      <span aria-label={children} className={className} ref={ref} style={{ display: "block" }}>
        {lines.map((line, lineIdx) => {
          const words = line.split(" ");
          return (
            <span key={lineIdx} style={{ display: "block" }}>
              {line === "" ? <br /> : words.map((word, index) => {
                const wordIdx = globalWordIndex++;
                const wordStart = baseDelayS + wordIdx * staggerS;
                const wordElapsed = Math.max(0, elapsed - wordStart);
                const progress = Math.min(1, Math.max(0, wordElapsed / animDur));
                const eased = 1 - Math.pow(1 - progress, 3);
                const opacity = eased;
                const y = (1 - eased) * 8;

                return (
                  <span key={index} style={{ display: "inline-block" }}>
                    <span
                      aria-hidden="true"
                      style={{
                        display: "inline-block",
                        whiteSpace: "pre",
                        opacity,
                        transform: `translateY(${y.toFixed(2)}px)`,
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
        })}
      </span>
    );
  }

  return (
    <span aria-label={children} className={className} ref={ref} style={{ display: "block" }}>
      {lines.map((line, lineIdx) => {
        const words = line.split(" ");
        return (
          <span key={lineIdx} style={{ display: "block" }}>
            {line === "" ? <br /> : words.map((word, index) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: words have no stable id
              <span key={index} style={{ display: "inline-block" }}>
                <motion.span
                  animate={play ? { opacity: 1, y: 0 } : undefined}
                  aria-hidden="true"
                  initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
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
      })}
    </span>
  );
}
