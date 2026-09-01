"use client";

import React, { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion, AnimatePresence, useScroll, useTransform, useInView } from "framer-motion";

import SmoothHero from "@/components/SmoothHero";
import { AppProvider } from "@/store";

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

interface TemplateCardData {
  id: string;
  animationName: string;
  video: string;
  gradient?: string;
  isVertical?: boolean;
}

const TEMPLATE_CARDS: TemplateCardData[] = [
  { id: "corkscrew-reveal", animationName: "Corkscrew Reveal", video: "/showcase-videos/screen-motion-1080p-corkscrew-reveal-1785452727399.webm", gradient: "#050509" },
  { id: "bounce-drop", animationName: "Bounce Drop", video: "/showcase-videos/screen-motion-1080p-bounce-drop-1785438886976.webm", gradient: "linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)" },
  { id: "flip", animationName: "Flip & Land", video: "/showcase-videos/screen-motion-1080p-flip-1785165653076.webm", gradient: "linear-gradient(135deg, #ff7e5f 0%, #feb47b 100%)" },
  { id: "depth-zoom", animationName: "Depth Zoom", video: "/showcase-videos/screen-motion-4k-depth-zoom-1785492356200.webm", gradient: "linear-gradient(135deg, #312e81 0%, #4c1d95 100%)", isVertical: true },
  { id: "orbit", animationName: "Orbit 3D", video: "/animation-card-videos/orbit-template.webm", gradient: "linear-gradient(135deg, #a7f3d0 0%, #a855f7 50%, #facc15 100%)" },
  { id: "rise", animationName: "Studio Rise", video: "/showcase-videos/screen-motion-4k-rise-1785492156624.webm", gradient: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)", isVertical: true },
  { id: "dynamic-showcase", animationName: "Dynamic 3D Showcase", video: "/animation-card-videos/dynamic-showcase-template.webm", gradient: "linear-gradient(135deg, #f43f5e 0%, #ec4899 50%, #fb923c 100%)" },
  { id: "float", animationName: "Floating Drift", video: "/animation-card-videos/float-template.webm", gradient: "linear-gradient(135deg, #c084fc 0%, #facc15 50%, #f97316 100%)" },
  { id: "hero-reveal", animationName: "Hero Reveal", video: "/animation-card-videos/hero-reveal-template.webm", gradient: "#09090b" },
  { id: "cinematic-pan", animationName: "Cinematic Pan", video: "/animation-card-videos/cinematic-pan-template.webm", gradient: "linear-gradient(135deg, #1e293b 0%, #334155 100%)" }
];


const WORKFLOW_STEPS = [
  {
    step: 1,
    title: "Add your product design",
    description: "Upload your SaaS screenshots, screen recordings, logos, or app captures directly into the canvas",
    video: "/animation-card-videos/hero-reveal-template.webm"
  },
  {
    step: 2,
    title: "Customize motion & style",
    description: "Customize kinetic typography, 3D device mockups, studio lighting, colors, and motion timelines without learning complex video editing software",
    video: "/animation-card-videos/orbit-template.webm"
  },
  {
    step: 3,
    title: "Export your product video",
    description: "Export your final SaaS promotional video in ultra-smooth 60 FPS MP4 format ready for your website, socials, and launch campaigns",
    video: "/animation-card-videos/dynamic-showcase-template.webm"
  }
];

const USE_CASES = [
  { title: "Pitch Decks", desc: "High-impact product videos tailored for investors and stakeholder presentations" },
  { title: "App Store & Launches", desc: "High fidelity promo videos for Product Hunt launches, iOS, and Web stores" },
  { title: "Social Media Ads", desc: "Attention grabbing SaaS motion clips for Twitter, LinkedIn, and Instagram ads" },
  { title: "Content Marketing", desc: "Engaging feature walkthroughs, UI changelogs, and product announcements" }
];

