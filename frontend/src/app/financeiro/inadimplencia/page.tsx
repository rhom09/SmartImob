"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, ChevronDown, ChevronRight, User, Building2, Calendar } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface OverdueReceipt {
  id: string;
  numeroRecibo: string;
  referenciaMes: number;
  referenciaAno: number;
  valorOriginal: number;
  dataVencimento: string;
  diasAtraso: number;
  multa: number;
  juros: number;
  valorTotal: number;
}

interface DelinquentContract {
  contratoId: string;
  numeroContrato: string;
  inquilino: { id: string; nome: string; telefone: string; email: string };
  imovel: { id: string; endereco: string };
  recibosVencidos: OverdueReceipt[];
  totalDevido: number;
}

export default function InadimplenciaPage() {
  const [data, setData] = useState<DelinquentContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    setMounted(true);
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:3001/api/financeiro/inadimplencia");
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Erro ao carregar inadimplência:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id: string) => {
    const next = new Set(expanded);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setExpanded(next);
  };

  const getAtrasoColor = (dias: number) => {
    if (dias > 60) return "text-error";
    if (dias > 30) return "text-warning";
    return "text-on-surface-variant";
  };

  const totalGeral = data.reduce((sum, c) => sum + c.totalDevido, 0);

  if (!mounted || loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-on-surface">Inadimplência</h1>
        <div className="py-12 text-center text-on-surface-variant">Carregando dados de inadimplência...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Controle de Inadimplência</h1>
          <p className="text-on-surface-variant">Contratos com pagamentos em atraso</p>
        </div>
        <Link href="/financeiro">
          <Button variant="outline">Voltar ao Financeiro</Button>
        </Link>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-xs font-bold uppercase text-on-surface-variant tracking-wider">Total Inadimplente</p>
            <p className="text-2xl font-bold text-error mt-1">{formatCurrency(totalGeral)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-xs font-bold uppercase text-on-surface-variant tracking-wider">Contratos Inadimplentes</p>
            <p className="text-2xl font-bold text-on-surface mt-1">{data.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-xs font-bold uppercase text-on-surface-variant tracking-wider">Total de Recibos Vencidos</p>
            <p className="text-2xl font-bold text-warning mt-1">
              {data.reduce((sum, c) => sum + c.recibosVencidos.length, 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Contratos */}
      {data.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center space-y-3">
            <div className="mx-auto w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
              <AlertTriangle size={24} className="text-success" />
            </div>
            <p className="text-on-surface-variant font-medium">Nenhuma inadimplência encontrada!</p>
            <p className="text-sm text-on-surface-variant">Todos os pagamentos estão em dia.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {data.map((contract) => (
            <Card key={contract.contratoId}>
              <CardContent className="p-0">
                {/* Header do contrato - clicável */}
                <button
                  onClick={() => toggleExpand(contract.contratoId)}
                  className="w-full p-6 flex items-center gap-4 hover:bg-surface-container/30 transition-colors text-left"
                >
                  {expanded.has(contract.contratoId) ? (
                    <ChevronDown size={20} className="text-on-surface-variant flex-shrink-0" />
                  ) : (
                    <ChevronRight size={20} className="text-on-surface-variant flex-shrink-0" />
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-bold text-on-surface">
                        Contrato {contract.numeroContrato}
                      </span>
                      <span className="text-sm text-on-surface-variant flex items-center gap-1">
                        <User size={14} />
                        {contract.inquilino.nome}
                      </span>
                      <span className="text-sm text-on-surface-variant flex items-center gap-1">
                        <Building2 size={14} />
                        <span className="truncate max-w-[250px]">{contract.imovel.endereco}</span>
                      </span>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-on-surface-variant">{contract.recibosVencidos.length} recibo(s)</p>
                    <p className="font-bold text-error text-lg">{formatCurrency(contract.totalDevido)}</p>
                  </div>
                </button>

                {/* Detalhes expandidos */}
                {expanded.has(contract.contratoId) && (
                  <div className="border-t border-outline-variant px-6 pb-6">
                    <div className="overflow-x-auto mt-4">
                      <table className="w-full text-sm text-left">
                        <thead className="text-xs text-on-surface-variant uppercase bg-surface-container/50 border-y border-outline-variant">
                          <tr>
                            <th className="px-4 py-3 font-bold">Referência</th>
                            <th className="px-4 py-3 font-bold">Vencimento</th>
                            <th className="px-4 py-3 font-bold">Valor Original</th>
                            <th className="px-4 py-3 font-bold">Dias Atraso</th>
                            <th className="px-4 py-3 font-bold">Multa (2%)</th>
                            <th className="px-4 py-3 font-bold">Juros (1%/mês)</th>
                            <th className="px-4 py-3 font-bold">Total Devido</th>
                          </tr>
                        </thead>
                        <tbody>
                          {contract.recibosVencidos.map((recibo) => (
                            <tr key={recibo.id} className="border-b border-outline-variant hover:bg-surface-container/30 transition-colors">
                              <td className="px-4 py-3 font-medium">
                                {String(recibo.referenciaMes).padStart(2, "0")}/{recibo.referenciaAno}
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-1">
                                  <Calendar size={12} className="text-on-surface-variant" />
                                  {new Date(recibo.dataVencimento).toLocaleDateString("pt-BR")}
                                </div>
                              </td>
                              <td className="px-4 py-3">{formatCurrency(recibo.valorOriginal)}</td>
                              <td className={`px-4 py-3 font-bold ${getAtrasoColor(recibo.diasAtraso)}`}>
                                {recibo.diasAtraso} dias
                              </td>
                              <td className="px-4 py-3 text-error">{formatCurrency(recibo.multa)}</td>
                              <td className="px-4 py-3 text-error">{formatCurrency(recibo.juros)}</td>
                              <td className="px-4 py-3 font-bold text-error">{formatCurrency(recibo.valorTotal)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-outline-variant">
                      <div className="flex gap-2">
                        <Link href={`/clientes/${contract.inquilino.id}`}>
                          <Button variant="outline" size="sm">Ver Inquilino</Button>
                        </Link>
                        <Link href={`/contratos/${contract.contratoId}`}>
                          <Button variant="outline" size="sm">Ver Contrato</Button>
                        </Link>
                      </div>
                      <p className="font-bold text-error text-lg">
                        Total: {formatCurrency(contract.totalDevido)}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
