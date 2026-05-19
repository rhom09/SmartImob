"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useViaCEP } from "@/hooks/useViaCEP";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";

const propertySchema = z.object({
  ownerId: z.string().min(1, "Selecione um proprietário"),
  tipo: z.enum(["CASA", "APARTAMENTO", "TERRENO", "COMERCIAL", "SALA", "GALPAO", "OUTROS"]),
  finalidade: z.enum(["VENDA", "LOCACAO", "AMBOS"]),
  cep: z.string().min(8, "CEP inválido"),
  endereco: z.string().min(3, "Endereço obrigatório"),
  numero: z.string().optional(),
  complemento: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().max(2).optional(),
  descricao: z.string().optional(),
  codigo: z.string().optional(),

  // Características
  areaTotal: z.coerce.number().positive().optional(),
  areaConstruida: z.coerce.number().positive().optional(),
  quartos: z.coerce.number().int().min(0).optional(),
  suites: z.coerce.number().int().min(0).optional(),
  banheiros: z.coerce.number().int().min(0).optional(),
  vagas: z.coerce.number().int().min(0).optional(),

  // Valores
  valorVenda: z.coerce.number().positive().optional(),
  valorLocacao: z.coerce.number().positive().optional(),
  valorCondominio: z.coerce.number().min(0).optional(),
  valorIptu: z.coerce.number().min(0).optional(),

  observacoes: z.string().optional(),
});

type PropertyFormData = z.infer<typeof propertySchema>;

interface PropertyFormProps {
  initialData?: any;
  onSubmit: (data: PropertyFormData) => void;
  isLoading?: boolean;
}

export function PropertyForm({ initialData, onSubmit, isLoading }: PropertyFormProps) {
  const [owners, setOwners] = useState<any[]>([]);
  const [ownerSearch, setOwnerSearch] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema) as any,
    defaultValues: initialData || {
      tipo: "CASA",
      finalidade: "LOCACAO",
      cep: "",
      endereco: "",
    },
  });

  const cepValue = watch("cep");
  const { address, loading: loadingCEP } = useViaCEP(cepValue);

  useEffect(() => {
    if (address) {
      setValue("endereco", address.logradouro);
      setValue("bairro", address.bairro);
      setValue("cidade", address.localidade);
      setValue("estado", address.uf);
    }
  }, [address, setValue]);

  useEffect(() => {
    const fetchOwners = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/proprietarios?busca=${ownerSearch}&limit=5`);
        const result = await response.json();
        setOwners(result.data || []);
      } catch (error) {
        console.error("Erro ao buscar proprietários:", error);
      }
    };

    const debounce = setTimeout(fetchOwners, 300);
    return () => clearTimeout(debounce);
  }, [ownerSearch]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Proprietário */}
      <section className="space-y-4">
        <h4 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant">Proprietário</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-on-surface">Selecionar Proprietário</label>
            <div className="relative">
              <Input
                placeholder="Busque por nome ou CPF..."
                className="pl-10"
                value={ownerSearch}
                onChange={(e) => setOwnerSearch(e.target.value)}
              />
              <Search size={18} className="absolute left-3 top-2.5 text-on-surface-variant" />
            </div>
            {owners.length > 0 && ownerSearch.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-outline-variant rounded-md shadow-lg max-h-48 overflow-auto">
                {owners.map((owner) => (
                  <button
                    key={owner.id}
                    type="button"
                    className="w-full px-4 py-2 text-left text-sm hover:bg-surface-container flex justify-between items-center"
                    onClick={() => {
                      setValue("ownerId", owner.id);
                      setOwnerSearch(owner.nome);
                      setOwners([]);
                    }}
                  >
                    <span className="font-medium">{owner.nome}</span>
                    <span className="text-xs text-on-surface-variant">{owner.cpfCnpj}</span>
                  </button>
                ))}
              </div>
            )}
            {errors.ownerId && (
              <p className="text-xs font-medium text-error italic">{errors.ownerId.message}</p>
            )}
          </div>
        </div>
      </section>

      {/* Dados Básicos */}
      <section className="space-y-4 pt-4 border-t border-outline-variant">
        <h4 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant">Dados do Imóvel</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-on-surface">Tipo de Imóvel</label>
            <select
              {...register("tipo")}
              className="flex h-10 w-full rounded-md border border-outline-variant bg-white px-3 py-2 text-sm text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary transition-all"
            >
              <option value="CASA">Casa</option>
              <option value="APARTAMENTO">Apartamento</option>
              <option value="TERRENO">Terreno</option>
              <option value="COMERCIAL">Comercial</option>
              <option value="SALA">Sala</option>
              <option value="GALPAO">Galpão</option>
              <option value="OUTROS">Outros</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-on-surface">Finalidade</label>
            <select
              {...register("finalidade")}
              className="flex h-10 w-full rounded-md border border-outline-variant bg-white px-3 py-2 text-sm text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary transition-all"
            >
              <option value="LOCACAO">Locação</option>
              <option value="VENDA">Venda</option>
              <option value="AMBOS">Ambos</option>
            </select>
          </div>

          <Input
            label="Código do Imóvel (opcional)"
            placeholder="Ex: IMV-001"
            {...register("codigo")}
          />
        </div>
      </section>

      {/* Localização */}
      <section className="space-y-4 pt-4 border-t border-outline-variant">
        <h4 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant">Localização</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Input
            label="CEP"
            placeholder="00000-000"
            error={errors.cep?.message}
            {...register("cep")}
          />
          <div className="md:col-span-2">
            <Input
              label="Endereço"
              placeholder={loadingCEP ? "Buscando..." : "Rua, Avenida, etc."}
              error={errors.endereco?.message}
              {...register("endereco")}
            />
          </div>
          <Input label="Número" placeholder="S/N" {...register("numero")} />

          <Input label="Bairro" placeholder="Bairro" {...register("bairro")} />
          <Input label="Complemento" placeholder="Apto, Sala, etc." {...register("complemento")} />
          <Input label="Cidade" placeholder="Cidade" {...register("cidade")} />
          <Input label="Estado" placeholder="UF" {...register("estado")} />
        </div>
      </section>

      {/* Características */}
      <section className="space-y-4 pt-4 border-t border-outline-variant">
        <h4 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant">Características</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          <Input type="number" label="Área Total (m²)" {...register("areaTotal")} />
          <Input type="number" label="Área Const. (m²)" {...register("areaConstruida")} />
          <Input type="number" label="Quartos" {...register("quartos")} />
          <Input type="number" label="Suítes" {...register("suites")} />
          <Input type="number" label="Banheiros" {...register("banheiros")} />
          <Input type="number" label="Vagas" {...register("vagas")} />
        </div>
      </section>

      {/* Valores */}
      <section className="space-y-4 pt-4 border-t border-outline-variant">
        <h4 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant">Valores</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Input type="number" label="Valor Venda (R$)" {...register("valorVenda")} />
          <Input type="number" label="Valor Aluguel (R$)" {...register("valorLocacao")} />
          <Input type="number" label="Condomínio (R$)" {...register("valorCondominio")} />
          <Input type="number" label="IPTU (R$)" {...register("valorIptu")} />
        </div>
      </section>

      <div className="flex justify-end gap-3 pt-6 border-t border-outline-variant">
        <Button type="submit" isLoading={isLoading} size="lg">
          {initialData ? "Salvar Alterações" : "Cadastrar Imóvel"}
        </Button>
      </div>
    </form>
  );
}
