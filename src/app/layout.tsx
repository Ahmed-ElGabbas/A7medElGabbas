import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const cascadiaCode = localFont({
  src: "../../public/fonts/CascadiaCode-600.woff2",
  weight: "600",
  style: "normal",
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ahmedelgabbas.dev"),
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
      "Engineering production-scale systems — from mobile apps to full-stack web platforms.",
    locale: "en_US",
    siteName: "Ahmed ElGabbas Portfolio",
    images: [
      {
        url: "/images/og.jpg",
        width: 1200,
        height: 630,
        alt: "Ahmed ElGabbas — Full-Stack Developer & Mobile Engineer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ahmed ElGabbas — Full-Stack Developer & Mobile Engineer",
    description:
      "Engineering production-scale systems — from mobile apps to full-stack web platforms.",
    creator: "@A7med_ElGabbas",
    images: ["/images/og.jpg"],
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
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='light'){document.documentElement.classList.remove('dark');document.documentElement.classList.add('light');}else{document.documentElement.classList.add('dark');}}catch(e){document.documentElement.classList.add('dark');}})();`,
          }}
        />
        <meta name="theme-color" content="#000000" />
      </head>
      <body className="antialiased overflow-x-hidden">
        <div className="grid-overlay" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}