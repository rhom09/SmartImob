import prisma from '../lib/prisma';
import { calcularTotalDevido, calcularComissao, calcularRepasse, CONSTANTES } from '../utils/financial';
import { startOfMonth, endOfMonth, addMonths, format } from 'date-fns';

export class FinancialService {
  // ─── Contratos Inadimplentes ──────────────────────────────────────
  static async getInadimplentes() {
    // Buscar todos os recibos vencidos e não pagos
    const overdueReceipts = await prisma.receipt.findMany({
      where: {
        status: 'PENDENTE',
        dataVencimento: { lt: new Date() },
      },
      include: {
        contrato: {
          include: {
            inquilino: true,
            imovel: { include: { owner: true } },
          },
        },
      },
      orderBy: { dataVencimento: 'asc' },
    });

    // Agrupar por contrato
    const contractsMap = new Map<string, any>();

    for (const receipt of overdueReceipts) {
      const cId = receipt.contratoId;
      const calculo = calcularTotalDevido(
        Number(receipt.valorBruto),
        receipt.dataVencimento
      );

      if (!contractsMap.has(cId)) {
        contractsMap.set(cId, {
          contratoId: cId,
          numeroContrato: receipt.contrato.numeroContrato,
          inquilino: {
            id: receipt.contrato.inquilino.id,
            nome: receipt.contrato.inquilino.nome,
            telefone: receipt.contrato.inquilino.telefone,
            email: receipt.contrato.inquilino.email,
          },
          imovel: {
            id: receipt.contrato.imovel.id,
            endereco: receipt.contrato.imovel.endereco,
          },
          recibosVencidos: [],
          totalDevido: 0,
        });
      }

      const contractData = contractsMap.get(cId)!;
      contractData.recibosVencidos.push({
        id: receipt.id,
        numeroRecibo: receipt.numeroRecibo,
        referenciaMes: receipt.referenciaMes,
        referenciaAno: receipt.referenciaAno,
        valorOriginal: calculo.valorOriginal,
        dataVencimento: receipt.dataVencimento,
        diasAtraso: calculo.diasAtraso,
        multa: calculo.multa,
        juros: calculo.juros,
        valorTotal: calculo.valorTotal,
      });
      contractData.totalDevido += calculo.valorTotal;
    }

    // Arredondar totais
    const result = Array.from(contractsMap.values()).map((c) => ({
      ...c,
      totalDevido: Number(c.totalDevido.toFixed(2)),
    }));

    // Ordenar por total devido (maior primeiro)
    return result.sort((a, b) => b.totalDevido - a.totalDevido);
  }

  // ─── Comissões ────────────────────────────────────────────────────
  static async getComissoes(filters: { dataInicio?: string; dataFim?: string }) {
    const where: any = {
      status: 'PAGO',
    };

    if (filters.dataInicio || filters.dataFim) {
      where.dataPagamento = {};
      if (filters.dataInicio) where.dataPagamento.gte = new Date(filters.dataInicio);
      if (filters.dataFim) where.dataPagamento.lte = new Date(filters.dataFim);
    }

    const paidReceipts = await prisma.receipt.findMany({
      where,
      include: {
        contrato: {
          include: {
            imovel: true,
            inquilino: true,
          },
        },
      },
      orderBy: { dataPagamento: 'asc' },
    });

    // Agrupar por mês/ano
    const monthsMap = new Map<string, any>();

    for (const receipt of paidReceipts) {
      const payDate = receipt.dataPagamento!;
      const key = `${payDate.getFullYear()}-${String(payDate.getMonth() + 1).padStart(2, '0')}`;
      const valorAluguel = Number(receipt.valorBruto);
      const comissao = calcularComissao(valorAluguel);

      if (!monthsMap.has(key)) {
        monthsMap.set(key, {
          mes: payDate.getMonth() + 1,
          ano: payDate.getFullYear(),
          totalAlugueis: 0,
          percentualComissao: CONSTANTES.TAXA_COMISSAO_PADRAO * 100,
          valorComissao: 0,
          contratos: [],
        });
      }

      const monthData = monthsMap.get(key)!;
      monthData.totalAlugueis += valorAluguel;
      monthData.valorComissao += comissao;
      monthData.contratos.push({
        contratoId: receipt.contratoId,
        numeroContrato: receipt.contrato.numeroContrato,
        inquilino: receipt.contrato.inquilino.nome,
        imovel: receipt.contrato.imovel.endereco,
        valorAluguel,
        comissao,
      });
    }

    return Array.from(monthsMap.values()).map((m) => ({
      ...m,
      totalAlugueis: Number(m.totalAlugueis.toFixed(2)),
      valorComissao: Number(m.valorComissao.toFixed(2)),
    }));
  }

