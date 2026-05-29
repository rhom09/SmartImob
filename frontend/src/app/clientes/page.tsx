"use client";

import { useEffect, useState } from "react";
import { getApiUrl } from "@/lib/api";
import { Plus, Search, Users, ExternalLink, Phone, Mail, Filter } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatCPF, formatCNPJ, formatPhone } from "@/lib/utils";

export default function ClientesPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [filters, setFilters] = useState({
    busca: "",
    tipo: "",
  });

  useEffect(() => {
    setMounted(true);
    fetchClients();
  }, []);

  const fetchClients = async (params = filters) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (params.busca) queryParams.append("busca", params.busca);
      if (params.tipo) queryParams.append("tipo", params.tipo);

      const response = await fetch(getApiUrl("/clientes?${queryParams.toString()}"));
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
          {!mounted || loading ? (
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
            <div className="overflow-x-auto -mx-6 -mb-6">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-on-surface-variant uppercase bg-surface-container/50 border-y border-outline-variant">
                  <tr>
                    <th scope="col" className="px-6 py-4 font-bold">Nome / Tipo</th>
                    <th scope="col" className="px-6 py-4 font-bold">Documento</th>
                    <th scope="col" className="px-6 py-4 font-bold">Contato</th>
                    <th scope="col" className="px-6 py-4 font-bold">Resumo</th>
                    <th scope="col" className="px-6 py-4 font-bold text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((client) => (
                    <tr key={client.id} className="bg-white border-b border-outline-variant hover:bg-surface-container/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                            client.tipo === 'INQUILINO' ? 'bg-secondary/10 text-secondary' : 'bg-outline-variant/30 text-outline'
                          }`}>
                            {client.nome.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-on-surface">{client.nome}</div>
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${
                              client.tipo === 'INQUILINO' ? 'text-secondary' : 'text-outline'
                            }`}>
                              {client.tipo}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-on-surface-variant font-medium">
                        {client.cpfCnpj.length === 11 ? formatCPF(client.cpfCnpj) : formatCNPJ(client.cpfCnpj)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {client.telefone && (
                            <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                              <Phone size={12} className="text-primary/60" />
                              <span>{formatPhone(client.telefone)}</span>
                            </div>
                          )}
                          {client.email && (
                            <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                              <Mail size={12} className="text-primary/60" />
                              <span>{client.email}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1 text-xs font-medium text-on-surface-variant">
                          <span><strong className="text-on-surface">{client._count?.contratos || 0}</strong> contratos</span>
                          <span><strong className="text-on-surface">{client._count?.interacoes || 0}</strong> interações</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link href={`/clientes/${client.id}`}>
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
