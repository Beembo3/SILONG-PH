"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { REPORT_STATUSES, REPORT_STATUS_LABELS } from "@/lib/places";

export function ReportModeration({
  reportId,
  status,
  note,
}: {
  reportId: string;
  status: string;
  note: string | null;
}) {
  const router = useRouter();
  const [statusValue, setStatusValue] = useState(status);
  const [noteValue, setNoteValue] = useState(note ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function save() {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const response = await fetch(`/api/admin/reports/${reportId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: statusValue, moderatorNote: noteValue || null }),
      });
      const body = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(body.error ?? "The report could not be updated.");
        return;
      }
      setSaved(true);
      router.refresh();
    } catch {
      setError("The report could not be updated. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-3 rounded-lg border border-border bg-muted/30 p-3">
      {error ? (
        <Alert variant="danger" className="mb-3">
          {error}
        </Alert>
      ) : null}
      {saved ? (
        <Alert variant="success" className="mb-3">
          Moderation saved.
        </Alert>
      ) : null}
      <div className="grid gap-3 sm:grid-cols-[12rem_1fr_auto] sm:items-end">
        <div className="space-y-1.5">
          <Label htmlFor={`report-status-${reportId}`}>Queue status</Label>
          <Select
            id={`report-status-${reportId}`}
            value={statusValue}
            onChange={(event) => setStatusValue(event.target.value)}
          >
            {REPORT_STATUSES.map((item) => (
              <option key={item} value={item}>
                {REPORT_STATUS_LABELS[item]}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`report-note-${reportId}`}>Moderator note</Label>
          <Textarea
            id={`report-note-${reportId}`}
            rows={2}
            value={noteValue}
            onChange={(event) => setNoteValue(event.target.value)}
            placeholder="What was checked? This note is internal."
          />
        </div>
        <Button type="button" onClick={save} disabled={saving} className="w-full sm:w-auto">
          <Save className="h-4 w-4" aria-hidden="true" /> {saving ? "Saving…" : "Save"}
        </Button>
      </div>
      <p className="mt-2 text-[11px] text-muted-foreground">
        Moderator notes are internal. Updating the queue status does not automatically change a facility&apos;s
        verification status; edit the facility record separately if needed.
      </p>
    </div>
  );
}
