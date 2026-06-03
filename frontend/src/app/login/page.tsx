import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#f8f7ff]">
      <div className="flex w-full max-w-[1200px] h-[700px] bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Lado Esquerdo - Banner */}
        <div className="hidden lg:flex w-1/2 relative bg-[#f8f7ff]">
          <img
            src="/building-mockup.png"
            alt="Branding"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Lado Direito - Login */}
        <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
          <div className="w-full max-w-md">
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}
