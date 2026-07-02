import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en" className="scroll-smooth dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Syne:wght@400;500;600;700;800&family=JetBrains+Mono:ital,wght@0,400;0,500;1,400&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: "(function(){try{var t=localStorage.getItem('theme');if(t==='light'){document.documentElement.classList.remove('dark');document.documentElement.classList.add('light');}else{document.documentElement.classList.add('dark');}}catch(e){document.documentElement.classList.add('dark');}})();",
          }}
        />
        <meta name="theme-color" content="#080808" />
      </head>
      <body className="antialiased bg-[#080808] text-white overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
