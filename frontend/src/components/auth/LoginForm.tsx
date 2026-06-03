"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { toast } from "sonner";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { GoogleIcon } from "@/components/auth/GoogleIcon";

const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginValues) {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) throw error;
      router.push("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/dashboard` }
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error("Erro ao entrar com Google");
    }
  }

  return (
    <div className="w-full max-w-[440px] p-8 bg-white rounded-2xl shadow-sm border border-outline-variant/20">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-on-surface mb-2">Acessar sua conta</h2>
        <p className="text-muted text-sm">Entre com seu e-mail e senha para continuar</p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-2">
          <Input
            {...form.register("email")}
            label="E-mail"
            icon={<Mail size={18} />}
            placeholder="seu@email.com"
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-on-surface">Senha</label>
            <a href="/esqueci-senha" className="text-sm text-secondary font-bold hover:underline">Esqueci minha senha</a>
          </div>
          <div className="relative">
            <Input
              {...form.register("password")}
              type={showPassword ? "text" : "password"}
              icon={<Lock size={18} />}
              placeholder="••••••••"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 text-muted hover:text-on-surface"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" id="remember" className="rounded border-outline-variant text-secondary focus:ring-secondary" />
          <label htmlFor="remember" className="text-sm text-on-surface-variant">Lembrar de mim</label>
        </div>

        <Button
          className="w-full h-11 font-bold text-base"
          disabled={loading}
        >
          {loading ? "Entrando..." : "→ Entrar"}
        </Button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-outline-variant/30"></div>
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="px-2 bg-white text-muted uppercase font-bold">ou</span>
        </div>
      </div>

      <Button
        variant="outline"
        onClick={handleGoogleLogin}
        className="w-full h-11 font-bold gap-2 hover:bg-surface-container-low"
      >
        <GoogleIcon className="w-4 h-4" />
        Entrar com Google
      </Button>

      <p className="mt-8 text-center text-xs text-muted">© 2026 SmartImob. Todos os direitos reservados.</p>
    </div>
  );
}
