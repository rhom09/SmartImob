"use client";

import { useForm } from "react-hook-form";
import { getApiUrl, fetchWithAuth } from "@/lib/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useViaCEP } from "@/hooks/useViaCEP";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";

const propertySchema = z.object({
  ownerId: z.string().min(1, "Selecione um proprietÃ¡rio"),
  tipo: z.enum(["CASA", "APARTAMENTO", "TERRENO", "COMERCIAL", "SALA", "GALPAO", "OUTROS"]),
  finalidade: z.enum(["VENDA", "LOCACAO", "AMBOS"]),
  cep: z.string().min(8, "CEP invÃ¡lido"),
  endereco: z.string().min(3, "EndereÃ§o obrigatÃ³rio"),
  numero: z.string().optional(),
  complemento: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().max(2).optional(),
  descricao: z.string().optional(),
  codigo: z.string().optional(),

  // CaracterÃ­sticas
  areaTotal: z.preprocess((val) => (val === "" || val === null ? undefined : val), z.coerce.number().min(0).optional()),
  areaConstruida: z.preprocess((val) => (val === "" || val === null ? undefined : val), z.coerce.number().min(0).optional()),
  quartos: z.preprocess((val) => (val === "" || val === null ? undefined : val), z.coerce.number().int().min(0).optional()),
  suites: z.preprocess((val) => (val === "" || val === null ? undefined : val), z.coerce.number().int().min(0).optional()),
  banheiros: z.preprocess((val) => (val === "" || val === null ? undefined : val), z.coerce.number().int().min(0).optional()),
  vagas: z.preprocess((val) => (val === "" || val === null ? undefined : val), z.coerce.number().int().min(0).optional()),

  // Valores
  valorVenda: z.preprocess((val) => (val === "" || val === null ? undefined : val), z.coerce.number().min(0).optional()),
  valorLocacao: z.preprocess((val) => (val === "" || val === null ? undefined : val), z.coerce.number().min(0).optional()),
  valorCondominio: z.preprocess((val) => (val === "" || val === null ? undefined : val), z.coerce.number().min(0).optional()),
  valorIptu: z.preprocess((val) => (val === "" || val === null ? undefined : val), z.coerce.number().min(0).optional()),
  valorAgua: z.preprocess((val) => (val === "" || val === null ? undefined : val), z.coerce.number().min(0).optional()),
  valorLuz: z.preprocess((val) => (val === "" || val === null ? undefined : val), z.coerce.number().min(0).optional()),
  outrosDebitos: z.preprocess((val) => (val === "" || val === null ? undefined : val), z.coerce.number().min(0).optional()),
  descontos: z.preprocess((val) => (val === "" || val === null ? undefined : val), z.coerce.number().min(0).optional()),

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
    reset,
    formState: { errors, isValid, isSubmitting },
  } = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema) as any,
    mode: "onChange",
    defaultValues: initialData || {
      tipo: "CASA",
      finalidade: "LOCACAO",
      cep: "",
      endereco: "",
    },
  });

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      console.log("Validation Errors:", errors);
    }
  }, [errors]);

  const cepValue = watch("cep");
  const { address, loading: loadingCEP } = useViaCEP(cepValue);

  useEffect(() => {
    if (initialData) {
      // Limpar campos que podem vir como null do banco para evitar erro de validaÃ§Ã£o do Zod
      const cleanedData = { ...initialData };
      Object.keys(cleanedData).forEach(key => {
        if (cleanedData[key] === null) {
          cleanedData[key] = undefined;
        }
      });

      reset(cleanedData);
      if (initialData.ownerId) {
        setValue("ownerId", initialData.ownerId);
      }
      if (initialData.owner) {
        setOwnerSearch(initialData.owner.nome);
      }
    }
  }, [initialData, reset, setValue]);

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
        const response = await fetchWithAuth(getApiUrl(`/proprietarios?busca=${ownerSearch}&limit=5`));
        const result = await response.json();
        setOwners(result.data || []);
      } catch (error) {
        console.error("Erro ao buscar proprietÃ¡rios:", error);
      }
    };

    const debounce = setTimeout(fetchOwners, 300);
    return () => clearTimeout(debounce);
  }, [ownerSearch]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* ProprietÃ¡rio */}
      <section className={`space-y-4 ${initialData ? 'hidden' : ''}`}>
        <h4 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant">ProprietÃ¡rio</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-on-surface">Selecionar ProprietÃ¡rio</label>
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

      {/* Dados BÃ¡sicos */}
      <section className="space-y-4 pt-4 border-t border-outline-variant">
        <h4 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant">Dados do ImÃ³vel</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-on-surface">Tipo de ImÃ³vel</label>
            <select
              {...register("tipo")}
              className="flex h-10 w-full rounded-md border border-outline-variant bg-white px-3 py-2 text-sm text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary transition-all"
            >
              <option value="CASA">Casa</option>
              <option value="APARTAMENTO">Apartamento</option>
              <option value="TERRENO">Terreno</option>
              <option value="COMERCIAL">Comercial</option>
              <option value="SALA">Sala</option>
              <option value="GALPAO">GalpÃ£o</option>
              <option value="OUTROS">Outros</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-on-surface">Finalidade</label>
            <select
              {...register("finalidade")}
              className="flex h-10 w-full rounded-md border border-outline-variant bg-white px-3 py-2 text-sm text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary transition-all"
            >
              <option value="LOCACAO">LocaÃ§Ã£o</option>
              <option value="VENDA">Venda</option>
              <option value="AMBOS">Ambos</option>
            </select>
          </div>

          <Input
            label="CÃ³digo do ImÃ³vel (opcional)"
            placeholder="Ex: IMV-001"
            {...register("codigo")}
          />
        </div>
      </section>

      {/* LocalizaÃ§Ã£o */}
      <section className="space-y-4 pt-4 border-t border-outline-variant">
        <h4 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant">LocalizaÃ§Ã£o</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Input
            label="CEP"
            placeholder="00000-000"
            error={errors.cep?.message}
            {...register("cep")}
          />
          <div className="md:col-span-2">
            <Input
              label="EndereÃ§o"
              placeholder={loadingCEP ? "Buscando..." : "Rua, Avenida, etc."}
              error={errors.endereco?.message}
              {...register("endereco")}
            />
          </div>
          <Input label="NÃºmero" placeholder="S/N" {...register("numero")} />

          <Input label="Bairro" placeholder="Bairro" {...register("bairro")} />
          <Input label="Complemento" placeholder="Apto, Sala, etc." {...register("complemento")} />
          <Input label="Cidade" placeholder="Cidade" {...register("cidade")} />
          <Input label="Estado" placeholder="UF" {...register("estado")} />
        </div>
      </section>

      {/* CaracterÃ­sticas */}
      <section className="space-y-4 pt-4 border-t border-outline-variant">
        <h4 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant">CaracterÃ­sticas</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          <Input type="number" label="Ãrea Total (mÂ²)" {...register("areaTotal")} />
          <Input type="number" label="Ãrea Const. (mÂ²)" {...register("areaConstruida")} />
          <Input type="number" label="Quartos" {...register("quartos")} />
          <Input type="number" label="SuÃ­tes" {...register("suites")} />
          <Input type="number" label="Banheiros" {...register("banheiros")} />
          <Input type="number" label="Vagas" {...register("vagas")} />
        </div>
      </section>

      {/* Valores */}
      <section className="space-y-4 pt-4 border-t border-outline-variant">
        <h4 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant">Valores e Despesas Mensais</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Input type="number" step="0.01" label="Valor Venda (R$)" {...register("valorVenda")} />
          <Input type="number" step="0.01" label="Valor Aluguel (R$)" {...register("valorLocacao")} />
          <Input type="number" step="0.01" label="CondomÃ­nio (R$)" {...register("valorCondominio")} />
          <Input type="number" step="0.01" label="IPTU (R$)" {...register("valorIptu")} />
          <Input type="number" step="0.01" label="Ãgua (R$)" {...register("valorAgua")} />
          <Input type="number" step="0.01" label="Luz (R$)" {...register("valorLuz")} />
          <Input type="number" step="0.01" label="Outros DÃ©bitos (R$)" {...register("outrosDebitos")} />
          <Input type="number" step="0.01" label="Descontos (R$)" {...register("descontos")} />
        </div>
      </section>

      <div className="flex flex-col gap-3 pt-6 border-t border-outline-variant">
        {!isValid && (
          <p className="text-xs font-bold text-error text-right uppercase animate-pulse">
            Preencha todos os campos obrigatÃ³rios para salvar
          </p>
        )}
        <div className="flex justify-end gap-3">
          <Button
            type="submit"
            isLoading={isLoading || isSubmitting}
            size="lg"
            disabled={!isValid}
          >
            {initialData ? "Salvar AlteraÃ§Ãµes" : "Cadastrar ImÃ³vel"}
          </Button>
        </div>
      </div>
    </form>
  );
}

