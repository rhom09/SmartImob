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
    success: 'text-success',
    error: 'text-error',
    warning: 'text-warning',
    secondary: 'text-secondary'
  };

  const bgStyles = {
    default: 'bg-surface-container',
    success: 'bg-success/10',
    error: 'bg-error/10',
    warning: 'bg-warning/10',
    secondary: 'bg-secondary/10'
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-on-surface-variant tracking-wider">{label}</p>
            <p className={`text-2xl font-bold mt-1 ${variantStyles[variant]}`}>
              {value}
            </p>
            {sublabel && <p className="text-xs text-on-surface-variant/70 mt-0.5">{sublabel}</p>}
          </div>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${bgStyles[variant]}`}>
            <Icon size={20} className={variantStyles[variant]} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
