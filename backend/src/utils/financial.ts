import { differenceInCalendarDays } from 'date-fns';

// ─── Constantes Financeiras ─────────────────────────────────────────
const TAXA_JUROS_MENSAL = 0.01;     // 1% ao mês (padrão brasileiro)
const TAXA_MULTA = 0.02;            // 2% de multa por atraso
const TAXA_COMISSAO_PADRAO = 0.08;  // 8% de comissão de administração

// ─── Cálculo de Dias de Atraso ──────────────────────────────────────
export function getDiasAtraso(dataVencimento: Date, dataReferencia: Date = new Date()): number {
  const dias = differenceInCalendarDays(dataReferencia, new Date(dataVencimento));
  return dias > 0 ? dias : 0;
}

// ─── Verifica se está vencido ───────────────────────────────────────
export function estaVencido(dataVencimento: Date, dataReferencia: Date = new Date()): boolean {
  return getDiasAtraso(dataVencimento, dataReferencia) > 0;
}

// ─── Cálculo de Juros (1% ao mês, pro rata diário) ─────────────────
export function calcularJuros(valorOriginal: number, dataVencimento: Date, dataPagamento: Date = new Date()): number {
  const diasAtraso = getDiasAtraso(dataVencimento, dataPagamento);
  if (diasAtraso <= 0) return 0;
  return Number((valorOriginal * TAXA_JUROS_MENSAL * diasAtraso / 30).toFixed(2));
}

// ─── Cálculo de Multa (2% flat) ─────────────────────────────────────
export function calcularMulta(valorOriginal: number, dataVencimento: Date, dataPagamento: Date = new Date()): number {
  const diasAtraso = getDiasAtraso(dataVencimento, dataPagamento);
  if (diasAtraso <= 0) return 0;
  return Number((valorOriginal * TAXA_MULTA).toFixed(2));
}

// ─── Cálculo do Total Devido ────────────────────────────────────────
export function calcularTotalDevido(
  valorOriginal: number,
  dataVencimento: Date,
  dataPagamento: Date = new Date()
): {
  valorOriginal: number;
  multa: number;
  juros: number;
  valorTotal: number;
  diasAtraso: number;
} {
  const diasAtraso = getDiasAtraso(dataVencimento, dataPagamento);
  const multa = calcularMulta(valorOriginal, dataVencimento, dataPagamento);
  const juros = calcularJuros(valorOriginal, dataVencimento, dataPagamento);
  const valorTotal = Number((valorOriginal + multa + juros).toFixed(2));

  return { valorOriginal, multa, juros, valorTotal, diasAtraso };
}

// ─── Cálculo de Comissão de Administração ───────────────────────────
export function calcularComissao(valorAluguel: number, taxaComissao: number = TAXA_COMISSAO_PADRAO): number {
  return Number((valorAluguel * taxaComissao).toFixed(2));
}

// ─── Cálculo de Repasse ao Proprietário ─────────────────────────────
export function calcularRepasse(
  valorAluguel: number,
  taxaComissao: number = TAXA_COMISSAO_PADRAO,
  totalDespesas: number = 0
): number {
  const comissao = calcularComissao(valorAluguel, taxaComissao);
  return Number((valorAluguel - comissao - totalDespesas).toFixed(2));
}

// ─── Exportar constantes para uso externo ───────────────────────────
export const CONSTANTES = {
  TAXA_JUROS_MENSAL,
  TAXA_MULTA,
  TAXA_COMISSAO_PADRAO,
};
