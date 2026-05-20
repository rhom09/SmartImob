"use client";

import { useEffect, useState } from "react";
import { Plus, Search, FileText, ExternalLink, Calendar, User, Building2 } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function ContratosPage() {
  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    busca: "",
    status: "",
  });

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async (params = filters) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (params.busca) queryParams.append("busca", params.busca);
      if (params.status) queryParams.append("status", params.status);

      const response = await fetch(`http://localhost:3001/api/contratos?${queryParams.toString()}`);
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
          <p className="text-on-surface-variant">Gestão de locações e documentos</p>
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
                placeholder="Buscar por número, inquilino ou endereço..."
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
          {loading ? (
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {contracts.map((contract) => (
                <Card key={contract.id} className="hover:border-secondary/50 transition-all group">
                  <CardContent className="p-5 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold bg-primary/10 text-primary px-2 py-1 rounded">
                          #{contract.numeroContrato}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          contract.status === 'ATIVO' ? 'bg-success/10 text-success' : 'bg-outline-variant/30 text-outline'
                        }`}>
                          {contract.status}
                        </span>
                      </div>
                      <Link href={`/contratos/${contract.id}`} className="text-on-surface-variant hover:text-secondary">
                        <ExternalLink size={18} />
                      </Link>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <User size={18} className="text-on-surface-variant mt-0.5" />
                        <div>
                          <p className="text-[10px] uppercase font-bold text-on-surface-variant">Inquilino</p>
                          <p className="text-sm font-semibold text-on-surface">{contract.inquilino?.nome}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Building2 size={18} className="text-on-surface-variant mt-0.5" />
                        <div>
                          <p className="text-[10px] uppercase font-bold text-on-surface-variant">Imóvel</p>
                          <p className="text-sm font-medium text-on-surface truncate max-w-[300px]">
                            {contract.imovel?.endereco}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-2 border-t border-outline-variant/50">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-on-surface-variant" />
                          <div className="text-xs">
                            <p className="text-[8px] uppercase font-bold text-on-surface-variant">Início</p>
                            <p className="font-medium">{new Date(contract.dataInicio).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[8px] uppercase font-bold text-on-surface-variant">Valor</p>
                          <p className="text-sm font-bold text-secondary">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(contract.valorAluguel))}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