  // ─── Repasses aos Proprietários ───────────────────────────────────
  static async getRepasses(filters: { dataInicio?: string; dataFim?: string }) {
    const receiptWhere: any = { status: 'PAGO' };

    if (filters.dataInicio || filters.dataFim) {
      receiptWhere.dataPagamento = {};
      if (filters.dataInicio) receiptWhere.dataPagamento.gte = new Date(filters.dataInicio);
      if (filters.dataFim) receiptWhere.dataPagamento.lte = new Date(filters.dataFim);
    }

    const paidReceipts = await prisma.receipt.findMany({
      where: receiptWhere,
      include: {
        contrato: {
          include: {
            imovel: { include: { owner: true } },
            inquilino: true,
            despesas: {
              where: { status: 'PAGO' },
            },
          },
        },
      },
    });

    // Agrupar por proprietário
    const ownersMap = new Map<string, any>();

    for (const receipt of paidReceipts) {
      const owner = receipt.contrato.imovel.owner;
      const ownerId = owner.id;
      const valorAluguel = Number(receipt.valorBruto);
      const comissao = calcularComissao(valorAluguel);

      // Despesas do contrato no período
      const totalDespesas = receipt.contrato.despesas.reduce(
        (sum, d) => sum + Number(d.valor), 0
      );

      // Despesas rateadas por recibo (simplificação)
      const totalRecibos = paidReceipts.filter((r) => r.contratoId === receipt.contratoId).length;
      const despesasPorRecibo = totalRecibos > 0 ? totalDespesas / totalRecibos : 0;
      const repasse = calcularRepasse(valorAluguel, CONSTANTES.TAXA_COMISSAO_PADRAO, despesasPorRecibo);

      if (!ownersMap.has(ownerId)) {
        ownersMap.set(ownerId, {
          proprietarioId: ownerId,
          proprietarioNome: owner.nome,
          contratos: [],
          totalRepasse: 0,
        });
      }

      const ownerData = ownersMap.get(ownerId)!;

      // Verificar se já adicionou esse contrato
      const existing = ownerData.contratos.find(
        (c: any) => c.contratoId === receipt.contratoId
      );

      if (existing) {
        existing.valorAluguel += valorAluguel;
        existing.comissao += comissao;
        existing.despesas += despesasPorRecibo;
        existing.valorRepasse += repasse;
      } else {
        ownerData.contratos.push({
          contratoId: receipt.contratoId,
          numeroContrato: receipt.contrato.numeroContrato,
          imovelEndereco: receipt.contrato.imovel.endereco,
          valorAluguel,
          comissao,
          despesas: despesasPorRecibo,
          valorRepasse: repasse,
        });
      }
      ownerData.totalRepasse += repasse;
    }

    return Array.from(ownersMap.values()).map((o) => ({
      ...o,
      totalRepasse: Number(o.totalRepasse.toFixed(2)),
      contratos: o.contratos.map((c: any) => ({
        ...c,
        valorAluguel: Number(c.valorAluguel.toFixed(2)),
        comissao: Number(c.comissao.toFixed(2)),
        despesas: Number(c.despesas.toFixed(2)),
        valorRepasse: Number(c.valorRepasse.toFixed(2)),
      })),
    }));
  }

