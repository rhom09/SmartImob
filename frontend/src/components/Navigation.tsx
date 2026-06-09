"use client";

import { Home, Building2, Users, FileText, Settings, LogOut, Search, UserCheck, DollarSign, Receipt, Menu, X } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { NotificationBell } from "./NotificationBell";

const menuItems = [
  { icon: Home, label: "Dashboard", href: "/dashboard" },
  { icon: Building2, label: "Imóveis", href: "/imoveis" },
  { icon: UserCheck, label: "Proprietários", href: "/proprietarios" },
  { icon: Users, label: "Clientes", href: "/clientes" },
  { icon: FileText, label: "Contratos", href: "/contratos" },
  { icon: DollarSign, label: "Financeiro", href: "/financeiro" },
  { icon: Receipt, label: "Recibos", href: "/financeiro/recibos" },
  { icon: Settings, label: "Configurações", href: "/configuracoes" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-sidebar bg-primary text-on-primary flex-col z-50">
      <div className="p-6">
        <h1 className="text-xl font-bold tracking-tight">SmartImob</h1>
      </div>

      <nav className="flex-1 px-4 py-2 space-y-1">
        {menuItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
              pathname === item.href
                ? 'bg-primary-container text-on-primary'
                : 'text-on-primary-container/80 hover:bg-primary-container/50 hover:text-on-primary-container'
            }`}
          >
            <item.icon size={20} />
            <span className="text-sm font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-primary-container">
        <button className="flex items-center gap-3 w-full px-3 py-2 rounded-md hover:bg-primary-container text-on-primary-container/80 hover:text-on-primary-container transition-colors">
          <LogOut size={20} />
          <span className="text-sm font-medium">Sair</span>
        </button>
      </div>
    </aside>
  );
}

import { supabase } from "@/lib/supabase";

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    setIsMobileMenuOpen(false);

    // Busca dados do usuário
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser({
          name: data.user.user_metadata?.name || "Usuário",
          role: "Gestor" // Pode ser extraído de metadata se necessário
        });
      }
    });
  }, [pathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-sidebar bg-primary text-on-primary flex-col z-50">
      <div className="p-6">
        <h1 className="text-xl font-bold tracking-tight">SmartImob</h1>
      </div>

      <nav className="flex-1 px-4 py-2 space-y-1">
        {menuItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
              pathname === item.href
                ? 'bg-primary-container text-on-primary'
                : 'text-on-primary-container/80 hover:bg-primary-container/50 hover:text-on-primary-container'
            }`}
          >
            <item.icon size={20} />
            <span className="text-sm font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-primary-container">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-md hover:bg-primary-container text-on-primary-container/80 hover:text-on-primary-container transition-colors"
        >
          <LogOut size={20} />
          <span className="text-sm font-medium">Sair</span>
        </button>
      </div>
    </aside>
  );
}

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<{ firstName: string; role: string } | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    setIsMobileMenuOpen(false);

    // Busca dados do usuário diretamente do banco para garantir consistência
    const fetchUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        // Busca perfil completo no banco usando email
        const { data: dbUser } = await supabase
          .from('USUARIOS')
          .select('nome, perfil')
          .eq('email', authUser.email)
          .single();

        if (dbUser) {
          const firstName = dbUser.nome.split(' ')[0];
          setUser({
            name: firstName,
            role: dbUser.perfil
          });
        }
      }
    };
    fetchUser();
  }, [pathname]);

      {/* Mobile Menu (Overlay) */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[100] flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Sidebar drawer */}
          <div className="relative w-72 h-full bg-primary text-on-primary flex flex-col animate-in slide-in-from-left duration-300">
            <div className="p-6 flex items-center justify-between">
              <h1 className="text-xl font-bold tracking-tight">SmartImob</h1>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1 rounded-full hover:bg-primary-container text-on-primary"
              >
                <X size={24} />
              </button>
            </div>

            <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
              {menuItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                    pathname === item.href
                      ? 'bg-primary-container text-on-primary'
                      : 'text-on-primary-container/80 hover:bg-primary-container/50 hover:text-on-primary-container'
                  }`}
                >
                  <item.icon size={20} />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              ))}
            </nav>

            <div className="p-4 border-t border-primary-container">
              <button className="flex items-center gap-3 w-full px-3 py-2 rounded-md hover:bg-primary-container text-on-primary-container/80 hover:text-on-primary-container transition-colors">
                <LogOut size={20} />
                <span className="text-sm font-medium">Sair</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
