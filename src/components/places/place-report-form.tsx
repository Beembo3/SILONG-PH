"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertTriangle, Send } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { localitiesForProvince, provinces } from "@/lib/geography";

const REPORT_TYPES = [
  { value: "INCORRECT_DETAILS", label: "Incorrect name, address, or details" },
  { value: "OUTDATED_HOURS", label: "Outdated operating hours" },
  { value: "PERMANENTLY_CLOSED", label: "Permanently closed" },
  { value: "INACCURATE_DIRECTIONS", label: "Inaccurate location or directions" },
  { value: "MISSING_ACCESSIBILITY", label: "Accessibility information is missing or wrong" },
  { value: "NEW_LOCATION", label: "Suggest a new location" },
  { value: "OTHER", label: "Something else" },
] as const;

const reportFormSchema = z
  .object({
    reportType: z.enum([
      "INCORRECT_DETAILS",
      "OUTDATED_HOURS",
      "PERMANENTLY_CLOSED",
      "INACCURATE_DIRECTIONS",
      "MISSING_ACCESSIBILITY",
      "NEW_LOCATION",
      "OTHER",
    ]),
    description: z
      .string()
      .trim()
      .min(15, "Please give at least 15 characters of detail so a reviewer can investigate.")
      .max(2000, "Keep the report under 2,000 characters."),
    proposedName: z.string().trim().max(160).optional(),
    proposedAddress: z.string().trim().max(300).optional(),
    proposedLocalityCode: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.reportType !== "NEW_LOCATION") return;
    if (!data.proposedName || data.proposedName.length < 2) {
      ctx.addIssue({ code: "custom", path: ["proposedName"], message: "Add the proposed place name." });
    }
    if (!data.proposedAddress || data.proposedAddress.length < 5) {
      ctx.addIssue({ code: "custom", path: ["proposedAddress"], message: "Add the proposed address." });
    }
    if (!data.proposedLocalityCode) {
      ctx.addIssue({
        code: "custom",
        path: ["proposedLocalityCode"],
        message: "Select the city or municipality.",
      });
    }
  });

type ReportFormValues = z.infer<typeof reportFormSchema>;

interface PlaceReportFormProps {
  coolingPlaceId?: string;
  placeName?: string;
}

export function PlaceReportForm({ coolingPlaceId, placeName }: PlaceReportFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ id: string; message: string } | null>(null);
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ReportFormValues>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
      reportType: coolingPlaceId ? "INCORRECT_DETAILS" : "NEW_LOCATION",
      description: "",
      proposedName: "",
      proposedAddress: "",
      proposedLocalityCode: "",
    },
  });

  const reportType =
    useWatch({ control, name: "reportType" }) ??
    (coolingPlaceId ? "INCORRECT_DETAILS" : "NEW_LOCATION");

  async function onSubmit(values: ReportFormValues) {
    setServerError(null);
    setSuccess(null);
    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...values,
          coolingPlaceId: coolingPlaceId ?? null,
          proposedName: values.reportType === "NEW_LOCATION" ? values.proposedName : null,
          proposedAddress: values.reportType === "NEW_LOCATION" ? values.proposedAddress : null,
          proposedLocalityCode:
            values.reportType === "NEW_LOCATION" ? values.proposedLocalityCode : null,
        }),
      });
      const body = (await response.json()) as {
        error?: string;
        id?: string;
        message?: string;
      };
      if (!response.ok) {
        setServerError(body.error ?? "The report could not be submitted. Please try again.");
        return;
      }
      setSuccess({
        id: body.id ?? "submitted",
        message:
          body.message ??
          "Thank you. Your report is in the moderation queue and is not published automatically.",
      });
      reset();
    } catch {
      setServerError("The report could not be submitted. Check your connection and try again.");
    }
  }

  if (success) {
    return (
      <Alert variant="success" title="Report received">
        <p>{success.message}</p>
        <p className="mt-1 text-xs">Reference: {success.id}</p>
        <Button type="button" variant="outline" size="sm" className="mt-3" onClick={() => setSuccess(null)}>
          Submit another report
        </Button>
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {serverError ? (
        <Alert variant="danger" title="Report not submitted">
          {serverError}
        </Alert>
      ) : null}

      <div className="space-y-1.5">
        <Label htmlFor="report-type">What needs checking?</Label>
        <Select id="report-type" {...register("reportType")} aria-invalid={Boolean(errors.reportType)}>
          {REPORT_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </Select>
        {errors.reportType ? (
          <p className="text-xs text-red-700" role="alert">
            {errors.reportType.message}
          </p>
        ) : null}
      </div>

      {reportType === "NEW_LOCATION" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="proposed-name">Proposed place name</Label>
            <Input
              id="proposed-name"
              {...register("proposedName")}
              aria-invalid={Boolean(errors.proposedName)}
              aria-describedby={errors.proposedName ? "proposed-name-error" : undefined}
              placeholder="e.g. Barangay hall multi-purpose room"
            />
            {errors.proposedName ? (
              <p id="proposed-name-error" className="text-xs text-red-700" role="alert">
                {errors.proposedName.message}
              </p>
            ) : null}
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="proposed-address">Proposed address</Label>
            <Input
              id="proposed-address"
              {...register("proposedAddress")}
              aria-invalid={Boolean(errors.proposedAddress)}
              aria-describedby={errors.proposedAddress ? "proposed-address-error" : undefined}
              placeholder="Street, barangay, city or municipality"
            />
            {errors.proposedAddress ? (
              <p id="proposed-address-error" className="text-xs text-red-700" role="alert">
                {errors.proposedAddress.message}
              </p>
            ) : null}
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="proposed-locality">City or municipality</Label>
            <Select
              id="proposed-locality"
              {...register("proposedLocalityCode")}
              aria-invalid={Boolean(errors.proposedLocalityCode)}
            >
              <option value="">Select a locality</option>
              {provinces.map((province) => (
                <optgroup key={province.code} label={province.name}>
                  {localitiesForProvince(province.code).map((locality) => (
                    <option key={locality.code} value={locality.code}>
                      {locality.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </Select>
            {errors.proposedLocalityCode ? (
              <p className="text-xs text-red-700" role="alert">
                {errors.proposedLocalityCode.message}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="space-y-1.5">
        <Label htmlFor="report-description">What should the reviewer know?</Label>
        <Textarea
          id="report-description"
          {...register("description")}
          aria-invalid={Boolean(errors.description)}
          aria-describedby={errors.description ? "report-description-error" : "report-description-help"}
          rows={5}
          placeholder="Describe what you observed, when you observed it, and any source that can help a reviewer check it."
        />
        <p id="report-description-help" className="text-xs text-muted-foreground">
          Do not include personal information about other people. Reports are moderated and are not published as
          verified facts automatically.
        </p>
        {errors.description ? (
          <p id="report-description-error" className="text-xs text-red-700" role="alert">
            {errors.description.message}
          </p>
        ) : null}
      </div>

      <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs leading-relaxed text-amber-950">
        <p className="flex items-start gap-2">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>
            This form is not for emergencies. For suspected heat stroke or another life-threatening emergency, call 911
            or local emergency services immediately.
          </span>
        </p>
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? (
          "Submitting report…"
        ) : (
          <>
            <Send className="h-4 w-4" aria-hidden="true" /> Submit for moderation
          </>
        )}
      </Button>
      {placeName ? (
        <p className="text-xs text-muted-foreground">
          Your report is about <strong>{placeName}</strong>.
        </p>
      ) : null}
    </form>
  );
}
