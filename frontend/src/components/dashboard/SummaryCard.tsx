import { LucideIcon } from 'lucide-react';

interface SummaryCardProps {
  label: string;
  value: number;
  Icon: LucideIcon;
  tone?: 'default' | 'brand' | 'warning' | 'danger' | 'success';
}

const TONE_STYLES: Record<string, string> = {
  default: 'border-slate-200 bg-white text-slate-800',
  brand: 'border-brand-200 bg-brand-50 text-brand-800',
  warning: 'border-amber-200 bg-amber-50 text-amber-800',
  danger: 'border-red-200 bg-red-50 text-red-800',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
};

const ICON_TONE: Record<string, string> = {
  default: 'bg-slate-100 text-slate-500',
  brand: 'bg-brand-100 text-brand-700',
  warning: 'bg-amber-100 text-amber-700',
  danger: 'bg-red-100 text-red-700',
  success: 'bg-emerald-100 text-emerald-700',
};

export function SummaryCard({ label, value, Icon, tone = 'default' }: SummaryCardProps) {
  return (
    <div className={`rounded-2xl border p-4 shadow-sm transition-shadow hover:shadow-md ${TONE_STYLES[tone]}`}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <span className={`flex h-8 w-8 items-center justify-center rounded-full ${ICON_TONE[tone]}`}>
          <Icon size={16} strokeWidth={2.2} />
        </span>
      </div>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
    </div>
  );
}
