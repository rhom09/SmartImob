import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex w-full">
      {/* Lado Esquerdo - Branding */}
      <div className="hidden lg:flex w-1/2 bg-[#f8f7ff] p-16 flex-col justify-between relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center text-white font-bold text-xl">in</div>
            <h1 className="text-2xl font-bold text-primary tracking-tight">SmartImob</h1>
          </div>
          <h2 className="text-4xl font-bold text-primary mb-4 leading-tight">Bem-vindo de volta!</h2>
          <p className="text-on-surface-variant text-lg max-w-sm leading-relaxed">
            Faça login para acessar sua conta e gerenciar seus imóveis com mais praticidade e eficiência.
          </p>
        </div>

        <div className="relative z-10 w-full mt-auto pt-12">
          <img
            src="/building-mockup.png"
            alt="Edifício"
            className="w-full h-auto object-cover rounded-t-3xl shadow-2xl"
          />
        </div>

        <div className="text-on-surface-variant/50 text-sm mt-8 relative z-10">
          © 2026 SmartImob. Todos os direitos reservados.
        </div>
      </div>

      {/* Lado Direito - Login */}
      <div className="flex-1 flex items-center justify-center p-8 bg-surface">
        <LoginForm />
      </div>
    </div>
  );
}
