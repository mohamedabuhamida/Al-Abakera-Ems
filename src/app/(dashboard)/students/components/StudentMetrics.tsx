"use client";

import { Users, UserPlus, Wallet, AlertCircle } from "lucide-react";

interface StudentMetricsProps {
  total: number;
  active: number;
  balance: number;
  overdue: number;
  numberFormatter: Intl.NumberFormat;
  currencyFormatter: Intl.NumberFormat;
}

export function StudentMetrics({
  total,
  active,
  balance,
  overdue,
  numberFormatter,
  currencyFormatter,
}: StudentMetricsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <MetricCard
        label="إجمالي الطلاب"
        value={numberFormatter.format(total)}
        icon={<Users size={20} />}
      />
      <MetricCard
        label="طلاب نشطون"
        value={numberFormatter.format(active)}
        icon={<UserPlus size={20} />}
      />
      <MetricCard
        label="رصيد مستحق"
        value={currencyFormatter.format(balance)}
        icon={<Wallet size={20} />}
      />
      <MetricCard
        label="فواتير متأخرة"
        value={numberFormatter.format(overdue)}
        icon={<AlertCircle size={20} />}
      />
    </div>
  );
}

function MetricCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="surface-card p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-on-surface-variant">{label}</p>
          <p className="mt-3 text-2xl font-semibold text-on-surface">{value}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-default bg-primary-fixed text-on-primary-fixed-variant">
          {icon}
        </div>
      </div>
    </div>
  );
}