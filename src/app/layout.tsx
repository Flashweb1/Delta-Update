import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Inter, Source_Serif_4 } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-source-serif",
  display: "swap",
});

const siteDescription =
  "Community-first news from Nigeria: politics, business, cities, culture, security, sports and local reporting across all 36 states and the FCT, rooted in Delta State.";

export const metadata: Metadata = {
  metadataBase: new URL("https://deltaupdates.ng"),
  title: {
    default: "Delta Updates | Independent Local News from Across Nigeria",
    template: "%s | Delta Updates",
  },
  description: siteDescription,
  applicationName: "Delta Updates",
  keywords: [
    "Delta Updates",
    "Nigeria local news",
    "Nigeria news",
    "Nigerian states news",
    "community news Nigeria",
    "Niger Delta news",
    "Delta State news",
    "Warri news",
    "Asaba news",
    "Abuja local news",
    "Lagos local news",
  ],
  authors: [{ name: "Delta Updates Editorial Desk" }],
  openGraph: {
    type: "website",
    locale: "en_NG",
    siteName: "Delta Updates",
    title: "Delta Updates | Independent Local News from Across Nigeria",
    description: siteDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: "Delta Updates | Independent Local News from Across Nigeria",
    description: siteDescription,
  },
};

export const viewport: Viewport = {
  themeColor: "#0b2545",
  colorScheme: "light",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${inter.variable} ${sourceSerif.variable} bg-slate-100 font-sans text-slate-900 antialiased selection:bg-red-600 selection:text-white`}
      >
        {children}
      </body>
    </html>
  );
}
