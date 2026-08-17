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
        backgroundColor: "#000000",
        color: "#ffffff",
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
          height: 54px;
          display: inline-flex;
          align-items: center;
          justifyContent: center;
          border-radius: 14px;
          font-size: 16px;
          font-weight: 700;
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
            display: inline-flex !important;
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
          <span style={{ fontSize: "22px", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.03em" }}>
            screen<span style={{ color: "#ffffff", opacity: 0.85 }}>motion</span>
          </span>
        </Link>

        {/* Center Nav Links (Desktop) */}
        <nav className="nav-desktop-links">
          <a href="#templates" style={{ color: "#a1a1aa", textDecoration: "none", fontSize: "14px", fontWeight: 600, transition: "color 0.15s" }}>
            3D Templates
          </a>
          <Link href="/projects" style={{ color: "#a1a1aa", textDecoration: "none", fontSize: "14px", fontWeight: 600, transition: "color 0.15s" }}>
            Motion Graphics
          </Link>
          <Link href="/editor" style={{ color: "#a1a1aa", textDecoration: "none", fontSize: "14px", fontWeight: 600, transition: "color 0.15s" }}>
            3D Editor
          </Link>
          <a href="#faq" style={{ color: "#a1a1aa", textDecoration: "none", fontSize: "14px", fontWeight: 600, transition: "color 0.15s" }}>
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
            color: "#000000",
            backgroundColor: "#ffffff",
            border: "none",
            padding: "8px 20px",
            borderRadius: "9999px",
            textDecoration: "none",
            transition: "all 0.15s ease",
            boxShadow: "0 2px 12px rgba(255, 255, 255, 0.2)",
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
            background: "#141414",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            borderRadius: "10px",
            padding: "8px",
            color: "#ffffff",
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
                backgroundColor: "#0a0a0a",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                borderRadius: "16px",
                padding: "20px",
                boxShadow: "0 20px 50px rgba(0, 0, 0, 0.9)",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                zIndex: 40,
              }}
            >
              <a
                href="#templates"
                onClick={() => setMobileMenuOpen(false)}
                style={{ color: "#ffffff", textDecoration: "none", fontSize: "15px", fontWeight: 600 }}
              >
                3D Templates
              </a>
              <Link
                href="/projects"
                onClick={() => setMobileMenuOpen(false)}
                style={{ color: "#ffffff", textDecoration: "none", fontSize: "15px", fontWeight: 600 }}
              >
                Motion Graphics
              </Link>
              <Link
                href="/editor"
                onClick={() => setMobileMenuOpen(false)}
                style={{ color: "#ffffff", textDecoration: "none", fontSize: "15px", fontWeight: 600 }}
              >
                3D Editor
              </Link>
              <a
                href="#faq"
                onClick={() => setMobileMenuOpen(false)}
                style={{ color: "#ffffff", textDecoration: "none", fontSize: "15px", fontWeight: 600 }}
              >
                FAQ
              </a>
              <div style={{ height: "1px", backgroundColor: "rgba(255, 255, 255, 0.1)", margin: "4px 0" }} />
              <a
                href="https://forms.gle/rtfYsFTgRUP9RE79A"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  fontSize: "14px",
                  fontWeight: 700,
                  color: "#000000",
                  backgroundColor: "#ffffff",
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
            color: "#ffffff",
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
            color: "#a1a1aa",
            maxWidth: "760px",
            margin: "0 0 36px 0",
            fontWeight: 400,
          }}
        >
          No need to learn After Effects and spend your unprofessional time in making videos. Choose from the variety of our templates and create video easily. Zero Experience required
        </p>

        {/* Monochrome CTA Buttons */}
        <div className="hero-btn-container" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: "16px", marginBottom: "48px" }}>
          {/* Solid White Primary Button */}
          <Link
            href="/editor"
            className="hero-btn-primary"
            style={{
              padding: "0 32px",
              background: "#ffffff",
              color: "#000000",
              boxShadow: "0 4px 20px rgba(255, 255, 255, 0.25)",
              transition: "transform 0.2s ease",
            }}
          >
            Launch 3D Editor
          </Link>

          {/* Secondary Pitch Dark Button */}
          <Link
            href="/projects"
            className="hero-btn-secondary"
            style={{
              padding: "0 28px",
              backgroundColor: "#0f0f0f",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              color: "#ffffff",
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
                color: "#000000",
                backgroundColor: "#ffffff",
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
            backgroundColor: "#0a0a0a",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            boxShadow: "0 25px 80px -10px rgba(0, 0, 0, 0.9)",
          }}
        >
          {/* Inner Studio Window */}
          <div
            style={{
              width: "100%",
              borderRadius: "26px",
              overflow: "hidden",
              backgroundColor: "#0a0a0a",
              textAlign: "left",
            }}
          >
            {/* Window Titlebar */}
            <div
              style={{
                height: "42px",
                backgroundColor: "#0a0a0a",
                borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
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
                  backgroundColor: "#141414",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "6px",
                  padding: "3px 16px",
                  fontSize: "11px",
                  color: "#a1a1aa",
                  letterSpacing: "0.02em",
                }}
              >
                screenmotion.io/editor
              </div>

              <div style={{ width: "42px" }} />
            </div>

            {/* Window Content / Canvas Video */}
            <div
              style={{
                position: "relative",
                width: "100%",
                height: "clamp(300px, 50vw, 560px)",
                overflow: "hidden",
                backgroundColor: "#000000",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <video
                src="/animation-card-videos/orbit-template.webm"
                autoPlay
                loop
                muted
                playsInline
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
