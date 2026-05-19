"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Bed,
  Bath,
  Car,
  Maximize2,
  Tag,
  Calendar,
  User,
  Phone,
  Mail,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatCurrency, formatPhone, formatCPF, formatCNPJ } from "@/lib/utils";

export default function DetalhesImovelPage() {
  const { id } = useParams();
  const router = useRouter();
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activePhoto, setActivePhoto] = useState(0);

  useEffect(() => {
    if (id) fetchProperty();
  }, [id]);

  const fetchProperty = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/api/imoveis/${id}`);
      if (!response.ok) throw new Error("Imóvel não encontrado");
      const data = await response.json();
      setProperty(data);
    } catch (error) {
      console.error("Erro ao buscar imóvel:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja excluir este imóvel?")) return;

    try {
      const response = await fetch(`http://localhost:3001/api/imoveis/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        router.push("/imoveis");
      } else {
        const error = await response.json();
        alert(error.message || "Erro ao excluir imóvel.");
      }
    } catch (error) {
      alert("Erro ao conectar ao servidor.");
    }
  };

  if (loading) return <div className="py-20 text-center text-on-surface-variant">Carregando detalhes do imóvel...</div>;
  if (!property) return <div className="py-20 text-center text-error">Imóvel não encontrado.</div>;

  const hasPhotos = property.fotos && property.fotos.length > 0;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      {/* Header Ações */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/imoveis">
            <Button variant="ghost" size="icon">
              <ArrowLeft size={20} />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-on-surface">Detalhes do Imóvel</h1>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                property.status === 'VAGO' ? 'bg-success/10 text-success border-success/20' :
                property.status === 'OCUPADO' ? 'bg-warning/10 text-warning border-warning/20' :
                'bg-error/10 text-error border-error/20'
              }`}>
                {property.status}
              </span>
            </div>
            <p className="text-on-surface-variant flex items-center gap-1 text-sm">
              <Tag size={14} className="text-secondary" />
              #{property.codigo || property.id.split("-")[0].toUpperCase()} • {property.tipo} para {property.finalidade}
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
            Excluir
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Coluna Esquerda: Galeria e Descrição */}
        <div className="lg:col-span-2 space-y-8">
          {/* Galeria */}
          <Card className="overflow-hidden">
            <div className="relative aspect-video bg-surface-container">
              {hasPhotos ? (
                <>
                  <img
                    src={property.fotos[activePhoto].url}
                    alt="Foto do imóvel"
                    className="w-full h-full object-cover transition-all"
                  />
                  {property.fotos.length > 1 && (
                    <>
                      <button
                        onClick={() => setActivePhoto((prev) => (prev > 0 ? prev - 1 : property.fotos.length - 1))}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                      >
                        <ChevronLeft size={24} />
                      </button>
                      <button
                        onClick={() => setActivePhoto((prev) => (prev < property.fotos.length - 1 ? prev + 1 : 0))}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                      >
                        <ChevronRight size={24} />
                      </button>
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {property.fotos.map((_: any, idx: number) => (
                          <div
                            key={idx}
                            className={`w-2 h-2 rounded-full transition-all ${idx === activePhoto ? 'bg-white w-4' : 'bg-white/50'}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-on-surface-variant/20">
                  <Building2 size={80} />
                  <p className="mt-4 font-bold">Sem fotos cadastradas</p>
                </div>
              )}
            </div>
            {hasPhotos && (
              <div className="p-2 flex gap-2 overflow-x-auto bg-surface-container-low">
                {property.fotos.map((foto: any, idx: number) => (
                  <button
                    key={foto.id}
                    onClick={() => setActivePhoto(idx)}
                    className={`relative w-24 aspect-square rounded overflow-hidden flex-shrink-0 border-2 transition-all ${
                      idx === activePhoto ? 'border-secondary scale-95' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={foto.url} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </Card>

          {/* Localização e Características */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm uppercase tracking-widest text-secondary flex items-center gap-2">
                  <MapPin size={16} /> Localização
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-bold text-on-surface text-lg leading-tight">
                    {property.endereco}, {property.numero}
                  </h4>
                  <p className="text-on-surface-variant">
                    {property.complemento && `${property.complemento} • `}
                    {property.bairro}
                  </p>
                  <p className="text-on-surface-variant">
                    {property.cidade} / {property.estado}
                  </p>
                  <p className="text-xs font-mono mt-2 bg-surface-container w-fit px-2 py-1 rounded">
                    CEP: {property.cep}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm uppercase tracking-widest text-secondary flex items-center gap-2">
                  <Maximize2 size={16} /> Características
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-y-4">
                <div className="flex items-center gap-2">
                  <Maximize2 size={16} className="text-on-surface-variant" />
                  <div className="text-xs">
                    <p className="text-on-surface-variant font-medium">Área Total</p>
                    <p className="font-bold">{property.areaTotal || 0}m²</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Maximize2 size={16} className="text-on-surface-variant" />
                  <div className="text-xs">
                    <p className="text-on-surface-variant font-medium">Área Const.</p>
                    <p className="font-bold">{property.areaConstruida || 0}m²</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Bed size={16} className="text-on-surface-variant" />
                  <div className="text-xs">
                    <p className="text-on-surface-variant font-medium">Quartos</p>
                    <p className="font-bold">{property.quartos || 0}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Bath size={16} className="text-on-surface-variant" />
                  <div className="text-xs">
                    <p className="text-on-surface-variant font-medium">Banheiros</p>
                    <p className="font-bold">{property.banheiros || 0} {property.suites > 0 && `(${property.suites} suítes)`}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Car size={16} className="text-on-surface-variant" />
                  <div className="text-xs">
                    <p className="text-on-surface-variant font-medium">Vagas</p>
                    <p className="font-bold">{property.vagas || 0}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-on-surface-variant" />
                  <div className="text-xs">
                    <p className="text-on-surface-variant font-medium">Cadastro em</p>
                    <p className="font-bold">{new Date(property.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm uppercase tracking-widest text-secondary">Descrição do Imóvel</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-on-surface whitespace-pre-line leading-relaxed">
                {property.descricao || "Nenhuma descrição informada para este imóvel."}
              </p>
              {property.observacoes && (
                <div className="mt-6 p-4 bg-warning/5 border-l-4 border-warning rounded">
                  <p className="text-[10px] font-black uppercase text-warning mb-1">Notas Internas</p>
                  <p className="text-sm text-on-surface italic">{property.observacoes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Coluna Direita: Valores e Proprietário */}
        <div className="space-y-8">
          {/* Valores */}
          <Card className="bg-primary text-on-primary">
            <CardHeader>
              <CardTitle className="text-xs uppercase tracking-[0.2em] text-on-primary/60 font-black">Informações Financeiras</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {(property.finalidade === 'LOCACAO' || property.finalidade === 'AMBOS') && (
                <div>
                  <p className="text-xs font-bold text-on-primary/60 mb-1">Valor do Aluguel</p>
                  <p className="text-3xl font-black text-secondary-container">{formatCurrency(property.valorLocacao || 0)}</p>
                </div>
              )}
              {property.finalidade === 'VENDA' && (
                <div>
                  <p className="text-xs font-bold text-on-primary/60 mb-1">Valor de Venda</p>
                  <p className="text-3xl font-black text-secondary-container">{formatCurrency(property.valorVenda || 0)}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-on-primary/10">
                <div>
                  <p className="text-[10px] font-bold text-on-primary/60 uppercase">Condomínio</p>
                  <p className="text-sm font-bold">{formatCurrency(property.valorCondominio || 0)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-on-primary/60 uppercase">IPTU</p>
                  <p className="text-sm font-bold">{formatCurrency(property.valorIptu || 0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Proprietário */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm uppercase tracking-widest text-secondary">Proprietário</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-secondary-container/20 text-secondary flex items-center justify-center font-black text-lg">
                  {property.owner.nome.charAt(0).toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <h4 className="font-bold text-on-surface truncate">{property.owner.nome}</h4>
                  <p className="text-xs text-on-surface-variant">
                    {property.owner.cpfCnpj.length === 11 ? formatCPF(property.owner.cpfCnpj) : formatCNPJ(property.owner.cpfCnpj)}
                  </p>
                </div>
              </div>
              <div className="space-y-3 pt-3 border-t border-outline-variant">
                <div className="flex items-center gap-3 text-sm text-on-surface">
                  <Phone size={16} className="text-secondary" />
                  <span>{formatPhone(property.owner.telefone || "")}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-on-surface">
                  <Mail size={16} className="text-secondary" />
                  <span className="truncate">{property.owner.email || "Sem email"}</span>
                </div>
                <Link href={`/proprietarios/${property.owner.id}`} className="block pt-2">
                  <Button variant="outline" size="sm" className="w-full">
                    Perfil do Proprietário
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Histórico/Ações Rápidas */}
          <Card className="bg-surface-container-low border-dashed">
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] uppercase font-black text-on-surface-variant">Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="ghost" className="w-full justify-start text-xs gap-2 py-1">
                <Calendar size={14} /> Agendar Visita
              </Button>
              <Button variant="ghost" className="w-full justify-start text-xs gap-2 py-1">
                <FileText size={14} /> Novo Contrato
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Para evitar erro de import do FileText que não está na lista principal acima
import { FileText } from "lucide-react";
