"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Users, ExternalLink, Phone, Mail, Filter } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatCPF, formatCNPJ, formatPhone } from "@/lib/utils";

export default function ClientesPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    busca: "",
    tipo: "",
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async (params = filters) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (params.busca) queryParams.append("busca", params.busca);
      if (params.tipo) queryParams.append("tipo", params.tipo);

      const response = await fetch(`http://localhost:3001/api/clientes?${queryParams.toString()}`);
      const result = await response.json();
      setClients(result.data || []);
    } catch (error) {
      console.error("Erro ao carregar clientes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchClients();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Clientes</h1>
          <p className="text-on-surface-variant">Gestão de Inquilinos e Interessados</p>
        </div>
        <Link href="/clientes/novo">
          <Button className="gap-2">
            <Plus size={18} />
            Novo Cliente
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar por nome, CPF, CNPJ ou email..."
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
              <option value="INQUILINO">Inquilinos</option>
              <option value="INTERESSADO">Interessados</option>
            </select>
            <Button type="submit" variant="secondary" className="gap-2">
              <Search size={18} />
              Buscar
            </Button>
          </form>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-12 text-center text-on-surface-variant">Carregando clientes...</div>
          ) : clients.length === 0 ? (
            <div className="py-12 text-center space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant">
                <Users size={24} />
              </div>
              <p className="text-on-surface-variant">Nenhum cliente encontrado.</p>
              <Link href="/clientes/novo">
                <Button variant="outline">Cadastrar primeiro cliente</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clients.map((client) => (
                <Card key={client.id} className="hover:border-secondary/50 transition-all group">
                  <CardContent className="p-5 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                          {client.nome.charAt(0).toUpperCase()}
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${
                          client.tipo === 'INQUILINO' ? 'bg-secondary/10 text-secondary' : 'bg-outline-variant/30 text-outline'
                        }`}>
                          {client.tipo}
                        </span>
                      </div>
                      <Link href={`/clientes/${client.id}`} className="text-on-surface-variant hover:text-secondary opacity-0 group-hover:opacity-100 transition-opacity">
                        <ExternalLink size={18} />
                      </Link>
                    </div>

                    <div>
                      <h4 className="font-bold text-on-surface truncate">{client.nome}</h4>
                      <p className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold mt-0.5">
                        {client.cpfCnpj.length === 11 ? formatCPF(client.cpfCnpj) : formatCNPJ(client.cpfCnpj)}
                      </p>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-outline-variant/50">
                      {client.telefone && (
                        <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                          <Phone size={14} className="text-primary/60" />
                          <span>{formatPhone(client.telefone)}</span>
                        </div>
                      )}
                      {client.email && (
                        <div className="flex items-center gap-2 text-sm text-on-surface-variant truncate">
                          <Mail size={14} className="text-primary/60" />
                          <span className="truncate">{client.email}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-xs font-semibold text-outline pt-2">
                        <span>{client._count?.contratos || 0} contratos</span>
                        <span>•</span>
                        <span>{client._count?.interacoes || 0} interações</span>
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
