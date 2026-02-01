import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Footer } from "@/components/Footer";
import { ToastProvider } from "@/components/ui";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Expert-Financement | Dossiers Bancaires Professionnels",
  description: "Construisez votre dossier de financement complet pour banques et investisseurs. Business plan, prévisionnel financier sur 3 ans et aide a la creation d'entreprise.",
  keywords: ["financement", "credit pro", "business plan", "banque", "previsionnel", "investisseurs", "creation entreprise", "BNC", "2035"],
};

export const viewport: Viewport = {
  themeColor: "#18181b",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${inter.variable} font-sans antialiased bg-background text-foreground`}>
        <ToastProvider>
          {children}
          <Footer />
        </ToastProvider>
      </body>
    </html>
  );
}
