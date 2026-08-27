import { motion, useInView, useReducedMotion } from "motion/react";
import React from "react";

export interface RevealTextProps {
  children: string;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
  speed?: number;
  triggerOnView?: boolean;
  localTime?: number;
  layerStartTime?: number;
  layerDuration?: number;
}

const REVEAL_ANIMATION_DURATION_S = 0.25;
const MILLISECONDS_TO_SECONDS = 1000;
const DEFAULT_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
const SMOOTH_EASE: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];

const directionVariants = {
  up: { y: 24, opacity: 0 },
  down: { y: -24, opacity: 0 },
  left: { x: 24, opacity: 0 },
  right: { x: -24, opacity: 0 },
};

const RevealText: React.FC<RevealTextProps> = ({
  children,
  direction = "up",
  delay = 0,
  speed = 1,
  triggerOnView = false,
  className = "",
  localTime,
  layerStartTime = 0,
}) => {
  const ref = React.useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const shouldReduceMotion = useReducedMotion();
  const animate = (!triggerOnView || inView) && !shouldReduceMotion;
  const effectiveSpeed = Math.max(speed, 0.3);
  const ease = speed < 1 ? SMOOTH_EASE : DEFAULT_EASE;

  if (localTime !== undefined) {
    const elapsed = Math.max(0, localTime - layerStartTime);
    const animDur = REVEAL_ANIMATION_DURATION_S / effectiveSpeed;
    const baseDelayS = delay / MILLISECONDS_TO_SECONDS;
    const itemElapsed = Math.max(0, elapsed - baseDelayS);
    const progress = Math.min(1, Math.max(0, itemElapsed / animDur));
    const eased = 1 - Math.pow(1 - progress, 3);
    const opacity = eased;
    const offset = (1 - eased) * 24;
    const transform = direction === 'up' ? `translateY(${offset.toFixed(2)}px)`
      : direction === 'down' ? `translateY(-${offset.toFixed(2)}px)`
      : direction === 'left' ? `translateX(${offset.toFixed(2)}px)`
      : `translateX(-${offset.toFixed(2)}px)`;

    return (
      <span
        className={className}
        ref={ref}
        style={{
          display: "inline-block",
          opacity,
          transform,
        }}
      >
        {children}
      </span>
    );
  }

  return (
    <motion.span
      animate={
        shouldReduceMotion || !animate
          ? { opacity: 1 }
          : { x: 0, y: 0, opacity: 1 }
      }
      className={className}
      initial={
        shouldReduceMotion ? { opacity: 1 } : directionVariants[direction]
      }
      ref={ref}
      style={{ display: "inline-block" }}
      transition={
        shouldReduceMotion
          ? { duration: 0 }
          : {
              duration: REVEAL_ANIMATION_DURATION_S / effectiveSpeed,
              delay: delay / MILLISECONDS_TO_SECONDS,
              ease,
            }
      }
    >
      {children}
    </motion.span>
  );
};

export default RevealText;
