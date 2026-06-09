"use client";

import { useEffect, useState } from "react";
import { fetchWithAuth, getApiUrl } from "../../lib/api";
import { Plus, Search, User, Phone, Mail, Building2, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatCPF, formatCNPJ, formatPhone } from "@/lib/utils";

export default function ProprietariosPage() {
  const [owners, setOwners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setMounted(true);
    fetchOwners();
  }, []);

  const fetchOwners = async (query = "") => {
    setLoading(true);
    try {
      const response = await fetchWithAuth(getApiUrl(`/proprietarios?busca=${query}`));
      const result = await response.json();
      setOwners(result.data || []);
    } catch (error) {
      console.error("Erro ao carregar proprietÃ¡rios:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOwners(searchTerm);
  };

  return (
    <div className="space-y-6 pt-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">ProprietÃ¡rios</h1>
          <p className="text-on-surface-variant">Gerencie os proprietÃ¡rios dos seus imÃ³veis</p>
        </div>
        <Link href="/proprietarios/novo">
          <Button className="gap-2">
            <Plus size={18} />
            Novo ProprietÃ¡rio
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar por nome, CPF ou CNPJ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button type="submit" variant="secondary" className="gap-2">
              <Search size={18} />
              Buscar
            </Button>
          </form>
        </CardHeader>
        <CardContent>
          {!mounted || loading ? (
            <div className="py-12 text-center text-on-surface-variant">Carregando proprietÃ¡rios...</div>
          ) : owners.length === 0 ? (
            <div className="py-12 text-center space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant">
                <User size={24} />
              </div>
              <p className="text-on-surface-variant">Nenhum proprietÃ¡rio encontrado.</p>
              <Link href="/proprietarios/novo">
                <Button variant="outline">Cadastrar primeiro proprietÃ¡rio</Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-6 -mb-6">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-on-surface-variant uppercase bg-surface-container/50 border-y border-outline-variant">
                  <tr>
                    <th scope="col" className="px-6 py-4 font-bold">Nome</th>
                    <th scope="col" className="px-6 py-4 font-bold">Documento</th>
                    <th scope="col" className="px-6 py-4 font-bold">Contato</th>
                    <th scope="col" className="px-6 py-4 font-bold">ImÃ³veis</th>
                    <th scope="col" className="px-6 py-4 font-bold text-right">AÃ§Ãµes</th>
                  </tr>
                </thead>
                <tbody>
                  {owners.map((owner) => (
                    <tr key={owner.id} className="bg-white border-b border-outline-variant hover:bg-surface-container/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-secondary-container/30 text-secondary flex items-center justify-center font-bold text-xs">
                            {owner.nome.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-bold text-on-surface">{owner.nome}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-on-surface-variant font-medium">
                        {owner.cpfCnpj.length === 11 ? formatCPF(owner.cpfCnpj) : formatCNPJ(owner.cpfCnpj)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {owner.telefone && (
                            <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                              <Phone size={12} className="text-secondary/70" />
                              <span>{formatPhone(owner.telefone)}</span>
                            </div>
                          )}
                          {owner.email && (
                            <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                              <Mail size={12} className="text-secondary/70" />
                              <span>{owner.email}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-on-surface-variant">
                          <Building2 size={14} className="text-secondary/70" />
                          <span className="font-bold">{owner._count?.imoveis || 0}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link href={`/proprietarios/${owner.id}`}>
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

