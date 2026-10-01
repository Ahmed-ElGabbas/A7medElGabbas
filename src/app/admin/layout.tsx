import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Admin — Portfolio Dashboard",
    template: "%s — Admin",
  },
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Deliberately no public Header/Footer/nav — /admin is a separate app area.
  // The root layout's grid-overlay background is inherited.
  return <>{children}</>;
}
