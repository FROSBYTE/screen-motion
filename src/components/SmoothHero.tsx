"use client";

import React from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { LayoutTemplate, Film, ChevronRight, Play, Settings2 } from "lucide-react";
import Grainient from "@/components/shared/effects/Grainient";

export default function SmoothHero() {
  const { scrollY } = useScroll();
  
  // Parallax effects
  const contentOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const contentY = useTransform(scrollY, [0, 600], [0, 100]);
  const rightElementY = useTransform(scrollY, [0, 600], [0, -50]);

  return (
    <section
      style={{
        position: "relative",
        minHeight: "100vh",
        backgroundColor: "var(--theme-bg-base, #FAFAF7)",
        color: "var(--theme-text-light, #0F172A)",
        fontFamily: "var(--font-sans, 'Inter Tight', sans-serif)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Interactive Grainient Live Background */}
      <div style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 0, opacity: 0.85 }}>
        <Grainient
          color1="#F97316"
          color2="#39c295"
          color3="#EAB308"
          timeSpeed={0.25}
          colorBalance={0.0}
          warpStrength={1.0}
          warpFrequency={5.0}
          warpSpeed={2.0}
          warpAmplitude={50.0}
          blendAngle={0.0}
          blendSoftness={0.05}
          rotationAmount={500.0}
          noiseScale={2.0}
          grainAmount={0.06}
          grainScale={2.0}
          grainAnimated={false}
          contrast={1.5}
          gamma={1.0}
          saturation={0.55}
          centerX={0.0}
          centerY={0.0}
          zoom={0.9}
        />
      </div>

      {/* Subtle Grain Overlay */}
      <div 
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.02,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          zIndex: 1,
          pointerEvents: "none",
        }}
      />

      {/* Ultra-minimal Top Brand */}
      <header
        className="hero-brand-header"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          padding: "32px 48px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          zIndex: 20,
        }}
      >
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "14px" }}>
          <img src="/logo.svg" alt="Screen Motion" style={{ width: '29px', height: '29px', objectFit: 'contain', filter: 'invert(1)' }} />
          <span style={{ fontSize: "19.5px", fontWeight: 600, letterSpacing: "-0.04em", color: "#0F172A" }}>
            screenmotion
          </span>
        </Link>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
          fontSize: "11px",
          color: "#64748B",
          textTransform: "uppercase",
          letterSpacing: "0.1em"
        }}>
          <span style={{ display: "inline-block", width: "8px", height: "8px", borderRadius: "50%", background: "#70FFD2", boxShadow: "0 0 10px rgba(112, 255, 210, 0.8)" }} />
          STUDIO BETA
        </div>
      </header>

      {/* Main Hero Asymmetric Layout */}
      <main
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          alignItems: "center",
          gap: "64px",
          padding: "120px 48px",
          zIndex: 10,
          maxWidth: "1800px",
          margin: "0 auto",
          width: "100%"
        }}
      >
        {/* Left Content */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{ maxWidth: "600px", opacity: contentOpacity, y: contentY }}
        >
          <h1
            style={{
              fontSize: "clamp(3.2rem, 5.8vw, 5.2rem)",
              lineHeight: 1.05,
              fontWeight: 400,
              letterSpacing: "-0.035em",
              color: "#0F172A",
              margin: "0 0 32px 0",
              textWrap: "balance"
            }}
          >
            Video Maker For Saas Owners
          </h1>
          <p
            style={{
              fontSize: "1.25rem",
              lineHeight: 1.6,
              color: "#475569",
              maxWidth: "480px",
              margin: "0 0 48px 0",
              fontWeight: 400,
            }}
          >
            No need to learn After Effects or complex timeline editors We Offer a bunch of templates which you can customise and use it
          </p>

          <Link
            href="/projects"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              padding: "16px 32px",
              background: "#FF9137",
              color: "#0F172A",
              borderRadius: "8px",
              fontSize: "17px",
              fontWeight: 700,
              textDecoration: "none",
              boxShadow: "0 4px 18px rgba(255, 145, 55, 0.35)",
              transition: "transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 10px 25px rgba(255, 145, 55, 0.5)";
              e.currentTarget.style.background = "#E6791E";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 18px rgba(255, 145, 55, 0.35)";
              e.currentTarget.style.background = "#FF9137";
            }}
          >
            Open Video Editor <ChevronRight size={18} strokeWidth={2.5} color="#0F172A" />
          </Link>
        </motion.div>

        {/* Right UI Slate Simulation */}
        <motion.div
          initial={{ opacity: 0, y: 30, rotateY: 10, rotateX: 5 }}
          animate={{ opacity: 1, y: 0, rotateY: -5, rotateX: 2 }}
          transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: "relative",
            width: "100%",
            aspectRatio: "16/10",
            background: "#FFFFFF",
            border: "1px solid rgba(15, 23, 42, 0.08)",
            borderRadius: "12px",
            boxShadow: "0 24px 64px -12px rgba(15, 23, 42, 0.12), 0 8px 24px -4px rgba(15, 23, 42, 0.06)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            transformPerspective: "1000px",
            y: rightElementY,
          }}
        >
          {/* UI Header with ColorHunt Mac dots */}
          <div style={{ height: "40px", borderBottom: "1px solid rgba(15, 23, 42, 0.06)", display: "flex", alignItems: "center", padding: "0 16px", justifyContent: "space-between", background: "#FFFFFF" }}>
            <div style={{ display: "flex", gap: "8px" }}>
              <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#FF9137" }} />
              <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#FFCC4D" }} />
              <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#70FFD2" }} />
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "#64748B", letterSpacing: "0.04em" }}>CANVAS_HERO_V2.MP4</div>
            <div style={{ width: "46px" }} />
          </div>

          {/* UI Main Area */}
          <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
            {/* Sidebar Tools */}
            <div style={{ width: "48px", borderRight: "1px solid rgba(15, 23, 42, 0.06)", display: "flex", flexDirection: "column", alignItems: "center", padding: "16px 0", gap: "24px", color: "#94A3B8", background: "#FAFAF7" }}>
              <LayoutTemplate size={18} />
              <Film size={18} style={{ color: "#FF9137" }} />
              <Settings2 size={18} />
            </div>

            {/* Viewport & Timeline */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              {/* Viewport */}
              <div style={{ flex: 1, position: "relative", backgroundColor: "#F4F5EE", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <video
                  src="/animation-card-videos/dynamic-showcase-template.webm"
                  autoPlay loop muted playsInline preload="auto"
                  style={{ width: "90%", height: "90%", objectFit: "contain", opacity: 1 }}
                />
                <div style={{ position: "absolute", bottom: "16px", right: "16px", background: "rgba(112, 255, 210, 0.25)", border: "1px solid #70FFD2", backdropFilter: "blur(8px)", padding: "4px 8px", borderRadius: "4px", fontFamily: "var(--font-mono)", fontSize: "10px", color: "#0F172A", fontWeight: 700 }}>
                  60FPS
                </div>
              </div>
              
              {/* Timeline */}
              <div style={{ height: "120px", borderTop: "1px solid rgba(15, 23, 42, 0.06)", background: "#FFFFFF", padding: "16px" }}>
                <div style={{ display: "flex", gap: "16px", height: "100%" }}>
                  <div style={{ width: "64px", borderRight: "1px solid rgba(15, 23, 42, 0.08)", display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div style={{ height: "24px", background: "#F4F5EE", borderRadius: "4px" }} />
                    <div style={{ height: "24px", background: "#F4F5EE", borderRadius: "4px" }} />
                  </div>
                  <div style={{ flex: 1, position: "relative", display: "flex", flexDirection: "column", gap: "8px" }}>
                    {/* Playhead with Tangerine indicator */}
                    <div style={{ position: "absolute", left: "30%", top: "-10px", bottom: "-10px", width: "2px", background: "#FF9137", zIndex: 10, boxShadow: "0 0 10px rgba(255, 145, 55, 0.6)" }}>
                      <div style={{ position: "absolute", top: 0, left: "-4px", width: "10px", height: "10px", background: "#FF9137", borderRadius: "50%" }} />
                    </div>
                    {/* Tracks */}
                    <div style={{ height: "24px", background: "rgba(255, 204, 77, 0.3)", border: "1px solid #FFCC4D", borderRadius: "4px", width: "80%" }} />
                    <div style={{ height: "24px", background: "rgba(112, 255, 210, 0.25)", border: "1px solid #70FFD2", borderRadius: "4px", width: "60%", marginLeft: "10%" }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Top Floating Navigation Bar */}
      <div
        className="floating-nav-bar"
        style={{
          position: "fixed",
          top: "32px",
          left: "50%",
          transform: "translateX(-50%)",
          background: "rgba(255, 255, 255, 0.9)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(15, 23, 42, 0.08)",
          borderRadius: "999px",
          padding: "10px 24px",
          display: "flex",
          alignItems: "center",
          gap: "19px",
          zIndex: 100,
          boxShadow: "0 12px 32px -4px rgba(15, 23, 42, 0.08)",
        }}
      >
        <div className="floating-nav-links" style={{ display: "flex", gap: "19px", alignItems: "center" }}>
          <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2, ease: "easeOut" }}>
            <Link href="/" style={{ display: "block", color: "#475569", textDecoration: "none", fontSize: "14.7px", fontWeight: 600, padding: "5px 10px", transition: "color 0.2s", whiteSpace: "nowrap" }} onMouseOver={e=>e.currentTarget.style.color="#FF9137"} onMouseOut={e=>e.currentTarget.style.color="#475569"}>Home</Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2, ease: "easeOut" }}>
            <Link href="#templates" style={{ display: "block", color: "#475569", textDecoration: "none", fontSize: "14.7px", fontWeight: 600, padding: "5px 10px", transition: "color 0.2s", whiteSpace: "nowrap" }} onMouseOver={e=>e.currentTarget.style.color="#FF9137"} onMouseOut={e=>e.currentTarget.style.color="#475569"}>Templates</Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2, ease: "easeOut" }}>
            <Link href="#use-cases" style={{ display: "block", color: "#475569", textDecoration: "none", fontSize: "14.7px", fontWeight: 600, padding: "5px 10px", transition: "color 0.2s", whiteSpace: "nowrap" }} onMouseOver={e=>e.currentTarget.style.color="#FF9137"} onMouseOut={e=>e.currentTarget.style.color="#475569"}>Use Cases</Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2, ease: "easeOut" }}>
            <Link
              href="/motion-graphics"
              style={{
                display: "block",
                background: "linear-gradient(135deg, #0F172A 15%, #FF9137 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textDecoration: "none",
                fontSize: "14.7px",
                fontWeight: 800,
                padding: "5px 10px",
                transition: "all 0.2s ease",
                whiteSpace: "nowrap",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = "linear-gradient(135deg, #0F172A 0%, #FF6B00 100%)";
                e.currentTarget.style.webkitBackgroundClip = "text";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = "linear-gradient(135deg, #0F172A 15%, #FF9137 100%)";
                e.currentTarget.style.webkitBackgroundClip = "text";
              }}
            >
              Motion Graphics
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2, ease: "easeOut" }}>
            <Link
              href="/editor"
              style={{
                display: "block",
                background: "linear-gradient(135deg, #0F172A 15%, #FF9137 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textDecoration: "none",
                fontSize: "14.7px",
                fontWeight: 800,
                padding: "5px 10px",
                transition: "all 0.2s ease",
                whiteSpace: "nowrap",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = "linear-gradient(135deg, #0F172A 0%, #FF6B00 100%)";
                e.currentTarget.style.webkitBackgroundClip = "text";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = "linear-gradient(135deg, #0F172A 15%, #FF9137 100%)";
                e.currentTarget.style.webkitBackgroundClip = "text";
              }}
            >
              3D Mockup
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2, ease: "easeOut" }}>
            <Link href="#faq" style={{ display: "block", color: "#475569", textDecoration: "none", fontSize: "14.7px", fontWeight: 600, padding: "5px 10px", transition: "color 0.2s", whiteSpace: "nowrap" }} onMouseOver={e=>e.currentTarget.style.color="#FF9137"} onMouseOut={e=>e.currentTarget.style.color="#475569"}>FAQ</Link>
          </motion.div>
        </div>
      </div>

      <style jsx global>{`
        .floating-nav-bar::-webkit-scrollbar {
          display: none;
        }
        @media (max-width: 1024px) {
          main {
            grid-template-columns: 1fr !important;
            padding: 130px 24px 60px 24px !important;
            text-align: center;
          }
          main > div:first-child {
            margin: 0 auto;
          }
          h1 {
            font-size: clamp(2.5rem, 8vw, 3.5rem) !important;
          }
        }
        @media (max-width: 768px) {
          .hero-brand-header {
            display: none !important;
          }
          .floating-nav-bar {
            top: 12px !important;
            padding: 6px 14px !important;
            max-width: calc(100vw - 24px) !important;
            overflow-x: auto !important;
            -webkit-overflow-scrolling: touch;
          }
          .floating-nav-links {
            gap: 4px !important;
            white-space: nowrap !important;
          }
          .floating-nav-links a {
            font-size: 12px !important;
            padding: 4px 8px !important;
            white-space: nowrap !important;
          }
          main {
            padding: 92px 20px 48px 20px !important;
          }
          h1 {
            font-size: clamp(2.1rem, 9vw, 3rem) !important;
            margin-bottom: 20px !important;
          }
        }
      `}</style>
    </section>
  );
}
