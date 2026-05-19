import { Home, Building2, Users, FileText, Settings, LogOut, Bell, Search } from "lucide-react";
import Link from "next/link";

const menuItems = [
  { icon: Home, label: "Dashboard", href: "/" },
  { icon: Building2, label: "Imóveis", href: "/imoveis" },
  { icon: Users, label: "Clientes", href: "/clientes" },
  { icon: FileText, label: "Contratos", href: "/contratos" },
  { icon: Settings, label: "Configurações", href: "/configuracoes" },
];

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-sidebar bg-primary text-on-primary flex flex-col z-50">
      <div className="p-6">
        <h1 className="text-xl font-bold tracking-tight">SmartImob</h1>
      </div>

      <nav className="flex-1 px-4 py-2 space-y-1">
        {menuItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-primary-container text-on-primary-container/80 hover:text-on-primary-container transition-colors"
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
  return (
    <header className="fixed top-0 right-0 left-sidebar h-16 bg-white border-b border-outline-variant flex items-center justify-between px-8 z-40">
      <div className="flex items-center gap-4 bg-surface-container-low px-4 py-2 rounded-md w-96">
        <Search size={18} className="text-on-surface-variant" />
        <input
          type="text"
          placeholder="Pesquisar..."
          className="bg-transparent border-none outline-none text-sm w-full text-on-surface"
        />
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 rounded-full hover:bg-surface-container text-on-surface-variant">
          <Bell size={20} />
        </button>
        <div className="flex items-center gap-3 pl-4 border-l border-outline-variant">
          <div className="text-right">
            <p className="text-sm font-semibold text-on-surface">Admin</p>
            <p className="text-xs text-on-surface-variant">Gestor</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-secondary text-on-secondary flex items-center justify-center font-bold text-sm">
            A
          </div>
        </div>
      </div>
    </header>
  );
}
