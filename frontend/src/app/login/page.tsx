import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex w-full bg-[#f8f7ff]">
      {/* Lado Esquerdo - Branding/Banner */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden">
        <div className="relative w-full h-full flex flex-col p-16 z-10">
          <div className="flex items-center gap-2 mb-12">
            <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center text-white font-bold text-xl">in</div>
            <h1 className="text-2xl font-bold text-primary tracking-tight">SmartImob</h1>
          </div>

          <div className="flex-1 flex flex-col justify-center">
            <h2 className="text-4xl font-bold text-primary mb-4 leading-tight">Bem-vindo de volta!</h2>
            <p className="text-on-surface-variant text-lg max-w-sm leading-relaxed mb-8">
              Faça login para acessar sua conta e gerenciar seus imóveis com mais praticidade e eficiência.
            </p>
          </div>

          <div className="mt-auto text-on-surface-variant/50 text-sm">
            © 2026 SmartImob. Todos os direitos reservados.
          </div>
        </div>

        {/* Imagem do prédio integrada ao fundo */}
        <div className="absolute bottom-0 right-0 w-[80%] h-[75%] translate-x-10">
          <img
            src="/building-mockup.png"
            alt="Edifício"
            className="w-full h-full object-contain object-bottom"
          />
        </div>
      </div>

      {/* Lado Direito - Login */}
      <div className="flex-1 flex items-center justify-center p-8 bg-surface">
        <LoginForm />
      </div>
    </div>
  );
}
