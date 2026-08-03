import { initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { onDocumentWritten } from "firebase-functions/v2/firestore";

initializeApp();

const db = getFirestore();

function calcularPrioridade(categoria: string) {
  const prioridades: Record<string, number> = {
    produtor: 1,
    familiar: 2,
    colaborador: 3,
    publico_geral: 4,
  };

  return prioridades[categoria] ?? 4;
}

function calcularPercentual(presencas: Array<{ presente: boolean }> = []) {
  if (presencas.length === 0) {
    return 0;
  }

  const presentes = presencas.filter((presenca) => presenca.presente).length;
  return Math.round((presentes / presencas.length) * 100);
}

export const derivarInscricao = onDocumentWritten(
  { document: "inscricoes/{inscricaoId}", region: "southamerica-east1" },
  async (event) => {
    const after = event.data?.after;

    if (!after?.exists) {
      return;
    }

    const inscricao = after.data();
    const percentualFrequencia = calcularPercentual(inscricao.presencas);
    const aptoCertificado = percentualFrequencia >= 80 && inscricao.aprovadoInstrutor === true;
    const prioridade = calcularPrioridade(inscricao.categoriaSnapshot);

    await after.ref.set(
      {
        percentualFrequencia,
        aptoCertificado,
        prioridade,
      },
      { merge: true },
    );
  },
);

export const atualizarVagasDaTurma = onDocumentWritten(
  { document: "inscricoes/{inscricaoId}", region: "southamerica-east1" },
  async (event) => {
    const after = event.data?.after;
    const before = event.data?.before;
    const turmaId = after?.data()?.turmaId ?? before?.data()?.turmaId;

    if (!turmaId) {
      return;
    }

    const snapshot = await db
      .collection("inscricoes")
      .where("turmaId", "==", turmaId)
      .where("status", "in", ["pendente", "confirmada", "concluida"])
      .get();

    await db.collection("turmas").doc(turmaId).set(
      {
        vagasPreenchidas: snapshot.size,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
  },
);

export const concluirComCertificado = onDocumentWritten(
  { document: "inscricoes/{inscricaoId}", region: "southamerica-east1" },
  async (event) => {
    const after = event.data?.after;

    if (!after?.exists) {
      return;
    }

    const inscricao = after.data();
    const wasCertificateIssued = event.data?.before.data()?.certificadoEmitido === true;

    if (!inscricao.certificadoEmitido || wasCertificateIssued || !inscricao.aptoCertificado) {
      return;
    }

    await db.collection("alunos").doc(inscricao.alunoId).set(
      {
        cursosConcluidos: FieldValue.arrayUnion(inscricao.cursoId),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
  },
);
