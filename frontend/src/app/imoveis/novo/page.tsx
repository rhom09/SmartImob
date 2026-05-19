"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PropertyForm } from "@/components/imoveis/PropertyForm";

export default function NovoImovelPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("http://localhost:3001/api/imoveis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const result = await response.json();
        setError(result.message || "Erro ao cadastrar imóvel.");
        return;
      }

      router.push("/imoveis");
    } catch (err) {
      setError("Não foi possível conectar ao servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/imoveis">
          <Button variant="ghost" size="icon">
            <ArrowLeft size={20} />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Novo Imóvel</h1>
          <p className="text-on-surface-variant">Cadastre um novo imóvel no inventário</p>
        </div>
      </div>

      {error && (
        <div className="bg-error-container text-on-error-container p-4 rounded-md text-sm font-medium border border-error/20">
          {error}
        </div>
      )}

      <Card>
        <CardContent className="pt-6">
          <PropertyForm onSubmit={handleSubmit} isLoading={loading} />
        </CardContent>
      </Card>
    </div>
  );
}
