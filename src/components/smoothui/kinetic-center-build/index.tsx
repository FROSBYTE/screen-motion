"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

export interface KineticCenterBuildProps {
  className?: string;
  /** Interval between phrase completions in milliseconds. */
  interval?: number;
  phrases?: string[];
  children?: string;
  speed?: number;
  localTime?: number;
  layerStartTime?: number;
  layerDuration?: number;
}

const BUILD_EASE: [number, number, number, number] = [0.2, 0.8, 0.2, 1];
const SMOOTH_EASE: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];
const EXIT_EASE: [number, number, number, number] = [0.4, 0, 0.2, 1];

export default function KineticCenterBuild({
  phrases: phrasesProp,
  children,
  className = "",
  interval = 2500,
  speed = 1,
  localTime,
  layerStartTime = 0,
}: KineticCenterBuildProps) {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [wordCount, setWordCount] = useState(1);
  const [exiting, setExiting] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const phrases = phrasesProp ?? (children ? [children] : []);
  const currentPhrase = phrases[phraseIndex] ?? "";
  const words = currentPhrase.split(" ");
  const effectiveSpeed = Math.max(speed, 0.35);
  const activeEase = speed < 1 ? SMOOTH_EASE : BUILD_EASE;

  useEffect(() => {
    if (localTime !== undefined || shouldReduceMotion) return;

    setWordCount(1);
    setExiting(false);

    const buildTimers: ReturnType<typeof setTimeout>[] = [];

    const wordDelay = Math.min((430) / effectiveSpeed, 250);
    for (let i = 1; i < words.length; i++) {
      buildTimers.push(
        setTimeout(() => {
          setWordCount(i + 1);
        }, i * wordDelay)
      );
    }

    if (phrases.length > 1) {
      const totalBuild = ((words.length - 1) * wordDelay + 340) / effectiveSpeed;
      const holdId = setTimeout(() => {
        setExiting(true);
        setTimeout(() => {
          setPhraseIndex((prev) => (prev + 1) % phrases.length);
          setWordCount(1);
          setExiting(false);
        }, 480 / effectiveSpeed);
      }, totalBuild + interval / effectiveSpeed);
      buildTimers.push(holdId);
    }

    return () => {
      for (const t of buildTimers) {
        clearTimeout(t);
      }
    };
  }, [phraseIndex, phrases.length, interval, effectiveSpeed, shouldReduceMotion, words.length, localTime]);

  if (localTime !== undefined) {
    const elapsed = Math.max(0, localTime - layerStartTime);
    const wordDelay = Math.min(430 / effectiveSpeed, 250) / 1000;
    const totalWords = words.length;
    const activeCount = Math.min(totalWords, Math.floor(elapsed / wordDelay) + 1);
    const shown = words.slice(0, activeCount);

    return (
      <span
        aria-live="polite"
        className={`flex flex-wrap items-center justify-center ${className}`}
        style={{ gap: 10 }}
      >
        {shown.map((word, i) => {
          const wStart = i * wordDelay;
          const wElapsed = Math.max(0, elapsed - wStart);
          const wDur = (i === 0 ? 0.34 : 0.43) / effectiveSpeed;
          const p = Math.min(1, Math.max(0, wElapsed / wDur));
          const eased = 1 - Math.pow(1 - p, 3);
          const opacity = eased;
          const x = (1 - eased) * 44;

          return (
            <span
              key={`${phraseIndex}-${i}`}
              style={{
                display: "inline-block",
                opacity,
                transform: `translateX(${x.toFixed(2)}px)`,
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
    : { opacity: 1, x: 0, y: 0, scale: 1, filter: "blur(0px)" };
  const exitAnimate = {
    opacity: 0,
    y: -6,
    filter: "blur(2.5px)",
    transition: { duration: 0.26 / effectiveSpeed, ease: EXIT_EASE },
  };

  return (
    <span
      aria-live="polite"
      className={`flex flex-wrap items-center justify-center ${className}`}
      style={{ gap: 10 }}
    >
      <AnimatePresence mode="popLayout">
        {visibleWords.map((word, i) => (
          <motion.span
            animate={exiting ? exitAnimate : restingAnimate}
            initial={
              shouldReduceMotion
                ? { opacity: 1 }
                : {
                    opacity: 0,
                    x: 88,
                    y: 6,
                    scale: 0.992,
                    filter: "blur(3.5px)",
                  }
            }
            // biome-ignore lint/suspicious/noArrayIndexKey: word position is the stable identity within a phrase
            key={`${phraseIndex}-${i}`}
            layout
            style={{ display: "inline-block" }}
            transition={
              shouldReduceMotion
                ? { duration: 0 }
                : {
                    duration: (i === 0 ? 0.34 : 0.43) / effectiveSpeed,
                    ease: activeEase,
                    layout: { duration: 0.43 / effectiveSpeed, ease: activeEase },
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
