import type { Metadata } from "next";
import { Noto_Sans } from "next/font/google";
import { Provider } from "./components/ui/provider";
import { Analytics } from "@vercel/analytics/next";
import { SettingsProvider } from "./context/SettingsContext";

import "./globals.scss";
import "mapbox-gl/dist/mapbox-gl.css";
import Script from "next/script";

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
      <head></head>
      <body>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3589363029410962"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <Analytics />
        <Provider>
          <SettingsProvider>{children}</SettingsProvider>
        </Provider>
      </body>
    </html>
  );
}
