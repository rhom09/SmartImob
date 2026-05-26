"use client";

import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { DollarSign, TrendingUp, TrendingDown, AlertTriangle, Receipt, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/utils";
import { SimpleBarChart, FinancialAreaChart } from "@/components/dashboard/Charts";
import { StatCard } from "@/components/dashboard/ui/StatCard";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [financialSummary, setFinancialSummary] = useState<any>(null);
  const [evolutionData, setEvolutionData] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

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

  if (loading) return <div className="p-8 text-center text-on-surface-variant">Carregando dashboard...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-on-surface">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Imóveis" value={metrics?.totalProperties || 0} icon={BarChart3} variant="secondary" />
        <StatCard label="Vacância" value={`${metrics?.vacancyRate || 0}%`} icon={AlertTriangle} variant={metrics?.vacancyRate > 20 ? "error" : "warning"} />
        <StatCard label="Novos Contratos" value={metrics?.newContracts || 0} icon={TrendingUp} variant="success" />
        <StatCard label="A Receber (Mês)" value={formatCurrency(financialSummary?.pendingReceivables || 0)} icon={DollarSign} variant="default" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-8">
          <CardHeader><CardTitle>Evolução Financeira (6 meses)</CardTitle></CardHeader>
          <CardContent><FinancialAreaChart data={evolutionData} /></CardContent>
        </Card>

        <Card className="lg:col-span-4">
          <CardHeader><CardTitle>Status dos Imóveis</CardTitle></CardHeader>
          <CardContent><SimpleBarChart data={chartData} /></CardContent>
        </Card>

        <Card className="lg:col-span-12">
          <CardHeader><CardTitle>Contratos Próximos ao Vencimento</CardTitle></CardHeader>
          <CardContent>
            {alerts.length === 0 ? <p className="text-muted">Nenhum contrato a vencer.</p> : (
              <ul className="space-y-2">
                {alerts.map(a => <li key={a.id} className="p-2 border-b flex justify-between">{a.inquilino.nome} - <span>Venc: {new Date(a.dataFim).toLocaleDateString()}</span></li>)}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
