"use client";

import { useEffect, useState } from "react";
import { getApiUrl } from "@/lib/api";
import { Plus, Search, FileText, ExternalLink, Calendar, User, Building2 } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function ContratosPage() {
  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [filters, setFilters] = useState({
    busca: "",
    status: "",
  });

  useEffect(() => {
    setMounted(true);
    fetchContracts();
  }, []);

  const fetchContracts = async (params = filters) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (params.busca) queryParams.append("busca", params.busca);
      if (params.status) queryParams.append("status", params.status);

      const response = await fetch(getApiUrl(`/contratos?${queryParams.toString()}`));
      const result = await response.json();
      setContracts(result.items || []);
    } catch (error) {
      console.error("Erro ao carregar contratos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchContracts();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Contratos</h1>
          <p className="text-on-surface-variant">GestÃ£o de locaÃ§Ãµes e documentos</p>
        </div>
        <Link href="/contratos/novo">
          <Button className="gap-2">
            <Plus size={18} />
            Novo Contrato
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar por nÃºmero, inquilino ou endereÃ§o..."
                value={filters.busca}
                onChange={(e) => setFilters({ ...filters, busca: e.target.value })}
              />
            </div>
            <select
              className="h-10 px-3 rounded-md border border-outline-variant bg-white text-sm"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="">Todos os Status</option>
              <option value="ATIVO">Ativo</option>
              <option value="ENCERRADO">Encerrado</option>
              <option value="SUSPENSO">Suspenso</option>
            </select>
            <Button type="submit" variant="secondary" className="gap-2">
              <Search size={18} />
              Buscar
            </Button>
          </form>
        </CardHeader>
        <CardContent>
          {!mounted || loading ? (
            <div className="py-12 text-center text-on-surface-variant">Carregando contratos...</div>
          ) : contracts.length === 0 ? (
            <div className="py-12 text-center space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant">
                <FileText size={24} />
              </div>
              <p className="text-on-surface-variant">Nenhum contrato encontrado.</p>
              <Link href="/contratos/novo">
                <Button variant="outline">Criar primeiro contrato</Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-6 -mb-6">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-on-surface-variant uppercase bg-surface-container/50 border-y border-outline-variant">
                  <tr>
                    <th scope="col" className="px-6 py-4 font-bold">NÂº Contrato</th>
                    <th scope="col" className="px-6 py-4 font-bold">ImÃ³vel</th>
                    <th scope="col" className="px-6 py-4 font-bold">Inquilino</th>
                    <th scope="col" className="px-6 py-4 font-bold">VigÃªncia</th>
                    <th scope="col" className="px-6 py-4 font-bold">Valor</th>
                    <th scope="col" className="px-6 py-4 font-bold">Status</th>
                    <th scope="col" className="px-6 py-4 font-bold text-right">AÃ§Ãµes</th>
                  </tr>
                </thead>
                <tbody>
                  {contracts.map((contract) => (
                    <tr key={contract.id} className="bg-white border-b border-outline-variant hover:bg-surface-container/30 transition-colors">
                      <td className="px-6 py-4 font-bold text-on-surface">
                        {contract.numeroContrato}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Building2 size={14} className="text-on-surface-variant" />
                          <span className="font-medium text-on-surface truncate max-w-[200px]" title={contract.imovel?.endereco}>
                            {contract.imovel?.endereco}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <User size={14} className="text-on-surface-variant" />
                          <span className="font-medium text-on-surface">
                            {contract.inquilino?.nome}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-xs text-on-surface-variant">
                          <Calendar size={12} />
                          <span>
                            {new Date(contract.dataInicio).toLocaleDateString('pt-BR')} atÃ© {new Date(contract.dataFim).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-secondary">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(contract.valorAluguel)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold border ${
                          contract.status === 'ATIVO' ? 'bg-success/10 text-success border-success/20' :
                          contract.status === 'ENCERRADO' ? 'bg-error/10 text-error border-error/20' :
                          'bg-warning/10 text-warning border-warning/20'
                        }`}>
                          {contract.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link href={`/contratos/${contract.id}`}>
                          <Button variant="outline" size="sm" className="h-8 text-xs">
                            Ver Detalhes
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

