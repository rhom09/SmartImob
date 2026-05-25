"use client";

import { useEffect, useState } from "react";
import { DollarSign, TrendingUp, TrendingDown, AlertTriangle, Receipt, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/utils";
import { SimpleBarChart } from "@/components/dashboard/Charts";
import { StatCard } from "@/components/dashboard/ui/StatCard";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, chartRes] = await Promise.all([
        fetch("http://localhost:3001/api/dashboard/stats"),
        fetch("http://localhost:3001/api/dashboard/chart-data")
      ]);
      setMetrics(await statsRes.json());
      const chartDataRes = await chartRes.json();
      setChartData(chartDataRes.propertiesByStatus);
    } catch (error) {
      console.error("Erro ao carregar dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-on-surface-variant">Carregando dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-on-surface">Dashboard</h1>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Imóveis"
          value={metrics?.totalProperties || 0}
          icon={BarChart3}
          variant="secondary"
        />
        <StatCard
          label="Taxa de Vacância"
          value={`${metrics?.vacancyRate || 0}%`}
          icon={AlertTriangle}
          variant={metrics?.vacancyRate > 20 ? "error" : "warning"}
        />
        <StatCard
          label="Novos Contratos (30d)"
          value={metrics?.newContracts || 0}
          icon={TrendingUp}
          variant="success"
        />
        <StatCard
          label="Inquilinos Ativos"
          value={metrics?.activeTenants || 0}
          icon={Receipt}
          variant="default"
        />
      </div>

      {/* Gráficos */}
      <Card>
        <CardHeader>
          <CardTitle>Status dos Imóveis</CardTitle>
        </CardHeader>
        <CardContent>
          <SimpleBarChart data={chartData} />
        </CardContent>
      </Card>
    </div>
  );
}
