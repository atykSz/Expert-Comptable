import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Footer } from "@/components/Footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Expert-Comptable | SAAS Prévisionnel Comptable",
  description: "Solution d'expertise comptable aux normes françaises - Prévisionnels, comptes de résultat, bilans et plans de trésorerie",
  keywords: ["expert-comptable", "prévisionnel", "business plan", "comptabilité", "PCG", "France"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${inter.variable} font-sans antialiased bg-gray-50`}>
        {children}
        <Footer />
      </body>
    </html>
  );
}
