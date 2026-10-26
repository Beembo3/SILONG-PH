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
  { value: "INCORRECT_DETAILS", label: "Mali ang pangalan, address, o detalye" },
  { value: "OUTDATED_HOURS", label: "Luma na ang oras ng pagbubukas" },
  { value: "PERMANENTLY_CLOSED", label: "Permanenteng sarado" },
  { value: "INACCURATE_DIRECTIONS", label: "Mali ang lokasyon o direksyon" },
  { value: "MISSING_ACCESSIBILITY", label: "Kulang o mali ang impormasyon sa accessibility" },
  { value: "NEW_LOCATION", label: "Magmungkahi ng bagong lugar" },
  { value: "OTHER", label: "Iba pang bagay" },
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
      .min(15, "Magbigay ng hindi bababa sa 15 character na detalye para masuri ng reviewer.")
      .max(2000, "Panatilihing wala pang 2,000 character ang report."),
    proposedName: z.string().trim().max(160).optional(),
    proposedAddress: z.string().trim().max(300).optional(),
    proposedLocalityCode: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.reportType !== "NEW_LOCATION") return;
    if (!data.proposedName || data.proposedName.length < 2) {
      ctx.addIssue({ code: "custom", path: ["proposedName"], message: "Ilagay ang iminumungkahing pangalan ng lugar." });
    }
    if (!data.proposedAddress || data.proposedAddress.length < 5) {
      ctx.addIssue({ code: "custom", path: ["proposedAddress"], message: "Ilagay ang iminumungkahing address." });
    }
    if (!data.proposedLocalityCode) {
      ctx.addIssue({
        code: "custom",
        path: ["proposedLocalityCode"],
        message: "Pumili ng lungsod o munisipyo.",
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
        setServerError(body.error ?? "Hindi naipadala ang report. Subukan muli.");
        return;
      }
      setSuccess({
        id: body.id ?? "submitted",
        message:
          body.message ??
          "Salamat. Nasa moderation queue ang report mo at hindi ito awtomatikong napi-publish.",
      });
      reset();
    } catch {
      setServerError("Hindi naipadala ang report. I-check ang koneksyon at subukan muli.");
    }
  }

  if (success) {
    return (
      <Alert variant="success" title="Natanggap ang report">
        <p>{success.message}</p>
        <p className="mt-1 text-xs">Reference: {success.id}</p>
        <Button type="button" variant="outline" size="sm" className="mt-3" onClick={() => setSuccess(null)}>
          Magpadala ng isa pang report
        </Button>
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {serverError ? (
        <Alert variant="danger" title="Hindi naipadala ang report">
          {serverError}
        </Alert>
      ) : null}

      <div className="space-y-1.5">
        <Label htmlFor="report-type">Ano ang kailangang i-check?</Label>
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
            <Label htmlFor="proposed-name">Iminumungkahing pangalan ng lugar</Label>
            <Input
              id="proposed-name"
              {...register("proposedName")}
              aria-invalid={Boolean(errors.proposedName)}
              aria-describedby={errors.proposedName ? "proposed-name-error" : undefined}
              placeholder="Hal. multi-purpose room ng barangay hall"
            />
            {errors.proposedName ? (
              <p id="proposed-name-error" className="text-xs text-red-700" role="alert">
                {errors.proposedName.message}
              </p>
            ) : null}
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="proposed-address">Iminumungkahing address</Label>
            <Input
              id="proposed-address"
              {...register("proposedAddress")}
              aria-invalid={Boolean(errors.proposedAddress)}
              aria-describedby={errors.proposedAddress ? "proposed-address-error" : undefined}
              placeholder="Street, barangay, lungsod o munisipyo"
            />
            {errors.proposedAddress ? (
              <p id="proposed-address-error" className="text-xs text-red-700" role="alert">
                {errors.proposedAddress.message}
              </p>
            ) : null}
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="proposed-locality">Lungsod o munisipyo</Label>
            <Select
              id="proposed-locality"
              {...register("proposedLocalityCode")}
              aria-invalid={Boolean(errors.proposedLocalityCode)}
            >
              <option value="">Pumili ng lugar</option>
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
        <Label htmlFor="report-description">Ano ang dapat malaman ng reviewer?</Label>
        <Textarea
          id="report-description"
          {...register("description")}
          aria-invalid={Boolean(errors.description)}
          aria-describedby={errors.description ? "report-description-error" : "report-description-help"}
          rows={5}
          placeholder="Ilarawan ang nakita mo, kailan mo ito nakita, at ang source na makakatulong sa reviewer."
        />
        <p id="report-description-help" className="text-xs text-muted-foreground">
          Huwag maglagay ng personal na impormasyon ng ibang tao. Minomodera ang report at hindi awtomatikong
          napi-publish bilang verified fact.
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
            Hindi para sa emergency ang form na ito. Kung pinaghihinalaang heat stroke o may emergency na delikado sa
            buhay, tumawag agad sa 911 o lokal na emergency service.
          </span>
        </p>
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
        {isSubmitting ? (
          "Ipinapadala ang report…"
        ) : (
          <>
            <Send className="h-4 w-4" aria-hidden="true" /> Ipadala para sa moderation
          </>
        )}
      </Button>
      {placeName ? (
        <p className="text-xs text-muted-foreground">
          Ang report mo ay tungkol sa <strong>{placeName}</strong>.
        </p>
      ) : null}
    </form>
  );
}
