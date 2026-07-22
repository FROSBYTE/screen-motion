"use client";

import React from "react";
import Link from "next/link";

interface FooterProps {
  companyName?: string;
  copyright?: string;
  description?: string;
  links?: Record<string, { name: string; url: string }[]>;
}

export function FooterSimple({
  companyName = "screen-motion",
  copyright = `© ${new Date().getFullYear()} screen-motion. All rights reserved.`
}: FooterProps) {
  return (
    <footer
      style={{
        width: "100%",
        backgroundColor: "rgba(255, 255, 255, 0.4)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderTop: "1px solid rgba(255, 255, 255, 0.4)",
        padding: "20px 32px",
        fontFamily: "'Google Sans', sans-serif",
        position: "relative",
        zIndex: 10
      }}
    >
      <div
        style={{
          maxWidth: "1150px",
          margin: "0 auto",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px"
        }}
      >
        {/* Brand */}
        <div style={{ fontSize: "15px", fontWeight: 800, color: "#111827", letterSpacing: "-0.01em" }}>
          {companyName}
        </div>

        {/* Minimal Nav Links */}
        <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
          <Link href="/editor" style={{ fontSize: "13px", fontWeight: 600, color: "#4b5563", textDecoration: "none" }}>
            Editor
          </Link>
          <a href="#templates" style={{ fontSize: "13px", fontWeight: 600, color: "#4b5563", textDecoration: "none" }}>
            Templates
          </a>
          <a href="#" style={{ fontSize: "13px", fontWeight: 600, color: "#4b5563", textDecoration: "none" }}>
            Twitter
          </a>
          <a href="#" style={{ fontSize: "13px", fontWeight: 600, color: "#4b5563", textDecoration: "none" }}>
            Discord
          </a>
        </div>

        {/* Short Copyright */}
        <div style={{ fontSize: "12px", color: "#6b7280", fontWeight: 500 }}>
          {copyright}
        </div>
      </div>
    </footer>
  );
}

export default FooterSimple;
