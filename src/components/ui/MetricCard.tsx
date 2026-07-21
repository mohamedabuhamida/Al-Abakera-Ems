"use client";

import { ReactNode } from "react";

interface MetricCardProps {
  label: string;
  value: string;
  icon: ReactNode;
  color?: string;
}

export function MetricCard({
  label,
  value,
  icon,
  color = "text-primary",
}: MetricCardProps) {
  return (
    <div className="surface-card p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-on-surface-variant">
            {label}
          </p>
          <p className="mt-3 text-2xl font-semibold text-on-surface">{value}</p>
        </div>
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-default bg-primary-fixed ${color}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}