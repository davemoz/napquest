import type { Metadata } from "next";
import { Noto_Sans } from "next/font/google";

import "./globals.scss";
import "mapbox-gl/dist/mapbox-gl.css";

const inter = Noto_Sans({ subsets: ["latin"], weight: ["400", "700"] });

export const metadata: Metadata = {
  title: "NapQuest",
  description: "For parents who drive so their kids can sleep.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className}>
      <body>{children}</body>
    </html>
  );
}