const FAQ_ITEMS = [
  {
    question: "How does ScreenMotion work?",
    answer: "Use ready-made product video templates and customize to your SaaS Import screenshots, adjust text and 3D device motions, and export in seconds That's it"
  },
  {
    question: "Do I need video editing skills or After Effects?",
    answer: "No ScreenMotion is built specifically for creators who struggle with complex timeline software Everything runs right in your browser"
  },
  {
    question: "What formats can I export?",
    answer: "We support ultra-crisp MP4 video exports at 1080p Full HD with 60 & 30 FPS and high-resolution PNG image exports"
  },
  {
    question: "How is my data handled?",
    answer: "100% safe Everything is processed locally on your machine, nothing leaves your browser Your assets and videos never leave your device"
  }
];

function TemplateCardItem({ card, index = 0 }: { card: TemplateCardData; index?: number }) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [isIntersecting, setIsIntersecting] = React.useState(false);

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
        if (entry.isIntersecting) {
          videoRef.current?.play().catch(() => {});
        } else {
          videoRef.current?.pause();
        }
      },
      { threshold: 0.1, rootMargin: '150px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: (index % 3) * 0.08, ease: [0.16, 1, 0.3, 1] }}
      className={`template-card-cell ${card.isVertical ? "vertical-span" : ""}`}
      style={{ width: "100%", height: "100%" }}
    >
      <Link
        href="/projects"
        style={{ textDecoration: "none", color: "inherit", display: "block", height: "100%", outline: "none" }}
        className="template-card-link"
        aria-label={`Launch ${card.animationName} template`}
      >
        <motion.div
          ref={containerRef}
          whileHover={{ y: -6, scale: 1.015 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className={`template-card-inner ${card.isVertical ? "is-vertical-card" : ""}`}
          style={{
            position: "relative",
            borderRadius: "16px",
            overflow: "hidden",
            background: card.gradient || "#0F172A",
            width: "100%",
            height: "100%",
            aspectRatio: card.isVertical ? undefined : "16/10",
            minHeight: card.isVertical ? "100%" : undefined,
            border: "1px solid rgba(15, 23, 42, 0.08)",
            boxShadow: "0 8px 24px -6px rgba(15, 23, 42, 0.08), 0 2px 6px -1px rgba(15, 23, 42, 0.04)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            transform: "translateZ(0)",
            willChange: "transform",
          }}
        >
          {/* Main Video element with lazy IntersectionObserver playback */}
          <div style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "hidden" }}>
            {isIntersecting && (
              <video
                ref={videoRef}
                src={card.video}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "center",
                  display: "block",
                }}
              />
            )}
          </div>

          {/* Bottom Label + Launch Action */}
          <div
            style={{
              position: "relative",
              zIndex: 2,
              padding: "16px 18px",
              background: "linear-gradient(to top, rgba(5, 5, 9, 0.8) 0%, rgba(5, 5, 9, 0.3) 60%, transparent 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
            }}
          >
            <div>
              <div style={{
                color: "#FFFFFF",
                fontWeight: 700,
                fontSize: "14.5px",
                letterSpacing: "-0.01em",
                textShadow: "0 2px 6px rgba(0,0,0,0.8), 0 1px 2px rgba(0,0,0,0.9)"
              }}>
                {card.animationName}
              </div>
              <div style={{
                color: "rgba(255, 255, 255, 0.85)",
                fontSize: "11px",
                fontFamily: "var(--font-mono)",
                marginTop: "2px",
                textShadow: "0 1px 4px rgba(0,0,0,0.8)"
              }}>
                {card.isVertical ? "Vertical Mobile Motion" : "SaaS Product Motion"}
              </div>
            </div>
            <span
              className="template-launch-badge"
              style={{
                backgroundColor: "#FF9137",
                color: "#0F172A",
                fontWeight: 700,
                fontSize: "12px",
                padding: "6px 14px",
                borderRadius: "6px",
                boxShadow: "0 2px 10px rgba(255, 145, 55, 0.4)",
                flexShrink: 0,
              }}
            >
              Launch
            </span>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}

