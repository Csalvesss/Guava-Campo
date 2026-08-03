import type { CategoriaAluno } from "./types";
import type { NovoAlunoInput, Certificado } from "./store";

/** Dispara o download de um Blob no navegador. */
export function downloadBlob(filename: string, content: BlobPart, mime: string) {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Baixa a partir de um data: URL (arquivo já embutido, ex.: certificado subido). */
export function downloadDataUrl(filename: string, dataUrl: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function escapeCsv(value: string): string {
  if (/[",\n;]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

/** Gera CSV (separador ";" — padrão pt-BR no Excel) e dispara o download. */
export function downloadCSV(filename: string, header: string[], rows: (string | number)[][]) {
  const lines = [header, ...rows].map((row) =>
    row.map((cell) => escapeCsv(String(cell))).join(";"),
  );
  // BOM para acentuação correta no Excel.
  downloadBlob(filename, "﻿" + lines.join("\r\n"), "text/csv;charset=utf-8");
}

export function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

const categoriaMap: Record<string, CategoriaAluno> = {
  produtor: "produtor",
  "produtor rural": "produtor",
  familiar: "familiar",
  "familiar de produtor": "familiar",
  colaborador: "colaborador",
  "colaborador de produtor": "colaborador",
  "publico geral": "publico_geral",
  "público geral": "publico_geral",
  publico_geral: "publico_geral",
};

/**
 * Parser simples de CSV para importação de alunos (migração do SENAR).
 * Aceita cabeçalho com: nome, cpf, telefone, categoria, municipio, atividade, associado.
 * Separador ";" ou ",".
 */
export function parseAlunosCSV(text: string): NovoAlunoInput[] {
  const clean = text.replace(/^﻿/, "").trim();
  if (!clean) return [];
  const linhas = clean.split(/\r?\n/).filter((l) => l.trim());
  if (linhas.length < 2) return [];

  const sep = linhas[0].includes(";") ? ";" : ",";
  const header = linhas[0].split(sep).map((h) => h.trim().toLowerCase());
  const idx = (name: string) => header.findIndex((h) => h.includes(name));

  const iNome = idx("nome");
  const iCpf = idx("cpf");
  const iTel = header.findIndex((h) => h.includes("telefone") || h.includes("whats") || h.includes("fone"));
  const iCat = idx("categoria");
  const iMun = header.findIndex((h) => h.includes("munic") || h.includes("cidade"));
  const iAtiv = header.findIndex((h) => h.includes("ativ"));
  const iAssoc = idx("associ");

  const out: NovoAlunoInput[] = [];
  for (let r = 1; r < linhas.length; r++) {
    const cols = splitCsvLine(linhas[r], sep);
    const nome = (cols[iNome] ?? "").trim();
    if (!nome) continue;
    const catRaw = (cols[iCat] ?? "").trim().toLowerCase();
    out.push({
      nome,
      cpf: (cols[iCpf] ?? "").trim(),
      telefone: (cols[iTel] ?? "").trim(),
      categoria: categoriaMap[catRaw] ?? "produtor",
      municipio: (cols[iMun] ?? "São José dos Campos").trim() || "São José dos Campos",
      atividadePrincipal: (cols[iAtiv] ?? "Não informado").trim() || "Não informado",
      associado: /^(sim|s|true|1|x)$/i.test((cols[iAssoc] ?? "").trim()),
    });
  }
  return out;
}

function splitCsvLine(line: string, sep: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === sep && !inQuotes) {
      out.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}

/** Certificado de fallback (HTML imprimível) quando o sindicato ainda não subiu o PDF do SENAR. */
export function gerarCertificadoHTML(cert: Certificado): string {
  const data = new Intl.DateTimeFormat("pt-BR").format(new Date(cert.emitidoEm));
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
<title>Certificado — ${cert.alunoNome}</title>
<style>
  @page { size: A4 landscape; margin: 0; }
  body { margin:0; font-family: Georgia, serif; color:#12281c; }
  .cert { width: 297mm; height: 200mm; box-sizing: border-box; padding: 26mm 30mm;
    background:#fbf8f1; border: 10px solid #1b4332; position: relative; }
  .bar { position:absolute; inset:0; border: 2px solid #d8a13a; margin: 6mm; pointer-events:none; }
  .kick { letter-spacing:.35em; text-transform:uppercase; font-size:12px; color:#2d6a4f; }
  h1 { font-size:44px; margin:14px 0 4px; }
  .name { font-size:34px; margin:22px 0 6px; color:#1b4332; }
  .muted { color:#4a5b52; font-size:15px; line-height:1.6; max-width:190mm; }
  .row { display:flex; justify-content:space-between; margin-top:40px; font-size:13px; }
  .code { font-family: monospace; color:#1b4332; }
</style></head>
<body><div class="cert"><div class="bar"></div>
  <p class="kick">SENAR-SP · Sindicato Rural de São José dos Campos</p>
  <h1>Certificado de Conclusão</h1>
  <p class="muted">Certificamos que</p>
  <p class="name">${cert.alunoNome}</p>
  <p class="muted">concluiu o curso <strong>${cert.cursoNome}</strong>, com carga horária de
  ${cert.cargaHoraria} horas, promovido pelo Serviço Nacional de Aprendizagem Rural (SENAR-SP)
  e mobilizado pelo Sindicato Rural de São José dos Campos.</p>
  <div class="row">
    <span>Emitido em ${data}</span>
    <span>Código de validação: <span class="code">${cert.codigo}</span></span>
  </div>
</div></body></html>`;
}
