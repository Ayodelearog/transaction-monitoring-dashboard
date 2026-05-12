"use client";

import { useRouter } from "next/navigation";
import { LogOut, Menu, Bell } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { GlobalSearch } from "./global-search";
import { ThemeToggle } from "./theme-toggle";
import { useAuthStore } from "@/lib/store/auth";

interface TopbarProps {
  onOpenMenu: () => void;
}

export function Topbar({ onOpenMenu }: TopbarProps) {
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();

  const handleLogout = () => {
    clearAuth();
    router.replace("/login");
  };

  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-background/80 backdrop-blur px-4 sm:px-6 h-14">
      <button
        onClick={onOpenMenu}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-4 w-4" />
      </button>

      <GlobalSearch />

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <ThemeToggle />
        <button
          className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-muted-foreground hover:text-foreground"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-2 h-1.5 w-1.5 rounded-full bg-danger" />
        </button>
        {user && (
          <div className="flex items-center gap-2 rounded-full border border-border bg-surface pl-1 pr-3 py-1">
            <Avatar name={user.name} color={user.avatarColor} size="sm" />
            <div className="hidden sm:block leading-tight">
              <p className="text-xs font-semibold text-foreground">{user.name}</p>
              <p className="text-[10px] text-muted-foreground capitalize">{user.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="ml-1 inline-flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted"
              aria-label="Sign out"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
