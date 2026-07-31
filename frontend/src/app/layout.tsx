import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SwiftBite | Premium Food Delivery",
  description: "Experience the best food delivery app with our olive green theme.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="container">
          {children}
        </div>
      </body>
    </html>
  );
}
