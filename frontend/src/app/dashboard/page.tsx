"use client";

import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { DollarSign, TrendingUp, TrendingDown, AlertTriangle, Receipt, BarChart3, Plus, Calendar, Building, UserPlus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";
import { SimpleBarChart, FinancialAreaChart } from "@/components/dashboard/Charts";
import { StatCard } from "@/components/dashboard/ui/StatCard";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [financialSummary, setFinancialSummary] = useState<any>(null);
  const [evolutionData, setEvolutionData] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("30d");

  useEffect(() => {
    fetchData();
  }, [period]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const [statsRes, chartRes, financeRes, evolutionRes, alertsRes] = await Promise.all([
        fetch("http://localhost:3001/api/dashboard/stats", { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch("http://localhost:3001/api/dashboard/chart-data", { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch("http://localhost:3001/api/dashboard/financial-summary", { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch("http://localhost:3001/api/dashboard/financial-evolution", { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch("http://localhost:3001/api/dashboard/operational-alerts", { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      setMetrics(await statsRes.json());
      const chartDataRes = await chartRes.json();
      setChartData(chartDataRes.propertiesByStatus);
      setFinancialSummary(await financeRes.json());
      setEvolutionData(await evolutionRes.json());
      setAlerts(await alertsRes.json());
    } catch (error) {
      console.error("Erro ao carregar dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <div className="w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
      <p className="text-on-surface-variant font-medium">Carregando dados estratégicos...</p>
    </div>
  );

  return (
    <div className="space-y-6 pb-8 bg-surface">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-on-surface tracking-tight font-hanken">Dashboard</h1>
          <p className="text-on-surface-variant text-sm font-medium">Bem-vindo de volta, aqui está o resumo operacional.</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-surface-container-high p-1 rounded-lg flex items-center mr-2">
            {['7d', '30d', '90d', '12m'].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                  period === p
                    ? 'bg-secondary text-on-secondary shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {p.toUpperCase()}
              </button>
            ))}
          </div>

          <Link href="/imoveis/novo">
            <Button size="sm" className="gap-2 bg-primary hover:bg-primary-container text-on-primary border-none">
              <Building size={16} />
              <span className="hidden sm:inline">Imóvel</span>
            </Button>
          </Link>
          <Link href="/contratos/novo">
            <Button size="sm" variant="secondary" className="gap-2 border-secondary text-secondary hover:bg-secondary/5">
              <Plus size={16} />
              <span className="hidden sm:inline">Contrato</span>
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Imóveis"
          value={metrics?.totalProperties || 0}
          icon={BarChart3}
          variant="secondary"
        />
        <StatCard
          label="Vacância"
          value={`${metrics?.vacancyRate || 0}%`}
          icon={AlertTriangle}
          variant={metrics?.vacancyRate > 20 ? "error" : "warning"}
          sublabel={metrics?.vacancyRate > 20 ? "Taxa acima do ideal" : "Taxa saudável"}
        />
        <StatCard
          label="Novos Contratos"
          value={metrics?.newContracts || 0}
          icon={TrendingUp}
          variant="success"
          sublabel="Últimos 30 dias"
        />
        <StatCard
          label="A Receber (Mês)"
          value={formatCurrency(financialSummary?.pendingReceivables || 0)}
          icon={DollarSign}
          variant="default"
          sublabel="Previsão de entrada"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-8 shadow-sm border-outline-variant/30 bg-surface-container-lowest">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-lg font-bold text-on-surface">Evolução Financeira (6 meses)</CardTitle>
            <TrendingUp className="text-tertiary-fixed-dim" size={20} />
          </CardHeader>
          <CardContent><FinancialAreaChart data={evolutionData} /></CardContent>
        </Card>

        <Card className="lg:col-span-4 shadow-sm border-outline-variant/30 bg-surface-container-lowest">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-on-surface">Status dos Imóveis</CardTitle>
          </CardHeader>
          <CardContent><SimpleBarChart data={chartData} /></CardContent>
        </Card>

        <Card className="lg:col-span-12 shadow-sm border-outline-variant/30 bg-surface-container-lowest overflow-hidden">
          <CardHeader className="bg-surface-container-low/50 border-b border-outline-variant/20">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold flex items-center gap-2 text-on-surface">
                <Calendar size={20} className="text-secondary" />
                Contratos Próximos ao Vencimento
              </CardTitle>
              <Link href="/contratos" className="text-secondary text-sm font-bold hover:underline">Ver todos</Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {alerts.length === 0 ? (
              <div className="p-8 text-center text-on-surface-variant">Nenhum contrato a vencer nos próximos 30 dias.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-outline-variant/20 bg-surface-container-low/30">
                      <th className="text-left p-4 font-bold text-on-surface-variant uppercase tracking-wider">Inquilino</th>
                      <th className="text-left p-4 font-bold text-on-surface-variant uppercase tracking-wider">Imóvel</th>
                      <th className="text-left p-4 font-bold text-on-surface-variant uppercase tracking-wider">Vencimento</th>
                      <th className="text-right p-4 font-bold text-on-surface-variant uppercase tracking-wider">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10">
                    {alerts.map(a => (
                      <tr key={a.id} className="hover:bg-surface-container-low/50 transition-colors">
                        <td className="p-4 font-bold text-on-surface">{a.inquilino?.nome || "Inquilino não identificado"}</td>
                        <td className="p-4 text-on-surface-variant font-medium">{a.imovel?.endereco || "Endereço não identificado"}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                            new Date(a.dataFim) < new Date() ? 'bg-error-container text-on-error-container' : 'bg-tertiary-fixed text-on-tertiary-fixed'
                          }`}>
                            {new Date(a.dataFim).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <Link href={`/contratos/${a.id}`}>
                            <Button variant="ghost" size="sm" className="font-bold text-secondary hover:bg-secondary/10">Renovar</Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
