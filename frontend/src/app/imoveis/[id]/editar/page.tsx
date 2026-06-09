"use client";

import { useEffect, useState } from "react";
import { getApiUrl, fetchWithAuth } from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PropertyForm } from "@/components/imoveis/PropertyForm";

export default function EditarImovelPage() {
  const { id } = useParams();
  const router = useRouter();
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) fetchProperty();
  }, [id]);

  const fetchProperty = async () => {
    try {
      const response = await fetchWithAuth(getApiUrl("/imoveis/${id}"));
      if (!response.ok) throw new Error("Imóvel não encontrado");
      const data = await response.json();
      setProperty(data);
    } catch (error) {
      console.error("Erro ao buscar imóvel:", error);
      setError("Não foi possível carregar os dados do imóvel.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: any) => {
    console.log("Submitting updated data:", data);
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetchWithAuth(getApiUrl("/imoveis/${id}"), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const result = await response.json();
        console.log("Server error result:", result);
        // Formatar erros de validação do servidor se houver
        const errorMessage = result.errors
          ? `Erro de validação: ${Object.values(result.errors).flat().join(", ")}`
          : result.message || "Erro ao atualizar imóvel.";
        setError(errorMessage);
        return;
      }

      router.push(`/imoveis/${id}`);
    } catch (err) {
      console.error("Submission error:", err);
      setError("Não foi possível conectar ao servidor.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="py-20 text-center text-on-surface-variant">Carregando dados...</div>;
  if (!property && error) return <div className="py-20 text-center text-error">{error}</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pt-20">
      <div className="flex items-center gap-4">
        <Link href={`/imoveis/${id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft size={20} />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Editar Imóvel</h1>
          <p className="text-on-surface-variant">Atualize as informações do imóvel #{property?.codigo || id}</p>
        </div>
      </div>

      {error && (
        <div className="bg-error-container text-on-error-container p-4 rounded-md text-sm font-medium border border-error/20">
          {error}
        </div>
      )}

      <Card>
        <CardContent className="pt-6">
          <PropertyForm
            initialData={property}
            onSubmit={handleSubmit}
            isLoading={submitting}
          />
        </CardContent>
      </Card>
    </div>
  );
}
