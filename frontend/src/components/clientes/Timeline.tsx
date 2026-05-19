"use client";

import { Phone, Mail, MapPin, MessageSquare, Plus } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Interaction {
  id: string;
  tipo: string;
  descricao: string;
  data: string;
  usuario?: { nome: string };
}

interface TimelineProps {
  interactions: Interaction[];
}

export function Timeline({ interactions }: TimelineProps) {
  const getIcon = (tipo: string) => {
    switch (tipo) {
      case "LIGACAO": return <Phone size={14} />;
      case "EMAIL": return <Mail size={14} />;
      case "VISITA": return <MapPin size={14} />;
      default: return <MessageSquare size={14} />;
    }
  };

  const getColor = (tipo: string) => {
    switch (tipo) {
      case "LIGACAO": return "bg-blue-100 text-blue-600 border-blue-200";
      case "EMAIL": return "bg-purple-100 text-purple-600 border-purple-200";
      case "VISITA": return "bg-green-100 text-green-600 border-green-200";
      default: return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  if (interactions.length === 0) {
    return (
      <div className="py-8 text-center border border-dashed rounded-lg bg-surface-container-low text-on-surface-variant">
        <MessageSquare size={24} className="mx-auto mb-2 opacity-50" />
        <p className="text-sm">Nenhuma interação registrada ainda.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-outline-variant/50 before:to-transparent">
      {interactions.map((interaction, index) => (
        <div key={interaction.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
          {/* Icon */}
          <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm ${getColor(interaction.tipo)}`}>
            {getIcon(interaction.tipo)}
          </div>

          {/* Card */}
          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded border border-outline-variant bg-white shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-sm text-on-surface capitalize">{interaction.tipo}</span>
              <time className="text-xs text-on-surface-variant font-medium">
                {format(new Date(interaction.data), "dd/MM/yyyy HH:mm", { locale: ptBR })}
              </time>
            </div>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              {interaction.descricao}
            </p>
            {interaction.usuario && (
              <div className="mt-2 text-[10px] font-semibold text-outline uppercase tracking-wider">
                Por: {interaction.usuario.nome}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
