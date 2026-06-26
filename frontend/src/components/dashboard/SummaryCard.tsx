import { LucideIcon } from 'lucide-react';

interface SummaryCardProps {
  label: string;
  value: number;
  Icon: LucideIcon;
  tone?: 'default' | 'brand' | 'warning' | 'danger' | 'success';
}

const TONE_STYLES: Record<string, string> = {
  default: 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100',
  brand: 'border-brand-200 dark:border-brand-800/60 bg-brand-50 dark:bg-brand-950/30 text-brand-800 dark:text-brand-300',
  warning: 'border-amber-200 dark:border-amber-800/60 bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300',
  danger: 'border-red-200 dark:border-red-800/60 bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-300',
  success: 'border-emerald-200 dark:border-emerald-800/60 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300',
};

const ICON_TONE: Record<string, string> = {
  default: 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400',
  brand: 'bg-brand-100 dark:bg-brand-900/50 text-brand-700 dark:text-brand-300',
  warning: 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300',
  danger: 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300',
  success: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300',
};

export function SummaryCard({ label, value, Icon, tone = 'default' }: SummaryCardProps) {
  return (
    <div className={`rounded-2xl border p-4 shadow-sm transition-shadow hover:shadow-md ${TONE_STYLES[tone]}`}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
        <span className={`flex h-8 w-8 items-center justify-center rounded-full ${ICON_TONE[tone]}`}>
          <Icon size={16} strokeWidth={2.2} />
        </span>
      </div>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
    </div>
  );
}
