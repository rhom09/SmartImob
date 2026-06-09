"use client";

import { useEffect, useState } from "react";
import { getApiUrl, fetchWithAuth } from "@/lib/api";
import { BarChart3, TrendingUp, TrendingDown, DollarSign, FileText } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatCurrency } from "@/lib/utils";
import { exportToExcel, exportToPDF } from "@/lib/exportUtils";

export const dynamic = "force-dynamic";

type Tab = "comissoes" | "repasses" | "despesas";

export default function RelatoriosPage() {
  const [resumo, setResumo] = useState<any>(null);
  const [comissoes, setComissoes] = useState<any[]>([]);
  const [repasses, setRepasses] = useState<any[]>([]);
  const [despesas, setDespesas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("comissoes");
  const [filters, setFilters] = useState({
    dataInicio: new Date(new Date().getFullYear(), 0, 1).toISOString().split("T")[0],
    dataFim: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    setMounted(true);
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filters.dataInicio) queryParams.append("dataInicio", filters.dataInicio);
      if (filters.dataFim) queryParams.append("dataFim", filters.dataFim);
      const qs = queryParams.toString();

      const [resumoRes, comissoesRes, repassesRes, despesasRes] = await Promise.all([
        fetchWithAuth(getApiUrl(`/financeiro/resumo?${qs}`)),
        fetchWithAuth(getApiUrl(`/financeiro/comissoes?${qs}`)),
        fetchWithAuth(getApiUrl(`/financeiro/repasses?${qs}`)),
        fetchWithAuth(getApiUrl(`/despesas?${qs}&limit=100`)),
      ]);

      setResumo(await resumoRes.json());
      setComissoes(await comissoesRes.json());
      setRepasses(await repassesRes.json());
      const despesasResult = await despesasRes.json();
      setDespesas(despesasResult.items || []);
    } catch (error) {
      console.error("Erro ao carregar relatÃ³rios:", error);
    } finally {
      setLoading(false);
    }
  };

  const MESES = ["", "Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

  if (!mounted || loading) {
    return (
      <div className="space-y-6 pt-20">
        <h1 className="text-2xl font-bold text-on-surface">RelatÃ³rios Financeiros</h1>
        <div className="py-12 text-center text-on-surface-variant">Carregando relatÃ³rios...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">RelatÃ³rios Financeiros</h1>
          <p className="text-on-surface-variant">AnÃ¡lise detalhada de receitas, despesas e comissÃµes</p>
        </div>
        <Link href="/financeiro">
          <Button variant="outline">Voltar ao Financeiro</Button>
        </Link>
      </div>

      {/* Filtros de PerÃ­odo */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 items-end">
            <Input
              label="De"
              type="date"
              value={filters.dataInicio}
              onChange={(e) => setFilters({ ...filters, dataInicio: e.target.value })}
            />
            <Input
              label="AtÃ©"
              type="date"
              value={filters.dataFim}
              onChange={(e) => setFilters({ ...filters, dataFim: e.target.value })}
            />
            <Button variant="secondary" className="gap-2" onClick={() => fetchAll()}>
              <BarChart3 size={18} />
              Gerar RelatÃ³rio
            </Button>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => {
                const data = activeTab === 'comissoes' ? comissoes : activeTab === 'repasses' ? repasses : despesas;
                exportToExcel(data, `Relatorio_${activeTab}`);
              }}
            >
              <FileText size={18} />
              Exportar Excel
            </Button>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => {
                const data = activeTab === 'comissoes' ? comissoes : activeTab === 'repasses' ? repasses : despesas;
                const columns = data.length > 0 ? Object.keys(data[0]) : [];
                exportToPDF(data, `Relatorio_${activeTab}`, columns);
              }}
            >
              <FileText size={18} />
              Exportar PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resumo do PerÃ­odo */}
      {resumo && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Receitas */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingUp size={20} className="text-success" />
                <CardTitle className="text-base">Receitas</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-outline-variant">
                <span className="text-sm text-on-surface-variant">AluguÃ©is Recebidos</span>
                <span className="font-medium">{formatCurrency(resumo.receitas.alugueisPagos)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-outline-variant">
                <span className="text-sm text-on-surface-variant">ComissÃµes</span>
                <span className="font-medium text-success">{formatCurrency(resumo.receitas.comissoes)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Despesas */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingDown size={20} className="text-error" />
                <CardTitle className="text-base">Despesas</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-outline-variant">
                <span className="text-sm text-on-surface-variant">Repasses ProprietÃ¡rios</span>
                <span className="font-medium">{formatCurrency(resumo.despesas.repassesProprietarios)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-outline-variant">
                <span className="text-sm text-on-surface-variant">Despesas ImÃ³veis</span>
                <span className="font-medium">{formatCurrency(resumo.despesas.despesasImoveis)}</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="font-bold text-on-surface">Total Despesas</span>
                <span className="font-bold text-error text-lg">{formatCurrency(resumo.despesas.total)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Saldo e InadimplÃªncia */}
      {resumo && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-6">
              <p className="text-xs font-bold uppercase text-on-surface-variant tracking-wider">Saldo LÃ­quido (ImobiliÃ¡ria)</p>
              <p className={`text-3xl font-bold mt-2 ${resumo.saldoLiquido >= 0 ? "text-success" : "text-error"}`}>
                {formatCurrency(resumo.saldoLiquido)}
              </p>
              <p className="text-xs text-on-surface-variant mt-1">ComissÃµes - Despesas de ImÃ³veis</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-xs font-bold uppercase text-on-surface-variant tracking-wider">InadimplÃªncia Atual</p>
              <p className="text-3xl font-bold text-error mt-2">{formatCurrency(resumo.inadimplencia.valorTotal)}</p>
              <p className="text-xs text-on-surface-variant mt-1">
                {resumo.inadimplencia.quantidadeRecibos} recibo(s) em {resumo.inadimplencia.quantidadeContratos} contrato(s)
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs de Detalhamento */}
      <Card>
        <CardHeader>
          <div className="flex gap-1 border-b border-outline-variant -mx-6 px-6">
            {[
              { id: "comissoes" as Tab, label: "ComissÃµes" },
              { id: "repasses" as Tab, label: "Repasses" },
              { id: "despesas" as Tab, label: "Despesas" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-secondary text-secondary"
                    : "border-transparent text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          {/* Tab: ComissÃµes */}
          {activeTab === "comissoes" && (
            <div className="overflow-x-auto">
              {comissoes.length === 0 ? (
                <p className="py-8 text-center text-on-surface-variant">Nenhuma comissÃ£o no perÃ­odo.</p>
              ) : (
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-on-surface-variant uppercase bg-surface-container/50 border-y border-outline-variant">
                    <tr>
                      <th className="px-4 py-3 font-bold">MÃªs/Ano</th>
                      <th className="px-4 py-3 font-bold">Qtd Contratos</th>
                      <th className="px-4 py-3 font-bold">Total AluguÃ©is</th>
                      <th className="px-4 py-3 font-bold">Valor ComissÃ£o</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comissoes.map((c, idx) => (
                      <tr key={idx} className="border-b border-outline-variant hover:bg-surface-container/30 transition-colors">
                        <td className="px-4 py-3 font-medium">{MESES[c.mes]}/{c.ano}</td>
                        <td className="px-4 py-3">{c.contratos.length}</td>
                        <td className="px-4 py-3">{formatCurrency(c.totalAlugueis)}</td>
                        <td className="px-4 py-3 font-bold text-success">{formatCurrency(c.valorComissao)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Tab: Repasses */}
          {activeTab === "repasses" && (
            <div className="overflow-x-auto">
              {repasses.length === 0 ? (
                <p className="py-8 text-center text-on-surface-variant">Nenhum repasse no perÃ­odo.</p>
              ) : (
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-on-surface-variant uppercase bg-surface-container/50 border-y border-outline-variant">
                    <tr>
                      <th className="px-4 py-3 font-bold">ProprietÃ¡rio</th>
                      <th className="px-4 py-3 font-bold">Qtd Contratos</th>
                      <th className="px-4 py-3 font-bold">Total Repasse</th>
                    </tr>
                  </thead>
                  <tbody>
                    {repasses.map((r) => (
                      <tr key={r.proprietarioId} className="border-b border-outline-variant hover:bg-surface-container/30 transition-colors">
                        <td className="px-4 py-3 font-medium">{r.proprietarioNome}</td>
                        <td className="px-4 py-3">{r.contratos.length}</td>
                        <td className="px-4 py-3 font-bold text-success">{formatCurrency(r.totalRepasse)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Tab: Despesas */}
          {activeTab === "despesas" && (
            <div className="overflow-x-auto">
              {despesas.length === 0 ? (
                <p className="py-8 text-center text-on-surface-variant">Nenhuma despesa no perÃ­odo.</p>
              ) : (
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-on-surface-variant uppercase bg-surface-container/50 border-y border-outline-variant">
                    <tr>
                      <th className="px-4 py-3 font-bold">Tipo</th>
                      <th className="px-4 py-3 font-bold">DescriÃ§Ã£o</th>
                      <th className="px-4 py-3 font-bold">ImÃ³vel</th>
                      <th className="px-4 py-3 font-bold">Vencimento</th>
                      <th className="px-4 py-3 font-bold">Valor</th>
                      <th className="px-4 py-3 font-bold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {despesas.map((d) => (
                      <tr key={d.id} className="border-b border-outline-variant hover:bg-surface-container/30 transition-colors">
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 rounded text-xs font-bold bg-surface-container">{d.tipo}</span>
                        </td>
                        <td className="px-4 py-3">{d.descricao || "â€”"}</td>
                        <td className="px-4 py-3 truncate max-w-[200px]">{d.contrato?.imovel?.endereco || "â€”"}</td>
                        <td className="px-4 py-3">{new Date(d.dataVencimento).toLocaleDateString("pt-BR")}</td>
                        <td className="px-4 py-3 font-bold">{formatCurrency(d.valor)}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold border ${
                            d.status === "PAGO"
                              ? "bg-success/10 text-success border-success/20"
                              : "bg-warning/10 text-warning border-warning/20"
                          }`}>{d.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

