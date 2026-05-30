"use client";

import { useEffect, useState, useRef } from "react";
import { Bell, Check, ExternalLink, Calendar } from "lucide-react";
import { getApiUrl } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { Button } from "./ui/Button";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function NotificationBell() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => n.status === "ATIVO").length;

  useEffect(() => {
    // 1. Monitora mudanças na sessão para disparar a busca quando o login for confirmado
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.access_token) {
        fetchNotifications();
      }
    });

    // 2. Tenta uma busca inicial (caso a sessão já exista)
    fetchNotifications();

    // 3. Fecha o dropdown ao clicar fora
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      subscription.unsubscribe();
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      // Se não houver token, ainda assim permitimos a busca (Modo Desenvolvimento / Mock)
      // O backend cuidará de injetar o usuário Mock.
      setLoading(true);
      const response = await fetch(getApiUrl("/notifications"), {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }

      const data = await response.json();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erro ao carregar notificações:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const response = await fetch(getApiUrl(`/notifications/${id}/read`), {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, status: "LIDO" } : n))
        );
      }
    } catch (error) {
      console.error("Erro ao marcar como lida:", error);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full hover:bg-surface-container text-on-surface-variant relative transition-colors"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-error text-on-error text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white border border-outline-variant rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in duration-200 origin-top-right">
          <div className="p-4 border-b border-outline-variant bg-surface-container-low flex items-center justify-between">
            <h3 className="font-bold text-on-surface">Notificações</h3>
            <span className="text-[10px] font-bold uppercase tracking-wider text-secondary bg-secondary/10 px-2 py-0.5 rounded">
              {unreadCount} novas
            </span>
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <div className="p-8 text-center text-on-surface-variant text-sm">Carregando...</div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-on-surface-variant text-sm font-medium">
                Nenhuma notificação por enquanto.
              </div>
            ) : (
              <div className="divide-y divide-outline-variant/30">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={cn(
                      "p-4 transition-colors hover:bg-surface-container-lowest",
                      n.status === "ATIVO" ? "bg-secondary/5" : "bg-transparent"
                    )}
                  >
                    <div className="flex gap-3">
                      <div className="mt-1 w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center shrink-0 text-secondary">
                        <Calendar size={16} />
                      </div>
                      <div className="flex-1 min-w-0 text-sm">
                        <p className={cn(
                          "leading-tight",
                          n.status === "ATIVO" ? "font-bold text-on-surface" : "text-on-surface-variant"
                        )}>
                          {n.mensagem}
                        </p>
                        <p className="text-[10px] text-on-surface-variant mt-1 font-medium">
                          {new Date(n.createdAt).toLocaleString('pt-BR')}
                        </p>

                        <div className="mt-3 flex items-center gap-2">
                          {n.contratoId && (
                            <Link
                              href={`/contratos/${n.contratoId}`}
                              onClick={() => setIsOpen(false)}
                            >
                              <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1.5 font-bold">
                                <ExternalLink size={12} />
                                Detalhes
                              </Button>
                            </Link>
                          )}
                          {n.status === "ATIVO" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-[10px] gap-1.5 font-bold text-secondary"
                              onClick={() => markAsRead(n.id)}
                            >
                              <Check size={12} />
                              Lida
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-3 bg-surface-container-low border-t border-outline-variant text-center">
            <Link href="/configuracoes" onClick={() => setIsOpen(false)}>
              <span className="text-[10px] font-bold text-on-surface-variant hover:text-secondary cursor-pointer uppercase tracking-widest">
                Configurar Alertas
              </span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
