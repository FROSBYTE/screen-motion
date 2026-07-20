"use client";

import React from "react";

export const HeroHeader = () => {
  return (
    <header className="absolute top-0 left-0 z-20 w-full">
      <nav className="mx-auto max-w-5xl px-6">
        <div className="relative flex items-center justify-between py-6">
          {/* Logo removed */}

          {/* Desktop CTA — right */}
          <div className="hidden lg:flex items-center gap-3">
          </div>
        </div>
      </nav>
    </header>
  );
};
