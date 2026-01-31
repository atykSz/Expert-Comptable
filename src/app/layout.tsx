import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Footer } from "@/components/Footer";
import { ToastProvider } from "@/components/ui";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Expert-Financement | Outil de dossiers bancaires pour professionnels",
  description: "Créez votre dossier de financement complet pour banques et investisseurs. Business plan, prévisionnel financier et aide à la création d'entreprise.",
  keywords: ["financement", "crédit pro", "business plan", "banque", "prévisionnel", "investisseurs", "création entreprise"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${inter.variable} font-sans antialiased bg-gray-50`}>
        <ToastProvider>
          {children}
          <Footer />
        </ToastProvider>
      </body>
    </html>
  );
}
