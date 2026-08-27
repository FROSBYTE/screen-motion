"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import { useRef, useEffect } from "react";

export interface LineByLineSlideProps {
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
  localTime?: number;
  layerStartTime?: number;
  layerDuration?: number;
}

const DURATION_S = 0.55;
const MS = 1000;
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const SMOOTH_EASE: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];

export default function LineByLineSlide({
  children,
  lines: linesProp,
  className = "",
  delay = 0,
  stagger = 120,
  speed = 1,
  triggerOnView = false,
  localTime,
  layerStartTime = 0,
}: LineByLineSlideProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const shouldReduceMotion = useReducedMotion();
  const play = (!triggerOnView || inView) && !shouldReduceMotion;

  const isMountedRef = useRef(false);
  useEffect(() => {
    isMountedRef.current = true;
  }, []);

  const lines = linesProp ?? (children ? children.split("\n") : []);
  const label = lines.join(" ");
  const effectiveSpeed = Math.max(speed, 0.3);
  const effectiveEase = speed < 1 ? SMOOTH_EASE : EASE;
  const effectiveStagger = Math.min(stagger / effectiveSpeed, 300);

  if (localTime !== undefined) {
    const elapsed = Math.max(0, localTime - layerStartTime);
    const animDur = DURATION_S / effectiveSpeed;
    const staggerS = effectiveStagger / MS;
    const baseDelayS = delay / MS;

    return (
      <span
        aria-label={label}
        className={className}
        ref={ref}
        style={{ display: "block" }}
      >
        {lines.map((line, index) => {
          const lineStart = baseDelayS + index * staggerS;
          const lineElapsed = Math.max(0, elapsed - lineStart);
          const progress = Math.min(1, Math.max(0, lineElapsed / animDur));
          const eased = 1 - Math.pow(1 - progress, 3);
          const opacity = eased;
          const x = (1 - eased) * -48;

          return (
            <span
              aria-hidden="true"
              key={index}
              style={{
                display: "block",
                opacity,
                transform: `translateX(${x.toFixed(2)}px)`,
              }}
            >
              {line === "" ? <br /> : line}
            </span>
          );
        })}
      </span>
    );
  }

  return (
    <span
      aria-label={label}
      className={className}
      ref={ref}
      style={{ display: "block" }}
    >
      {lines.map((line, index) => (
        <motion.span
          animate={play ? { opacity: 1, x: 0 } : undefined}
          aria-hidden="true"
          initial={isMountedRef.current ? false : (shouldReduceMotion ? { opacity: 1 } : { opacity: 0, x: -48 })}
          // biome-ignore lint/suspicious/noArrayIndexKey: lines have no stable id
          key={index}
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
          {line === "" ? <br /> : line}
        </motion.span>
      ))}
    </span>
  );
}