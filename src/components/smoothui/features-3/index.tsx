"use client";

import { cn } from "@/lib/utils";
import { getImageKitUrl } from "@/lib/smoothui-data";
import { motion, useReducedMotion } from "motion/react";

const SPRING = {
  type: "spring" as const,
  duration: 0.25,
  bounce: 0.1,
};

const features = [
  {
    title: "Intuitive Design",
    description:
      "Every component is designed with usability in mind. Clean interfaces that your users will love from the first interaction.",
    image: getImageKitUrl("/images/designerworking.webp", {
      width: 800,
      quality: 85,
      format: "auto",
    }),
    imageAlt: "Designer working on user interface",
  },
  {
    title: "Blazing Performance",
    description:
      "Optimized animations that only use transform and opacity. Hardware-accelerated rendering for butter-smooth 60fps experiences.",
    image: getImageKitUrl("/images/hero-smoothui.png", {
      width: 800,
      quality: 85,
      format: "auto",
    }),
    imageAlt: "SmoothUI component showcase",
  },
  {
    title: "Developer Experience",
    description:
      "Full TypeScript support, comprehensive documentation, and one-command installation via the shadcn registry.",
    image: getImageKitUrl("/images/hero-example_xertaz.png", {
      width: 800,
      quality: 85,
      format: "auto",
    }),
    imageAlt: "Code example with TypeScript support",
  },
];

export function FeaturesAlternating() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section aria-labelledby="features-alternating-heading" className="w-full bg-gradient-to-b from-white to-[#fcf9ea] border-t border-[#ededed]" style={{ paddingTop: "140px", paddingBottom: "140px" }}>
      <div className="w-full flex flex-col items-center">
        <div className="mx-auto max-w-6xl px-6 w-full flex flex-col items-center">
          <div className="mx-auto text-center flex flex-col items-center" style={{ marginBottom: "80px" }}>
            <h2
              className="text-balance font-bold text-3xl tracking-tight md:text-4xl text-[#141414]"
              id="features-alternating-heading"
            >
              Why developers choose us
            </h2>
            <p className="mt-4 text-[#707070] text-lg">
              Designed for developer productivity and user delight.
            </p>
          </div>
          
          {/* Spacer between heading block and features list */}
          <div style={{ height: "64px" }} className="w-full" />

          <div className="w-full flex flex-col" style={{ gap: "120px" }}>
            {features.map((feature, index) => {
              const isReversed = index % 2 === 1;
              const slideDirection = isReversed ? 24 : -24;

              return (
                <div
                  className={cn(
                    "grid items-center gap-16 md:gap-24 md:grid-cols-2 w-full",
                    isReversed && "md:[direction:rtl]"
                  )}
                  key={feature.title}
                >
                  <motion.div
                    className="md:[direction:ltr]"
                    initial={
                      shouldReduceMotion
                        ? { opacity: 1 }
                        : { opacity: 0, x: slideDirection }
                    }
                    transition={shouldReduceMotion ? { duration: 0 } : SPRING}
                    viewport={{ once: true, margin: "-100px" }}
                    whileInView={
                      shouldReduceMotion ? { opacity: 1 } : { opacity: 1, x: 0 }
                    }
                  >
                    <h3 className="mb-6 md:mb-8 font-bold text-2xl text-[#141414]">{feature.title}</h3>
                    <p className="text-[#707070] text-lg leading-relaxed">
                      {feature.description}
                    </p>
                  </motion.div>

                  <motion.div
                    className="md:[direction:ltr]"
                    initial={
                      shouldReduceMotion
                        ? { opacity: 1 }
                        : { opacity: 0, x: -slideDirection }
                    }
                    transition={shouldReduceMotion ? { duration: 0 } : SPRING}
                    viewport={{ once: true, margin: "-100px" }}
                    whileInView={
                      shouldReduceMotion ? { opacity: 1 } : { opacity: 1, x: 0 }
                    }
                  >
                    <div className="overflow-hidden rounded-xl border border-[#ededed] shadow-md bg-white">
                      <img
                        alt={feature.imageAlt}
                        className="aspect-video h-auto w-full object-cover"
                        draggable={false}
                        src={feature.image}
                      />
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export default FeaturesAlternating;
