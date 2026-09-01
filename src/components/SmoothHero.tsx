"use client";

import React from "react";
import Link from "next/link";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { ChevronRight, Menu, X, ArrowUpRight } from "lucide-react";
import Grainient from "@/components/shared/effects/Grainient";

interface NavItem {
  label: string;
  href: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Templates", href: "#templates" },
  { label: "Use Cases", href: "#use-cases" },
  { label: "Motion Graphics", href: "/motion-graphics" },
  { label: "3D Mockup", href: "/editor" },
  { label: "FAQ", href: "#faq" },
];

function PremiumNavbar() {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: "fixed",
          top: scrolled ? "14px" : "22px",
          left: 0,
          right: 0,
          zIndex: 100,
          display: "flex",
          justifyContent: "center",
          pointerEvents: "none",
          padding: "0 24px",
          transition: "all 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <div
          className="premium-nav-container"
          style={{
            pointerEvents: "auto",
            width: "100%",
            maxWidth: "1120px",
            background: scrolled
              ? "rgba(255, 255, 255, 0.84)"
              : "rgba(255, 255, 255, 0.7)",
            backdropFilter: "blur(28px) saturate(200%)",
            WebkitBackdropFilter: "blur(28px) saturate(200%)",
            border: "1px solid rgba(255, 255, 255, 0.65)",
            boxShadow: scrolled
              ? "0 20px 48px -10px rgba(15, 23, 42, 0.14), 0 2px 8px -2px rgba(15, 23, 42, 0.06), 0 0 0 1px rgba(15, 23, 42, 0.06), inset 0 1px 1px 0 rgba(255, 255, 255, 0.95)"
              : "0 12px 32px -8px rgba(15, 23, 42, 0.08), 0 2px 6px -1px rgba(15, 23, 42, 0.03), 0 0 0 1px rgba(15, 23, 42, 0.04), inset 0 1px 1px 0 rgba(255, 255, 255, 0.85)",
            borderRadius: "999px",
            padding: "6px 8px 6px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
            transition: "all 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          {/* Left: Brand Wordmark */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
            <Link
              href="/"
              style={{
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                outline: "none",
              }}
            >
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "8px",
                  background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 2px 8px rgba(15, 23, 42, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.25)",
                }}
              >
                <img
                  src="/logo.svg"
                  alt="Screen Motion"
                  style={{ width: "15px", height: "15px", objectFit: "contain" }}
                />
              </div>
              <span
                style={{
                  fontSize: "16px",
                  fontWeight: 700,
                  letterSpacing: "-0.04em",
                  color: "#0F172A",
                  fontFamily: "var(--font-sans)",
                }}
              >
                screenmotion
              </span>
            </Link>
          </div>

          {/* Center: Recessed Segmented Nav Island with Fluid Spring Capsule */}
          <nav
            className="desktop-nav-tabs"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "2px",
              position: "relative",
              background: "rgba(15, 23, 42, 0.035)",
              border: "1px solid rgba(15, 23, 42, 0.05)",
              borderRadius: "999px",
              padding: "3px 4px",
              boxShadow: "inset 0 1px 2px rgba(15, 23, 42, 0.03)",
            }}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {NAV_ITEMS.map((item, idx) => {
              const isHovered = hoveredIndex === idx;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onMouseEnter={() => setHoveredIndex(idx)}
                  style={{
                    position: "relative",
                    textDecoration: "none",
                    padding: "6px 14px",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: isHovered ? "#0F172A" : "#475569",
                    borderRadius: "999px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    transition: "color 0.15s ease",
                    zIndex: 1,
                    whiteSpace: "nowrap",
                    letterSpacing: "-0.015em",
                  }}
                >
                  {isHovered && (
                    <motion.div
                      layoutId="nav-hover-capsule"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 450, damping: 30 }}
                      style={{
                        position: "absolute",
                        inset: 0,
                        backgroundColor: "#FFFFFF",
                        borderRadius: "999px",
                        boxShadow: "0 2px 8px rgba(15, 23, 42, 0.08), 0 1px 2px rgba(15, 23, 42, 0.04)",
                        zIndex: -1,
                      }}
                    />
                  )}
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right: Actions & Launch Button */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
            <Link
              href="/projects"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 18px",
                background: "linear-gradient(180deg, #FFA04D 0%, #FF9137 100%)",
                color: "#0F172A",
                borderRadius: "999px",
                fontSize: "13px",
                fontWeight: 700,
                letterSpacing: "-0.01em",
                textDecoration: "none",
                border: "1px solid rgba(230, 121, 30, 0.5)",
                boxShadow: "0 3px 12px rgba(255, 145, 55, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.45)",
                transition: "transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease",
                whiteSpace: "nowrap",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow = "0 6px 18px rgba(255, 145, 55, 0.48)";
                e.currentTarget.style.filter = "brightness(1.03)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 3px 12px rgba(255, 145, 55, 0.35)";
                e.currentTarget.style.filter = "none";
              }}
            >
              Open Editor
              <ChevronRight size={14} strokeWidth={2.5} />
            </Link>

            {/* Mobile Nav Toggle */}
            <button
              className="mobile-nav-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Navigation Menu"
              style={{
                display: "none",
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: "rgba(15, 23, 42, 0.04)",
                border: "1px solid rgba(15, 23, 42, 0.08)",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "#0F172A",
              }}
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Glass Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.97 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            style={{
              position: "fixed",
              top: "76px",
              left: "16px",
              right: "16px",
              zIndex: 99,
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              border: "1px solid rgba(15, 23, 42, 0.08)",
              borderRadius: "20px",
              padding: "16px",
              boxShadow: "0 24px 48px -12px rgba(15, 23, 42, 0.18)",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
            }}
          >
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  textDecoration: "none",
                  padding: "12px 14px",
                  fontSize: "14.5px",
                  fontWeight: 600,
                  color: "#0F172A",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "rgba(15, 23, 42, 0.02)",
                }}
              >
                <span>{item.label}</span>
              </Link>
            ))}

            <Link
              href="/projects"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                marginTop: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                padding: "12px 20px",
                background: "#FF9137",
                color: "#0F172A",
                borderRadius: "12px",
                fontSize: "14.5px",
                fontWeight: 700,
                textDecoration: "none",
                boxShadow: "0 4px 14px rgba(255, 145, 55, 0.35)",
              }}
            >
              Open Video Editor <ChevronRight size={16} strokeWidth={2.5} />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

