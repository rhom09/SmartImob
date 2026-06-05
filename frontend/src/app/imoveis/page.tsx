"use client";

import { useEffect, useState } from "react";
import { fetchWithAuth, getApiUrl } from "@/lib/api";
import { Plus, Building2, Filter } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatCurrency } from "@/lib/utils";

export default function ImoveisPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [filters, setFilters] = useState({
    busca: "",
    tipo: "",
    status: "",
  });

  useEffect(() => {
    setMounted(true);
    fetchProperties();
  }, []);

  const fetchProperties = async (params = filters) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (params.busca) queryParams.append("busca", params.busca);
      if (params.tipo) queryParams.append("tipo", params.tipo);
      if (params.status) queryParams.append("status", params.status);

      const response = await fetchWithAuth(getApiUrl(`/imoveis?${queryParams.toString()}`));
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
          <p className="text-on-surface-variant text-sm font-medium">Gerencie seu inventário imobiliário</p>
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
              className="h-10 px-3 rounded-md border border-outline-variant bg-white text-sm text-on-surface"
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
              className="h-10 px-3 rounded-md border border-outline-variant bg-white text-sm text-on-surface"
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

      {!mounted || loading ? (
        <div className="py-20 text-center text-on-surface-variant">Carregando imóveis...</div>
      ) : properties.length === 0 ? (
        <div className="py-20 text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant">
            <Building2 size={32} />
          </div>
          <p className="text-on-surface-variant text-lg font-medium">Nenhum imóvel encontrado.</p>
          <Link href="/imoveis/novo">
            <Button variant="outline">Cadastrar primeiro imóvel</Button>
          </Link>
        </div>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="text-xs text-on-surface-variant uppercase bg-surface-container/50 border-b border-outline-variant">
                <tr>
                  <th scope="col" className="px-6 py-4 font-bold">Código</th>
                  <th scope="col" className="px-6 py-4 font-bold">Endereço</th>
                  <th scope="col" className="px-6 py-4 font-bold">Tipo</th>
                  <th scope="col" className="px-6 py-4 font-bold">Finalidade</th>
                  <th scope="col" className="px-6 py-4 font-bold">Valor</th>
                  <th scope="col" className="px-6 py-4 font-bold">Status</th>
                  <th scope="col" className="px-6 py-4 font-bold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {properties.map((property) => (
                  <tr key={property.id} className="bg-white hover:bg-surface-container/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-on-surface">
                      {property.codigo ? `#${property.codigo}` : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-on-surface">{property.endereco}, {property.numero}</div>
                      <div className="text-xs text-on-surface-variant font-medium">{property.bairro}, {property.cidade} - {property.estado}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">
                        {property.tipo}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-on-surface-variant font-bold uppercase tracking-tighter text-[10px]">
                      {property.finalidade}
                    </td>
                    <td className="px-6 py-4 font-bold text-secondary">
                      {property.finalidade === 'VENDA'
                        ? formatCurrency(property.valorVenda || 0)
                        : formatCurrency(property.valorLocacao || 0)
                      }
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(property.status)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/imoveis/${property.id}`}>
                        <Button variant="outline" size="sm" className="h-8 text-xs font-bold">
                          Ver Detalhes
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
