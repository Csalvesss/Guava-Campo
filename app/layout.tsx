import type { Metadata } from "next";
import { Fraunces, Hanken_Grotesk } from "next/font/google";
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
    "Portal de cursos gratuitos SENAR-SP mobilizados pelo Sindicato Rural de São José dos Campos. Pré-inscrição online, área do aluno e gestão completa para o sindicato rural.",
  keywords: [
    "SENAR-SP",
    "Sindicato Rural",
    "São José dos Campos",
    "cursos rurais gratuitos",
    "Formação Profissional Rural",
    "Vale do Paraíba",
  ],
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: siteUrl,
    siteName: "Sindicato Rural de São José dos Campos",
    title: "Cursos SENAR-SP em São José dos Campos",
    description:
      "Capacitação gratuita para o produtor rural e sua família. Pré-inscrição online mobilizada pelo Sindicato Rural de São José dos Campos.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Cursos SENAR do Sindicato Rural de São José dos Campos" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cursos SENAR-SP em São José dos Campos",
    description: "Pré-inscrição online para cursos gratuitos mobilizados pelo Sindicato Rural de São José dos Campos.",
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
      <body className="antialiased">{children}</body>
    </html>
  );
}
