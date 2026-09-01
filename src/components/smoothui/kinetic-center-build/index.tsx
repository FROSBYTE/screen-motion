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
  const lines = currentPhrase.split("\n");
  const wordsWithLine = lines.flatMap((line, lineIdx) =>
    line.split(" ").map((word, wordInLineIdx) => ({ word, lineIdx, wordInLineIdx }))
  );
  const totalWords = wordsWithLine.length;
  const effectiveSpeed = Math.max(speed, 0.35);
  const activeEase = speed < 1 ? SMOOTH_EASE : BUILD_EASE;

  useEffect(() => {
    if (localTime !== undefined || shouldReduceMotion) return;

    setWordCount(1);
    setExiting(false);

    const buildTimers: ReturnType<typeof setTimeout>[] = [];

    const wordDelay = Math.min((430) / effectiveSpeed, 250);
    for (let i = 1; i < totalWords; i++) {
      buildTimers.push(
        setTimeout(() => {
          setWordCount(i + 1);
        }, i * wordDelay)
      );
    }

    if (phrases.length > 1) {
      const totalBuild = ((totalWords - 1) * wordDelay + 340) / effectiveSpeed;
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
  }, [phraseIndex, phrases.length, interval, effectiveSpeed, shouldReduceMotion, totalWords, localTime]);

  if (localTime !== undefined) {
    const elapsed = Math.max(0, localTime - layerStartTime);
    const wordDelay = Math.min(430 / effectiveSpeed, 250) / 1000;
    const activeCount = Math.min(totalWords, Math.floor(elapsed / wordDelay) + 1);

    return (
      <span
        aria-live="polite"
        className={`flex flex-col items-center justify-center ${className}`}
        style={{ gap: 6 }}
      >
        {lines.map((line, lineIdx) => {
          const lineWords = line.split(" ");
          return (
            <span
              key={lineIdx}
              className="flex flex-wrap items-center justify-center"
              style={{ gap: 10 }}
            >
              {lineWords.map((word, wordInLineIdx) => {
                const globalIdx = lines.slice(0, lineIdx).reduce((acc, l) => acc + l.split(" ").length, 0) + wordInLineIdx;
                if (globalIdx >= activeCount) return null;
                const wStart = globalIdx * wordDelay;
                const wElapsed = Math.max(0, elapsed - wStart);
                const wDur = (globalIdx === 0 ? 0.34 : 0.43) / effectiveSpeed;
                const p = Math.min(1, Math.max(0, wElapsed / wDur));
                const eased = 1 - Math.pow(1 - p, 3);
                const opacity = eased;
                const x = (1 - eased) * 44;

                return (
                  <span
                    key={`${phraseIndex}-${lineIdx}-${wordInLineIdx}`}
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
        })}
      </span>
    );
  }

  const exitAnimate = {
    opacity: 0,
    y: -6,
    filter: "blur(2.5px)",
    transition: { duration: 0.26 / effectiveSpeed, ease: EXIT_EASE },
  };

  const restingAnimate = shouldReduceMotion
    ? { opacity: 1 }
    : { opacity: 1, x: 0, y: 0, scale: 1, filter: "blur(0px)" };

  return (
    <span
      aria-live="polite"
      className={`flex flex-col items-center justify-center ${className}`}
      style={{ gap: 6 }}
    >
      {lines.map((line, lineIdx) => {
        const lineWords = line.split(" ");
        return (
          <span
            key={lineIdx}
            className="flex flex-wrap items-center justify-center"
            style={{ gap: 10 }}
          >
            <AnimatePresence mode="popLayout">
              {lineWords.map((word, wordInLineIdx) => {
                const globalIdx = lines.slice(0, lineIdx).reduce((acc, l) => acc + l.split(" ").length, 0) + wordInLineIdx;
                const isVisible = shouldReduceMotion || globalIdx < wordCount;
                if (!isVisible) return null;

                return (
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
                    key={`${phraseIndex}-${lineIdx}-${wordInLineIdx}`}
                    layout
                    style={{ display: "inline-block" }}
                    transition={
                      shouldReduceMotion
                        ? { duration: 0 }
                        : {
                            duration: (globalIdx === 0 ? 0.34 : 0.43) / effectiveSpeed,
                            ease: activeEase,
                            layout: { duration: 0.43 / effectiveSpeed, ease: activeEase },
                          }
                    }
                  >
                    {word}
                  </motion.span>
                );
              })}
            </AnimatePresence>
          </span>
        );
      })}
    </span>
  );
}
