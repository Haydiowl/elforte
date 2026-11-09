import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: string;
  icon?: ReactNode;
  trend?: string;
  trendUp?: boolean;
  dark?: boolean;
}

export default function StatCard({ label, value, icon, trend, trendUp, dark = false }: StatCardProps) {
  if (dark) {
    return (
      <div className="rounded-lg border border-white/10 bg-[var(--admin-surface)] p-4 sm:p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="text-xs text-[var(--admin-muted)]">{label}</div>
          {trend && (
            <span className={`inline-flex shrink-0 items-center gap-1 rounded-full border border-white/10 px-2 py-0.5 text-[11px] font-medium ${trendUp ? "text-emerald-400" : "text-[var(--admin-muted)]"}`}>
              {trendUp ? "↗" : "↘"}
              {trend}
            </span>
          )}
        </div>
        <div className="mt-1.5 text-2xl font-bold tabular-nums text-white sm:text-3xl">{value}</div>
      </div>
    );
  }
  return (
    <div className="rounded-xl border border-[#e3e9f0] bg-white p-5 ">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[12px] font-semibold uppercase tracking-wider text-[#6b8aa0]">{label}</div>
          <div className="mt-2 text-[28px] font-bold leading-none text-[#09123c]">{value}</div>
          {trend && (
            <div className={`mt-2 text-[12px] font-semibold ${trendUp ? "text-emerald-600" : "text-[#cc091b]"}`}>
              {trend}
            </div>
          )}
        </div>
        {icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#eaf4fc] text-[#09123c]">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
