"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2, Send } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const SEVERITIES = ["INFO", "WATCH", "WARNING", "DANGER", "EXTREME"] as const;

const alertSchema = z
  .object({
    title: z.string().trim().min(5, "Enter a title of at least 5 characters.").max(200),
    description: z.string().trim().min(20, "Give at least 20 characters of detail.").max(4000),
    affectedArea: z.string().trim().min(2, "State the affected area.").max(300),
    severity: z.enum(SEVERITIES),
    issuer: z.string().trim().min(2, "Name the official issuer.").max(200),
    issuedAt: z.string().min(1, "Set the issue time."),
    expiresAt: z.string().optional(),
    sourceUrl: z.string().trim().url("Enter a full http(s) source URL.").max(500),
  })
  .superRefine((data, ctx) => {
    const issued = new Date(data.issuedAt);
    if (Number.isNaN(issued.getTime())) {
      ctx.addIssue({ code: "custom", path: ["issuedAt"], message: "Enter a valid issue time." });
    }
    if (data.expiresAt) {
      const expires = new Date(data.expiresAt);
      if (Number.isNaN(expires.getTime())) {
        ctx.addIssue({ code: "custom", path: ["expiresAt"], message: "Enter a valid expiry time." });
      } else if (!Number.isNaN(issued.getTime()) && expires <= issued) {
        ctx.addIssue({ code: "custom", path: ["expiresAt"], message: "Expiry must be after the issue time." });
      }
    }
  });

type AlertValues = z.infer<typeof alertSchema>;

function localDateTimeValue(date = new Date()): string {
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 16);
}

export function AlertComposer() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AlertValues>({
    resolver: zodResolver(alertSchema),
    defaultValues: {
      title: "",
      description: "",
      affectedArea: "Central Luzon (Region III)",
      severity: "WARNING",
      issuer: "",
      issuedAt: localDateTimeValue(),
      expiresAt: "",
      sourceUrl: "",
    },
  });

  async function onSubmit(values: AlertValues) {
    setServerError(null);
    setSuccess(false);
    try {
      const response = await fetch("/api/admin/alerts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title: values.title,
          description: values.description,
          affectedArea: values.affectedArea,
          severity: values.severity,
          issuer: values.issuer,
          issuedAt: new Date(values.issuedAt).toISOString(),
          expiresAt: values.expiresAt ? new Date(values.expiresAt).toISOString() : null,
          sourceUrl: values.sourceUrl,
        }),
      });
      const body = (await response.json()) as { error?: string };
      if (!response.ok) {
        setServerError(body.error ?? "The advisory could not be recorded.");
        return;
      }
      setSuccess(true);
      reset({
        title: "",
        description: "",
        affectedArea: "Central Luzon (Region III)",
        severity: "WARNING",
        issuer: "",
        issuedAt: localDateTimeValue(),
        expiresAt: "",
        sourceUrl: "",
      });
      router.refresh();
    } catch {
      setServerError("The advisory could not be recorded. Check your connection and try again.");
    }
  }

  return (
    <Card>
      <CardContent className="pt-5 sm:pt-6">
        <h2 className="text-base font-bold text-navy">Record an official advisory</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Only record an advisory that you can verify at the issuer&apos;s own source. The application does not ingest
          PAGASA or LGU feeds automatically.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4" noValidate>
          {serverError ? (
            <Alert variant="danger" title="Advisory not recorded">
              {serverError}
            </Alert>
          ) : null}
          {success ? (
            <Alert variant="success" title="Advisory recorded">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> It is now visible on the public alerts page while
                active and unexpired.
              </span>
            </Alert>
          ) : null}

          <div className="space-y-1.5">
            <Label htmlFor="alert-title">Title</Label>
            <Input id="alert-title" {...register("title")} aria-invalid={Boolean(errors.title)} />
            {errors.title ? <p className="text-xs text-red-700" role="alert">{errors.title.message}</p> : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="alert-issuer">Official issuer</Label>
              <Input id="alert-issuer" placeholder="e.g. DOST-PAGASA" {...register("issuer")} aria-invalid={Boolean(errors.issuer)} />
              {errors.issuer ? <p className="text-xs text-red-700" role="alert">{errors.issuer.message}</p> : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="alert-severity">Severity</Label>
              <Select id="alert-severity" {...register("severity")}>
                {SEVERITIES.map((severity) => (
                  <option key={severity} value={severity}>
                    {severity}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="alert-area">Affected area</Label>
              <Input id="alert-area" {...register("affectedArea")} aria-invalid={Boolean(errors.affectedArea)} />
              {errors.affectedArea ? <p className="text-xs text-red-700" role="alert">{errors.affectedArea.message}</p> : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="alert-issued">Issued at</Label>
              <Input id="alert-issued" type="datetime-local" {...register("issuedAt")} aria-invalid={Boolean(errors.issuedAt)} />
              {errors.issuedAt ? <p className="text-xs text-red-700" role="alert">{errors.issuedAt.message}</p> : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="alert-expires">Expires at (optional)</Label>
              <Input id="alert-expires" type="datetime-local" {...register("expiresAt")} aria-invalid={Boolean(errors.expiresAt)} />
              {errors.expiresAt ? <p className="text-xs text-red-700" role="alert">{errors.expiresAt.message}</p> : null}
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="alert-source">Source URL</Label>
              <Input id="alert-source" type="url" placeholder="https://…" {...register("sourceUrl")} aria-invalid={Boolean(errors.sourceUrl)} />
              <p className="text-[11px] text-muted-foreground">
                Link directly to the official advisory or the issuer&apos;s page. Do not use a screenshot URL or social
                media post as the only source.
              </p>
              {errors.sourceUrl ? <p className="text-xs text-red-700" role="alert">{errors.sourceUrl.message}</p> : null}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="alert-description">Description</Label>
            <Textarea
              id="alert-description"
              rows={5}
              placeholder="Summarise the advisory accurately. Do not add instructions the issuer did not give."
              {...register("description")}
              aria-invalid={Boolean(errors.description)}
            />
            {errors.description ? <p className="text-xs text-red-700" role="alert">{errors.description.message}</p> : null}
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
            {isSubmitting ? (
              "Recording…"
            ) : (
              <>
                <Send className="h-4 w-4" aria-hidden="true" /> Record advisory
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
