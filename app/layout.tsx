import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import { ShieldProvider } from "./components/ShieldMode";

// Serif for titles — a sophisticated, high-contrast face.
const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-serif",
  display: "swap",
});

// Sans for body — clean and ultra-readable.
const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Jc App — Auditor de Presencia",
  description:
    "Una herramienta anti-productividad. No te ayuda a hacer más; te obliga a proteger tu presencia, tu energía y tu vida.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${serif.variable} ${sans.variable}`}>
      <body>
        <ShieldProvider>{children}</ShieldProvider>
      </body>
    </html>
  );
}
