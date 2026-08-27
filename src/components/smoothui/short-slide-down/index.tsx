"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

export interface ShortSlideDownProps {
  className?: string;
  /** Interval between phrase completions in milliseconds. */
  interval?: number;
  phrases: string[];
  speed?: number;
  localTime?: number;
  layerStartTime?: number;
  layerDuration?: number;
}

const BUILD_EASE = [0.2, 0.8, 0.2, 1] as const;
const EXIT_EASE = [0.4, 0, 0.2, 1] as const;

/**
 * ShortSlideDown — each new word drops in from above into its own centered line,
 * pushing the stack downward until a centered multi-line composition locks in place.
 * From the animate-text catalog (`short-slide-down`).
 */
export default function ShortSlideDown({
  phrases,
  className = "",
  interval = 2500,
  speed = 1,
  localTime,
  layerStartTime = 0,
}: ShortSlideDownProps) {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [wordCount, setWordCount] = useState(1);
  const [exiting, setExiting] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const currentPhrase = phrases[phraseIndex] ?? "";
  const words = currentPhrase.split(" ");

  useEffect(() => {
    if (localTime !== undefined || shouldReduceMotion) return;

    setWordCount(1);
    setExiting(false);

    const buildTimers: ReturnType<typeof setTimeout>[] = [];

    const wordDelay = 250;
    for (let i = 1; i < words.length; i++) {
      buildTimers.push(
        setTimeout(() => {
          setWordCount(i + 1);
        }, i * wordDelay)
      );
    }

    if (phrases.length > 1) {
      const totalBuild = (words.length - 1) * wordDelay + 360;
      const holdId = setTimeout(() => {
        setExiting(true);
        setTimeout(() => {
          setPhraseIndex((prev) => (prev + 1) % phrases.length);
          setWordCount(1);
          setExiting(false);
        }, 500);
      }, totalBuild + interval);
      buildTimers.push(holdId);
    }

    return () => {
      for (const t of buildTimers) {
        clearTimeout(t);
      }
    };
  }, [phraseIndex, phrases.length, interval, shouldReduceMotion, words.length, localTime]);

  if (localTime !== undefined) {
    const elapsed = Math.max(0, localTime - layerStartTime);
    const wordDelay = 0.25 / Math.max(0.1, speed);
    const activeCount = Math.min(words.length, Math.floor(elapsed / wordDelay) + 1);
    const shown = words.slice(0, activeCount);

    return (
      <span
        aria-live="polite"
        className={`flex flex-col items-center ${className}`}
        style={{ gap: 12 }}
      >
        {shown.map((word, i) => {
          const wStart = i * wordDelay;
          const wElapsed = Math.max(0, elapsed - wStart);
          const wDur = (i === 0 ? 0.36 : 0.45) / Math.max(0.1, speed);
          const p = Math.min(1, Math.max(0, wElapsed / wDur));
          const eased = 1 - Math.pow(1 - p, 3);
          const opacity = eased;
          const y = (1 - eased) * -28;

          return (
            <span
              key={`${phraseIndex}-${i}`}
              style={{
                display: "block",
                opacity,
                transform: `translateY(${y.toFixed(2)}px)`,
              }}
            >
              {word}
            </span>
          );
        })}
      </span>
    );
  }

  const visibleWords = shouldReduceMotion ? words : words.slice(0, wordCount);
  const restingAnimate = shouldReduceMotion
    ? { opacity: 1 }
    : { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" };
  const exitAnimate = {
    opacity: 0,
    y: 10,
    filter: "blur(1.2px)",
    transition: { duration: 0.32, ease: EXIT_EASE },
  };

  return (
    <span
      aria-live="polite"
      className={`flex flex-col items-center ${className}`}
      style={{ gap: 12 }}
    >
      <AnimatePresence mode="popLayout">
        {visibleWords.map((word, i) => (
          <motion.span
            animate={exiting ? exitAnimate : restingAnimate}
            initial={
              shouldReduceMotion
                ? { opacity: 1 }
                : { opacity: 0, y: -28, scale: 0.992, filter: "blur(2.4px)" }
            }
            // biome-ignore lint/suspicious/noArrayIndexKey: word position is the stable identity within a phrase
            key={`${phraseIndex}-${i}`}
            layout
            style={{ display: "block" }}
            transition={
              shouldReduceMotion
                ? { duration: 0 }
                : {
                    duration: i === 0 ? 0.36 : 0.45,
                    ease: BUILD_EASE,
                    layout: { duration: 0.45, ease: BUILD_EASE },
                  }
            }
          >
            {word}
          </motion.span>
        ))}
      </AnimatePresence>
    </span>
  );
}
