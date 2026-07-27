import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";

// next/font/google replaces the previous <link> tags — eliminates the
// @next/next/no-page-custom-font lint warning and gives us automatic
// font-display: swap, preloading, and CSS-variable exposure to Tailwind @theme.
//
// Approved design system typography: Space Grotesk for display/headings,
// Inter for body/UI copy, JetBrains Mono for terminal/code/badge text.
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
});
const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
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
      className={`${spaceGrotesk.variable} ${inter.variable} ${jetBrainsMono.variable} scroll-smooth dark`}
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
        {children}
      </body>
    </html>
  );
}