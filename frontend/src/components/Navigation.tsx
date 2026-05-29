"use client";

import { Home, Building2, Users, FileText, Settings, LogOut, Bell, Search, UserCheck, DollarSign, Receipt, Menu, X } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

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

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Fecha o menu móvel quando o caminho muda
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <>
      <header className="fixed top-0 right-0 left-0 lg:left-sidebar h-16 bg-white border-b border-outline-variant flex items-center justify-between px-4 md:px-8 z-40">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden p-2 -ml-2 rounded-full hover:bg-surface-container text-on-surface"
          >
            <Menu size={24} />
          </button>
          <div className="hidden md:flex items-center gap-4 bg-surface-container-low px-4 py-2 rounded-md w-64 lg:w-96">
            <Search size={18} className="text-on-surface-variant" />
            <input
              type="text"
              placeholder="Pesquisar..."
              className="bg-transparent border-none outline-none text-sm w-full text-on-surface"
            />
          </div>
          <h1 className="md:hidden text-lg font-bold text-primary">SmartImob</h1>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <button className="p-2 rounded-full hover:bg-surface-container text-on-surface-variant">
            <Bell size={20} />
          </button>
          <div className="flex items-center gap-3 pl-2 md:pl-4 border-l border-outline-variant">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-semibold text-on-surface leading-tight">Admin</p>
              <p className="text-[10px] uppercase tracking-tighter text-on-surface-variant font-bold">Gestor</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-secondary text-on-secondary flex items-center justify-center font-bold text-sm">
              A
            </div>
          </div>
        </div>
      </header>

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
