"use client";

import React, { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import Iridescence from "@/components/Iridescence";
import Footer1 from "@/components/smoothui/blocks/footers/footer-1";
import { AppProvider } from "@/store";

const Preview3D = dynamic(() => import("@/components/Preview3D"), {
  ssr: false,
  loading: () => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#6b7280", fontSize: "14px", fontWeight: 600 }}>
      Loading 3D Motion Render Engine...
    </div>
  )
});

const IRIDESCENCE_COLOR: [number, number, number] = [0.9, 0.8, 1.0];
const SHOWCASE_ANIMATIONS = [
  { name: "Orbit 3D", id: "orbit" },
  { name: "Hero Reveal", id: "hero-reveal" },
  { name: "Floating Drift", id: "float" },
  { name: "Flip & Land", id: "flip" },
  { name: "Bounce Drop", id: "bounce-drop" },
  { name: "Cinematic Pan", id: "cinematic-pan" },
  { name: "Corkscrew Reveal", id: "corkscrew-reveal" },
  { name: "Infinity Loop", id: "infinity-loop" },
  { name: "Depth Zoom", id: "depth-zoom" },
];

const TEMPLATE_CARDS = [
  { id: "orbit", animationName: "Orbit 3D", video: "/animation-card-videos/orbit-template.webm", gradient: "linear-gradient(135deg, #a7f3d0 0%, #a855f7 50%, #38bdf8 100%)" },
  { id: "hero-reveal", animationName: "Hero Reveal", video: "/animation-card-videos/hero-reveal-template.webm", gradient: "#09090b" },
  { id: "corkscrew-reveal", animationName: "Corkscrew Reveal", video: "/showcase-videos/screen-motion-1080p-corkscrew-reveal-1785452727399.webm", gradient: "#050509" },
  { id: "float", animationName: "Floating Drift", video: "/animation-card-videos/float-template.webm", gradient: "linear-gradient(135deg, #c084fc 0%, #38bdf8 50%, #f97316 100%)" },
  { id: "dynamic-showcase", animationName: "Dynamic 3D Showcase", video: "/animation-card-videos/dynamic-showcase-template.webm", gradient: "linear-gradient(135deg, #f43f5e 0%, #ec4899 50%, #fb923c 100%)" },
  { id: "slow-pan", animationName: "Slow Studio Pan", video: "/animation-card-videos/slow-pan-template.webm", gradient: "linear-gradient(135deg, #4158D0 0%, #C850C0 46%, #FFCC70 100%)" },
  { id: "horizontal-slide", animationName: "Landscape Slide", video: "/animation-card-videos/horizontal-slide-template.webm", gradient: "linear-gradient(135deg, #0093E9 0%, #80D0C7 100%)" },
  { id: "bounce-drop", animationName: "Bounce Drop", video: "/showcase-videos/screen-motion-1080p-bounce-drop-1785438886976.webm", gradient: "linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)" },
  { id: "flip", animationName: "Flip & Land", video: "/animation-card-videos/flip-template.webm", gradient: "linear-gradient(135deg, #ff7e5f 0%, #feb47b 100%)" }
];

const WORKFLOW_STEPS = [
  {
    step: 1,
    title: "Add your design",
    description: "ScreenMotion supports PNG, JPG, and WEBP image uploads, plus MP4, WEBM, and MOV video files displayed directly on the 3D device screen.",
    video: "/animation-card-videos/hero-reveal-template.webm"
  },
  {
    step: 2,
    title: "Make it yours",
    description: "Customize camera angles, 3D device models, lighting, and motion timelines for studio-quality Renders.",
    video: "/animation-card-videos/orbit-template.webm"
  },
  {
    step: 3,
    title: "Get your mockup",
    description: "Export your final 3D device mockup in ultra-crisp 4K video or high resolution PNG image formats.",
    video: "/animation-card-videos/dynamic-showcase-template.webm"
  }
];

const USE_CASES = [
  { title: "Landing Pages", desc: "Hero 3D animations that boost website conversions." },
  { title: "Pitch Decks", desc: "Studio Renders tailored for investor presentations." },
  { title: "App Store Previews", desc: "High fidelity promo videos for iOS and Play Store listings." },
  { title: "Social Media Ads", desc: "Attention grabbing motion clips for Instagram, Twitter, and LinkedIn." },
  { title: "Content Marketing", desc: "Engaging product walkthroughs and feature announcements." },
  { title: "Product Promos", desc: "Cinematic 4K videos for launch campaigns and web demos." }
];

