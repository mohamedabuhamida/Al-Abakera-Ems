"use client";
import Image from "next/image";
import { type AuthRole } from "@/core/auth/roles";
import { useLanguage } from "@/core/i18n/useLanguage";
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

const menuItems: Array<{
  nameAr: string;
  nameEn: string;
  icon: React.ElementType;
  href: string;
  roles: AuthRole[];
}> = [
  {
    nameAr: "الرئيسية",
    nameEn: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
    roles: ["admin", "teacher", "student", "parent"],
  },
  {
    nameAr: "الطلاب",
    nameEn: "Students",
    icon: Users,
    href: "/students",
    roles: ["admin", "teacher"],
  },
  {
    nameAr: "المعلمون",
    nameEn: "Teachers",
    icon: GraduationCap,
    href: "/teachers",
    roles: ["admin"],
  },
 
  {
    nameAr: "المواد الدراسية",
    nameEn: "Subjects",
    icon: BookOpen,
    href: "/subjects",
    roles: ["admin", "teacher"],
  },
  {
    nameAr: "المجموعات",
    nameEn: "Groups",
    icon: GraduationCap,
    href: "/groups",
    roles: ["admin", "teacher", "student", "parent"],
  },
  {
    nameAr: "الفواتير والمالية",
    nameEn: "Billing",
    icon: CreditCard,
    href: "/billing",
    roles: ["admin", "parent"],
  },
  {
    nameAr: "التنبيهات",
    nameEn: "Alerts",
    icon: Bell,
    href: "/billing/reminders",
    roles: ["admin", "parent"],
  },
  {
    nameAr: "الإعدادات",
    nameEn: "Settings",
    icon: Settings,
    href: "/settings",
    roles: ["admin"],
  },
];

export default function Sidebar({ role }: { role: AuthRole }) {
  const { isSidebarOpen } = useUIStore();
  const pathname = usePathname();
  const { isArabic } = useLanguage();
  const visibleMenuItems = menuItems.filter((item) => item.roles.includes(role));

  return (
    <motion.aside
      initial={false}
      animate={{ width: isSidebarOpen ? 280 : 80 }}
      className="relative flex h-screen flex-col border-e border-outline-variant bg-surface-container-lowest"
    >
      <div className="flex items-center gap-3 overflow-hidden border-b border-outline-variant px-5 py-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-default bg-primary text-on-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]">
          <Image src="/logo.png" alt="Logo" width={1000} height={1000} className="w-full" />
        </div>
        {isSidebarOpen && (
          <div className="min-w-0">
            <p className="whitespace-nowrap text-base font-semibold text-on-surface">
              {isArabic ? "العباقرة" : "Al Abakera"}
            </p>
            <p className="whitespace-nowrap text-xs text-on-surface-variant">
              {isArabic ? "إدارة التعليم" : "Education Management"}
            </p>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {visibleMenuItems.map((item) => {
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
                  <span className="whitespace-nowrap">
                    {isArabic ? item.nameAr : item.nameEn}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>
    </motion.aside>
  );
}