const HeroShowcasePlayer = React.memo(function HeroShowcasePlayer() {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isBuffering, setIsBuffering] = React.useState(false);

  // IntersectionObserver to pause when offscreen
  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          videoRef.current?.play().catch(() => {});
        } else {
          videoRef.current?.pause();
        }
      },
      { threshold: 0.1, rootMargin: "100px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleCanPlay = React.useCallback(() => {
    setIsLoading(false);
    setIsBuffering(false);
  }, []);

  const handleWaiting = React.useCallback(() => {
    setIsBuffering(true);
  }, []);

  const handlePlaying = React.useCallback(() => {
    setIsLoading(false);
    setIsBuffering(false);
  }, []);

  const handleLoadStart = React.useCallback(() => {
    setIsLoading(true);
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        backgroundColor: "#050509",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Top Video Loader Bar - Only displays when loading or buffering */}
      <AnimatePresence>
        {(isLoading || isBuffering) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "3px",
              background: "rgba(255, 255, 255, 0.12)",
              zIndex: 10,
              overflow: "hidden",
            }}
          >
            {/* Animated Shimmer Loader */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(90deg, transparent 0%, #FF9137 50%, #70FFD2 100%)",
                animation: "hero-loader-shimmer 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite",
                boxShadow: "0 0 10px rgba(255, 145, 55, 0.9)",
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full-bleed Video */}
      <video
        ref={videoRef}
        src="/showcase-videos/Screen-Motion-Motion-Graphic%20Demo.webm"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        onLoadStart={handleLoadStart}
        onCanPlay={handleCanPlay}
        onCanPlayThrough={handleCanPlay}
        onWaiting={handleWaiting}
        onPlaying={handlePlaying}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
          opacity: isLoading ? 0.35 : 1,
          transition: "opacity 0.4s ease-out",
        }}
      />

      {/* Glassmorphic Buffering / Loading Badge Overlay */}
      <AnimatePresence>
        {(isLoading || isBuffering) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(5, 5, 9, 0.55)",
              backdropFilter: "blur(6px)",
              zIndex: 6,
              gap: "10px",
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "8px 18px",
                background: "rgba(15, 23, 42, 0.85)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                borderRadius: "999px",
                boxShadow: "0 12px 32px rgba(0, 0, 0, 0.35)",
              }}
            >
              <span
                style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  border: "2px solid #FF9137",
                  borderTopColor: "transparent",
                  display: "inline-block",
                  animation: "hero-spin 0.75s linear infinite",
                }}
              />
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "#FFFFFF",
                  letterSpacing: "0.04em",
                }}
              >
                {isLoading ? "LOADING SHOWCASE VIDEO..." : "BUFFERING..."}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

