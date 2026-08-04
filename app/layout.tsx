import type { Metadata } from "next";
import { Fraunces, Hanken_Grotesk } from "next/font/google";
import { CookieConsent } from "@/components/privacy/cookie-consent";
import "./globals.css";

const display = Fraunces({
  variable: "--ff-display",
  subsets: ["latin"],
  display: "swap",
  axes: ["opsz", "SOFT"],
});

const sans = Hanken_Grotesk({
  variable: "--ff-body",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://guavacampo.netlify.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Sindicato Rural de São José dos Campos | Cursos SENAR-SP",
    template: "%s · Sindicato Rural de São José dos Campos",
  },
  description:
    "Portal de cursos gratuitos SENAR-SP em São José dos Campos e Caçapava. Pré-inscrição online e acompanhamento pela área do aluno.",
  keywords: [
    "SENAR-SP",
    "Sindicato Rural",
    "São José dos Campos",
    "Caçapava",
    "cursos rurais gratuitos",
    "Formação Profissional Rural",
  ],
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: siteUrl,
    siteName: "Sindicato Rural de São José dos Campos",
    title: "Cursos SENAR-SP em São José dos Campos e Caçapava",
    description:
      "Capacitação gratuita para o produtor rural e sua família em São José dos Campos e Caçapava.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Cursos SENAR do Sindicato Rural de São José dos Campos" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cursos SENAR-SP em São José dos Campos e Caçapava",
    description: "Pré-inscrição online para cursos gratuitos do SENAR-SP em São José dos Campos e Caçapava.",
    images: ["/og.png"],
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
    <html lang="pt-BR" className={`${display.variable} ${sans.variable}`}>
      <body className="antialiased">
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}