  // ─── Fluxo de Caixa ──────────────────────────────────────────────
  static async getFluxoCaixa(filters: { dataInicio: string; dataFim: string }) {
    const inicio = new Date(filters.dataInicio);
    const fim = new Date(filters.dataFim);

    const meses: any[] = [];
    let current = startOfMonth(inicio);
    let saldoAcumulado = 0;

    while (current <= fim) {
      const mesInicio = startOfMonth(current);
      const mesFim = endOfMonth(current);

      // Receitas: recibos pagos no mês
      const recibosPagos = await prisma.receipt.findMany({
        where: {
          status: 'PAGO',
          dataPagamento: {
            gte: mesInicio,
            lte: mesFim,
          },
        },
      });

      const totalAlugueis = recibosPagos.reduce((sum, r) => sum + Number(r.valorBruto), 0);
      const totalComissoes = totalAlugueis * CONSTANTES.TAXA_COMISSAO_PADRAO;

      // Despesas pagas no mês
      const despesasPagas = await prisma.expense.findMany({
        where: {
          status: 'PAGO',
          dataPagamento: {
            gte: mesInicio,
            lte: mesFim,
          },
        },
      });

      const totalDespesas = despesasPagas.reduce((sum, d) => sum + Number(d.valor), 0);
      const totalRepasses = totalAlugueis - totalComissoes;

      const receitas = totalComissoes; // Receita da imobiliária = comissões
      const despesas = totalDespesas;
      const saldo = receitas - despesas;
      saldoAcumulado += saldo;

      meses.push({
        mes: current.getMonth() + 1,
        ano: current.getFullYear(),
        label: format(current, 'MMM/yyyy'),
        receitas: {
          alugueis: Number(totalAlugueis.toFixed(2)),
          comissoes: Number(totalComissoes.toFixed(2)),
        },
        despesas: {
          repasses: Number(totalRepasses.toFixed(2)),
          despesasImoveis: Number(totalDespesas.toFixed(2)),
        },
        saldo: Number(saldo.toFixed(2)),
        saldoAcumulado: Number(saldoAcumulado.toFixed(2)),
      });

      current = addMonths(current, 1);
    }

    return { meses };
  }

  // ─── Resumo Financeiro ────────────────────────────────────────────
  static async getResumo(filters: { dataInicio?: string; dataFim?: string }) {
    const now = new Date();
    const inicio = filters.dataInicio
      ? new Date(filters.dataInicio)
      : startOfMonth(now);
    const fim = filters.dataFim
      ? new Date(filters.dataFim)
      : endOfMonth(now);

    // Recibos pagos no período
    const recibosPagos = await prisma.receipt.findMany({
      where: {
        status: 'PAGO',
        dataPagamento: { gte: inicio, lte: fim },
      },
    });

    const totalAlugueisPagos = recibosPagos.reduce(
      (sum, r) => sum + Number(r.valorBruto), 0
    );
    const totalComissoes = totalAlugueisPagos * CONSTANTES.TAXA_COMISSAO_PADRAO;
    const totalRepasses = totalAlugueisPagos - totalComissoes;

    // Despesas pagas no período
    const despesasPagas = await prisma.expense.aggregate({
      where: {
        status: 'PAGO',
        dataPagamento: { gte: inicio, lte: fim },
      },
      _sum: { valor: true },
    });
    const totalDespesasImoveis = Number(despesasPagas._sum.valor || 0);

    // Inadimplência (recibos vencidos e pendentes)
    const recibosInadimplentes = await prisma.receipt.findMany({
      where: {
        status: 'PENDENTE',
        dataVencimento: { lt: new Date() },
      },
    });

    const totalInadimplencia = recibosInadimplentes.reduce(
      (sum, r) => {
        const calc = calcularTotalDevido(Number(r.valorBruto), r.dataVencimento);
        return sum + calc.valorTotal;
      }, 0
    );

    // Contagem de contratos ativos
    const contratosAtivos = await prisma.contract.count({
      where: { status: 'ATIVO' },
    });

    // Recibos pendentes do mês atual
    const recibosPendentes = await prisma.receipt.count({
      where: {
        status: 'PENDENTE',
        dataVencimento: { gte: startOfMonth(now), lte: endOfMonth(now) },
      },
    });

    return {
      periodo: { dataInicio: inicio, dataFim: fim },
      receitas: {
        alugueisPagos: Number(totalAlugueisPagos.toFixed(2)),
        comissoes: Number(totalComissoes.toFixed(2)),
        total: Number((totalAlugueisPagos + totalComissoes).toFixed(2)),
      },
      despesas: {
        repassesProprietarios: Number(totalRepasses.toFixed(2)),
        despesasImoveis: Number(totalDespesasImoveis.toFixed(2)),
        total: Number((totalRepasses + totalDespesasImoveis).toFixed(2)),
      },
      inadimplencia: {
        quantidadeContratos: new Set(recibosInadimplentes.map((r) => r.contratoId)).size,
        quantidadeRecibos: recibosInadimplentes.length,
        valorTotal: Number(totalInadimplencia.toFixed(2)),
      },
      contratosAtivos,
      recibosPendentesMes: recibosPendentes,
      saldoLiquido: Number((totalComissoes - totalDespesasImoveis).toFixed(2)),
    };
  }
}
