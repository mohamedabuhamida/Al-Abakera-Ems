"use client";

import { cn } from "@/core/utils/rtl";
import { useUIStore } from "@/store/useUIStore";
import { motion } from "framer-motion";
import {
  Bell,
  BookOpen,
  CreditCard,
  GraduationCap,
  LayoutDashboard,
  Settings,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  { name: "الرئيسية", icon: LayoutDashboard, href: "/dashboard" },
  { name: "الطلاب", icon: Users, href: "/students" },
  { name: "المعلمون", icon: GraduationCap, href: "/teachers" },
  { name: "المواد الدراسية", icon: BookOpen, href: "/subjects" },
  { name: "المجموعات", icon: GraduationCap, href: "/groups" },
  { name: "الفواتير والمالية", icon: CreditCard, href: "/billing" },
  { name: "التنبيهات", icon: Bell, href: "/billing/reminders" },
  { name: "الإعدادات", icon: Settings, href: "/settings" },
];

export default function Sidebar() {
  const { isSidebarOpen } = useUIStore();
  const pathname = usePathname();

  return (
    <motion.aside
      initial={false}
      animate={{ width: isSidebarOpen ? 280 : 80 }}
      className="relative flex h-screen flex-col border-e border-outline-variant bg-surface-container-lowest"
    >
      <div className="flex items-center gap-3 overflow-hidden border-b border-outline-variant px-5 py-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-default bg-primary text-on-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]">
          <GraduationCap size={23} />
        </div>
        {isSidebarOpen && (
          <div className="min-w-0">
            <p className="whitespace-nowrap text-base font-semibold text-on-surface">
              العباقرة
            </p>
            <p className="whitespace-nowrap text-xs text-on-surface-variant">
              Education Management
            </p>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {menuItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex h-10 items-center gap-3 rounded-default px-3 text-sm transition-colors",
                  isActive
                    ? "bg-primary-fixed font-semibold text-on-primary-fixed-variant"
                    : "font-medium text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
                )}
              >
                <item.icon size={20} className="shrink-0" />
                {isSidebarOpen && (
                  <span className="whitespace-nowrap">{item.name}</span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>
    </motion.aside>
  );
}
