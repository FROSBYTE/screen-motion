"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";


export default function SmoothHero() {
  return (
    <section
      style={{
        position: "relative",
        overflow: "hidden",
        minHeight: "100vh",
        backgroundColor: "#0e0e14", // Pro Video Editor Dark Primary Background
        color: "#f8fafc",
        fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: "20px",
        paddingBottom: "80px",
      }}
    >
      {/* 1. Top Navigation Bar */}
      <header
        style={{
          width: "100%",
          maxWidth: "1140px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 24px",
          zIndex: 20,
          marginBottom: "40px",
        }}
      >
        {/* Brand Logo - Text Only (No App Icon) */}
        <Link href="/" style={{ textDecoration: "none" }}>
          <span style={{ fontSize: "24px", fontWeight: 800, color: "#f8fafc", letterSpacing: "-0.03em" }}>
            screen<span style={{ color: "#facc15" }}>motion</span>
          </span>
        </Link>

        {/* Center Nav Links */}
        <nav style={{ display: "flex", alignItems: "center", gap: "28px" }}>
          <a href="#templates" style={{ color: "#e2e8f0", textDecoration: "none", fontSize: "14px", fontWeight: 600, transition: "color 0.15s" }}>
            3D Templates
          </a>
          <Link href="/motion-graphics" style={{ color: "#e2e8f0", textDecoration: "none", fontSize: "14px", fontWeight: 600, transition: "color 0.15s" }}>
            Motion Graphics
          </Link>
          <Link href="/editor" style={{ color: "#e2e8f0", textDecoration: "none", fontSize: "14px", fontWeight: 600, transition: "color 0.15s" }}>
            3D Editor
          </Link>
          <a href="#faq" style={{ color: "#e2e8f0", textDecoration: "none", fontSize: "14px", fontWeight: 600, transition: "color 0.15s" }}>
            FAQ
          </a>
        </nav>

        {/* Right CTA */}
        <a
          href="https://forms.gle/rtfYsFTgRUP9RE79A"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: "13px",
            fontWeight: 700,
            color: "#f8fafc",
            backgroundColor: "#222232",
            border: "1px solid #2a2a3c",
            padding: "8px 20px",
            borderRadius: "9999px",
            textDecoration: "none",
            transition: "all 0.15s ease",
          }}
        >
          Join Waitlist
        </a>
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
            fontSize: "clamp(2.5rem, 5.5vw, 4.25rem)",
            lineHeight: 1.12,
            fontWeight: 800,
            letterSpacing: "-0.03em",
            color: "#f8fafc",
            margin: "0 0 20px 0",
            maxWidth: "920px",
          }}
        >
          Build Beautiful 3D Product Videos, Effortlessly
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: "clamp(1rem, 1.8vw, 1.25rem)",
            lineHeight: 1.5,
            color: "#94a3b8",
            maxWidth: "680px",
            margin: "0 0 36px 0",
            fontWeight: 400,
          }}
        >
          Craft. Animate. Export 4K Studio Device Mockups &amp; Motion Graphics In Your Browser.
        </p>

        {/* Warm Light Yellow CTA Buttons (No Glow Effect) */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: "16px", marginBottom: "48px" }}>
          {/* Light Yellow Gradient Primary Button */}
          <Link
            href="/editor"
            style={{
              height: "58px",
              padding: "0 32px",
              borderRadius: "18px",
              background: "linear-gradient(135deg, #facc15 0%, #eab308 100%)",
              color: "#0f172a",
              fontSize: "18px",
              fontWeight: 800,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              textDecoration: "none",
              boxShadow: "0 4px 16px rgba(234, 179, 8, 0.25)",
              transition: "transform 0.2s ease",
            }}
          >
            Launch 3D Editor
          </Link>

          {/* Secondary Studio Dark Button with Background Color & BETA Tag */}
          <Link
            href="/motion-graphics"
            style={{
              height: "58px",
              padding: "0 28px",
              borderRadius: "18px",
              backgroundColor: "#1c1c28",
              border: "1.5px solid #2d2d42",
              color: "#f8fafc",
              fontSize: "18px",
              fontWeight: 800,
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              textDecoration: "none",
              boxShadow: "0 4px 16px rgba(0, 0, 0, 0.3)",
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
                color: "#0f172a",
                backgroundColor: "#facc15",
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
