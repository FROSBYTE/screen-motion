import type { Metadata } from "next";
import { Inter, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Screen Motion — 3D Device Mockup Generator",
  description:
    "Generate stunning 3D Android & iOS device mockup videos. Upload a screenshot, choose a template, and export professional MP4 animations in seconds.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body style={{ fontFamily: "var(--font-inter, var(--font-sans))" }}>
        {children}
      </body>
    </html>
  );
}
