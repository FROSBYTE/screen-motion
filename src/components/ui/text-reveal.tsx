"use client"

import {
  useRef,
  type ComponentPropsWithoutRef,
  type FC,
  type ReactNode,
} from "react"
import { motion, useTime, useTransform, MotionValue } from "motion/react"

import { cn } from "@/lib/utils"

export interface TextRevealProps extends ComponentPropsWithoutRef<"div"> {
  children: string
  duration?: number
}

export const TextReveal: FC<TextRevealProps> = ({ children, className, duration = 3000 }) => {
  const sectionRef = useRef<HTMLDivElement | null>(null)
  
  const time = useTime();
  const progress = useTransform(time, (t) => (t / duration) % 1); // looping animation

  if (typeof children !== "string") {
    throw new Error("TextReveal: children must be a string")
  }

  const lines = children.split("\n")

  return (
    <div ref={sectionRef} className={cn("relative z-0", className)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {lines.map((line, lineIdx) => {
        const words = line.split(" ")
        return (
          <div
            key={lineIdx}
            className={
              "flex items-center bg-transparent"
            }
          >
            <span
              className={
                "flex flex-nowrap whitespace-pre text-black/20 dark:text-white/20"
              }
            >
              {words.map((word, i) => {
                const totalWords = words.length * lines.length || 1;
                const indexInTotal = lineIdx * words.length + i;
                const start = indexInTotal / totalWords;
                const end = start + 1 / totalWords;
                return (
                  <Word key={i} progress={progress} range={[start, end]}>
                    {word}{i < words.length - 1 ? " " : ""}
                  </Word>
                )
              })}
            </span>
          </div>
        )
      })}
    </div>
  )
}

interface WordProps {
  children: ReactNode
  progress: MotionValue<number>
  range: [number, number]
}

const Word: FC<WordProps> = ({ children, progress, range }) => {
  const opacity = useTransform(progress, range, [0, 1])
  return (
    <span className="xl:lg-3 relative mx-1 lg:mx-1.5">
      <span className="absolute opacity-30">{children}</span>
      <motion.span
        style={{ opacity: opacity }}
        className={"text-black dark:text-white"}
      >
        {children}
      </motion.span>
    </span>
  )
}
