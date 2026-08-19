import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

// next/font replaces the previous <link> tags — eliminates the
// @next/next/no-page-custom-font lint warning and gives us automatic
// font-display: swap, preloading, and CSS-variable exposure to Tailwind.
//
// Updated design system typography: Cascadia Code (weight 600) everywhere —
// headings, body/UI copy, and terminal/code/badge text all use the same
// family. A single instance is wired to --font-sans; globals.css aliases
// --font-display and --font-mono to it, so the whole site resolves to this
// one loaded font.
//
// Self-hosted via next/font/local because next/font/google fails to load
// "Cascadia Code" with "Failed to find font override values for font
// 'Cascadia Code'" (Next.js lacks font-metrics data for it yet). The woff2
// below was pulled from Google Fonts' own CSS endpoint.
const cascadiaCode = localFont({
  src: "./fonts/CascadiaCode-600.woff2",
  weight: "600",
  style: "normal",
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ahmed ElGabbas — Full-Stack Developer & Mobile Engineer",
  description:
    "Ahmed ElGabbas — Full-Stack Software Engineer & Mobile Application Developer. Building scalable systems with React, Next.js, Flutter, and .NET. Available for hire.",
  keywords: [
    "Ahmed ElGabbas",
    "full-stack developer",
    "mobile developer",
    "flutter developer",
    "react developer",
    "next.js",
    "portfolio",
    "typescript",
    "software engineer",
  ],
  authors: [{ name: "Ahmed ElGabbas" }],
  openGraph: {
    type: "website",
    title: "Ahmed ElGabbas — Full-Stack Developer & Mobile Engineer",
    description:
      "Engineering production-scale systems — from mobile apps to full-stack web platforms. Every line crafted with precision and intent.",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ahmed ElGabbas — Full-Stack Developer & Mobile Engineer",
    description:
      "Engineering production-scale systems — from mobile apps to full-stack web platforms.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${cascadiaCode.variable} scroll-smooth dark`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: "(function(){try{var t=localStorage.getItem('theme');if(t==='light'){document.documentElement.classList.remove('dark');document.documentElement.classList.add('light');}else{document.documentElement.classList.add('dark');}}catch(e){document.documentElement.classList.add('dark');}})();",
          }}
        />
        <meta name="theme-color" content="#0D1117" />
      </head>
      <body className="antialiased bg-(--color-background) text-(--color-foreground) overflow-x-hidden">
        <div className="grid-overlay" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}