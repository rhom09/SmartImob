"use client";

import { useEffect, useState } from "react";
import { Plus, Search, User, Phone, Mail, Building2, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatCPF, formatCNPJ, formatPhone } from "@/lib/utils";

export default function ProprietariosPage() {
  const [owners, setOwners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchOwners();
  }, []);

  const fetchOwners = async (query = "") => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/api/proprietarios?busca=${query}`);
      const result = await response.json();
      setOwners(result.data || []);
    } catch (error) {
      console.error("Erro ao carregar proprietários:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOwners(searchTerm);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Proprietários</h1>
          <p className="text-on-surface-variant">Gerencie os proprietários dos seus imóveis</p>
        </div>
        <Link href="/proprietarios/novo">
          <Button className="gap-2">
            <Plus size={18} />
            Novo Proprietário
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
          {loading ? (
            <div className="py-12 text-center text-on-surface-variant">Carregando proprietários...</div>
          ) : owners.length === 0 ? (
            <div className="py-12 text-center space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant">
                <User size={24} />
              </div>
              <p className="text-on-surface-variant">Nenhum proprietário encontrado.</p>
              <Link href="/proprietarios/novo">
                <Button variant="outline">Cadastrar primeiro proprietário</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {owners.map((owner) => (
                <Card key={owner.id} className="hover:border-secondary/50 transition-all group">
                  <CardContent className="p-5 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="w-10 h-10 rounded-full bg-secondary-container/30 text-secondary flex items-center justify-center font-bold">
                        {owner.nome.charAt(0).toUpperCase()}
                      </div>
                      <Link href={`/proprietarios/${owner.id}`} className="text-on-surface-variant hover:text-secondary opacity-0 group-hover:opacity-100 transition-opacity">
                        <ExternalLink size={18} />
                      </Link>
                    </div>

                    <div>
                      <h4 className="font-bold text-on-surface truncate">{owner.nome}</h4>
                      <p className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold mt-0.5">
                        {owner.cpfCnpj.length === 11 ? formatCPF(owner.cpfCnpj) : formatCNPJ(owner.cpfCnpj)}
                      </p>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-outline-variant/50">
                      {owner.telefone && (
                        <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                          <Phone size={14} className="text-secondary" />
                          <span>{formatPhone(owner.telefone)}</span>
                        </div>
                      )}
                      {owner.email && (
                        <div className="flex items-center gap-2 text-sm text-on-surface-variant truncate">
                          <Mail size={14} className="text-secondary" />
                          <span className="truncate">{owner.email}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                        <Building2 size={14} className="text-secondary" />
                        <span>{owner._count?.imoveis || 0} imóveis vinculados</span>
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
