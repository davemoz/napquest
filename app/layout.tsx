import type { Metadata } from "next";
import { Noto_Sans } from "next/font/google";
import { Provider } from "./components/ui/provider";
import { Analytics } from "@vercel/analytics/next";

import "./globals.scss";
import "mapbox-gl/dist/mapbox-gl.css";

const notoSans = Noto_Sans({ subsets: ["latin"], weight: ["400", "700"] });

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
    <html lang="en" className={notoSans.className} suppressHydrationWarning>
      <body>
        <Analytics />
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