export default function SmoothHero() {
  const { scrollY } = useScroll();
  
  // Parallax effects
  const contentOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const contentY = useTransform(scrollY, [0, 600], [0, 100]);
  const rightElementY = useTransform(scrollY, [0, 600], [0, -40]);

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
      <div style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 0, opacity: 0.82 }}>
        <Grainient
          color1="#F97316"
          color2="#39c295"
          color3="#EAB308"
          timeSpeed={0.18}
          colorBalance={0.0}
          warpStrength={0.85}
          warpFrequency={4.0}
          warpSpeed={1.5}
          warpAmplitude={45.0}
          blendAngle={0.0}
          blendSoftness={0.05}
          rotationAmount={500.0}
          noiseScale={2.0}
          grainAmount={0.04}
          grainScale={2.0}
          grainAnimated={false}
          contrast={1.4}
          gamma={1.0}
          saturation={0.5}
          centerX={0.0}
          centerY={0.0}
          zoom={0.95}
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

      {/* Unified Floating Glassmorphic Header */}
      <PremiumNavbar />

      {/* Main Hero Layout */}
      <main
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          alignItems: "center",
          gap: "64px",
          padding: "160px 48px 100px 48px",
          zIndex: 10,
          maxWidth: "1720px",
          margin: "0 auto",
          width: "100%",
        }}
      >
        {/* Left Content */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{ maxWidth: "620px", opacity: contentOpacity, y: contentY, willChange: "transform, opacity" }}
        >
          <h1
            style={{
              fontSize: "clamp(3.5rem, 5.8vw, 5.5rem)",
              lineHeight: 1.02,
              fontWeight: 500,
              letterSpacing: "-0.045em",
              color: "#0F172A",
              margin: "0 0 28px 0",
              textWrap: "balance",
            }}
          >
            Video maker for SaaS owners
          </h1>
          <p
            style={{
              fontSize: "clamp(1.15rem, 1.35vw, 1.3rem)",
              lineHeight: 1.65,
              color: "#475569",
              maxWidth: "46ch",
              margin: "0 0 44px 0",
              fontWeight: 400,
              letterSpacing: "-0.01em",
            }}
          >
            Create cinematic 3D product motion and promotional videos in seconds. No complex timelines, After Effects, or editing experience required.
          </p>

          <div style={{ display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
            <Link
              href="/projects"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                padding: "16px 34px",
                background: "linear-gradient(180deg, #FFA04D 0%, #FF9137 100%)",
                color: "#0F172A",
                borderRadius: "12px",
                fontSize: "16.5px",
                fontWeight: 700,
                letterSpacing: "-0.01em",
                textDecoration: "none",
                border: "1px solid rgba(230, 121, 30, 0.6)",
                boxShadow: "0 4px 20px rgba(255, 145, 55, 0.38), inset 0 1px 0 rgba(255, 255, 255, 0.5)",
                transition: "transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 8px 26px rgba(255, 145, 55, 0.52)";
                e.currentTarget.style.filter = "brightness(1.03)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 20px rgba(255, 145, 55, 0.38)";
                e.currentTarget.style.filter = "none";
              }}
            >
              Open Video Editor <ChevronRight size={18} strokeWidth={2.5} color="#0F172A" />
            </Link>

            <Link
              href="#templates"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "16px 20px",
                color: "#334155",
                fontSize: "15.5px",
                fontWeight: 600,
                letterSpacing: "-0.01em",
                textDecoration: "none",
                transition: "color 0.2s ease, transform 0.2s ease",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.color = "#0F172A";
                e.currentTarget.style.transform = "translateX(2px)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.color = "#334155";
                e.currentTarget.style.transform = "translateX(0)";
              }}
            >
              Explore Templates <ArrowUpRight size={16} strokeWidth={2.2} />
            </Link>
          </div>
        </motion.div>

        {/* Right Showcase Video Frame */}
        <motion.div
          initial={{ opacity: 0, y: 32, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1.0, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: "relative",
            width: "100%",
            aspectRatio: "16/10",
            background: "#050509",
            borderRadius: "20px",
            border: "1px solid rgba(255, 255, 255, 0.35)",
            boxShadow: "0 32px 80px -16px rgba(15, 23, 42, 0.22), 0 12px 32px -4px rgba(15, 23, 42, 0.1), 0 0 0 1px rgba(15, 23, 42, 0.08), inset 0 1px 1px 0 rgba(255, 255, 255, 0.2)",
            overflow: "hidden",
            y: rightElementY,
            willChange: "transform",
          }}
        >
          <HeroShowcasePlayer />
        </motion.div>
      </main>

      <style jsx global>{`
        @keyframes hero-loader-shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes hero-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @media (max-width: 900px) {
          .desktop-nav-tabs {
            display: none !important;
          }
          .mobile-nav-toggle-btn {
            display: flex !important;
          }
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
            font-size: clamp(2.6rem, 8vw, 3.8rem) !important;
          }
        }
        @media (max-width: 768px) {
          main {
            padding: 110px 20px 48px 20px !important;
          }
          h1 {
            font-size: clamp(2.2rem, 9vw, 3.2rem) !important;
            margin-bottom: 20px !important;
          }
        }
      `}</style>
    </section>
  );
}
