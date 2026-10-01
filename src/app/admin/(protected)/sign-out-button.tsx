"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export default function AdminSignOutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleLogout() {
    setPending(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.replace("/admin");
      router.refresh();
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={pending}
      className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-xs transition-colors hover:bg-accent disabled:opacity-60"
    >
      <LogOut className="h-3.5 w-3.5" aria-hidden />
      Sign out
    </button>
  );
}
