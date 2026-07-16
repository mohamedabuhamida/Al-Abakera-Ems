"use client";

import { cn } from "@/core/utils/rtl";
import { motion } from "framer-motion";

interface StatsCardProps {
  label: string;
  value: string | number;
  trend?: {
    value: number;
    isUp: boolean;
  };
  icon: React.ReactNode;
  description?: string;
}

export default function StatsCard({
  label,
  value,
  trend,
  icon,
  description,
}: StatsCardProps) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="surface-card group relative flex flex-col gap-4 overflow-hidden p-5"
    >
      <div className="flex items-start justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-default bg-primary-fixed text-on-primary-fixed-variant ring-1 ring-primary-fixed-dim/50">
          {icon}
        </div>
        {trend && (
          <span
            className={cn(
              "rounded-sm px-2 py-1 text-xs font-semibold",
              trend.isUp
                ? "bg-secondary-fixed text-on-secondary-fixed-variant"
                : "bg-error-container text-on-error-container"
            )}
          >
            {trend.isUp ? "+" : "-"}
            {trend.value}%
          </span>
        )}
      </div>

      <div>
        <p className="text-sm font-semibold text-on-surface-variant">{label}</p>
        <h3 className="mt-2 text-2xl font-semibold leading-none text-on-surface">
          {value}
        </h3>
        {description && (
          <p className="mt-2 text-xs leading-5 text-on-surface-variant">
            {description}
          </p>
        )}
      </div>
    </motion.div>
  );
}
