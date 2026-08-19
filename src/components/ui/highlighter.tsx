"use client"

import React, { useEffect, useState } from "react"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"

export type AnnotationAction =
  | "highlight"
  | "underline"
  | "box"
  | "circle"
  | "strike-through"

export interface HighlighterProps {
  children: React.ReactNode
  action?: AnnotationAction
  color?: string
  textColor?: string
  strokeWidth?: number
  animationDuration?: number
  speed?: number
  className?: string
}

export function Highlighter({
  children,
  action = "highlight",
  color = "#ffd1dc",
  textColor,
  strokeWidth = 2,
  animationDuration = 600,
  speed = 1,
  className,
}: HighlighterProps) {
  const [triggered, setTriggered] = useState(false)
  const effectiveDuration = animationDuration / speed / 1000

  useEffect(() => {
    const timer = setTimeout(() => setTriggered(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const renderMark = () => {
    switch (action) {
      case "highlight":
        return (
          <motion.span
            initial={{ width: 0 }}
            animate={triggered ? { width: "100%" } : { width: 0 }}
            transition={{ duration: effectiveDuration, ease: [0.65, 0, 0.35, 1] }}
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              height: "45%",
              background: color,
              opacity: 0.55,
              borderRadius: "2px",
              zIndex: 0,
            }}
          />
        )
      case "underline":
        return (
          <motion.span
            initial={{ width: 0 }}
            animate={triggered ? { width: "100%" } : { width: 0 }}
            transition={{ duration: effectiveDuration, ease: [0.65, 0, 0.35, 1] }}
            style={{
              position: "absolute",
              bottom: "-2px",
              left: 0,
              height: `${strokeWidth}px`,
              background: color,
              borderRadius: "1px",
              zIndex: 0,
            }}
          />
        )
      case "box":
        return (
          <motion.span
            initial={{ opacity: 0, scale: 0.92 }}
            animate={triggered ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.92 }}
            transition={{ duration: effectiveDuration, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{
              position: "absolute",
              inset: `-${strokeWidth + 2}px`,
              border: `${strokeWidth}px solid ${color}`,
              borderRadius: "4px",
              zIndex: 0,
            }}
          />
        )
      case "circle":
        return (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={triggered ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
            transition={{ duration: effectiveDuration, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{
              position: "absolute",
              inset: `-${strokeWidth + 4}px`,
              border: `${strokeWidth}px solid ${color}`,
              borderRadius: "50%",
              zIndex: 0,
            }}
          />
        )
      case "strike-through":
        return (
          <motion.span
            initial={{ width: 0 }}
            animate={triggered ? { width: "100%" } : { width: 0 }}
            transition={{ duration: effectiveDuration, ease: [0.65, 0, 0.35, 1] }}
            style={{
              position: "absolute",
              top: "50%",
              left: 0,
              height: `${strokeWidth}px`,
              background: color,
              transform: "translateY(-50%)",
              zIndex: 2,
            }}
          />
        )
      default:
        return null
    }
  }

  return (
    <span
      className={cn("relative inline-block bg-transparent", className)}
      style={{ color: textColor }}
    >
      {renderMark()}
      <span style={{ position: "relative", zIndex: 1 }}>{children}</span>
    </span>
  )
}

export default Highlighter
