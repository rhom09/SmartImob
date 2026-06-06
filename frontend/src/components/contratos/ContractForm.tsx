"use client";

import { useForm } from "react-hook-form";
import { getApiUrl, fetchWithAuth } from "@/lib/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/Card";

const contractSchema = z.object({
  imovelId: z.string().uuid("Selecione um imóvel"),
  inquilinoId: z.string().uuid("Selecione um inquilino"),
  numeroContrato: z.string().min(1, "Número do contrato é obrigatório"),
  dataInicio: z.string().min(1, "Data de início é obrigatória"),
  dataFim: z.string().min(1, "Data de fim é obrigatória"),
  valorAluguel: z.coerce.number().positive("O valor deve ser positivo"),
  percentualComissao: z.coerce.number().min(0, "Percentual inválido").default(8),
  diaVencimento: z.coerce.number().int().min(1).max(31, "Dia inválido"),
  observacoes: z.string().optional(),
});

type ContractFormData = z.infer<typeof contractSchema>;

interface ContractFormProps {
  onSubmit: (data: ContractFormData) => void;
  isLoading?: boolean;
}

export function ContractForm({ onSubmit, isLoading }: ContractFormProps) {
  const [properties, setProperties] = useState<any[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ContractFormData>({
    resolver: zodResolver(contractSchema) as any,
    defaultValues: {
      diaVencimento: 5,
    },
  });

  useEffect(() => {
    async function fetchOptions() {
      try {
        const [propsRes, tenantsRes] = await Promise.all([
          fetchWithAuth(getApiUrl("/imoveis?status=VAGO")),
          fetchWithAuth(getApiUrl("/clientes?tipo=INQUILINO")),
        ]);

        const propsData = await propsRes.json();
        const tenantsData = await tenantsRes.json();

        setProperties(propsData.data || []);
        setTenants(tenantsData.data || []);
      } catch (error) {
        console.error("Erro ao buscar opções:", error);
      } finally {
        setLoadingOptions(false);
      }
    }
    fetchOptions();
  }, []);

  const selectedImovelId = watch("imovelId");

  useEffect(() => {
    if (selectedImovelId) {
      const imovel = properties.find(p => p.id === selectedImovelId);
      if (imovel && imovel.valorLocacao) {
        setValue("valorAluguel", imovel.valorLocacao);
      }
    }
  }, [selectedImovelId, properties, setValue]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <section className="space-y-4">
        <h4 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant">Partes do Contrato</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-on-surface">Imóvel</label>
            <select
              {...register("imovelId")}
              className="flex h-10 w-full rounded-md border border-outline-variant bg-white px-3 py-2 text-sm text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary transition-all"
            >
              <option value="">Selecione um imóvel vago</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.codigo ? `[${p.codigo}] ` : ""}{p.endereco}
                </option>
              ))}
            </select>
            {errors.imovelId && <p className="text-xs text-error font-medium">{errors.imovelId.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-on-surface">Inquilino</label>
            <select
              {...register("inquilinoId")}
              className="flex h-10 w-full rounded-md border border-outline-variant bg-white px-3 py-2 text-sm text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary transition-all"
            >
              <option value="">Selecione um inquilino</option>
              {tenants.map((t) => (
                <option key={t.id} value={t.id}>{t.nome}</option>
              ))}
            </select>
            {errors.inquilinoId && <p className="text-xs text-error font-medium">{errors.inquilinoId.message}</p>}
          </div>
        </div>
      </section>

      <section className="space-y-4 pt-4 border-t border-outline-variant">
        <h4 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant">Vigência e Valores</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Input
            label="Número do Contrato"
            placeholder="Ex: 2024-001"
            error={errors.numeroContrato?.message}
            {...register("numeroContrato")}
          />

          <Input
            label="Data de Início"
            type="date"
            error={errors.dataInicio?.message}
            {...register("dataInicio")}
          />

          <Input
            label="Data de Fim"
            type="date"
            error={errors.dataFim?.message}
            {...register("dataFim")}
          />

          <Input
            label="Valor do Aluguel"
            type="number"
            step="0.01"
            placeholder="0.00"
            error={errors.valorAluguel?.message}
            {...register("valorAluguel")}
          />

          <Input
            label="% Comissão"
            type="number"
            step="0.1"
            placeholder="8"
            error={errors.percentualComissao?.message}
            {...register("percentualComissao")}
          />

          <Input
            label="Dia de Vencimento"
            type="number"
            min="1"
            max="31"
            error={errors.diaVencimento?.message}
            {...register("diaVencimento")}
          />
        </div>
      </section>

      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-on-surface">Observações</label>
        <textarea
          {...register("observacoes")}
          rows={3}
          className="flex w-full rounded-md border border-outline-variant bg-white px-3 py-2 text-sm text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary transition-all"
          placeholder="Informações adicionais sobre o contrato..."
        />
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t border-outline-variant">
        <Button type="submit" isLoading={isLoading} size="lg">
          Criar Contrato e Gerar Parcelas
        </Button>
      </div>
    </form>
  );
}
