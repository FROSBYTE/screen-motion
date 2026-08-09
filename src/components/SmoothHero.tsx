"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

export default function SmoothHero() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <section
      style={{
        position: "relative",
        overflow: "hidden",
        minHeight: "100vh",
        backgroundColor: "#0e0e14",
        color: "#f8fafc",
        fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: "20px",
        paddingBottom: "80px",
      }}
    >
      {/* Responsive Styles */}
      <style jsx global>{`
        .nav-desktop-links {
          display: flex;
          align-items: center;
          gap: 28px;
        }
        .nav-desktop-cta {
          display: inline-flex;
          align-items: center;
        }
        .nav-mobile-toggle {
          display: none;
        }
        .hero-btn-primary, .hero-btn-secondary {
          height: 58px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 18px;
          font-size: 18px;
          font-weight: 800;
          text-decoration: none;
          white-space: nowrap;
        }

        @media (max-width: 768px) {
          .nav-desktop-links {
            display: none !important;
          }
          .nav-desktop-cta {
            display: none !important;
          }
          .nav-mobile-toggle {
            display: flex !important;
          }
        }

        @media (max-width: 640px) {
          .hero-btn-container {
            flex-direction: column !important;
            width: 100% !important;
            padding: 0 16px !important;
          }
          .hero-btn-primary, .hero-btn-secondary {
            width: 100% !important;
            max-width: 320px !important;
            height: 50px !important;
            font-size: 15px !important;
            padding: 0 20px !important;
          }
        }
      `}</style>

      {/* 1. Top Navigation Bar */}
      <header
        style={{
          width: "100%",
          maxWidth: "1140px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 24px",
          zIndex: 30,
          marginBottom: "40px",
          position: "relative",
        }}
      >
        {/* Brand Logo - Text Only */}
        <Link href="/" style={{ textDecoration: "none" }}>
          <span style={{ fontSize: "24px", fontWeight: 800, color: "#EEEEEE", letterSpacing: "-0.03em" }}>
            screen<span style={{ color: "#00ADB5" }}>motion</span>
          </span>
        </Link>

        {/* Center Nav Links (Desktop) */}
        <nav className="nav-desktop-links">
          <a href="#templates" style={{ color: "#EEEEEE", textDecoration: "none", fontSize: "14px", fontWeight: 600, transition: "color 0.15s" }}>
            3D Templates
          </a>
          <Link href="/motion-graphics" style={{ color: "#EEEEEE", textDecoration: "none", fontSize: "14px", fontWeight: 600, transition: "color 0.15s" }}>
            Motion Graphics
          </Link>
          <Link href="/editor" style={{ color: "#EEEEEE", textDecoration: "none", fontSize: "14px", fontWeight: 600, transition: "color 0.15s" }}>
            3D Editor
          </Link>
          <a href="#faq" style={{ color: "#EEEEEE", textDecoration: "none", fontSize: "14px", fontWeight: 600, transition: "color 0.15s" }}>
            FAQ
          </a>
        </nav>

        {/* Right CTA (Desktop) */}
        <a
          href="https://forms.gle/rtfYsFTgRUP9RE79A"
          target="_blank"
          rel="noopener noreferrer"
          className="nav-desktop-cta"
          style={{
            fontSize: "13px",
            fontWeight: 700,
            color: "#222831",
            backgroundColor: "#00ADB5",
            border: "none",
            padding: "8px 20px",
            borderRadius: "9999px",
            textDecoration: "none",
            transition: "all 0.15s ease",
          }}
        >
          Join Waitlist
        </a>

        {/* Mobile Hamburger Toggle Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="nav-mobile-toggle"
          aria-label="Toggle Mobile Navigation Menu"
          style={{
            background: "#393E46",
            border: "1px solid #4f5663",
            borderRadius: "10px",
            padding: "8px",
            color: "#EEEEEE",
            cursor: "pointer",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              style={{
                position: "absolute",
                top: "100%",
                left: "16px",
                right: "16px",
                backgroundColor: "#393E46",
                border: "1px solid #4f5663",
                borderRadius: "16px",
                padding: "20px",
                boxShadow: "0 20px 50px rgba(0, 0, 0, 0.8)",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                zIndex: 40,
              }}
            >
              <a
                href="#templates"
                onClick={() => setMobileMenuOpen(false)}
                style={{ color: "#EEEEEE", textDecoration: "none", fontSize: "15px", fontWeight: 600 }}
              >
                3D Templates
              </a>
              <Link
                href="/motion-graphics"
                onClick={() => setMobileMenuOpen(false)}
                style={{ color: "#EEEEEE", textDecoration: "none", fontSize: "15px", fontWeight: 600 }}
              >
                Motion Graphics
              </Link>
              <Link
                href="/editor"
                onClick={() => setMobileMenuOpen(false)}
                style={{ color: "#EEEEEE", textDecoration: "none", fontSize: "15px", fontWeight: 600 }}
              >
                3D Editor
              </Link>
              <a
                href="#faq"
                onClick={() => setMobileMenuOpen(false)}
                style={{ color: "#EEEEEE", textDecoration: "none", fontSize: "15px", fontWeight: 600 }}
              >
                FAQ
              </a>
              <div style={{ height: "1px", backgroundColor: "#4f5663", margin: "4px 0" }} />
              <a
                href="https://forms.gle/rtfYsFTgRUP9RE79A"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  fontSize: "14px",
                  fontWeight: 700,
                  color: "#222831",
                  backgroundColor: "#00ADB5",
                  padding: "12px",
                  borderRadius: "10px",
                  textDecoration: "none",
                  textAlign: "center",
                }}
              >
                Join Waitlist
              </a>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* 2. Main Hero Content Container */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        style={{
          maxWidth: "960px",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          zIndex: 10,
          paddingLeft: "20px",
          paddingRight: "20px",
        }}
      >
        {/* Title */}
        <h1
          style={{
            fontSize: "clamp(2.2rem, 5.5vw, 4.25rem)",
            lineHeight: 1.12,
            fontWeight: 800,
            letterSpacing: "-0.03em",
            color: "#EEEEEE",
            margin: "0 0 20px 0",
            maxWidth: "920px",
          }}
        >
          Product Video Maker For SaaS
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: "clamp(0.95rem, 1.8vw, 1.25rem)",
            lineHeight: 1.5,
            color: "#a0aab5",
            maxWidth: "760px",
            margin: "0 0 36px 0",
            fontWeight: 400,
          }}
        >
          No need to learn After Effects and spend your unprofessional time in making videos. Choose from the variety of our templates and create video easily. Zero Experience required
        </p>

        {/* Teal CTA Buttons */}
        <div className="hero-btn-container" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: "16px", marginBottom: "48px" }}>
          {/* Vibrant Teal Gradient Primary Button */}
          <Link
            href="/editor"
            className="hero-btn-primary"
            style={{
              padding: "0 32px",
              background: "linear-gradient(135deg, #00ADB5 0%, #008b92 100%)",
              color: "#222831",
              transition: "transform 0.2s ease",
            }}
          >
            Launch 3D Editor
          </Link>

          {/* Secondary Medium Dark Button */}
          <Link
            href="/motion-graphics"
            className="hero-btn-secondary"
            style={{
              padding: "0 28px",
              backgroundColor: "#393E46",
              border: "1.5px solid #4f5663",
              color: "#EEEEEE",
              gap: "10px",
              transition: "transform 0.2s ease",
            }}
          >
            Motion Video Maker
            <span
              style={{
                fontSize: "10px",
                fontWeight: 800,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "#222831",
                backgroundColor: "#00ADB5",
                padding: "3px 8px",
                borderRadius: "9999px",
                lineHeight: 1,
              }}
            >
              BETA
            </span>
          </Link>
        </div>

        {/* 3. Studio Dark Window Showcase Card */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.4, ease: "easeOut" }}
          style={{
            width: "100%",
            maxWidth: "1080px",
            borderRadius: "26px",
            overflow: "hidden",
            backgroundColor: "#181824",
            border: "1px solid #2a2a3c",
            boxShadow: "0 25px 80px -10px rgba(0, 0, 0, 0.8)",
          }}
        >
          {/* Inner Studio Window */}
          <div
            style={{
              width: "100%",
              borderRadius: "26px",
              overflow: "hidden",
              backgroundColor: "#181824",
              textAlign: "left",
            }}
          >
            {/* Window Titlebar */}
            <div
              style={{
                height: "42px",
                backgroundColor: "#181824",
                borderBottom: "1px solid #222232",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 16px",
              }}
            >
              {/* Window dots */}
              <div style={{ display: "flex", gap: "6px" }}>
                <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#ef4444" }} />
                <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#f59e0b" }} />
                <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#22c55e" }} />
              </div>

              {/* Fake Address bar */}
              <div
                style={{
                  backgroundColor: "#0e0e14",
                  border: "1px solid #2a2a3c",
                  borderRadius: "6px",
                  padding: "3px 16px",
                  fontSize: "11px",
                  color: "#94a3b8",
                  fontWeight: 500,
                  width: "280px",
                  textAlign: "center",
                }}
              >
                screenmotion.app/editor
              </div>
            </div>

            {/* Showcase Video Mockup */}
            <div style={{ position: "relative", width: "100%", aspectRatio: "16 / 9", backgroundColor: "#0e0e14", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <video
                src="/showcase-videos/screen-motion-1080p-bounce-drop-1785438886976.webm"
                autoPlay
                muted
                loop
                playsInline
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
