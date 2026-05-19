"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatCPF, formatCNPJ, formatPhone } from "@/lib/utils";
import { useState } from "react";

const isValidCpfCnpj = (value: string) => {
  const cleaned = value.replace(/\D/g, "");
  return cleaned.length === 11 || cleaned.length === 14;
};

const ownerSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  cpfCnpj: z.string().refine(isValidCpfCnpj, "CPF ou CNPJ inválido"),
  telefone: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  endereco: z.string().optional(),
});

type OwnerFormData = z.infer<typeof ownerSchema>;

interface OwnerFormProps {
  initialData?: any;
  onSubmit: (data: OwnerFormData) => void;
  isLoading?: boolean;
}

export function OwnerForm({ initialData, onSubmit, isLoading }: OwnerFormProps) {
  const [cpfCnpjValue, setCpfCnpjValue] = useState(initialData?.cpfCnpj || "");
  const [phoneValue, setPhoneValue] = useState(initialData?.telefone || "");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<OwnerFormData>({
    resolver: zodResolver(ownerSchema) as any,
    defaultValues: initialData || {
      nome: "",
      cpfCnpj: "",
      telefone: "",
      email: "",
      endereco: "",
    },
  });

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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Nome Completo / Razão Social"
          placeholder="Ex: João Silva"
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
          label="Email"
          type="email"
          placeholder="email@exemplo.com"
          error={errors.email?.message}
          {...register("email")}
        />

        <Input
          label="Telefone"
          placeholder="(00) 00000-0000"
          value={phoneValue}
          onChange={handlePhoneChange}
          error={errors.telefone?.message}
        />

        <div className="md:col-span-2">
          <Input
            label="Endereço Completo"
            placeholder="Rua, Número, Complemento, Bairro"
            error={errors.endereco?.message}
            {...register("endereco")}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="submit" isLoading={isLoading}>
          {initialData ? "Atualizar Proprietário" : "Cadastrar Proprietário"}
        </Button>
      </div>
    </form>
  );
}
