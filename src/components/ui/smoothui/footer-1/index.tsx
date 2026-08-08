"use client";

import React from "react";

interface FooterLink {
  name: string;
  url: string;
}

interface FooterSimpleProps {
  companyName: string;
  description: string;
  copyright: string;
  links: {
    product: FooterLink[];
    company: FooterLink[];
    support: FooterLink[];
  };
}

export function FooterSimple({
  companyName,
  description,
  copyright,
  links,
}: FooterSimpleProps) {
  const renderLink = (item: FooterLink, i: number) => {
    const isExternal = item.url.startsWith("http");
    return (
      <li key={i}>
        <a
          href={item.url}
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noopener noreferrer" : undefined}
          style={{ color: "#cbd5e1", textDecoration: "none", transition: "color 0.2s" }}
        >
          {item.name}
        </a>
      </li>
    );
  };

  return (
    <footer style={{
      width: "100%",
      backgroundColor: "transparent",
      color: "#cbd5e1",
      padding: "60px 24px 32px 24px",
      fontSize: "14px",
      fontFamily: "'Google Sans', 'Inter', sans-serif",
      borderTop: "1px solid #222232",
      position: "relative",
      zIndex: 10
    }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "40px" }}>
        <div>
          <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#ffffff", marginBottom: "12px" }}>{companyName}</h3>
          <p style={{ lineHeight: 1.6, color: "#cbd5e1", maxWidth: "300px" }}>{description}</p>
        </div>
        {links.product && links.product.length > 0 && (
          <div>
            <h4 style={{ fontSize: "12px", fontWeight: 700, color: "#f8fafc", marginBottom: "16px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Product</h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
              {links.product.map(renderLink)}
            </ul>
          </div>
        )}
        {links.company && links.company.length > 0 && (
          <div>
            <h4 style={{ fontSize: "12px", fontWeight: 700, color: "#f8fafc", marginBottom: "16px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Company</h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
              {links.company.map(renderLink)}
            </ul>
          </div>
        )}
        {links.support && links.support.length > 0 && (
          <div>
            <h4 style={{ fontSize: "12px", fontWeight: 700, color: "#f8fafc", marginBottom: "16px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Connect</h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
              {links.support.map(renderLink)}
            </ul>
          </div>
        )}
      </div>
      <div style={{ maxWidth: "1100px", margin: "40px auto 0 auto", paddingTop: "24px", borderTop: "1px solid #222232", textAlign: "center", fontSize: "13px", color: "#94a3b8" }}>
        {copyright}
      </div>
    </footer>
  );
}

export default FooterSimple;