const FAQ_ITEMS = [
  {
    question: "What file formats does ScreenMotion support?",
    answer: "PNG, JPG, and WEBP images, plus MP4, WEBM, and MOV video files. Videos play directly on the 3D device screen."
  },
  {
    question: "Do I need 3D design experience to create mockups?",
    answer: "No. Choose a template, upload your screenshot, and export your video."
  },
  {
    question: "Can I export high resolution 4K videos?",
    answer: "Yes, you can export in 4K video and high-resolution PNG formats directly in your browser."
  },
  {
    question: "What devices are available in the 3D engine?",
    answer: "iPhone and Android models. More devices will be added soon."
  },
  {
    question: "Is there a free trial or beta access?",
    answer: "Yes, you can test all 3D animation templates for free directly in the browser."
  }
];

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

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
        <Iridescence color={IRIDESCENCE_COLOR} speed={1.2} amplitude={0.0} mouseReact={false} />
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
        @media (max-width: 640px) {
          .home-waitlist-btn {
            top: 14px !important;
            right: 16px !important;
            padding: 7px 16px !important;
            font-size: 12px !important;
          }
          .hero-btn-primary, .hero-btn-secondary {
            padding: 10px 20px !important;
            font-size: 13.5px !important;
            width: auto !important;
            max-width: none !important;
            white-space: nowrap !important;
          }
          .hero-btn-container {
            gap: 10px !important;
            flex-direction: column !important;
          }
          .faq-question-text {
            font-size: 14.5px !important;
          }
          .use-case-title {
            font-size: 17px !important;
          }
        }
        .faq-question-text {
          font-size: 17px;
        }
        .use-case-title {
          font-size: 18px;
        }
        a:hover .card-hover-cta {
          opacity: 1 !important;
        }
        .template-3x3-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 28px;
        }
        @media (max-width: 1024px) {
          .template-3x3-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
        @media (max-width: 640px) {
          .template-3x3-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 12px;
          }
        }

        .use-cases-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 20px;
        }
        @media (min-width: 1025px) {
          .use-cases-card-center-start {
            grid-column-start: 2;
          }
        }
        @media (max-width: 1024px) {
          .use-cases-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
        @media (max-width: 640px) {
          .use-cases-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 12px;
          }
          .use-cases-card {
            padding: 16px 12px !important;
            aspect-ratio: 16 / 11;
            display: flex;
            flex-direction: column;
            justify-content: center;
          }
          .use-cases-card p {
            font-size: 12px !important;
            line-height: 1.4 !important;
          }
        }
      `}</style>

      {/* Fixed Top Right Header Button */}
      <div style={{ position: "fixed", top: "24px", right: "32px", zIndex: 100 }}>
        <a
          href="https://forms.gle/rtfYsFTgRUP9RE79A"
          target="_blank"
          rel="noopener noreferrer"
          className="home-waitlist-btn font-headline hover:scale-[1.02] active:scale-[0.98]"
          style={{
            fontSize: "14px",
            fontWeight: 700,
            color: "#111827",
            backgroundColor: "rgba(255, 255, 255, 0.85)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
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
          style={{ position: "relative", zIndex: 10, maxWidth: "1440px", width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: "32px" }}
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
              fontSize: "clamp(1.85rem, 3.8vw, 3.75rem)",
              lineHeight: 1.18,
              fontWeight: 800,
              letterSpacing: "-0.03em",
              color: "#111827",
              margin: 0,
              maxWidth: "1440px",
              width: "100%"
            }}
          >
            <span style={{ display: "inline-block" }}>Turn Your App Screenshots Into Animated</span>
            <br className="hidden sm:inline" />
            <span style={{ display: "inline-block" }}>3D Device Videos</span>
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
              color: "#111827",
              maxWidth: "760px",
              margin: 0,
              fontWeight: 400
            }}
          >
            Upload your app UI or screen recording, choose from ready-made 3D motion templates, and export studio-quality 4K mockup videos directly in your web browser. No 3D design skills required.
          </motion.p>

          {/* Pill CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="hero-btn-container"
            style={{ paddingTop: "12px", display: "flex", flexWrap: "wrap", gap: "16px", justifyContent: "center", alignItems: "center" }}
          >
            <Link
              className="hero-btn-primary font-headline hover:scale-[1.02] active:scale-[0.98]"
              style={{
                fontSize: "15px",
                fontWeight: 700,
                color: "#ffffff",
                backgroundColor: "#111827",
                padding: "14px 32px",
                borderRadius: "999px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                textDecoration: "none",
                whiteSpace: "nowrap",
                boxShadow: "0 10px 25px -5px rgba(17, 24, 39, 0.3)",
                transition: "all 0.2s ease"
              }}
              href="/editor"
            >
              Launch Editor
              <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>east</span>
            </Link>

            <a
              className="hero-btn-secondary font-headline hover:scale-[1.02] active:scale-[0.98]"
              style={{
                fontSize: "15px",
                fontWeight: 700,
                color: "#111827",
                backgroundColor: "#badfdb",
                padding: "14px 32px",
                borderRadius: "999px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                textDecoration: "none",
                whiteSpace: "nowrap",
                border: "1px solid rgba(0, 0, 0, 0.06)",
                boxShadow: "0 4px 14px rgba(186, 223, 219, 0.4)",
                transition: "all 0.2s ease"
              }}
              href="#templates"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById("templates")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Explore Templates
            </a>
          </motion.div>
        </motion.div>
      </section>

      {/* Templates Section (3D Device Animations Made Simple) */}
      <section id="templates" style={{
        paddingTop: "80px",
        paddingBottom: "120px",
        width: "100%",
        overflow: "hidden",
        position: "relative"
      }}>
        {/* Header & Subtitle */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            marginBottom: "48px",
            paddingLeft: "24px",
            paddingRight: "24px"
          }}
        >
          <h2 className="font-headline" style={{
            fontSize: "clamp(2.25rem, 4.5vw, 3.25rem)",
            fontWeight: 800,
            color: "#111827",
            margin: "0 0 12px 0",
            letterSpacing: "-0.03em"
          }}>
            3D Device Animations Made Simple
          </h2>
          <p className="font-body" style={{
            fontSize: "clamp(1.05rem, 1.8vw, 1.2rem)",
            color: "#111827",
            margin: 0,
            maxWidth: "680px",
            lineHeight: 1.6
          }}>
            Generate crisp creative assets lightning fast and without headaches
          </p>
        </motion.div>

        {/* 3x3 Template Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.7 }}
          style={{
            maxWidth: "1440px",
            margin: "0 auto",
            paddingLeft: "24px",
            paddingRight: "24px"
          }}
        >
          <div className="template-3x3-grid">
            {TEMPLATE_CARDS.map((card) => (
              <Link
                key={card.id}
                href={`/editor?template=${card.id}`}
                style={{ textDecoration: "none", color: "inherit", display: "block" }}
              >
                <motion.div
                  whileHover={{ y: -6, scale: 1.02 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  style={{
                    position: "relative",
                    borderRadius: "20px",
                    overflow: "hidden",
                    background: card.gradient,
                    aspectRatio: "16 / 9",
                    boxShadow: "0 12px 32px -8px rgba(0, 0, 0, 0.12)",
                    border: "1.5px solid rgba(0, 0, 0, 0.16)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  {/* Video preview */}
                  <video
                    src={card.video}
                    autoPlay
                    muted
                    loop
                    playsInline
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                      position: "absolute",
                      inset: 0,
                      zIndex: 1
                    }}
                  />

                  {/* Hover Overlay with Animation Name & Use Template CTA */}
                  <div
                    className="card-hover-cta"
                    style={{
                      position: "absolute",
                      inset: 0,
                      zIndex: 3,
                      backgroundColor: "rgba(0, 0, 0, 0.35)",
                      backdropFilter: "blur(3px)",
                      WebkitBackdropFilter: "blur(3px)",
                      opacity: 0,
                      transition: "opacity 0.25s ease",
                      display: "flex",
                      alignItems: "flex-end",
                      justifyContent: "space-between",
                      padding: "16px 20px"
                    }}
                  >
                    <div style={{ color: "#ffffff", fontWeight: 700, fontSize: "15px", textShadow: "0 2px 4px rgba(0,0,0,0.6)" }}>
                      {card.animationName}
                    </div>
                    <span
                      style={{
                        backgroundColor: "#ffffff",
                        color: "#111827",
                        fontWeight: 700,
                        fontSize: "12px",
                        padding: "7px 16px",
                        borderRadius: "999px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.25)"
                      }}
                    >
                      Use Template
                    </span>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>
      </section>

      {/* 3 Steps to Studio-Grade Mockups Section */}
      {false && (
      <section style={{
        paddingTop: "100px",
        paddingBottom: "100px",
        width: "100%",
        position: "relative",
        zIndex: 10
      }}>
        <div style={{
          maxWidth: "1280px",
          margin: "0 auto",
          paddingLeft: "24px",
          paddingRight: "24px"
        }}>
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6 }}
            style={{ marginBottom: "48px", maxWidth: "780px" }}
          >
            <h2 className="font-headline" style={{
              fontSize: "clamp(2.25rem, 4.5vw, 3.25rem)",
              fontWeight: 800,
              color: "#111827",
              margin: "0 0 16px 0",
              letterSpacing: "-0.03em",
              lineHeight: 1.15
            }}>
              How it works
            </h2>

            <p className="font-body" style={{
              fontSize: "clamp(1.05rem, 1.8vw, 1.2rem)",
              color: "#111827",
              margin: 0,
              lineHeight: 1.6,
              maxWidth: "680px"
            }}>
              We simplified the process to fit perfectly into your workflow. So even if you're 5 minutes away from a big presentation, you can get a stunning mockup that will blow them away.
            </p>
          </motion.div>

          {/* Grid Layout: Left Step Cards + Right Interactive Mac Studio Frame */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
            gap: "36px",
            alignItems: "stretch"
          }}>
            {/* Left Steps Column */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", justifyContent: "center" }}>
              {WORKFLOW_STEPS.map((item, idx) => {
                const isActive = activeStep === idx;
                return (
                  <motion.div
                    key={item.step}
                    onClick={() => setActiveStep(idx)}
                    whileHover={{ scale: 1.01 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      padding: "24px 28px",
                      borderRadius: "20px",
                      backgroundColor: isActive ? "#ffffff" : "rgba(255, 255, 255, 0.65)",
                      border: isActive ? "2px solid #3b82f6" : "1px solid rgba(0, 0, 0, 0.06)",
                      boxShadow: isActive ? "0 12px 32px -8px rgba(59, 130, 246, 0.18)" : "0 4px 14px rgba(0, 0, 0, 0.03)",
                      cursor: "pointer",
                      transition: "all 0.25s ease"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
                      {/* Step Number Circle */}
                      <span style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "50%",
                        backgroundColor: isActive ? "#1e293b" : "#e2e8f0",
                        color: isActive ? "#ffffff" : "#475569",
                        fontSize: "13px",
                        fontWeight: 700,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        marginTop: "2px"
                      }}>
                        {item.step}
                      </span>

                      <div>
                        <h3 className="font-headline" style={{
                          fontSize: "18px",
                          fontWeight: 800,
                          color: "#111827",
                          margin: "0 0 6px 0",
                          letterSpacing: "-0.01em"
                        }}>
                          {item.title}
                        </h3>

                        {isActive && (
                          <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            transition={{ duration: 0.3 }}
                            className="font-body"
                            style={{
                              fontSize: "14px",
                              color: "#4b5563",
                              margin: 0,
                              lineHeight: 1.55
                            }}
                          >
                            {item.description}
                          </motion.p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Right Interactive Mockup Video Frame */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6 }}
              style={{
                borderRadius: "24px",
                overflow: "hidden",
                boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.25)",
                border: "1px solid rgba(255, 255, 255, 0.4)",
                position: "relative",
                minHeight: "420px",
                background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)"
              }}
            >
              {/* Control Header with Coming Soon Badge */}
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 18px",
                backgroundColor: "#1e293b",
                borderBottom: "1px solid rgba(255, 255, 255, 0.08)"
              }}>
                <span style={{ fontSize: "11px", fontWeight: 600, color: "#94a3b8" }}>
                  {WORKFLOW_STEPS[activeStep].title}
                </span>
                <span style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "3px 10px",
                  borderRadius: "999px",
                  backgroundColor: "rgba(59, 130, 246, 0.15)",
                  color: "#60a5fa",
                  fontSize: "10.5px",
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                  border: "1px solid rgba(96, 165, 250, 0.3)"
                }}>
                  Coming Soon
                </span>
              </div>

              {/* Studio Canvas Placeholder (No Video Preview) */}
              <div style={{
                width: "100%",
                height: "calc(100% - 41px)",
                minHeight: "380px",
                position: "relative",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "32px",
                textAlign: "center",
                background: "radial-gradient(ellipse at center, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.95) 100%)"
              }}>
                <div style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(59, 130, 246, 0.1)",
                  border: "1px solid rgba(96, 165, 250, 0.25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "20px",
                  boxShadow: "0 0 30px rgba(59, 130, 246, 0.2)"
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: "28px", color: "#60a5fa" }}>
                    play_circle
                  </span>
                </div>

                <h3 className="font-headline" style={{
                  fontSize: "20px",
                  fontWeight: 700,
                  color: "#ffffff",
                  margin: "0 0 8px 0"
                }}>
                  Interactive Preview
                </h3>

                <p className="font-body" style={{
                  fontSize: "14px",
                  color: "#94a3b8",
                  margin: 0,
                  maxWidth: "320px",
                  lineHeight: 1.5
                }}>
                  Live video workflow previews are coming soon
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      )}

      {/* Use Cases & Applications Section */}
      <section style={{
        paddingTop: "60px",
        paddingBottom: "100px",
        width: "100%",
        position: "relative",
        zIndex: 10
      }}>
        <div style={{
          maxWidth: "1280px",
          margin: "0 auto",
          paddingLeft: "24px",
          paddingRight: "24px"
        }}>
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6 }}
            style={{ textAlign: "center", marginBottom: "48px" }}
          >
            <h2 className="font-headline" style={{
              fontSize: "clamp(2.25rem, 4.5vw, 3.25rem)",
              fontWeight: 800,
              color: "#111827",
              margin: "0 0 16px 0",
              letterSpacing: "-0.03em"
            }}>
              Built for Every Stage of Your Product Journey
            </h2>
            <p className="font-body" style={{
              fontSize: "clamp(1.05rem, 1.8vw, 1.2rem)",
              color: "#111827",
              maxWidth: "760px",
              margin: "0 auto",
              lineHeight: 1.6
            }}>
              Fluid 3D motion captures user attention faster than static images, making your product presentations instantly memorable.
            </p>
          </motion.div>

          <div className="use-cases-grid">
            {USE_CASES.map((uc, idx) => (
              <motion.div
                key={uc.title}
                className={`use-cases-card ${idx === 4 ? "use-cases-card-center-start" : ""}`.trim()}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.4, delay: idx * 0.06 }}
                whileHover={{ y: -4 }}
                style={{
                  padding: "24px 28px",
                  borderRadius: "20px",
                  backgroundColor: "rgba(255, 255, 255, 0.85)",
                  border: "1px solid rgba(0, 0, 0, 0.08)",
                  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.03)",
                  transition: "all 0.25s ease"
                }}
              >
                <h3 className="font-headline use-case-title" style={{
                  fontWeight: 700,
                  color: "#111827",
                  margin: "0 0 8px 0"
                }}>
                  {uc.title}
                </h3>
                <p className="font-body" style={{
                  fontSize: "14px",
                  color: "#4b5563",
                  margin: 0,
                  lineHeight: 1.55
                }}>
                  {uc.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section style={{
        paddingTop: "60px",
        paddingBottom: "120px",
        width: "100%",
        position: "relative",
        zIndex: 10
      }}>
        <div style={{
          maxWidth: "960px",
          margin: "0 auto",
          paddingLeft: "24px",
          paddingRight: "24px"
        }}>
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6 }}
            style={{ textAlign: "center", marginBottom: "48px" }}
          >
            <h2 className="font-headline" style={{
              fontSize: "clamp(2.25rem, 4.5vw, 3.25rem)",
              fontWeight: 800,
              color: "#111827",
              margin: "0 0 12px 0",
              letterSpacing: "-0.03em"
            }}>
              FAQ
            </h2>
            <p className="font-body" style={{
              fontSize: "clamp(1.05rem, 1.8vw, 1.2rem)",
              color: "#111827",
              margin: 0
            }}>
              Everything you need to know about ScreenMotion and 3D device mockups
            </p>
          </motion.div>

          {/* Accordion List */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {FAQ_ITEMS.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-20px" }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  style={{
                    borderRadius: "16px",
                    backgroundColor: "rgba(255, 255, 255, 0.85)",
                    border: "1px solid rgba(0, 0, 0, 0.08)",
                    boxShadow: "0 4px 14px rgba(0, 0, 0, 0.03)",
                    overflow: "hidden",
                    transition: "all 0.25s ease"
                  }}
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    style={{
                      width: "100%",
                      padding: "20px 24px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "16px",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      textAlign: "left"
                    }}
                  >
                    <span className="font-headline faq-question-text" style={{
                      fontWeight: 700,
                      color: "#111827"
                    }}>
                      {faq.question}
                    </span>
                    <span
                      className="material-symbols-outlined"
                      style={{
                        fontSize: "22px",
                        color: "#6b7280",
                        transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.3s ease"
                      }}
                    >
                      expand_more
                    </span>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        style={{ overflow: "hidden" }}
                      >
                        <div
                          className="font-body"
                          style={{
                            padding: "0 24px 20px 24px",
                            fontSize: "14.5px",
                            lineHeight: 1.6,
                            color: "#4b5563"
                          }}
                        >
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SmoothUI Footer1 Component */}
      <Footer1 />
    </div>
  );
}
