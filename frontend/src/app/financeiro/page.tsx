"use client";

import { useEffect, useState } from "react";
import { getApiUrl } from "@/lib/api";
import { DollarSign, TrendingUp, TrendingDown, AlertTriangle, ArrowRight, Receipt, BarChart3 } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";
import { SimpleBarChart } from "@/components/dashboard/Charts";
import { StatCard } from "@/components/dashboard/ui/StatCard";

export const dynamic = "force-dynamic";

interface FinancialSummary {
  receitas: { alugueisPagos: number; comissoes: number; total: number };
  despesas: { repassesProprietarios: number; despesasImoveis: number; total: number };
  inadimplencia: { quantidadeContratos: number; quantidadeRecibos: number; valorTotal: number };
  contratosAtivos: number;
  recibosPendentesMes: number;
  saldoLiquido: number;
}

export default function FinanceiroPage() {
  const [resumo, setResumo] = useState<FinancialSummary | null>(null);
  const [fluxoCaixa, setFluxoCaixa] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resumoRes, fluxoRes] = await Promise.all([
        fetch(getApiUrl("/financeiro/resumo")),
        fetch(getApiUrl("/financeiro/fluxo-caixa?dataInicio=2026-01-01&dataFim=2026-12-31"))
      ]);
      const resumoData = await resumoRes.json();
      const fluxoData = await fluxoRes.json();
      setResumo(resumoData);
      setFluxoCaixa(fluxoData.meses.map((m: any) => ({ name: m.label, value: m.saldo })));
    } catch (error) {
      console.error("Erro ao carregar dados financeiros:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted || loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-on-surface">Financeiro</h1>
        <div className="py-12 text-center text-on-surface-variant">Carregando dados financeiros...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-on-surface">Financeiro</h1>
        <p className="text-on-surface-variant">Visão geral financeira da imobiliária</p>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Receita (Comissões)"
          value={formatCurrency(resumo?.receitas.comissoes || 0)}
          icon={TrendingUp}
          variant="success"
        />
        <StatCard
          label="Aluguéis Recebidos"
          value={formatCurrency(resumo?.receitas.alugueisPagos || 0)}
          icon={DollarSign}
          variant="secondary"
        />
        <StatCard
          label="Despesas"
          value={formatCurrency(resumo?.despesas.despesasImoveis || 0)}
          icon={TrendingDown}
          variant="default"
        />
        <StatCard
          label="Inadimplência"
          value={formatCurrency(resumo?.inadimplencia.valorTotal || 0)}
          icon={AlertTriangle}
          variant="error"
          sublabel={`${resumo?.inadimplencia.quantidadeContratos || 0} contrato(s)`}
        />
      </div>

      {/* Indicadores Secundários */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          label="Contratos Ativos"
          value={resumo?.contratosAtivos || 0}
          icon={Receipt}
          variant="default"
        />
        <StatCard
          label="Recibos Pendentes (Mês)"
          value={resumo?.recibosPendentesMes || 0}
          icon={AlertTriangle}
          variant="warning"
        />
        <StatCard
          label="Saldo Líquido"
          value={formatCurrency(resumo?.saldoLiquido || 0)}
          icon={DollarSign}
          variant={(resumo?.saldoLiquido || 0) >= 0 ? 'success' : 'error'}
        />
      </div>

      {/* Gráfico de Fluxo de Caixa */}
      <Card>
        <CardHeader>
          <CardTitle>Fluxo de Caixa (Mensal)</CardTitle>
        </CardHeader>
        <CardContent>
          <SimpleBarChart data={fluxoCaixa} />
        </CardContent>
      </Card>

      {/* Ações Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/financeiro/inadimplencia">
              <Button variant="outline" className="w-full gap-2 h-12 justify-start">
                <AlertTriangle size={18} className="text-error" />
                <span>Inadimplência</span>
                <ArrowRight size={14} className="ml-auto" />
              </Button>
            </Link>
            <Link href="/financeiro/repasses">
              <Button variant="outline" className="w-full gap-2 h-12 justify-start">
                <DollarSign size={18} className="text-success" />
                <span>Repasses</span>
                <ArrowRight size={14} className="ml-auto" />
              </Button>
            </Link>
            <Link href="/financeiro/despesas">
              <Button variant="outline" className="w-full gap-2 h-12 justify-start">
                <Receipt size={18} className="text-secondary" />
                <span>Despesas</span>
                <ArrowRight size={14} className="ml-auto" />
              </Button>
            </Link>
            <Link href="/financeiro/recibos">
              <Button variant="outline" className="w-full gap-2 h-12 justify-start">
                <Receipt size={18} className="text-primary" />
                <span>Recibos</span>
                <ArrowRight size={14} className="ml-auto" />
              </Button>
            </Link>
            <Link href="/financeiro/relatorios">
              <Button variant="outline" className="w-full gap-2 h-12 justify-start">
                <BarChart3 size={18} className="text-on-surface-variant" />
                <span>Relatórios</span>
                <ArrowRight size={14} className="ml-auto" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
