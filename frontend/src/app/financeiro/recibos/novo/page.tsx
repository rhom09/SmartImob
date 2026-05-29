"use client";

import { useState, useEffect, useMemo } from "react";
import { getApiUrl } from "@/lib/api";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Eye, CreditCard, Info } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatCurrency } from "@/lib/utils";

interface Contrato {
  id: string;
  inquilino: { nome: string };
  imovel: { id: string; endereco: string };
  valorAluguel: string | number;
  taxaAdministracao: string | number;
  valorCondominio?: string | number;
  valorIptu?: string | number;
  diaVencimento?: number;
}

export default function NovoReciboPage() {
  const router = useRouter();
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previwing, setPreviewing] = useState(false);
  const [ownerDetails, setOwnerDetails] = useState<any>(null);

  // Form State
  const [contratoId, setContratoId] = useState("");
  const [referenciaMes, setReferenciaMes] = useState(new Date().getMonth() + 1);
  const [referenciaAno, setReferenciaAno] = useState(new Date().getFullYear());
  const [dataVencimento, setDataVencimento] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [comprovanteUrl, setComprovanteUrl] = useState("");

  // Valores Detalhados
  const [valorIPTU, setValorIptu] = useState(0);
  const [valorCondominio, setValorCondominio] = useState(0);
  const [valorAgua, setValorAgua] = useState(0);
  const [valorLuz, setValorLuz] = useState(0);
  const [outrosDebitos, setOutrosDebitos] = useState(0);
  const [descontos, setDescontos] = useState(0);

  useEffect(() => {
    fetchContratos();
  }, []);

  const fetchOwnerDetails = async (imovelId: string) => {
    try {
      const res = await fetch(getApiUrl("/imoveis/${imovelId}/owner"));
      if (res.ok) {
        const data = await res.json();
        setOwnerDetails(data);
      }
    } catch (error) {
      console.error("Erro ao buscar dados do proprietário:", error);
    }
  };

  const handlePreview = async () => {
    if (!contratoId) {
      alert("Selecione um contrato para visualizar a prévia");
      return;
    }

    setPreviewing(true);
    try {
      const res = await fetch(getApiUrl("/recibos/preview"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contratoId,
          referenciaMes,
          referenciaAno,
          valorBruto: totais.bruto,
          descontos,
          valorLiquido: totais.liquido,
          dataVencimento,
          observacoes,
          valorIptu: valorIPTU,
          valorCondominio,
          valorAgua,
          valorLuz,
          outrosDebitos,
          comprovanteUrl
        })
      });

      if (!res.ok) throw new Error("Erro ao gerar prévia");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (error) {
      console.error(error);
      alert("Não foi possível gerar a prévia do recibo.");
    } finally {
      setPreviewing(false);
    }
  };

  const fetchContratos = async () => {
    try {
      const res = await fetch(getApiUrl("/contratos"));
      const data = await res.json();
      const items = Array.isArray(data) ? data : data.items || [];
      setContratos(items.filter((c: any) => c.status === "ATIVO"));
    } catch (error) {
      console.error("Erro ao buscar contratos:", error);
    }
  };

  const selectedContrato = useMemo(() => contratos.find(c => c.id === contratoId), [contratoId, contratos]);

  const fetchFinancialDefaults = async (imovelId: string) => {
    try {
      const res = await fetch(getApiUrl("/imoveis/${imovelId}/defaults"));
      if (res.ok) {
        const defaults = await res.json();
        setValorIptu(Number(defaults.valorIptu) || 0);
        setValorCondominio(Number(defaults.valorCondominio) || 0);
        setValorAgua(Number(defaults.valorAgua) || 0);
        setValorLuz(Number(defaults.valorLuz) || 0);
        setOutrosDebitos(Number(defaults.outrosDebitos) || 0);
        setDescontos(Number(defaults.descontos) || 0);
      }
    } catch (error) {
      console.error("Erro ao buscar defaults:", error);
    }
  };

  useEffect(() => {
    if (selectedContrato) {
      const diaVencimento = selectedContrato.diaVencimento || 10;
      const data = new Date(referenciaAno, referenciaMes - 1, diaVencimento);
      setDataVencimento(data.toISOString().split('T')[0]);
      fetchFinancialDefaults(selectedContrato.imovel.id);
      fetchOwnerDetails(selectedContrato.imovel.id);
    }
  }, [selectedContrato, referenciaMes, referenciaAno]);

  const totais = useMemo(() => {
    const aluguel = selectedContrato ? Number(selectedContrato.valorAluguel) : 0;
    const bruto = aluguel + valorIPTU + valorCondominio + valorAgua + valorLuz + outrosDebitos;
    const liquido = bruto - descontos;
    return { aluguel, bruto, liquido };
  }, [selectedContrato, valorIPTU, valorCondominio, valorAgua, valorLuz, outrosDebitos, descontos]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contratoId || !dataVencimento) {
      alert("Preencha todos os campos obrigatórios");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(getApiUrl("/recibos"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contratoId,
          referenciaMes,
          referenciaAno,
          valorBruto: totais.bruto,
          descontos,
          valorLiquido: totais.liquido,
          dataVencimento,
          observacoes,
          valorIptu: valorIPTU,
          valorCondominio,
          valorAgua,
          valorLuz,
          outrosDebitos,
          comprovanteUrl
        })
      });

      if (!res.ok) {
        const result = await res.json();
        throw new Error(result.message || "Erro ao salvar recibo");
      }
      router.push("/financeiro/recibos");
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Ocorreu um erro ao gerar o recibo.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/financeiro/recibos">
            <Button variant="ghost" size="icon">
              <ArrowLeft size={20} />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-on-surface">Novo Recibo</h1>
            <p className="text-on-surface-variant">Emita e envie o comprovante de recebimento</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={handlePreview} disabled={previwing || !contratoId}>
            <Eye size={18} />
            {previwing ? "Gerando..." : "Visualizar Prévia"}
          </Button>
        </div>
      </div>

      <form id="recibo-form" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Dados do Contrato</CardTitle>
              <CardDescription>Selecione o contrato e a competência</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-bold uppercase text-on-surface-variant tracking-wider">Contrato *</label>
                  <select
                    value={contratoId}
                    onChange={(e) => setContratoId(e.target.value)}
                    className="w-full px-4 py-2 bg-surface border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-on-surface"
                    required
                  >
                    <option value="">Selecione um contrato</option>
                    {contratos.map(c => (
                      <option key={c.id} value={c.id}>{c.inquilino?.nome} - {c.imovel?.endereco}</option>
                    ))}
                  </select>
                </div>
                {selectedContrato && (
                  <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-surface-container-low rounded-lg border border-outline-variant mb-2">
                    <div className="space-y-1"><p className="text-[10px] font-bold text-on-surface-variant uppercase">Inquilino</p><p className="text-xs font-medium">{selectedContrato.inquilino.nome}</p></div>
                    <div className="space-y-1"><p className="text-[10px] font-bold text-on-surface-variant uppercase">Imóvel</p><p className="text-xs font-medium truncate">{selectedContrato.imovel.endereco}</p></div>
                    <div className="space-y-1"><p className="text-[10px] font-bold text-on-surface-variant uppercase">Vencimento Original</p><p className="text-xs font-medium">Dia {selectedContrato.diaVencimento || 10}</p></div>
                    <div className="space-y-1"><p className="text-[10px] font-bold text-on-surface-variant uppercase">Aluguel Base</p><p className="text-xs font-medium">{formatCurrency(selectedContrato.valorAluguel)}</p></div>
                  </div>
                )}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-on-surface-variant tracking-wider">Mês de Referência *</label>
                  <select value={referenciaMes} onChange={(e) => setReferenciaMes(Number(e.target.value))} className="w-full px-4 py-2 bg-surface border border-border rounded-lg text-sm">
                    {Array.from({length: 12}, (_, i) => i + 1).map(m => (<option key={m} value={m}>{m.toString().padStart(2, '0')}</option>))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-on-surface-variant tracking-wider">Ano de Referência *</label>
                  <input type="number" value={referenciaAno} onChange={(e) => setReferenciaAno(Number(e.target.value))} className="w-full px-4 py-2 bg-surface border border-border rounded-lg text-sm" required />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-on-surface-variant tracking-wider">Data do Vencimento *</label>
                  <Input type="date" value={dataVencimento} onChange={(e) => setDataVencimento(e.target.value)} required />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle className="text-base">Valores do Recibo</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm"><span className="text-on-surface-variant">Aluguel</span><span className="font-medium">{formatCurrency(totais.aluguel)}</span></div>
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-sm"><label className="text-on-surface-variant">IPTU</label><input type="number" step="0.01" className="w-24 text-right bg-transparent border-b border-outline-variant outline-none" value={valorIPTU} onChange={(e) => setValorIptu(Number(e.target.value))} /></div>
                  <div className="flex justify-between items-center text-sm"><label className="text-on-surface-variant">Condomínio</label><input type="number" step="0.01" className="w-24 text-right bg-transparent border-b border-outline-variant outline-none" value={valorCondominio} onChange={(e) => setValorCondominio(Number(e.target.value))} /></div>
                  <div className="flex justify-between items-center text-sm"><label className="text-on-surface-variant">Água</label><input type="number" step="0.01" className="w-24 text-right bg-transparent border-b border-outline-variant outline-none" value={valorAgua} onChange={(e) => setValorAgua(Number(e.target.value))} /></div>
                  <div className="flex justify-between items-center text-sm"><label className="text-on-surface-variant">Luz</label><input type="number" step="0.01" className="w-24 text-right bg-transparent border-b border-outline-variant outline-none" value={valorLuz} onChange={(e) => setValorLuz(Number(e.target.value))} /></div>
                  <div className="flex justify-between items-center text-sm"><label className="text-on-surface-variant">Outros Débitos</label><input type="number" step="0.01" className="w-24 text-right bg-transparent border-b border-outline-variant outline-none" value={outrosDebitos} onChange={(e) => setOutrosDebitos(Number(e.target.value))} /></div>
                  <div className="flex justify-between items-center text-sm text-error"><label>(-) Descontos</label><input type="number" step="0.01" className="w-24 text-right bg-transparent border-b border-error outline-none" value={descontos} onChange={(e) => setDescontos(Number(e.target.value))} /></div>
                </div>
                <div className="pt-3 border-t flex justify-between"><span className="font-bold text-sm">Valor Líquido</span><span className="font-bold text-primary">{formatCurrency(totais.liquido)}</span></div>
                {ownerDetails && (
                  <div className="mt-4 pt-3 border-t border-outline-variant/30">
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">Informações de Pagamento (Proprietário)</p>
                    <p className="text-xs text-on-surface font-medium">{ownerDetails.formaPagamento}</p>
                    {ownerDetails.formaPagamento === "PIX" ? (
                      <p className="text-xs text-secondary mt-1">Chave: {ownerDetails.chavePix}</p>
                    ) : (
                      <p className="text-xs text-secondary mt-1">
                        {ownerDetails.banco} | Ag: {ownerDetails.agencia} | Cc: {ownerDetails.conta}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="bg-primary/5">
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><CreditCard size={20} className="text-primary"/>Resumo</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <p className="text-3xl font-bold text-primary">{formatCurrency(totais.liquido)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">Observações</CardTitle></CardHeader>
            <CardContent>
              <textarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)} rows={4} className="w-full px-4 py-2 bg-surface border rounded-lg text-sm" placeholder="Observações..." />
            </CardContent>
          </Card>
          <Button type="submit" className="w-full h-12" disabled={saving || !contratoId}>{saving ? "Gerando..." : "Emitir Recibo"}</Button>
        </div>
      </form>
    </div>
  );
}
