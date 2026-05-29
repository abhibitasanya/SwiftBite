import type { Metadata, Viewport } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "SwiftBite",
  title: {
    default: "SwiftBite",
    template: "%s | SwiftBite",
  },
  description: "SwiftBite is a food ordering app for customers, delivery partners, restaurant owners, and platform teams.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    shortcut: ["/favicon.ico"],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    title: "SwiftBite",
    description: "A premium food ordering experience for customers, delivery partners, restaurant owners, and platform teams.",
    url: "/",
    siteName: "SwiftBite",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "SwiftBite" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SwiftBite",
    description: "A premium food ordering experience for customers, delivery partners, restaurant owners, and platform teams.",
    images: ["/og-image.png"],
  },
  appleWebApp: {
    capable: true,
    title: "SwiftBite",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#223326",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col relative">
        {/* Global soft gradient overlay for all pages */}
        <div className="pointer-events-none -z-10 absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(63,90,61,0.24),transparent_24%),radial-gradient(circle_at_80%_10%,rgba(111,135,92,0.20),transparent_20%),radial-gradient(circle_at_22%_78%,rgba(255,252,245,0.22),transparent_36%),linear-gradient(180deg,#f0f4e9_0%,#d9e3d3_42%,#bdd0bb_100%)]" />
        {children}
      </body>
    </html>
  );
}