function TemplateShowcaseGrid({ cards }: { cards: TemplateCardData[] }) {
  return (
    <div className="template-showcase-grid">
      {cards.map((card, idx) => (
        <TemplateCardItem key={card.id} card={card} index={idx} />
      ))}
    </div>
  );
}

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const { scrollYProgress } = useScroll();

  return (
    <div
      style={{
        minHeight: "100vh",
        position: "relative",
        overflowX: "hidden",
        backgroundColor: "var(--theme-bg-base, #FAFAF7)",
        color: "var(--theme-text-light, #0F172A)",
        fontFamily: "var(--font-sans)",
      }}
    >
      {/* Global Scroll Progress Indicator with ColorHunt Multi-Color Palette */}
      <motion.div
        style={{
          scaleX: scrollYProgress,
          transformOrigin: "0%",
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: "3px",
          background: "linear-gradient(90deg, #70FFD2 0%, #FFFC8C 35%, #FFCC4D 70%, #FF9137 100%)",
          zIndex: 9999,
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
          font-family: var(--font-sans);
        }
        .font-display {
          font-family: var(--font-sans);
        }
        .font-body {
          font-family: var(--font-sans);
        }
        .font-label {
          font-family: var(--font-mono);
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
        .template-showcase-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 24px;
          grid-auto-flow: dense;
        }
        .template-card-cell {
          width: 100%;
          display: flex;
          flex-direction: column;
        }
        .template-card-cell.vertical-span {
          grid-row: span 2;
          height: 100%;
        }
        @media (max-width: 1024px) {
          .template-showcase-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 20px;
          }
          .template-card-cell.vertical-span {
            grid-row: span 2;
          }
        }
        @media (max-width: 640px) {
          .template-showcase-grid {
            grid-template-columns: 1fr;
            gap: 18px;
          }
          .template-card-cell.vertical-span {
            grid-row: auto;
          }
          .template-card-cell.vertical-span .template-card-inner {
            aspect-ratio: 4 / 5 !important;
            height: auto !important;
          }
        }
        .template-card-link:focus-visible > div {
          border-color: #FF9137 !important;
          box-shadow: 0 0 0 2px rgba(255, 145, 55, 0.5) !important;
        }

        /* FAQ Premium Layout */
        @media (min-width: 860px) {
          .faq-layout {
            display: grid;
            grid-template-columns: 320px 1fr;
            gap: 80px;
            align-items: start;
          }
          .faq-header-sticky {
            position: sticky;
            top: 120px;
          }
        }
        @media (max-width: 859px) {
          .faq-layout {
            display: flex;
            flex-direction: column;
            gap: 48px;
          }
        }

        .footer-nav-link {
          font-size: 14px;
          color: #64748B;
          text-decoration: none;
          transition: color 0.15s ease, transform 0.15s ease;
          display: inline-block;
        }
        .footer-nav-link:hover {
          color: #0F172A;
          transform: translateX(2px);
        }
      `}</style>

      {/* Hero Section */}
      <SmoothHero />

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
            fontSize: "clamp(2rem, 4vw, 3rem)",
            fontWeight: 400,
            color: "#0F172A",
            margin: "0 0 12px 0",
            letterSpacing: "-0.035em"
          }}>
            Product Video Templates For SaaS
          </h2>
          <p className="font-body" style={{
            fontSize: "clamp(1.05rem, 1.8vw, 1.2rem)",
            color: "#475569",
            margin: 0,
            maxWidth: "680px",
            lineHeight: 1.6
          }}>
            Pick a ready-made motion graphic template, customize in seconds, and export stunning product videos
          </p>
        </motion.div>

        {/* Grid Breaker / Asymmetric Template Grid */}
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
          <TemplateShowcaseGrid cards={TEMPLATE_CARDS} />
        </motion.div>
      </section>

      {/* Use Cases & Applications Section (Ledger Format) */}
      <section id="use-cases" style={{
        paddingTop: "60px",
        paddingBottom: "100px",
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
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6 }}
            style={{ marginBottom: "48px" }}
          >
            <h2 className="font-headline" style={{
              fontSize: "clamp(2rem, 3vw, 2.5rem)",
              fontWeight: 400,
              color: "#0F172A",
              margin: "0 0 16px 0",
              letterSpacing: "-0.035em"
            }}>
              Use Cases
            </h2>
          </motion.div>

          <div style={{ display: "flex", flexDirection: "column", borderTop: "1px solid rgba(15, 23, 42, 0.08)" }}>
            {USE_CASES.map((uc, idx) => (
              <motion.div
                key={uc.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.4, delay: idx * 0.06 }}
                style={{
                  display: "grid",
                  gridTemplateColumns: "80px 1fr 1.5fr",
                  gap: "24px",
                  padding: "32px 0",
                  borderBottom: "1px solid rgba(15, 23, 42, 0.06)",
                  alignItems: "baseline",
                }}
              >
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "#94A3B8" }}>
                  0{idx + 1}
                </div>
                <div style={{ fontSize: "18px", fontWeight: 500, color: "#0F172A", letterSpacing: "-0.01em" }}>
                  {uc.title}
                </div>
                <div style={{ fontSize: "14px", color: "#475569", lineHeight: 1.6 }}>
                  {uc.desc}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section (Editorial Ledger Layout) */}
      <section id="faq" style={{
        paddingTop: "80px",
        paddingBottom: "160px",
        width: "100%",
        position: "relative",
        zIndex: 10,
        borderTop: "1px solid rgba(15, 23, 42, 0.08)"
      }}>
        <div style={{
          maxWidth: "1080px",
          margin: "0 auto",
          paddingLeft: "24px",
          paddingRight: "24px"
        }} className="faq-layout">
          
          {/* Left Sticky Header */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6 }}
            className="faq-header-sticky"
          >
            <h2 className="font-headline" style={{
              fontSize: "clamp(2rem, 3.5vw, 2.5rem)",
              fontWeight: 400,
              color: "#0F172A",
              margin: "0 0 16px 0",
              letterSpacing: "-0.035em",
              lineHeight: 1.1
            }}>
              Frequently Asked<br/>Questions
            </h2>
            <p className="font-body" style={{
              fontSize: "1rem",
              color: "#475569",
              margin: 0,
              maxWidth: "100%",
              lineHeight: 1.6,
              paddingRight: "20px"
            }}>
              Discover how ScreenMotion helps SaaS founders and creators make high-converting product videos without complex tools Everything you need to know is right here
            </p>
          </motion.div>

          {/* Right Accordion List (Ledger Style) */}
          <div style={{ display: "flex", flexDirection: "column" }}>
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
                    borderTop: "1px solid rgba(15, 23, 42, 0.08)",
                    borderBottom: index === FAQ_ITEMS.length - 1 ? "1px solid rgba(15, 23, 42, 0.08)" : "none",
                  }}
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    style={{
                      width: "100%",
                      padding: "24px 0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "24px",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      textAlign: "left"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "baseline", gap: "24px", flex: 1 }}>
                      <span style={{ 
                        fontFamily: "var(--font-mono)", 
                        fontSize: "12px", 
                        color: isOpen ? "#FF9137" : "#94A3B8" 
                      }}>
                        0{index + 1}
                      </span>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <span className="font-headline" style={{
                          fontSize: "1.1rem",
                          fontWeight: 600,
                          color: isOpen ? "#FF9137" : "#334155",
                          letterSpacing: "-0.01em",
                          transition: "color 0.2s ease"
                        }}>
                          {faq.question}
                        </span>
                      </div>
                    </div>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "18px",
                        fontWeight: 400,
                        color: isOpen ? "#FF9137" : "#64748B",
                        transition: "transform 0.3s ease, color 0.3s ease",
                        transform: isOpen ? "rotate(45deg)" : "rotate(0deg)"
                      }}
                    >
                      +
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
                            padding: "0 0 32px 42px",
                            fontSize: "15px",
                            lineHeight: 1.6,
                            color: "#475569",
                            maxWidth: "800px"
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

      {/* Premium Clean Editorial Footer */}
      <footer
        style={{
          borderTop: "1px solid rgba(15, 23, 42, 0.08)",
          backgroundColor: "#F4F4F0",
          color: "#0F172A",
          position: "relative",
          zIndex: 10,
          paddingTop: "72px",
          paddingBottom: "48px",
          width: "100%",
        }}
      >
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            paddingLeft: "32px",
            paddingRight: "32px",
          }}
        >
          {/* Top Row: Brand Info + Navigation Columns */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "48px 32px",
              paddingBottom: "56px",
              borderBottom: "1px solid rgba(15, 23, 42, 0.08)",
            }}
          >
            {/* Brand & Mission Column */}
            <div style={{ gridColumn: "span 2", maxWidth: "380px" }}>
              <Link
                href="/"
                style={{
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "16px",
                }}
              >
                <img
                  src="/logo.svg"
                  alt="Screen Motion"
                  style={{ width: "26px", height: "26px", objectFit: "contain", filter: "invert(1)" }}
                />
                <span
                  style={{
                    fontSize: "19px",
                    fontWeight: 600,
                    letterSpacing: "-0.04em",
                    color: "#0F172A",
                  }}
                >
                  screenmotion
                </span>
              </Link>
              <p
                style={{
                  fontSize: "14px",
                  lineHeight: "1.65",
                  color: "#64748B",
                  margin: 0,
                }}
              >
                Studio-grade 3D device mockups and kinetic motion graphics for SaaS product videos. Built for speed, precision, and high-converting launches.
              </p>
            </div>

            {/* Product Column */}
            <div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "11px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "#0F172A",
                  marginBottom: "18px",
                }}
              >
                Product
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
                <li>
                  <Link href="/projects" className="footer-nav-link">
                    3D Scene Studio
                  </Link>
                </li>
                <li>
                  <Link href="/motion-graphics" className="footer-nav-link">
                    Motion Graphics
                  </Link>
                </li>
                <li>
                  <a href="#templates" className="footer-nav-link">
                    Video Templates
                  </a>
                </li>
                <li>
                  <a href="#use-cases" className="footer-nav-link">
                    Use Cases
                  </a>
                </li>
              </ul>
            </div>

            {/* Capabilities Column */}
            <div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "11px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "#0F172A",
                  marginBottom: "18px",
                }}
              >
                Capabilities
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
                <li style={{ fontSize: "14px", color: "#64748B" }}>
                  Kinetic Typography
                </li>
                <li style={{ fontSize: "14px", color: "#64748B" }}>
                  3D Device Mockups
                </li>
                <li style={{ fontSize: "14px", color: "#64748B" }}>
                  1080p MP4 Export
                </li>
                <li style={{ fontSize: "14px", color: "#64748B" }}>
                  100% Local Processing
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar / Colophon */}
          <div
            style={{
              paddingTop: "32px",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "16px",
              fontSize: "13px",
              color: "#64748B",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <span>© {new Date().getFullYear()} ScreenMotion. All rights reserved.</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "#94A3B8" }}>
                DESIGNED FOR FOUNDERS & CREATORS
              </span>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "var(--font-mono)",
                  fontSize: "11px",
                  letterSpacing: "0.05em",
                  color: "#475569",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#FF9137";
                  e.currentTarget.style.background = "rgba(255, 145, 55, 0.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "#475569";
                  e.currentTarget.style.background = "transparent";
                }}
              >
                <span>BACK TO TOP</span>
                <span>↑</span>
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
