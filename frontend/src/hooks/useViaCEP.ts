import { useState, useEffect } from "react";

export interface ViaCEPAddress {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

export function useViaCEP(cep: string) {
  const [address, setAddress] = useState<ViaCEPAddress | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cleanedCEP = cep.replace(/\D/g, "");
    if (cleanedCEP.length !== 8) {
      setAddress(null);
      return;
    }

    const fetchAddress = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cleanedCEP}/json/`);
        const data = await response.json();
        if (data.erro) {
          setError("CEP não encontrado.");
          setAddress(null);
        } else {
          setAddress(data);
        }
      } catch (err) {
        setError("Erro ao buscar CEP.");
        setAddress(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAddress();
  }, [cep]);

  return { address, loading, error };
}
