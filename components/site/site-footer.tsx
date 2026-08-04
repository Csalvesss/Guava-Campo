import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { CookieSettingsButton } from "@/components/privacy/cookie-settings-button";
import { Brand } from "@/components/ui/brand";
import { contato } from "@/lib/site-content";

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden bg-pine text-cream">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage:
            "repeating-radial-gradient(circle at 85% -10%, rgba(216,161,58,0.6) 0 1px, transparent 1px 26px)",
        }}
        aria-hidden
      />
      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Brand tone="light" href={null} size="lg" />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-cream/75">
              Portal de mobilização dos cursos gratuitos do SENAR-SP, feito para o produtor,
              o trabalhador rural e a família do campo de {contato.municipio}.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <Image src="/senar-sp.png" alt="SENAR São Paulo" width={54} height={54} className="size-12 rounded-lg bg-white p-1.5 object-contain" />
              <p className="text-xs leading-snug text-cream/70">
                {contato.sistema}
                <br />
                {contato.regiao}
              </p>
            </div>
          </div>

          <div>
            <h3 className="font-display text-lg text-white">Navegar</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-cream/75">
              <li><Link href="/#cursos" className="hover:text-harvest">Cursos abertos</Link></li>
              <li><Link href="/#como-funciona" className="hover:text-harvest">Como funciona</Link></li>
              <li><Link href="/#eixos" className="hover:text-harvest">Áreas de capacitação</Link></li>
              <li><Link href="/#duvidas" className="hover:text-harvest">Dúvidas frequentes</Link></li>
              <li><Link href="/entrar?perfil=aluno" className="hover:text-harvest">Área do aluno</Link></li>
              <li><Link href="/entrar?perfil=sindicato" className="hover:text-harvest">Área do sindicato</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-display text-lg text-white">Fale com o sindicato</h3>
            <ul className="mt-4 space-y-3 text-sm text-cream/75">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 size-4 shrink-0 text-harvest" aria-hidden />
                {contato.endereco}
              </li>
              <li className="flex items-start gap-3">
                <Phone className="mt-0.5 size-4 shrink-0 text-harvest" aria-hidden />
                {contato.telefone}
              </li>
              <li className="flex items-start gap-3">
                <Mail className="mt-0.5 size-4 shrink-0 text-harvest" aria-hidden />
                <a href={`mailto:${contato.email}`} className="break-all hover:text-harvest">
                  {contato.email}
                </a>
              </li>
            </ul>
            <p className="mt-4 text-xs text-cream/55">{contato.horario}</p>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/12 pt-6 text-xs text-cream/55 lg:flex-row lg:items-center lg:justify-between">
          <p>© {new Date().getFullYear()} {contato.nome}. Cursos gratuitos SENAR-SP.</p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link href="/politica-de-privacidade" className="hover:text-harvest">Política de Privacidade</Link>
            <Link href="/politica-de-cookies" className="hover:text-harvest">Política de Cookies</Link>
            <CookieSettingsButton />
          </div>
          <p>Presidente {contato.presidente} · {contato.sistema}</p>
        </div>
      </div>
    </footer>
  );
}
