import Image from "next/image";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex w-full">
      {/* Lado Esquerdo - Branding */}
      <div className="hidden lg:flex w-1/2 bg-primary-container p-12 flex-col justify-between">
        <div>
          <h1 className="text-3xl font-bold text-on-primary-container mb-2">SmartImob</h1>
          <p className="text-on-primary-container/80">Sistema Inteligente de Gestão Imobiliária</p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-on-primary-container">Bem-vindo de volta!</h2>
          <p className="text-on-primary-container/70 max-w-sm">
            Faça login para acessar sua conta e gerenciar seus imóveis com mais praticidade e eficiência.
          </p>
          <div className="relative w-full aspect-video">
            <Image
              src="/building-mockup.png"
              alt="Edifício"
              fill
              className="rounded-2xl shadow-xl object-cover"
              priority
            />
          </div>
        </div>

        <div className="text-on-primary-container/50 text-sm">
          © 2026 SmartImob.
        </div>
      </div>

      {/* Lado Direito - Login */}
      <div className="flex-1 flex items-center justify-center p-8 bg-surface">
        <LoginForm />
      </div>
    </div>
  );
}
