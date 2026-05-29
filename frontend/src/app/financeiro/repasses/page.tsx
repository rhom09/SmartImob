"use client";

import { useEffect, useState } from "react";
import { getApiUrl } from "@/lib/api";
import { DollarSign, User, Building2, FileText } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface OwnerTransfer {
  proprietarioId: string;
  proprietarioNome: string;
  contratos: {
    contratoId: string;
    numeroContrato: string;
    imovelEndereco: string;
    valorAluguel: number;
    taxaComissao: number;
    comissao: number;
    despesas: number;
    valorRepasse: number;
  }[];
  totalRepasse: number;
}

export default function RepassesPage() {
  const [repasses, setRepasses] = useState<OwnerTransfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [filters, setFilters] = useState({
    dataInicio: "",
    dataFim: "",
  });

  useEffect(() => {
    setMounted(true);
    fetchRepasses();
  }, []);

  const fetchRepasses = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filters.dataInicio) queryParams.append("dataInicio", filters.dataInicio);
      if (filters.dataFim) queryParams.append("dataFim", filters.dataFim);

      const response = await fetch(getApiUrl(`/financeiro/repasses?${queryParams.toString()}`));
      const result = await response.json();
      setRepasses(result);
    } catch (error) {
      console.error("Erro ao carregar repasses:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalGeral = repasses.reduce((sum, r) => sum + r.totalRepasse, 0);

  if (!mounted || loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-on-surface">Repasses</h1>
        <div className="py-12 text-center text-on-surface-variant">Carregando repasses...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Repasses aos ProprietÃ¡rios</h1>
          <p className="text-on-surface-variant">Valores a repassar apÃ³s comissÃ£o e despesas</p>
        </div>
        <Link href="/financeiro">
          <Button variant="outline">Voltar ao Financeiro</Button>
        </Link>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 items-end">
            <Input
              label="Data InÃ­cio"
              type="date"
              value={filters.dataInicio}
              onChange={(e) => setFilters({ ...filters, dataInicio: e.target.value })}
            />
            <Input
              label="Data Fim"
              type="date"
              value={filters.dataFim}
              onChange={(e) => setFilters({ ...filters, dataFim: e.target.value })}
            />
            <Button variant="secondary" onClick={() => fetchRepasses()}>Filtrar</Button>
          </div>
        </CardContent>
      </Card>

      {/* Resumo */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase text-on-surface-variant tracking-wider">Total a Repassar</p>
              <p className="text-3xl font-bold text-success mt-1">{formatCurrency(totalGeral)}</p>
            </div>
            <div className="text-sm text-on-surface-variant">
              {repasses.length} proprietÃ¡rio(s)
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Repasses por ProprietÃ¡rio */}
      {repasses.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center space-y-3">
            <div className="mx-auto w-12 h-12 rounded-full bg-surface-container flex items-center justify-center">
              <DollarSign size={24} className="text-on-surface-variant" />
            </div>
            <p className="text-on-surface-variant">Nenhum repasse encontrado no perÃ­odo.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {repasses.map((repasse) => (
            <Card key={repasse.proprietarioId}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                      <User size={20} className="text-secondary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{repasse.proprietarioNome}</CardTitle>
                      <p className="text-xs text-on-surface-variant">{repasse.contratos.length} contrato(s)</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-on-surface-variant">Total Repasse</p>
                    <p className="text-xl font-bold text-success">{formatCurrency(repasse.totalRepasse)}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-on-surface-variant uppercase bg-surface-container/50 border-y border-outline-variant">
                      <tr>
                        <th className="px-4 py-3 font-bold">Contrato</th>
                        <th className="px-4 py-3 font-bold">ImÃ³vel</th>
                        <th className="px-4 py-3 font-bold">Aluguel</th>
                        <th className="px-4 py-3 font-bold">ComissÃ£o</th>
                        <th className="px-4 py-3 font-bold">Despesas</th>
                        <th className="px-4 py-3 font-bold">Repasse</th>
                      </tr>
                    </thead>
                    <tbody>
                      {repasse.contratos.map((contrato) => (
                        <tr key={contrato.contratoId} className="border-b border-outline-variant hover:bg-surface-container/30 transition-colors">
                          <td className="px-4 py-3">
                            <Link href={`/contratos/${contrato.contratoId}`} className="text-secondary hover:underline font-medium">
                              {contrato.numeroContrato}
                            </Link>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <Building2 size={12} className="text-on-surface-variant" />
                              <span className="truncate max-w-[200px]">{contrato.imovelEndereco}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 font-medium">{formatCurrency(contrato.valorAluguel)}</td>
                          <td className="px-4 py-3 text-error">
                            <div className="flex flex-col">
                              <span>- {formatCurrency(contrato.comissao)}</span>
                              <span className="text-[10px] text-on-surface-variant">({contrato.taxaComissao}%)</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-error">- {formatCurrency(contrato.despesas)}</td>
                          <td className="px-4 py-3 font-bold text-success">{formatCurrency(contrato.valorRepasse)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

