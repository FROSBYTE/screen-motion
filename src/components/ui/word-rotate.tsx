"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion, type MotionProps } from "motion/react"

import { cn } from "@/lib/utils"

export interface WordRotateProps {
  words: string[]
  duration?: number
  motionProps?: MotionProps
  className?: string
  color?: string
  fontSize?: number
}

export function WordRotate({
  words = ["Innovative", "Creative", "Powerful", "Beautiful"],
  duration = 2500,
  motionProps = {
    initial: { opacity: 0, y: -50 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 50 },
    transition: { duration: 0.25, ease: "easeOut" },
  },
  className,
  color,
  fontSize,
}: WordRotateProps) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (!words || words.length <= 1) return
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % words.length)
    }, duration)

    return () => clearInterval(interval)
  }, [words, duration])

  if (!words || words.length === 0) return null

  return (
    <div className="overflow-hidden py-1 inline-flex items-center">
      <AnimatePresence mode="wait">
        <motion.span
          key={words[index]}
          className={cn(className)}
          style={{ color, fontSize: fontSize ? `${fontSize}px` : undefined, display: "inline-block" }}
          {...motionProps}
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </div>
  )
}

export default WordRotate
