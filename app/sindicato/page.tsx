import type { Metadata } from "next";
import { SindicatoDashboard } from "@/components/sindicato/sindicato-dashboard";
import { StoreProvider } from "@/lib/store";

export const metadata: Metadata = {
  title: "Área do sindicato",
  description: "Gestão de turmas, pré-inscrições, frequência e prestação de contas ao SENAR-SP.",
};

export default function SindicatoPage() {
  return (
    <StoreProvider>
      <SindicatoDashboard />
    </StoreProvider>
  );
}
