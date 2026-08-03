import type { Metadata } from "next";
import { AlunoDashboard } from "@/components/aluno/aluno-dashboard";

export const metadata: Metadata = {
  title: "Área do aluno",
  description: "Acompanhe suas inscrições, turmas e certificados dos cursos SENAR.",
};

export default function AlunoPage() {
  return <AlunoDashboard />;
}
