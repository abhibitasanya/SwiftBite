import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SwiftBite | Premium Food Delivery Platform",
  description: "A polished, responsive food delivery experience for customers, restaurants, delivery partners, and admins.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
