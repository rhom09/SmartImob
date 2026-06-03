import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex w-full bg-[#f8f7ff]">
      {/* Lado Esquerdo - Banner com imagem única */}
      <div className="hidden lg:flex w-1/2 relative items-center justify-center p-8">
        <div className="relative w-full max-w-[500px]">
          <img
            src="/building-mockup.png"
            alt="Branding"
            className="w-full h-auto object-contain"
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
