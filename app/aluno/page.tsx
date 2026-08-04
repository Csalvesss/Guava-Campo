import type { Metadata } from "next";
import { AlunoArea } from "@/components/aluno/aluno-area";
import { StoreProvider } from "@/lib/store";

export const metadata: Metadata = {
  title: "Área do aluno",
  description: "Acompanhe suas inscrições, turmas e certificados dos cursos SENAR.",
};

export default async function AlunoPage({
  searchParams,
}: {
  searchParams: Promise<{ curso?: string }>;
}) {
  const { curso } = await searchParams;
  return (
    <StoreProvider>
      <AlunoArea courseId={curso} />
    </StoreProvider>
  );
}
