"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatCPF, formatCNPJ, formatPhone } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useViaCEP } from "@/hooks/useViaCEP";

const isValidCpfCnpj = (value: string) => {
  if (!value) return true; // Optional para interessados
  const cleaned = value.replace(/\D/g, "");
  return cleaned.length === 11 || cleaned.length === 14;
};

const clientSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  tipo: z.enum(["INQUILINO", "INTERESSADO"]),
  cpfCnpj: z.string().refine(isValidCpfCnpj, "CPF ou CNPJ inválido"),
  rg: z.string().optional(),
  dataNascimento: z.string().optional(),
  telefone: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  cep: z.string().optional(),
  endereco: z.string().optional(),
});

type ClientFormData = z.infer<typeof clientSchema>;

interface ClientFormProps {
  initialData?: any;
  onSubmit: (data: ClientFormData) => void;
  isLoading?: boolean;
}

export function ClientForm({ initialData, onSubmit, isLoading }: ClientFormProps) {
  const [cpfCnpjValue, setCpfCnpjValue] = useState(initialData?.cpfCnpj || "");
  const [phoneValue, setPhoneValue] = useState(initialData?.telefone || "");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: initialData || {
      nome: "",
      tipo: "INQUILINO",
      cpfCnpj: "",
      telefone: "",
      email: "",
      cep: "",
      endereco: "",
    },
  });

  const cepValue = watch("cep");
  const { address, loading: loadingCEP } = useViaCEP(cepValue || "");

  useEffect(() => {
    if (address) {
      setValue("endereco", `${address.logradouro}, ${address.bairro}, ${address.localidade} - ${address.uf}`);
    }
  }, [address, setValue]);

  const handleCpfCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    let formatted = value;
    if (value.length <= 11) {
      formatted = formatCPF(value);
    } else {
      formatted = formatCNPJ(value);
    }
    setCpfCnpjValue(formatted);
    setValue("cpfCnpj", value, { shouldValidate: true });
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    setPhoneValue(formatPhone(value));
    setValue("telefone", value);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Tipo */}
      <section className="space-y-4">
        <h4 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant">Classificação</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-on-surface">Tipo de Cliente</label>
            <select
              {...register("tipo")}
              className="flex h-10 w-full rounded-md border border-outline-variant bg-white px-3 py-2 text-sm text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary transition-all"
            >
              <option value="INQUILINO">Inquilino (Requer documentação completa)</option>
              <option value="INTERESSADO">Interessado (Lead)</option>
            </select>
          </div>
        </div>
      </section>

      {/* Dados Pessoais */}
      <section className="space-y-4 pt-4 border-t border-outline-variant">
        <h4 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant">Dados Pessoais</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Nome Completo / Razão Social"
            placeholder="Ex: Maria Oliveira"
            error={errors.nome?.message}
            {...register("nome")}
          />

          <Input
            label="CPF / CNPJ"
            placeholder="000.000.000-00"
            value={cpfCnpjValue}
            onChange={handleCpfCnpjChange}
            error={errors.cpfCnpj?.message}
          />

          <Input
            label="RG"
            placeholder="00.000.000-0"
            error={errors.rg?.message}
            {...register("rg")}
          />

          <Input
            label="Data de Nascimento"
            type="date"
            error={errors.dataNascimento?.message}
            {...register("dataNascimento")}
          />
        </div>
      </section>

      {/* Contato & Endereço */}
      <section className="space-y-4 pt-4 border-t border-outline-variant">
        <h4 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant">Contato e Endereço</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Email"
            type="email"
            placeholder="email@exemplo.com"
            error={errors.email?.message}
            {...register("email")}
          />

          <Input
            label="Telefone / WhatsApp"
            placeholder="(00) 00000-0000"
            value={phoneValue}
            onChange={handlePhoneChange}
            error={errors.telefone?.message}
          />

          <Input
            label="CEP"
            placeholder="00000-000"
            error={errors.cep?.message}
            {...register("cep")}
          />

          <Input
            label="Endereço Completo"
            placeholder={loadingCEP ? "Buscando..." : "Rua, Número, Complemento, Bairro"}
            error={errors.endereco?.message}
            {...register("endereco")}
          />
        </div>
      </section>

      <div className="flex justify-end gap-3 pt-6 border-t border-outline-variant">
        <Button type="submit" isLoading={isLoading} size="lg">
          {initialData ? "Atualizar Cliente" : "Cadastrar Cliente"}
        </Button>
      </div>
    </form>
  );
}
