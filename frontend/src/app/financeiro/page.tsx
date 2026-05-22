"use client";

import { useEffect, useState } from "react";
import { DollarSign, TrendingUp, TrendingDown, AlertTriangle, ArrowRight, Receipt, BarChart3, PieChart } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";

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
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchResumo();
  }, []);

  const fetchResumo = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:3001/api/financeiro/resumo");
      const result = await response.json();
      setResumo(result);
    } catch (error) {
      console.error("Erro ao carregar resumo financeiro:", error);
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
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase text-on-surface-variant tracking-wider">Receita (Comissões)</p>
                <p className="text-2xl font-bold text-success mt-1">
                  {formatCurrency(resumo?.receitas.comissoes || 0)}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                <TrendingUp size={20} className="text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase text-on-surface-variant tracking-wider">Aluguéis Recebidos</p>
                <p className="text-2xl font-bold text-secondary mt-1">
                  {formatCurrency(resumo?.receitas.alugueisPagos || 0)}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                <DollarSign size={20} className="text-secondary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase text-on-surface-variant tracking-wider">Despesas</p>
                <p className="text-2xl font-bold text-on-surface mt-1">
                  {formatCurrency(resumo?.despesas.despesasImoveis || 0)}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center">
                <TrendingDown size={20} className="text-on-surface-variant" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase text-on-surface-variant tracking-wider">Inadimplência</p>
                <p className="text-2xl font-bold text-error mt-1">
                  {formatCurrency(resumo?.inadimplencia.valorTotal || 0)}
                </p>
                <p className="text-xs text-error/70 mt-0.5">
                  {resumo?.inadimplencia.quantidadeContratos || 0} contrato(s)
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center">
                <AlertTriangle size={20} className="text-error" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Indicadores Secundários */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-xs font-bold uppercase text-on-surface-variant tracking-wider">Contratos Ativos</p>
            <p className="text-3xl font-bold text-on-surface mt-2">{resumo?.contratosAtivos || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-xs font-bold uppercase text-on-surface-variant tracking-wider">Recibos Pendentes (Mês)</p>
            <p className="text-3xl font-bold text-warning mt-2">{resumo?.recibosPendentesMes || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-xs font-bold uppercase text-on-surface-variant tracking-wider">Saldo Líquido</p>
            <p className={`text-3xl font-bold mt-2 ${(resumo?.saldoLiquido || 0) >= 0 ? 'text-success' : 'text-error'}`}>
              {formatCurrency(resumo?.saldoLiquido || 0)}
            </p>
          </CardContent>
        </Card>
      </div>

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
