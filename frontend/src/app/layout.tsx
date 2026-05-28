import type { Metadata, Viewport } from "next";
import "./globals.css";
import { PwaInstallButton } from "../components/pwa-install-button";

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
      <body className="min-h-full flex flex-col">
        <PwaInstallButton />
        {children}
      </body>
    </html>
  );
}
