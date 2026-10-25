"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.replace("/admin/login");
      router.refresh();
      setLoading(false);
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={logout} disabled={loading}>
      <LogOut className="h-4 w-4" aria-hidden="true" /> {loading ? "Signing out…" : "Sign out"}
    </Button>
  );
}
