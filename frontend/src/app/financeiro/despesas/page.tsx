"use client";

import { useEffect, useState } from "react";
import { getApiUrl } from "@/lib/api";
import { Plus, Search, Receipt, Calendar, Building2 } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

const TIPOS_DESPESA: Record<string, string> = {
  IPTU: "IPTU",
  CONDOMINIO: "CondomÃ­nio",
  AGUA: "Ãgua",
  LUZ: "Luz",
  OUTROS: "Outros",
};

export default function DespesasPage() {
  const [despesas, setDespesas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [contratos, setContratos] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    tipo: "",
    status: "",
  });
  const [formData, setFormData] = useState({
    contratoId: "",
    tipo: "OUTROS",
    descricao: "",
    valor: "",
    dataVencimento: "",
  });

  useEffect(() => {
    setMounted(true);
    fetchDespesas();
    fetchContratos();
  }, []);

  const fetchDespesas = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filters.tipo) queryParams.append("tipo", filters.tipo);
      if (filters.status) queryParams.append("status", filters.status);

      const response = await fetch(getApiUrl(`/despesas?${queryParams.toString()}`));
      const result = await response.json();
      setDespesas(result.items || []);
    } catch (error) {
      console.error("Erro ao carregar despesas:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchContratos = async () => {
    try {
      const response = await fetch(getApiUrl("/contratos?status=ATIVO&limit=100"));
      const result = await response.json();
      setContratos(result.items || []);
    } catch (error) {
      console.error("Erro ao carregar contratos:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(getApiUrl("/despesas"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          valor: Number(formData.valor),
        }),
      });

      if (response.ok) {
        setShowForm(false);
        setFormData({ contratoId: "", tipo: "OUTROS", descricao: "", valor: "", dataVencimento: "" });
        fetchDespesas();
      } else {
        const error = await response.json();
        alert(error.message || "Erro ao criar despesa");
      }
    } catch (error) {
      console.error("Erro ao criar despesa:", error);
      alert("Erro ao criar despesa");
    }
  };

  const handlePagar = async (id: string) => {
    try {
      const response = await fetch(getApiUrl(`/despesas/${id}/pagar`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      if (response.ok) {
        fetchDespesas();
      }
    } catch (error) {
      console.error("Erro ao dar baixa:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Deseja realmente excluir esta despesa?")) return;
    try {
      const response = await fetch(getApiUrl(`/despesas/${id}`), {
        method: "DELETE",
      });
      if (response.ok) {
        fetchDespesas();
      }
    } catch (error) {
      console.error("Erro ao excluir despesa:", error);
    }
  };

  if (!mounted || loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-on-surface">Despesas</h1>
        <div className="py-12 text-center text-on-surface-variant">Carregando despesas...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Despesas</h1>
          <p className="text-on-surface-variant">GestÃ£o de despesas dos imÃ³veis</p>
        </div>
        <div className="flex gap-2">
          <Link href="/financeiro">
            <Button variant="outline">Voltar ao Financeiro</Button>
          </Link>
          <Button className="gap-2" onClick={() => setShowForm(!showForm)}>
            <Plus size={18} />
            Nova Despesa
          </Button>
        </div>
      </div>

      {/* FormulÃ¡rio de Nova Despesa */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Registrar Nova Despesa</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">Contrato</label>
                <select
                  className="w-full h-10 px-3 rounded-md border border-outline-variant bg-white text-sm"
                  value={formData.contratoId}
                  onChange={(e) => setFormData({ ...formData, contratoId: e.target.value })}
                  required
                >
                  <option value="">Selecione um contrato</option>
                  {contratos.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.numeroContrato} - {c.inquilino?.nome} ({c.imovel?.endereco})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">Tipo</label>
                <select
                  className="w-full h-10 px-3 rounded-md border border-outline-variant bg-white text-sm"
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                >
                  {Object.entries(TIPOS_DESPESA).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
              <Input
                label="DescriÃ§Ã£o"
                placeholder="DescriÃ§Ã£o da despesa"
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              />
              <Input
                label="Valor (R$)"
                type="number"
                step="0.01"
                placeholder="0,00"
                value={formData.valor}
                onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                required
              />
              <Input
                label="Data de Vencimento"
                type="date"
                value={formData.dataVencimento}
                onChange={(e) => setFormData({ ...formData, dataVencimento: e.target.value })}
                required
              />
              <div className="flex items-end gap-2">
                <Button type="submit">Salvar Despesa</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Filtros */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex gap-4">
            <select
              className="h-10 px-3 rounded-md border border-outline-variant bg-white text-sm"
              value={filters.tipo}
              onChange={(e) => setFilters({ ...filters, tipo: e.target.value })}
            >
              <option value="">Todos os Tipos</option>
              {Object.entries(TIPOS_DESPESA).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
            <select
              className="h-10 px-3 rounded-md border border-outline-variant bg-white text-sm"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="">Todos os Status</option>
              <option value="PENDENTE">Pendente</option>
              <option value="PAGO">Pago</option>
            </select>
            <Button variant="secondary" className="gap-2" onClick={() => fetchDespesas()}>
              <Search size={18} />
              Filtrar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {despesas.length === 0 ? (
            <div className="py-12 text-center space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant">
                <Receipt size={24} />
              </div>
              <p className="text-on-surface-variant">Nenhuma despesa encontrada.</p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-6 -mb-6">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-on-surface-variant uppercase bg-surface-container/50 border-y border-outline-variant">
                  <tr>
                    <th className="px-6 py-4 font-bold">Tipo</th>
                    <th className="px-6 py-4 font-bold">DescriÃ§Ã£o</th>
                    <th className="px-6 py-4 font-bold">ImÃ³vel / Contrato</th>
                    <th className="px-6 py-4 font-bold">Vencimento</th>
                    <th className="px-6 py-4 font-bold">Valor</th>
                    <th className="px-6 py-4 font-bold">Status</th>
                    <th className="px-6 py-4 font-bold text-right">AÃ§Ãµes</th>
                  </tr>
                </thead>
                <tbody>
                  {despesas.map((despesa) => (
                    <tr key={despesa.id} className="bg-white border-b border-outline-variant hover:bg-surface-container/30 transition-colors">
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 rounded text-xs font-bold bg-surface-container text-on-surface">
                          {TIPOS_DESPESA[despesa.tipo] || despesa.tipo}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-on-surface">{despesa.descricao || "â€”"}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-sm">
                          <Building2 size={12} className="text-on-surface-variant" />
                          <span className="truncate max-w-[200px]">{despesa.contrato?.imovel?.endereco || "â€”"}</span>
                        </div>
                        <div className="text-xs text-on-surface-variant">
                          Contrato: {despesa.contrato?.numeroContrato}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <Calendar size={12} className="text-on-surface-variant" />
                          {new Date(despesa.dataVencimento).toLocaleDateString("pt-BR")}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-secondary">{formatCurrency(despesa.valor)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold border ${
                          despesa.status === "PAGO"
                            ? "bg-success/10 text-success border-success/20"
                            : "bg-warning/10 text-warning border-warning/20"
                        }`}>
                          {despesa.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex gap-1 justify-end">
                          {despesa.status === "PENDENTE" && (
                            <Button variant="outline" size="sm" className="h-8 text-xs"
                              onClick={() => handlePagar(despesa.id)}
                            >
                              Dar Baixa
                            </Button>
                          )}
                          <Button variant="ghost" size="sm" className="h-8 text-xs text-error"
                            onClick={() => handleDelete(despesa.id)}
                          >
                            Excluir
                          </Button>
                        </div>
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
  );
}

