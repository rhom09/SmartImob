import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  variant?: 'default' | 'success' | 'error' | 'warning' | 'secondary';
  sublabel?: string;
}

export function StatCard({ label, value, icon: Icon, variant = 'default', sublabel }: StatCardProps) {
  const variantStyles = {
    default: 'text-on-surface',
    success: 'text-on-tertiary-container',
    error: 'text-on-error-container',
    warning: 'text-on-primary-fixed-variant',
    secondary: 'text-on-primary-container'
  };

  const bgStyles = {
    default: 'bg-surface-container-low',
    success: 'bg-tertiary-container/30',
    error: 'bg-error-container/30',
    warning: 'bg-primary-fixed/30',
    secondary: 'bg-primary-container/30'
  };

  return (
    <Card className="shadow-sm border-on-surface/5 rounded-xl overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium uppercase text-muted tracking-widest mb-1">{label}</p>
            <p className={`text-2xl font-bold tracking-tight ${variantStyles[variant]}`}>
              {value}
            </p>
            {sublabel && <p className="text-xs text-muted/80 mt-1 font-medium">{sublabel}</p>}
          </div>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ml-4 ${bgStyles[variant]}`}>
            <Icon size={24} className={variantStyles[variant]} strokeWidth={1.5} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
