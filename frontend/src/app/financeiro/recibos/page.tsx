"use client";

import { useState, useEffect } from "react";
import { getApiUrl } from "@/lib/api";
import { Plus, Search, FileText, XCircle, CheckCircle, FileDown, Clock } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatCurrency, formatDate } from "@/lib/utils";

interface Contrato {
  id: string;
  inquilino: { nome: string };
  imovel: { endereco: string };
}

interface Recibo {
  id: string;
  numeroRecibo: string;
  contrato: Contrato;
  referenciaMes: number;
  referenciaAno: number;
  valorLiquido: string | number;
  dataVencimento: string;
  dataPagamento: string | null;
  status: "PENDENTE" | "PAGO" | "ATRASADO" | "CANCELADO";
}

export default function RecibosPage() {
  const [recibos, setRecibos] = useState<Recibo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("TODOS");
  const [mesFilter, setMesFilter] = useState("");
  const [anoFilter, setAnoFilter] = useState(new Date().getFullYear().toString());

  useEffect(() => {
    fetchRecibos();
  }, [statusFilter, mesFilter, anoFilter]);

  const fetchRecibos = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (statusFilter !== "TODOS") params.append("status", statusFilter);
      if (mesFilter) params.append("mes", mesFilter);
      if (anoFilter) params.append("ano", anoFilter);

      const res = await fetch(getApiUrl(`/recibos?${params.toString()}`));
      const data = await res.json();
      setRecibos(data);
    } catch (error) {
      console.error("Erro ao buscar recibos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRecibos();
  };

  const handlePagar = async (id: string) => {
    if (!confirm("Deseja marcar este recibo como pago?")) return;
    try {
      await fetch(getApiUrl(`/recibos/${id}/pagar`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataPagamento: new Date().toISOString() })
      });
      fetchRecibos();
    } catch (error) {
      console.error("Erro ao pagar recibo:", error);
    }
  };

  const handleCancelar = async (id: string) => {
    if (!confirm("Deseja cancelar este recibo?")) return;
    try {
      await fetch(getApiUrl(`/recibos/${id}/cancelar`), {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      fetchRecibos();
    } catch (error) {
      console.error("Erro ao cancelar recibo:", error);
    }
  };

  const handleDownload = async (id: string, numero: string) => {
    try {
      const res = await fetch(getApiUrl(`/recibos/${id}/pdf`));
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `recibo-${numero}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erro ao baixar recibo:", error);
    }
  };

  const getStatusBadge = (recibo: Recibo) => {
    const isOverdue = recibo.status === "PENDENTE" && new Date(recibo.dataVencimento) < new Date();

    if (isOverdue) {
      return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-error/10 text-error"><Clock size={12} /> Atrasado</span>;
    }

    switch (recibo.status) {
      case "PAGO":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success"><CheckCircle size={12} /> Pago</span>;
      case "PENDENTE":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning/10 text-warning"><Clock size={12} /> Pendente</span>;
      case "CANCELADO":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-surface-container-high text-on-surface-variant"><XCircle size={12} /> Cancelado</span>;
      default:
        return null;
    }
  };

  const filteredRecibos = recibos;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Recibos</h1>
          <p className="text-on-surface-variant">Gerencie os recibos de aluguel</p>
        </div>
        <Link href="/financeiro/recibos/novo">
          <Button className="gap-2">
            <Plus size={18} />
            Emitir Recibo
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="border-b border-border pb-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <CardTitle>Listagem de Recibos</CardTitle>
            <div className="flex flex-wrap gap-4">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
                <input
                  type="text"
                  placeholder="Buscar recibo ou inquilino..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-surface border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-on-surface w-full sm:w-64"
                />
              </form>
              <select
                value={mesFilter}
                onChange={(e) => setMesFilter(e.target.value)}
                className="px-4 py-2 bg-surface border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-on-surface"
              >
                <option value="">Todos os Meses</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                  <option key={m} value={m}>{m.toString().padStart(2, '0')}</option>
                ))}
              </select>
              <input
                type="number"
                value={anoFilter}
                onChange={(e) => setAnoFilter(e.target.value)}
                className="px-4 py-2 bg-surface border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-on-surface w-24"
                placeholder="Ano"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 bg-surface border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-on-surface"
              >
                <option value="TODOS">Todos os Status</option>
                <option value="PENDENTE">Pendente</option>
                <option value="PAGO">Pago</option>
                <option value="CANCELADO">Cancelado</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-on-surface-variant uppercase bg-surface-container-low border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-medium">NÂº Recibo</th>
                  <th className="px-6 py-4 font-medium">Inquilino</th>
                  <th className="px-6 py-4 font-medium">ReferÃªncia</th>
                  <th className="px-6 py-4 font-medium">Vencimento</th>
                  <th className="px-6 py-4 font-medium">Valor Liquido</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">AÃ§Ãµes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-on-surface-variant">
                      Carregando recibos...
                    </td>
                  </tr>
                ) : filteredRecibos.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-on-surface-variant">
                      Nenhum recibo encontrado.
                    </td>
                  </tr>
                ) : (
                  filteredRecibos.map((recibo) => (
                    <tr key={recibo.id} className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-on-surface">
                        {recibo.numeroRecibo}
                      </td>
                      <td className="px-6 py-4 text-on-surface">
                        {recibo.contrato?.inquilino?.nome || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-on-surface-variant">
                        {recibo.referenciaMes.toString().padStart(2, '0')}/{recibo.referenciaAno}
                      </td>
                      <td className="px-6 py-4 text-on-surface">
                        {formatDate(recibo.dataVencimento)}
                      </td>
                      <td className="px-6 py-4 font-medium text-on-surface">
                        {formatCurrency(Number(recibo.valorLiquido))}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(recibo)}
                      </td>
                      <td className="px-6 py-4 flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Baixar PDF"
                          onClick={() => handleDownload(recibo.id, recibo.numeroRecibo)}
                        >
                          <FileDown size={18} className="text-secondary" />
                        </Button>
                        {recibo.status === 'PENDENTE' && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Dar Baixa"
                              onClick={() => handlePagar(recibo.id)}
                            >
                              <CheckCircle size={18} className="text-success" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Cancelar Recibo"
                              onClick={() => handleCancelar(recibo.id)}
                            >
                              <XCircle size={18} className="text-error" />
                            </Button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
