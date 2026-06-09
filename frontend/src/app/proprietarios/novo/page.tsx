"use client";

import { useRouter } from "next/navigation";
import { getApiUrl, fetchWithAuth } from "@/lib/api";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { OwnerForm } from "@/components/proprietarios/OwnerForm";

export default function NovoProprietarioPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchWithAuth(getApiUrl("/proprietarios"), {
        method: "POST",
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const result = await response.json();
        if (result.errors) {
          setError("Erro de validação. Verifique os campos.");
        } else {
          setError(result.message || "Erro ao cadastrar proprietário.");
        }
        return;
      }

      router.push("/proprietarios");
    } catch (err) {
      setError("Não foi possível conectar ao servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pt-20">
      <div className="flex items-center gap-4">
        <Link href="/proprietarios">
          <Button variant="ghost" size="icon">
            <ArrowLeft size={20} />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Novo Proprietário</h1>
          <p className="text-on-surface-variant">Cadastre um novo proprietário no sistema</p>
        </div>
      </div>

      {error && (
        <div className="bg-error-container text-on-error-container p-4 rounded-md text-sm font-medium border border-error/20">
          {error}
        </div>
      )}

      <Card>
        <CardContent className="pt-6">
          <OwnerForm onSubmit={handleSubmit} isLoading={loading} />
        </CardContent>
      </Card>
    </div>
  );
}
