import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Warframe Cetus Bounties - Contratos y Rotaciones A, B, C en Tiempo Real",
  description: "Consulta en tiempo real los contratos de Konzu en Cetus, el ciclo Día/Noche de las Llanuras de Eidolon y las rotaciones A, B y C con sus probabilidades de recompensas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable}`}>
      <body suppressHydrationWarning className="bg-[var(--bg-primary)] text-slate-100 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
