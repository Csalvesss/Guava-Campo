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
  title: "Cursos SENAR | Sindicato Rural de São José dos Campos",
  description:
    "Cursos SENAR mobilizados pelo Sindicato Rural de São José dos Campos, com pré-inscrição online para produtores e trabalhadores rurais.",
  openGraph: {
    title: "Cursos SENAR em São José dos Campos",
    description:
      "Pré-inscrição online para cursos mobilizados pelo Sindicato Rural de São José dos Campos.",
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
    title: "Cursos SENAR em São José dos Campos",
    description:
      "Pré-inscrição online para cursos mobilizados pelo Sindicato Rural de São José dos Campos.",
    images: ["/og.svg"],
  },
  icons: {
    icon: "/sindicato-sjc.png",
    apple: "/sindicato-sjc.png",
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
