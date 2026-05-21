"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  Edit,
  Trash2,
  Calendar,
  MapPin,
  CreditCard,
  MessageSquarePlus
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatPhone, formatCPF, formatCNPJ } from "@/lib/utils";
import { Timeline } from "@/components/clientes/Timeline";

export default function DetalhesClientePage() {
  const { id } = useParams();
  const router = useRouter();
  const [client, setClient] = useState<any>(null);
  const [interactions, setInteractions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Form de nova interação
  const [novaInteracao, setNovaInteracao] = useState({ tipo: "LIGACAO", descricao: "" });
  const [loadingInteracao, setLoadingInteracao] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (id) {
      fetchClient();
      fetchInteractions();
    }
  }, [id]);

  const fetchClient = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/clientes/${id}`);
      if (!response.ok) throw new Error("Cliente não encontrado");
      const data = await response.json();
      setClient(data);
    } catch (error) {
      console.error("Erro ao buscar cliente:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInteractions = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/clientes/${id}/interacoes`);
      const data = await response.json();
      setInteractions(data || []);
    } catch (error) {
      console.error("Erro ao buscar interações:", error);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja desativar este cliente?")) return;

    try {
      const response = await fetch(`http://localhost:3001/api/clientes/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        router.push("/clientes");
      } else {
        const error = await response.json();
        alert(error.message || "Erro ao excluir cliente.");
      }
    } catch (error) {
      alert("Erro ao conectar ao servidor.");
    }
  };

  const handleAddInteraction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novaInteracao.descricao.trim()) return;

    setLoadingInteracao(true);
    try {
      const response = await fetch(`http://localhost:3001/api/clientes/${id}/interacoes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(novaInteracao),
      });

      if (response.ok) {
        setNovaInteracao({ tipo: "LIGACAO", descricao: "" });
        fetchInteractions(); // recarrega a timeline
      }
    } catch (error) {
      console.error("Erro ao adicionar interação", error);
    } finally {
      setLoadingInteracao(false);
    }
  };

  if (!mounted) return <div className="py-20 text-center text-on-surface-variant">Carregando detalhes...</div>;
  if (loading) return <div className="py-20 text-center text-on-surface-variant">Buscando dados no servidor...</div>;
  if (!client) return <div className="py-20 text-center text-error">Cliente não encontrado.</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/clientes">
            <Button variant="ghost" size="icon">
              <ArrowLeft size={20} />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-on-surface">{client.nome}</h1>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${
                client.tipo === 'INQUILINO' ? 'bg-secondary/10 text-secondary' : 'bg-outline-variant/30 text-outline'
              }`}>
                {client.tipo}
              </span>
              {client.status !== 'ATIVO' && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-error/10 text-error">INATIVO</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Edit size={18} />
            Editar
          </Button>
          <Button variant="error" className="gap-2" onClick={handleDelete}>
            <Trash2 size={18} />
            Desativar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Coluna Esquerda: Dados e Contratos */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader className="pb-4 border-b border-outline-variant/30">
              <CardTitle className="text-sm uppercase tracking-widest text-secondary">Dados Cadastrais</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="flex items-start gap-3">
                <CreditCard size={18} className="text-on-surface-variant mt-0.5" />
                <div>
                  <p className="text-[10px] uppercase font-bold text-on-surface-variant">Documento</p>
                  <p className="text-sm font-medium text-on-surface">
                    {client.cpfCnpj.length === 11 ? formatCPF(client.cpfCnpj) : formatCNPJ(client.cpfCnpj)}
                  </p>
                  {client.rg && <p className="text-xs text-on-surface-variant mt-1">RG: {client.rg}</p>}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone size={18} className="text-on-surface-variant mt-0.5" />
                <div>
                  <p className="text-[10px] uppercase font-bold text-on-surface-variant">Telefone</p>
                  <p className="text-sm font-medium text-on-surface">{client.telefone ? formatPhone(client.telefone) : "Não informado"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail size={18} className="text-on-surface-variant mt-0.5" />
                <div>
                  <p className="text-[10px] uppercase font-bold text-on-surface-variant">E-mail</p>
                  <p className="text-sm font-medium text-on-surface truncate">{client.email || "Não informado"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-on-surface-variant mt-0.5" />
                <div>
                  <p className="text-[10px] uppercase font-bold text-on-surface-variant">Endereço</p>
                  <p className="text-sm font-medium text-on-surface">{client.endereco || "Não informado"}</p>
                </div>
              </div>

              {client.dataNascimento && (
                <div className="flex items-start gap-3">
                  <Calendar size={18} className="text-on-surface-variant mt-0.5" />
                  <div>
                    <p className="text-[10px] uppercase font-bold text-on-surface-variant">Nascimento</p>
                    <p className="text-sm font-medium text-on-surface">
                      {new Date(client.dataNascimento).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contratos Ativos (se Inquilino) */}
          {client.tipo === "INQUILINO" && (
            <Card>
              <CardHeader className="pb-3 border-b border-outline-variant/30">
                <CardTitle className="text-sm uppercase tracking-widest text-secondary">Contratos Vinculados</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                {client.contratos && client.contratos.length > 0 ? (
                  <div className="space-y-3">
                    {client.contratos.map((contrato: any) => (
                      <Link key={contrato.id} href={`/contratos/${contrato.id}`} className="block">
                        <div className="p-3 border border-outline-variant rounded-md bg-surface-container-lowest hover:border-secondary transition-colors cursor-pointer">
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-xs font-bold bg-primary text-on-primary px-1.5 py-0.5 rounded">#{contrato.numeroContrato}</span>
                            <span className={`text-[10px] font-bold ${
                              contrato.status === 'ATIVO' ? 'text-success' : 'text-on-surface-variant'
                            }`}>{contrato.status}</span>
                          </div>
                          <p className="text-sm font-medium truncate">{contrato.imovel?.endereco}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-on-surface-variant text-center py-4">Nenhum contrato ativo.</p>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Coluna Direita: Interações / Timeline */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="bg-surface-container border-b border-outline-variant/50">
              <CardTitle className="flex items-center gap-2 text-on-surface">
                <MessageSquarePlus size={20} className="text-secondary" />
                Registrar Interação
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleAddInteraction} className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-1/3">
                    <select
                      className="flex h-10 w-full rounded-md border border-outline-variant bg-white px-3 py-2 text-sm text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
                      value={novaInteracao.tipo}
                      onChange={(e) => setNovaInteracao({ ...novaInteracao, tipo: e.target.value })}
                    >
                      <option value="LIGACAO">Ligação</option>
                      <option value="WHATSAPP">WhatsApp</option>
                      <option value="EMAIL">E-mail</option>
                      <option value="VISITA">Visita</option>
                      <option value="OUTROS">Outros</option>
                    </select>
                  </div>
                  <div className="flex-1 flex gap-2">
                    <Input
                      placeholder="Resumo da conversa ou anotação..."
                      value={novaInteracao.descricao}
                      onChange={(e) => setNovaInteracao({ ...novaInteracao, descricao: e.target.value })}
                      className="w-full"
                    />
                    <Button type="submit" disabled={loadingInteracao || !novaInteracao.descricao.trim()}>
                      Salvar
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="pt-4">
            <h3 className="text-lg font-bold text-on-surface mb-6">Histórico de Relacionamento</h3>
            <Timeline interactions={interactions} />
          </div>
        </div>
      </div>
    </div>
  );
}
