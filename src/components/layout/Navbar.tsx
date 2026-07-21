"use client";

import { logout } from "@/app/(auth)/login/actions";
import LanguageToggle from "@/components/shared/LanguageToggle";
import ThemeModeToggle from "@/components/shared/ThemeModeToggle";
import { roleLabel, type UserAccess } from "@/core/auth/roles";
import { useLanguage } from "@/core/i18n/useLanguage";
import { useUIStore } from "@/store/useUIStore";
import { Bell, LogOut, Menu, Plus, Search, Settings, User } from "lucide-react";

export default function Navbar({ user }: { user: UserAccess }) {
  const { toggleSidebar } = useUIStore();
  const { isArabic } = useLanguage();

  return (
    <nav className="sticky top-0 z-30 flex h-20.25 items-center justify-between border-b  border-outline-variant bg-surface-container-lowest/88 px-4 backdrop-blur-md lg:px-8">
      <div className="flex flex-1 items-center gap-4 ">
        <button
          type="button"
          aria-label="Toggle sidebar"
          onClick={toggleSidebar}
          className="icon-button"
        >
          <Menu size={20} />
        </button>

        <div className="hidden h-10 w-full max-w-md items-center gap-2 rounded-default border border-outline-variant bg-surface-container-low px-3 transition focus-within:border-primary focus-within:bg-surface-container-lowest focus-within:ring-2 focus-within:ring-primary/20 md:flex">
          <Search size={16} className="text-on-surface-variant" />
          <input
            type="text"
            placeholder={isArabic ? "بحث سريع..." : "Quick search..."}
            className="w-full border-none bg-transparent text-sm text-on-surface outline-none placeholder:text-on-surface-variant/70"
          />
          <kbd className="hidden whitespace-nowrap h-5 select-none items-center gap-1 rounded-sm border border-outline-variant bg-surface-container-lowest px-1.5 font-mono text-[10px] font-medium text-on-surface-variant sm:inline-flex">
            Ctrl K
          </kbd>
        </div>
      </div>

      <div className="flex items-center gap-2 lg:gap-4">
        <LanguageToggle />
        <ThemeModeToggle variant="icon" />

        <div className="mx-2 hidden h-8 w-px bg-outline-variant sm:block" />

        <button type="button" aria-label="Notifications" className="icon-button relative group">
          <Bell size={20} className="group-hover:shake" />
          <span className="absolute inset-e-2 top-2 h-2 w-2 rounded-full border-2 border-surface-container-lowest bg-error" />
        </button>

        <button type="button" aria-label="Settings" className="icon-button">
          <Settings size={20} />
        </button>

        <div className="group ms-2 flex cursor-pointer items-center gap-3 border-s border-outline-variant ps-2">
          <div className="hidden text-right lg:block">
            <p className="text-sm font-semibold leading-tight text-on-surface">
              {user.fullName ?? user.email ?? "User"}
            </p>
            <p className="text-[11px] text-on-surface-variant">
              {roleLabel(user.role)}
            </p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-default bg-inverse-surface text-inverse-on-surface transition-transform group-hover:scale-105">
            <User size={18} />
          </div>
        </div>

        <form action={logout}>
          <button type="submit" aria-label="Logout" className="icon-button">
            
            <LogOut size={20} className={` ${isArabic? "rotate-180" : ""} text-on-surface-variant `}/>
          </button>
        </form>
      </div>
    </nav>
  );
}
