"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth";

export default function RootPage() {
  const router = useRouter();
  const { hydrated, user } = useAuthStore();

  useEffect(() => {
    if (!hydrated) return;
    router.replace(user ? "/dashboard" : "/login");
  }, [hydrated, user, router]);

  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="h-6 w-6 rounded-full border-2 border-primary border-r-transparent animate-spin" />
    </div>
  );
}
