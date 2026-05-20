"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  FileText,
  User,
  Building2,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function DetalhesContratoPage() {
  const { id } = useParams();
  const router = useRouter();
  const [contract, setContract] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchContract();
    }
  }, [id]);

  const fetchContract = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/contratos/${id}`);
      if (!response.ok) throw new Error("Contrato não encontrado");
      const data = await response.json();
      setContract(data);
    } catch (error) {
      console.error("Erro ao buscar contrato:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async (receiptId: string) => {
    if (!confirm("Confirmar o recebimento desta parcela?")) return;

    try {
      const response = await fetch(`http://localhost:3001/api/recibos/${receiptId}/pagar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataPagamento: new Date().toISOString() })
      });

      if (response.ok) {
        fetchContract(); // recarrega os dados
      } else {
        alert("Erro ao processar pagamento.");
      }
    } catch (error) {
      alert("Erro ao conectar ao servidor.");
    }
  };

  const handleDownloadPDF = async (receiptId: string, numeroRecibo: string) => {
    try {
      window.open(`http://localhost:3001/api/recibos/${receiptId}/pdf`, '_blank');
    } catch (error) {
      alert("Erro ao gerar PDF.");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PAGO': return <CheckCircle2 size={16} className="text-success" />;
      case 'CANCELADO': return <XCircle size={16} className="text-error" />;
      default: return <Clock size={16} className="text-warning" />;
    }
  };

  if (loading) return <div className="py-20 text-center text-on-surface-variant">Carregando detalhes do contrato...</div>;
  if (!contract) return <div className="py-20 text-center text-error">Contrato não encontrado.</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/contratos">
            <Button variant="ghost" size="icon">
              <ArrowLeft size={20} />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-on-surface">Contrato #{contract.numeroContrato}</h1>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${
                contract.status === 'ATIVO' ? 'bg-success/10 text-success' : 'bg-outline-variant/30 text-outline'
              }`}>
                {contract.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Informações Principais */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader className="pb-4 border-b border-outline-variant/30">
              <CardTitle className="text-sm uppercase tracking-widest text-secondary">Resumo do Contrato</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="flex items-start gap-3">
                <Building2 size={18} className="text-on-surface-variant mt-0.5" />
                <div>
                  <p className="text-[10px] uppercase font-bold text-on-surface-variant">Imóvel</p>
                  <p className="text-sm font-medium text-on-surface">{contract.imovel?.endereco}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <User size={18} className="text-on-surface-variant mt-0.5" />
                <div>
                  <p className="text-[10px] uppercase font-bold text-on-surface-variant">Inquilino</p>
                  <p className="text-sm font-medium text-on-surface">{contract.inquilino?.nome}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <DollarSign size={18} className="text-on-surface-variant mt-0.5" />
                <div>
                  <p className="text-[10px] uppercase font-bold text-on-surface-variant">Aluguel Mensal</p>
                  <p className="text-lg font-bold text-secondary">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(contract.valorAluguel))}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Calendar size={18} className="text-on-surface-variant mt-0.5" />
                  <div>
                    <p className="text-[10px] uppercase font-bold text-on-surface-variant">Vencimento</p>
                    <p className="text-sm font-medium text-on-surface">Dia {contract.diaVencimento}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock size={18} className="text-on-surface-variant mt-0.5" />
                  <div>
                    <p className="text-[10px] uppercase font-bold text-on-surface-variant">Vigência</p>
                    <p className="text-sm font-medium text-on-surface">
                      {Math.round((new Date(contract.dataFim).getTime() - new Date(contract.dataInicio).getTime()) / (1000 * 60 * 60 * 24 * 30.44))} meses
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Financeiro / Recibos */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="bg-surface-container border-b border-outline-variant/50">
              <CardTitle className="text-on-surface">Fluxo de Recebimentos</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-on-surface-variant uppercase bg-surface-container-low border-b border-outline-variant">
                    <tr>
                      <th className="px-6 py-3 font-bold">Ref.</th>
                      <th className="px-6 py-3 font-bold">Vencimento</th>
                      <th className="px-6 py-3 font-bold">Valor</th>
                      <th className="px-6 py-3 font-bold">Status</th>
                      <th className="px-6 py-3 font-bold text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/30">
                    {contract.recibos?.map((recibo: any) => (
                      <tr key={recibo.id} className="hover:bg-surface-container-lowest transition-colors">
                        <td className="px-6 py-4 font-medium">
                          {recibo.referenciaMes.toString().padStart(2, '0')}/{recibo.referenciaAno}
                        </td>
                        <td className="px-6 py-4 text-on-surface-variant">
                          {new Date(recibo.dataVencimento).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 font-bold text-on-surface">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(recibo.valorLiquido))}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 font-bold text-[10px] uppercase">
                            {getStatusIcon(recibo.status)}
                            <span className={
                              recibo.status === 'PAGO' ? 'text-success' :
                              recibo.status === 'CANCELADO' ? 'text-error' : 'text-warning'
                            }>
                              {recibo.status}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right flex justify-end gap-2">
                          {recibo.status === 'PENDENTE' && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 text-[10px] uppercase font-bold border-success text-success hover:bg-success/10"
                              onClick={() => handlePay(recibo.id)}
                            >
                              Baixar Parcela
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-[10px] uppercase font-bold"
                            onClick={() => handleDownloadPDF(recibo.id, recibo.numeroRecibo)}
                          >
                            PDF
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {!contract.recibos?.length && (
                <div className="py-12 text-center text-on-surface-variant italic">
                  Nenhuma parcela gerada para este contrato.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
