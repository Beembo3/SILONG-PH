"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Archive, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AlertStatusButton({
  alertId,
  status,
}: {
  alertId: string;
  status: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function update(nextStatus: "EXPIRED" | "ARCHIVED") {
    const label = nextStatus === "EXPIRED" ? "mark this advisory as expired" : "archive this advisory";
    if (!window.confirm(`Are you sure you want to ${label}? It will no longer appear as active.`)) return;
    setBusy(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/alerts/${alertId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const body = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(body.error ?? "The advisory could not be updated.");
        return;
      }
      router.refresh();
    } catch {
      setError("The advisory could not be updated. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  if (status !== "ACTIVE") {
    return <span className="text-xs text-muted-foreground">No active actions</span>;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button type="button" variant="outline" size="sm" onClick={() => update("EXPIRED")} disabled={busy}>
        <Clock className="h-3.5 w-3.5" aria-hidden="true" /> Mark expired
      </Button>
      <Button type="button" variant="outline" size="sm" onClick={() => update("ARCHIVED")} disabled={busy}>
        <Archive className="h-3.5 w-3.5" aria-hidden="true" /> Archive
      </Button>
      {error ? (
        <span className="text-xs text-red-700" role="alert">
          {error}
        </span>
      ) : null}
    </div>
  );
}
