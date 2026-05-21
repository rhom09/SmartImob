"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  Building2,
  Edit,
  Trash2,
  CreditCard
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatPhone, formatCPF, formatCNPJ, formatCurrency } from "@/lib/utils";

export default function DetalhesProprietarioPage() {
  const { id } = useParams();
  const router = useRouter();
  const [owner, setOwner] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (id) fetchOwner();
  }, [id]);

  const fetchOwner = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/api/proprietarios/${id}`);
      if (!response.ok) throw new Error("Proprietário não encontrado");
      const data = await response.json();
      setOwner(data);
    } catch (error) {
      console.error("Erro ao buscar proprietário:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja desativar este proprietário?")) return;

    try {
      const response = await fetch(`http://localhost:3001/api/proprietarios/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        router.push("/proprietarios");
      } else {
        const error = await response.json();
        alert(error.message || "Erro ao desativar proprietário.");
      }
    } catch (error) {
      alert("Erro ao conectar ao servidor.");
    }
  };

  if (!mounted) return <div className="py-20 text-center text-on-surface-variant">Carregando detalhes...</div>;
  if (loading) return <div className="py-20 text-center text-on-surface-variant">Buscando dados no servidor...</div>;
  if (!owner) return <div className="py-20 text-center text-error">Proprietário não encontrado.</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/proprietarios">
            <Button variant="ghost" size="icon">
              <ArrowLeft size={20} />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-on-surface">{owner.nome}</h1>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${
                owner.status === 'ATIVO' ? 'bg-success/10 text-success border-success/20 border' : 'bg-error/10 text-error border-error/20 border'
              }`}>
                {owner.status}
              </span>
            </div>
            <p className="text-on-surface-variant text-sm flex items-center gap-1">
              <User size={14} className="text-secondary" />
              Proprietário desde {new Date(owner.createdAt).toLocaleDateString()}
            </p>
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
        {/* Dados Pessoais */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader className="pb-4 border-b border-outline-variant/30">
              <CardTitle className="text-sm uppercase tracking-widest text-secondary flex items-center gap-2">
                <CreditCard size={16} /> Informações de Contato
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-5">
              <div>
                <p className="text-[10px] uppercase font-bold text-on-surface-variant mb-1">Documento (CPF/CNPJ)</p>
                <p className="text-sm font-medium text-on-surface">
                  {owner.cpfCnpj?.length === 11 ? formatCPF(owner.cpfCnpj) : formatCNPJ(owner.cpfCnpj)}
                </p>
              </div>

              <div className="flex items-start gap-3">
                <Phone size={18} className="text-secondary mt-0.5" />
                <div>
                  <p className="text-[10px] uppercase font-bold text-on-surface-variant">Telefone</p>
                  <p className="text-sm font-medium text-on-surface">{owner.telefone ? formatPhone(owner.telefone) : "Não informado"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail size={18} className="text-secondary mt-0.5" />
                <div>
                  <p className="text-[10px] uppercase font-bold text-on-surface-variant">E-mail</p>
                  <p className="text-sm font-medium text-on-surface truncate">{owner.email || "Não informado"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-secondary mt-0.5" />
                <div>
                  <p className="text-[10px] uppercase font-bold text-on-surface-variant">Endereço Principal</p>
                  <p className="text-sm font-medium text-on-surface leading-relaxed">{owner.endereco || "Não informado"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Imóveis Vinculados */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="bg-surface-container border-b border-outline-variant/50">
              <CardTitle className="flex items-center gap-2 text-on-surface">
                <Building2 size={20} className="text-secondary" />
                Imóveis do Proprietário ({owner.imoveis?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {owner.imoveis && owner.imoveis.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-on-surface-variant uppercase bg-surface-container-low border-b border-outline-variant">
                      <tr>
                        <th className="px-6 py-3 font-bold">Imóvel</th>
                        <th className="px-6 py-3 font-bold">Tipo</th>
                        <th className="px-6 py-3 font-bold">Status</th>
                        <th className="px-6 py-3 font-bold text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/30">
                      {owner.imoveis.map((imovel: any) => (
                        <tr key={imovel.id} className="hover:bg-surface-container-lowest transition-colors">
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-bold text-on-surface">{imovel.endereco}, {imovel.numero}</p>
                              <p className="text-xs text-on-surface-variant">{imovel.bairro} - {imovel.cidade}/{imovel.estado}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs font-medium text-on-surface-variant">{imovel.tipo}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              imovel.status === 'VAGO' ? 'bg-success/10 text-success border-success/20' :
                              imovel.status === 'OCUPADO' ? 'bg-warning/10 text-warning border-warning/20' :
                              'bg-error/10 text-error border-error/20'
                            }`}>
                              {imovel.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Link href={`/imoveis/${imovel.id}`}>
                              <Button variant="ghost" size="sm" className="h-8 text-[10px] font-bold uppercase text-secondary">
                                Detalhes
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-12 text-center text-on-surface-variant italic">
                  Este proprietário ainda não possui imóveis cadastrados.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
