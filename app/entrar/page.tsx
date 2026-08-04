import type { Metadata } from "next";
import { AccessPortal } from "@/components/access/access-portal";

export const metadata: Metadata = {
  title: "Entrar",
  description:
    "Acesse a área do aluno ou a área de gestão do Sindicato Rural de São José dos Campos.",
};

export default async function EntrarPage({
  searchParams,
}: {
  searchParams: Promise<{ perfil?: string; curso?: string }>;
}) {
  const { perfil, curso } = await searchParams;
  const initialPerfil = perfil === "sindicato" ? "sindicato" : "aluno";
  return <AccessPortal initialPerfil={initialPerfil} courseId={curso} />;
}
