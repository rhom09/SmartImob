"use client";

import { useRouter } from "next/navigation";
import { getApiUrl } from "@/lib/api";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ClientForm } from "@/components/clientes/ClientForm";

export default function NovoClientePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(getApiUrl("/clientes"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const result = await response.json();
        if (result.errors) {
          setError("Erro de validação. Verifique os campos.");
        } else {
          setError(result.message || "Erro ao cadastrar cliente.");
        }
        return;
      }

      router.push("/clientes");
    } catch (err) {
      setError("Não foi possível conectar ao servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/clientes">
          <Button variant="ghost" size="icon">
            <ArrowLeft size={20} />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Novo Cliente</h1>
          <p className="text-on-surface-variant">Cadastre um inquilino ou interessado</p>
        </div>
      </div>

      {error && (
        <div className="bg-error-container text-on-error-container p-4 rounded-md text-sm font-medium border border-error/20">
          {error}
        </div>
      )}

      <Card>
        <CardContent className="pt-6">
          <ClientForm onSubmit={handleSubmit} isLoading={loading} />
        </CardContent>
      </Card>
    </div>
  );
}
