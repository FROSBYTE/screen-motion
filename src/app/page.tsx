"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Iridescence from "@/components/Iridescence";
import SplashCursor from "@/components/SplashCursor";
import { TEMPLATES } from "@/types";
import Footer1 from "@/components/smoothui/blocks/footers/footer-1";

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [studioMode, setStudioMode] = useState<"video" | "image">("video");
  const [activeStudioTemplate, setActiveStudioTemplate] = useState("orbit");

  return (
    <div
      style={{
        minHeight: "100vh",
        position: "relative",
        overflowX: "hidden",
        backgroundColor: "#f5f3ff",
        color: "#4A4A45",
        fontFamily: "'Google Sans', 'Inter', sans-serif"
      }}
    >
      {/* Fixed Full Page Live WebGL Iridescence Background */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        <Iridescence color={[0.9, 0.8, 1.0]} speed={1.2} amplitude={0.0} mouseReact={false} />
      </div>

      {/* Soft transparent vignette overlay */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 1,
          pointerEvents: "none",
          background: "radial-gradient(ellipse 80% 70% at 50% 50%, transparent 40%, rgba(255, 255, 255, 0.25) 100%)"
        }}
      />

      {/* Embedded CSS for Glassmorphic & Layout Specifics */}
      <style jsx global>{`
        html, body {
          overflow-x: hidden !important;
          max-width: 100vw !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        .font-headline {
          font-family: 'Google Sans', 'Sora', sans-serif;
        }
        .font-display {
          font-family: 'Google Sans', 'Sora', sans-serif;
        }
        .font-body {
          font-family: 'Google Sans', 'Inter', sans-serif;
        }
        .font-label {
          font-family: 'Google Sans', 'Space Grotesk', sans-serif;
        }
        .horizontal-templates-scroll::-webkit-scrollbar {
          display: none;
        }
        
        @keyframes marquee-drift {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        
        .infinite-marquee-track {
          display: flex;
          gap: 28px;
          width: max-content;
          animation: marquee-drift 70s linear infinite;
        }
        
        .infinite-marquee-track:hover {
          animation-play-state: paused;
        }

        .studio-canvas-phone {
          width: 155px;
          height: 290px;
          border-radius: 36px;
          border: 4px solid #111827;
          background: linear-gradient(180deg, #ffffff 0%, #fdf2f4 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.18);
          position: relative;
          opacity: 1 !important;
          transform-origin: 50% 50% !important;
          transform-style: preserve-3d !important;
        }

        @keyframes card-anim-orbit {
          0%, 100% { transform: perspective(1000px) rotateY(0deg) rotateX(0deg); }
          50% { transform: perspective(1000px) rotateY(35deg) rotateX(15deg); }
        }
        @keyframes card-anim-hero-reveal {
          0%, 100% { transform: perspective(1000px) scale(0.85) rotate(-5deg); }
          50% { transform: perspective(1000px) scale(1.1) rotate(0deg); }
        }
        @keyframes card-anim-float {
          0%, 100% { transform: perspective(1000px) translateY(0px) rotate(0deg); }
          50% { transform: perspective(1000px) translateY(-14px) rotate(3deg); }
        }
        @keyframes card-anim-tilt-shift {
          0%, 100% { transform: perspective(1000px) rotateX(20deg) rotateY(-15deg); }
          50% { transform: perspective(1000px) rotateX(-10deg) rotateY(15deg); }
        }
        .material-symbols-outlined {
          font-family: 'Material Symbols Outlined', sans-serif;
          font-weight: 300;
          font-style: normal;
          font-size: 24px;
          line-height: 1;
          letter-spacing: normal;
          text-transform: none;
          display: inline-block;
          white-space: nowrap;
          word-wrap: normal;
          direction: ltr;
          font-feature-settings: 'liga';
          -webkit-font-smoothing: antialiased;
        }
        .glass-panel {
          background: rgba(255, 255, 255, 0.65);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.4);
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.06);
        }
        .soft-shadow {
          box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.08);
        }
        .soft-glow-yellow {
          box-shadow: 0 0 40px rgba(255, 255, 255, 0.4);
        }

        /* Responsive Grid Adjustments */
        .bento-grid {
          display: grid;
          grid-template-columns: repeat(1, minmax(0, 1fr));
          gap: 32px;
        }
        @media (min-width: 768px) {
          .bento-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
          .bento-span-2 {
            grid-column: span 2 / span 2;
          }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>

      {/* Fixed Top Right Header Button */}
      <div style={{ position: "fixed", top: "24px", right: "32px", zIndex: 100 }}>
        <a
          href="#templates"
          className="font-headline hover:scale-[1.02] active:scale-[0.98]"
          style={{
            fontSize: "14px",
            fontWeight: 700,
            color: "#111827",
            backgroundColor: "rgba(255, 255, 255, 0.85)",
            backdropFilter: "blur(12px)",
            padding: "10px 24px",
            borderRadius: "999px",
            border: "1px solid rgba(255, 255, 255, 0.5)",
            textDecoration: "none",
            boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px"
          }}
        >
          Join Waitlist
        </a>
      </div>

      {/* Hero Section (Full Page 100vh) */}
      <section style={{
        position: "relative",
        overflow: "hidden",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        paddingLeft: "24px",
        paddingRight: "24px",
        textAlign: "center"
      }}>
        {/* Animated Hero Content Container */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{ position: "relative", zIndex: 10, maxWidth: "1050px", width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: "32px" }}
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="glass-panel font-label"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "12px",
              padding: "8px 20px",
              borderRadius: "999px",
              color: "#7A7A75",
              fontSize: "12px",
              letterSpacing: "0.1em",
              textTransform: "uppercase"
            }}
          >
            <span style={{ position: "relative", display: "flex", height: "6px", width: "6px" }}>
              <span className="animate-ping" style={{ position: "absolute", width: "100%", height: "100%", borderRadius: "50%", backgroundColor: "#D1CFA5", opacity: 0.75 }}></span>
              <span style={{ position: "relative", width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#7A7A75" }}></span>
            </span>
            BETA ACCESS
          </motion.div>

          {/* 2-Line Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="font-headline"
            style={{
              fontSize: "clamp(2.75rem, 5.5vw, 4.5rem)",
              lineHeight: 1.12,
              fontWeight: 800,
              letterSpacing: "-0.03em",
              color: "#111827",
              margin: 0,
              maxWidth: "1050px"
            }}
          >
            Turn Static Screenshots <br className="hidden sm:inline" />
            into 3D Motion Videos
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="font-body"
            style={{
              fontSize: "clamp(1.1rem, 2vw, 1.35rem)",
              lineHeight: 1.6,
              color: "#4b5563",
              maxWidth: "680px",
              margin: 0,
              fontWeight: 400
            }}
          >
            The fastest way for product creators to design studio-quality 4K <br className="hidden sm:inline" />
            3D promotional videos directly in the browser.
          </motion.p>

          {/* Pill CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            style={{ paddingTop: "12px", display: "flex", flexWrap: "wrap", gap: "16px", justifyContent: "center", alignItems: "center" }}
          >
            <Link
              className="font-headline hover:scale-[1.02] active:scale-[0.98]"
              style={{
                fontSize: "15px",
                fontWeight: 700,
                color: "#ffffff",
                backgroundColor: "#111827",
                padding: "14px 32px",
                borderRadius: "999px",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                textDecoration: "none",
                boxShadow: "0 10px 25px -5px rgba(17, 24, 39, 0.3)",
                transition: "all 0.2s ease"
              }}
              href="/editor"
            >
              Launch Editor
              <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>east</span>
            </Link>

            <a
              className="font-headline hover:scale-[1.02] active:scale-[0.98]"
              style={{
                fontSize: "15px",
                fontWeight: 700,
                color: "#111827",
                backgroundColor: "#badfdb",
                padding: "14px 32px",
                borderRadius: "999px",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                textDecoration: "none",
                border: "1px solid rgba(0, 0, 0, 0.06)",
                boxShadow: "0 4px 14px rgba(186, 223, 219, 0.4)",
                transition: "all 0.2s ease"
              }}
              href="#templates"
            >
              Explore Templates
            </a>
          </motion.div>
        </motion.div>
      </section>

      {/* Glowing Glassmorphic Section Separator Line */}
      <div style={{
        width: "100%",
        maxWidth: "1050px",
        height: "1px",
        margin: "0 auto",
        background: "linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.8) 50%, transparent 100%)",
        position: "relative",
        zIndex: 10
      }} />

      {/* Templates Section (Studio Showcase + Full Bleed Horizontal Scroll) */}
      <section id="templates" style={{
        paddingTop: "80px",
        paddingBottom: "120px",
        width: "100%",
        overflow: "hidden",
        position: "relative"
      }}>
        {/* Centered Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", marginBottom: "40px", paddingLeft: "24px", paddingRight: "24px" }}
        >
          <h2 className="font-headline" style={{ fontSize: "clamp(2rem, 4vw, 2.75rem)", fontWeight: 800, color: "#111827", margin: 0, letterSpacing: "-0.02em" }}>
            Explore Templates
          </h2>
        </motion.div>

        {/* Studio Window Showcase Card (From User Screenshot) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.7 }}
          style={{
            maxWidth: "1050px",
            margin: "0 auto 48px auto",
            paddingLeft: "24px",
            paddingRight: "24px"
          }}
        >
          {/* Top Mode Switcher Bar */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            marginBottom: "16px"
          }}>
            {/* Interactive Mode Pills Switcher */}
            <div style={{
              display: "inline-flex",
              backgroundColor: "rgba(17, 24, 39, 0.08)",
              borderRadius: "999px",
              padding: "4px"
            }}>
              <button
                onClick={() => setStudioMode("video")}
                style={{
                  backgroundColor: studioMode === "video" ? "#111827" : "transparent",
                  color: studioMode === "video" ? "#ffffff" : "#4b5563",
                  padding: "6px 18px",
                  borderRadius: "999px",
                  fontSize: "12px",
                  fontWeight: 700,
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
              >
                Video Mode
              </button>
              <button
                onClick={() => setStudioMode("image")}
                style={{
                  backgroundColor: studioMode === "image" ? "#111827" : "transparent",
                  color: studioMode === "image" ? "#ffffff" : "#4b5563",
                  padding: "6px 18px",
                  borderRadius: "999px",
                  fontSize: "12px",
                  fontWeight: 700,
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
              >
                Image Mode
              </button>
            </div>
          </div>

          {/* macOS Studio Showcase Frame */}
          <div style={{
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            borderRadius: "28px",
            border: "1px solid rgba(209, 207, 165, 0.4)",
            boxShadow: "0 20px 50px -10px rgba(0, 0, 0, 0.08)",
            overflow: "hidden"
          }}>
            {/* macOS Window Controls Header */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 20px",
              borderBottom: "1px solid rgba(0, 0, 0, 0.04)"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#ef4444" }} />
                <span style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#f59e0b" }} />
                <span style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#10b981" }} />
                <span style={{ marginLeft: "12px", fontSize: "12px", fontWeight: 600, color: "#6b7280" }}>
                  Screen Motion Studio ({studioMode === "video" ? "Video Render Engine" : "Static Image Render"})
                </span>
              </div>
            </div>

            {/* Gradient Studio Canvas */}
            <div style={{
              aspectRatio: "16 / 9",
              minHeight: "360px",
              background: "linear-gradient(135deg, #f0f7f4 0%, #fcf4f5 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              perspective: "1000px",
              transformStyle: "preserve-3d"
            }}>
              {/* Active 3D Phone Model Display with Motion Animation */}
              <div 
                className="studio-canvas-phone"
                style={{
                  animation: studioMode === "video" ? `card-anim-${activeStudioTemplate} 3.5s infinite ease-in-out` : "none"
                }}
              >
                {/* Dynamic Island Notch */}
                <div style={{
                  position: "absolute",
                  top: "14px",
                  width: "48px",
                  height: "14px",
                  backgroundColor: "#111827",
                  borderRadius: "999px"
                }} />

                <span className="material-symbols-outlined" style={{ fontSize: "36px", color: "#111827", marginTop: "16px" }}>
                  {studioMode === "video" ? "videocam" : "photo_camera"}
                </span>
                <span style={{ fontFamily: "'Google Sans', sans-serif", fontSize: "13px", fontWeight: 700, color: "#111827" }}>
                  {studioMode === "video" ? `Looping MP4 (${TEMPLATES.find(t => t.id === activeStudioTemplate)?.name || 'Orbit'})` : "High-Res PNG"}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* SmoothUI Footer1 Component */}
      <Footer1 />
    </div>
  );
}
