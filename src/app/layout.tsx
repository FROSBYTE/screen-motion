import type { Metadata } from "next";
import { Inter_Tight, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import ConsoleFilter from '@/components/shared/ConsoleFilter';

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Screen Motion : SAAS video maker",
  description:
    "Generate stunning 3D Android & iOS device mockup videos. Upload a screenshot, choose a template, and export professional MP4 animations in seconds.",
  icons: {
    icon: [
      { url: '/logo.svg', type: 'image/svg+xml' },
      { url: '/logo.svg', type: 'image/svg+xml' },
      { url: '/Icon.png', type: 'image/png' },
    ],
    shortcut: '/logo.svg',
    apple: '/logo.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html 
      lang="en" 
      data-scroll-behavior="smooth" 
      className={cn(
        "font-sans", 
        interTight.variable, 
        jetBrainsMono.variable
      )}
    >
      <head>
        <link rel="icon" href="/logo.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/logo.svg" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@300..500,0..1&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesk:wght@400;700;800&family=Inter:wght@400;700;800&family=Outfit:wght@400;700;800&family=Playfair+Display:ital,wght@0,400;0,700;0,800;1,400;1,700;1,800&family=Plus+Jakarta+Sans:ital,wght@0,400;0,700;0,800;1,400;1,700;1,800&family=Poppins:ital,wght@0,400;0,700;0,800;1,400;1,700;1,800&family=Roboto:ital,wght@0,400;0,700;0,900;1,400;1,700;1,900&family=Sora:wght@400;700;800&family=Space+Grotesk:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ fontFamily: '"Inter Tight", -apple-system, sans-serif', backgroundColor: '#0A0B0F', color: '#FFFFFF' }}>
        <ConsoleFilter />
        {children}
      </body>
    </html>
  );
}
