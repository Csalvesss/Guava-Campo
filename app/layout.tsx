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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://guava-campo.netlify.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Guava Campo | Sindicato Rural de São José dos Campos",
  description:
    "Plataforma de gestão de cursos SENAR para sindicatos rurais, com inscrições, frequência, WhatsApp e certificados.",
  openGraph: {
    title: "Guava Campo",
    description:
      "Portal do aluno e painel de gestão SENAR para o Sindicato Rural de São José dos Campos.",
    images: [
      {
        url: "/og.svg",
        width: 1200,
        height: 630,
        alt: "Guava Campo para cursos SENAR",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Guava Campo",
    description:
      "Cursos SENAR, inscrições, frequência e certificados para sindicatos rurais.",
    images: ["/og.svg"],
  },
  icons: {
    icon: "/sindicato-sjc.svg",
    apple: "/sindicato-sjc.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
