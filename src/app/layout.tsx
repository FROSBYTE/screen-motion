import type { Metadata } from "next";
import { Inter, Geist, Sora, Space_Grotesk, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import MixpanelInit from "@/components/MixpanelInit";
import RangeSliderSync from "@/components/RangeSliderSync";

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-google-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Screen Motion: 3D Device Mockup Generator",
  description:
    "Generate stunning 3D Android & iOS device mockup videos. Upload a screenshot, choose a template, and export professional MP4 animations in seconds.",
  icons: {
    icon: [
      { url: '/icon.png', type: 'image/png' },
      { url: '/icon-transparent.png', type: 'image/png' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/icon-transparent.png',
    apple: '/icon.png',
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
        geist.variable, 
        inter.variable, 
        sora.variable, 
        spaceGrotesk.variable, 
        plusJakarta.variable
      )}
    >
      <head>
        <link rel="icon" href="/icon-transparent.png" type="image/png" />
        <link rel="apple-touch-icon" href="/icon.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&family=Outfit:wght@400;600;700&family=Poppins:wght@400;600;700&family=Space+Grotesk:wght@400;600;700&family=Playfair+Display:ital,wght@0,600;0,700;1,400&family=Bricolage+Grotesk:opsz,wght@12..96,600;12..96,700&family=Roboto:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@300..500,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ fontFamily: '"Plus Jakarta Sans", "Google Sans", "Inter", sans-serif' }}>
        <MixpanelInit />
        <RangeSliderSync />
        {children}
      </body>
    </html>
  );
}
