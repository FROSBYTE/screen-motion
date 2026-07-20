"use client";

import { HeroHeader } from "@/components/smoothui/shared/hero-header";
import Iridescence from "@/components/Iridescence";
import { AnimatedGroup, AnimatedText } from "@/components/smoothui/shared";
import SmoothButton from "@/components/smoothui/smooth-button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen flex flex-col bg-white text-[#141414] selection:bg-[#141414] selection:text-white">
      <HeroHeader />

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center relative overflow-hidden" style={{ minHeight: "100vh" }}>
        {/* Iridescence Background — full bleed, no grayscale filter */}
        <div className="absolute inset-0 z-0">
          <Iridescence color={[0.9, 0.8, 1.0]} speed={1.2} amplitude={0.0} mouseReact={false} />
        </div>

        {/* Soft radial vignette — subtle, lets iridescence breathe */}
        <div
          className="absolute inset-0 z-[1] pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 80% 70% at 50% 50%, transparent 40%, rgba(255,255,255,0.7) 100%)",
          }}
        />

        {/* Content */}
        <AnimatedGroup
          className="pointer-events-none flex flex-col items-center gap-6 text-center z-10 relative px-6 w-full max-w-4xl"
          preset="blur-slide"
        >
          <div className="flex flex-col items-center">
            {/* Beta Tag */}
            <div className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-[#ededed] bg-white/80 px-4 py-1.5 text-sm font-medium text-[#141414] backdrop-blur-sm shadow-xs select-none">
              <span className="flex h-2 w-2 rounded-full bg-[#ffa4a4] animate-pulse" />
              Beta
            </div>

            <AnimatedText
              as="h1"
              className="mb-10 md:mb-12 text-pretty font-semibold text-5xl tracking-[-0.011em] lg:text-7xl xl:text-[80px] leading-[1.00] text-[#141414]"
            >
              Create stunning{" "}
              <br className="hidden md:block" />
              device mockups
            </AnimatedText>
            <AnimatedText
              as="p"
              className="mx-auto max-w-xl text-[#404040] text-lg lg:text-xl leading-relaxed tracking-[0.013em]"
              delay={0.15}
            >
              Upload a screenshot, pick a template, and export
              professional 3D mockup animations — in seconds
            </AnimatedText>
          </div>

          <AnimatedGroup
            className="pointer-events-auto mt-8 flex flex-col sm:flex-row justify-center gap-4"
            preset="slide"
          >
            <SmoothButton
              size="lg"
              shape="pill"
              className="w-64 md:w-72"
              asChild
            >
              <Link href="/editor">
                Open Editor
              </Link>
            </SmoothButton>
          </AnimatedGroup>
        </AnimatedGroup>
      </main>
    </div>
  );
}
