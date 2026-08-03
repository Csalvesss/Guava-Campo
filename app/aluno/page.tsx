import type { Metadata } from "next";
import { AlunoDashboard } from "@/components/aluno/aluno-dashboard";
import { StoreProvider } from "@/lib/store";

export const metadata: Metadata = {
  title: "Área do aluno",
  description: "Acompanhe suas inscrições, turmas e certificados dos cursos SENAR.",
};

export default function AlunoPage() {
  return (
    <StoreProvider>
      <AlunoDashboard />
    </StoreProvider>
  );
}
