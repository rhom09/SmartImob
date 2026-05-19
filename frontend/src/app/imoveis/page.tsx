"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Building2, MapPin, Bed, Bath, Car, Maximize2, Tag, Filter } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatCurrency } from "@/lib/utils";

export default function ImoveisPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    busca: "",
    tipo: "",
    status: "",
  });

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async (params = filters) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (params.busca) queryParams.append("busca", params.busca);
      if (params.tipo) queryParams.append("tipo", params.tipo);
      if (params.status) queryParams.append("status", params.status);

      const response = await fetch(`http://localhost:3001/api/imoveis?${queryParams.toString()}`);
      const result = await response.json();
      setProperties(result.data || []);
    } catch (error) {
      console.error("Erro ao carregar imóveis:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProperties();
  };

  const getStatusBadge = (status: string) => {
    const styles: any = {
      VAGO: "bg-success/10 text-success border-success/20",
      OCUPADO: "bg-warning/10 text-warning border-warning/20",
      SUSPENSO: "bg-error/10 text-error border-error/20",
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${styles[status] || ""}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Imóveis</h1>
          <p className="text-on-surface-variant">Gerencie seu inventário imobiliário</p>
        </div>
        <Link href="/imoveis/novo">
          <Button className="gap-2">
            <Plus size={18} />
            Novo Imóvel
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSearch} className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[300px]">
              <Input
                placeholder="Buscar por endereço, bairro ou código..."
                value={filters.busca}
                onChange={(e) => setFilters({ ...filters, busca: e.target.value })}
              />
            </div>
            <select
              className="h-10 px-3 rounded-md border border-outline-variant bg-white text-sm"
              value={filters.tipo}
              onChange={(e) => setFilters({ ...filters, tipo: e.target.value })}
            >
              <option value="">Todos os Tipos</option>
              <option value="CASA">Casa</option>
              <option value="APARTAMENTO">Apartamento</option>
              <option value="TERRENO">Terreno</option>
              <option value="COMERCIAL">Comercial</option>
            </select>
            <select
              className="h-10 px-3 rounded-md border border-outline-variant bg-white text-sm"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="">Todos os Status</option>
              <option value="VAGO">Vago</option>
              <option value="OCUPADO">Ocupado</option>
              <option value="SUSPENSO">Suspenso</option>
            </select>
            <Button type="submit" variant="secondary" className="gap-2">
              <Filter size={18} />
              Filtrar
            </Button>
          </form>
        </CardContent>
      </Card>

      {loading ? (
        <div className="py-20 text-center text-on-surface-variant">Carregando imóveis...</div>
      ) : properties.length === 0 ? (
        <div className="py-20 text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant">
            <Building2 size={32} />
          </div>
          <p className="text-on-surface-variant text-lg">Nenhum imóvel encontrado.</p>
          <Link href="/imoveis/novo">
            <Button variant="outline">Cadastrar primeiro imóvel</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {properties.map((property) => (
            <Card key={property.id} className="group hover:border-secondary/30 transition-all flex flex-col">
              <div className="relative h-48 bg-surface-container">
                {property.fotos?.[0] ? (
                  <img
                    src={property.fotos[0].url}
                    alt={property.endereco}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-on-surface-variant/30">
                    <Building2 size={48} />
                  </div>
                )}
                <div className="absolute top-3 left-3">
                  {getStatusBadge(property.status)}
                </div>
                {property.codigo && (
                  <div className="absolute bottom-3 right-3 bg-primary/80 text-on-primary text-[10px] font-bold px-2 py-1 rounded">
                    #{property.codigo}
                  </div>
                )}
              </div>

              <CardContent className="p-4 flex-1 flex flex-col space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-on-surface-variant">
                    <Tag size={12} className="text-secondary" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">{property.tipo}</span>
                  </div>
                  <h4 className="font-bold text-on-surface leading-tight h-10 line-clamp-2">
                    {property.endereco}, {property.numero}
                  </h4>
                  <div className="flex items-center gap-1 text-xs text-on-surface-variant">
                    <MapPin size={12} />
                    <span>{property.bairro}, {property.cidade}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between py-2 border-y border-outline-variant/50">
                  <div className="flex items-center gap-1" title="Quartos">
                    <Bed size={14} className="text-on-surface-variant" />
                    <span className="text-xs font-bold">{property.quartos || 0}</span>
                  </div>
                  <div className="flex items-center gap-1" title="Banheiros">
                    <Bath size={14} className="text-on-surface-variant" />
                    <span className="text-xs font-bold">{property.banheiros || 0}</span>
                  </div>
                  <div className="flex items-center gap-1" title="Vagas">
                    <Car size={14} className="text-on-surface-variant" />
                    <span className="text-xs font-bold">{property.vagas || 0}</span>
                  </div>
                  <div className="flex items-center gap-1" title="Área">
                    <Maximize2 size={14} className="text-on-surface-variant" />
                    <span className="text-xs font-bold">{property.areaTotal || 0}m²</span>
                  </div>
                </div>

                <div className="pt-2 mt-auto">
                  {property.finalidade === "LOCACAO" || property.finalidade === "AMBOS" ? (
                    <div className="flex justify-between items-end">
                      <span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">Locação</span>
                      <span className="text-lg font-black text-secondary">{formatCurrency(property.valorLocacao || 0)}</span>
                    </div>
                  ) : null}
                  {property.finalidade === "VENDA" ? (
                    <div className="flex justify-between items-end">
                      <span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">Venda</span>
                      <span className="text-lg font-black text-secondary">{formatCurrency(property.valorVenda || 0)}</span>
                    </div>
                  ) : null}
                </div>

                <Link href={`/imoveis/${property.id}`} className="block pt-2">
                  <Button variant="outline" size="sm" className="w-full text-xs">
                    Ver Detalhes
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
