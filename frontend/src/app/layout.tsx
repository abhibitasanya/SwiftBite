import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SwiftBite",
  description:
    "A food ordering PWA concept for customers, delivery partners, restaurant owners, and the platform team.",
};

export const viewport = {
  themeColor: "#f6efe2",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
