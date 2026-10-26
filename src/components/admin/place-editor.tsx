"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Archive, CheckCircle2, Save } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { localitiesForProvince, provinces } from "@/lib/geography";
import { PLACE_CATEGORIES, VERIFICATION_LABELS, VERIFICATION_STATUSES } from "@/lib/places";

export interface PlaceEditorInitial {
  id?: string;
  name: string;
  category: string;
  address: string;
  provinceCode: string;
  localityCode: string;
  latitude: number;
  longitude: number;
  operatingHours: string | null;
  accessibilityDetails: string | null;
  amenities: string[];
  publicAccessDetails: string | null;
  contactInformation: string | null;
  sourceUrl: string | null;
  verificationStatus: string;
  verificationNote: string | null;
}

const editorSchema = z.object({
  name: z.string().trim().min(2, "Enter the facility name.").max(160),
  category: z.string().min(2, "Select a category.").max(80),
  address: z.string().trim().min(5, "Enter a full address.").max(300),
  provinceCode: z.string().regex(/^\d{10}$/, "Select a province."),
  localityCode: z.string().regex(/^\d{10}$/, "Select a city or municipality."),
  latitude: z
    .string()
    .trim()
    .min(1, "Enter latitude.")
    .refine((value) => Number.isFinite(Number(value)) && Number(value) >= -90 && Number(value) <= 90, "Latitude must be between -90 and 90."),
  longitude: z
    .string()
    .trim()
    .min(1, "Enter longitude.")
    .refine((value) => Number.isFinite(Number(value)) && Number(value) >= -180 && Number(value) <= 180, "Longitude must be between -180 and 180."),
  operatingHours: z.string().max(200).optional(),
  accessibilityDetails: z.string().max(500).optional(),
  amenities: z.string().max(1000).optional(),
  publicAccessDetails: z.string().max(1000).optional(),
  contactInformation: z.string().max(300).optional(),
  sourceUrl: z
    .string()
    .trim()
    .max(500)
    .optional()
    .refine((value) => !value || /^https?:\/\//i.test(value), "Source URL must start with http(s)."),
  verificationStatus: z.enum(VERIFICATION_STATUSES),
  verificationNote: z.string().max(1000).optional(),
});

type EditorValues = z.infer<typeof editorSchema>;

function emptyToNull(value: string | undefined): string | null {
  const trimmed = value?.trim() ?? "";
  return trimmed === "" ? null : trimmed;
}

export function PlaceEditor({ initial }: { initial: PlaceEditorInitial }) {
  const router = useRouter();
  const isEdit = Boolean(initial.id);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [archiving, setArchiving] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<EditorValues>({
    resolver: zodResolver(editorSchema),
    defaultValues: {
      name: initial.name,
      category: initial.category,
      address: initial.address,
      provinceCode: initial.provinceCode,
      localityCode: initial.localityCode,
      latitude: String(initial.latitude),
      longitude: String(initial.longitude),
      operatingHours: initial.operatingHours ?? "",
      accessibilityDetails: initial.accessibilityDetails ?? "",
      amenities: initial.amenities.join(", "),
      publicAccessDetails: initial.publicAccessDetails ?? "",
      contactInformation: initial.contactInformation ?? "",
      sourceUrl: initial.sourceUrl ?? "",
      verificationStatus: initial.verificationStatus as EditorValues["verificationStatus"],
      verificationNote: initial.verificationNote ?? "",
    },
  });

  const provinceCode =
    useWatch({ control, name: "provinceCode" }) ?? initial.provinceCode;
  const verificationStatus =
    useWatch({ control, name: "verificationStatus" }) ??
    (initial.verificationStatus as EditorValues["verificationStatus"]);
  const localities = useMemo(() => localitiesForProvince(provinceCode), [provinceCode]);

  useEffect(() => {
    const current = getValues("localityCode");
    if (!localities.some((locality) => locality.code === current)) {
      setValue("localityCode", localities[0]?.code ?? "", { shouldValidate: false });
    }
  }, [provinceCode, localities, getValues, setValue]);

  async function onSubmit(values: EditorValues) {
    setServerError(null);
    setSuccess(null);
    const payload = {
      name: values.name,
      category: values.category,
      address: values.address,
      provinceCode: values.provinceCode,
      localityCode: values.localityCode,
      latitude: Number(values.latitude),
      longitude: Number(values.longitude),
      operatingHours: emptyToNull(values.operatingHours),
      accessibilityDetails: emptyToNull(values.accessibilityDetails),
      amenities: (values.amenities ?? "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
        .slice(0, 20),
      publicAccessDetails: emptyToNull(values.publicAccessDetails),
      contactInformation: emptyToNull(values.contactInformation),
      sourceUrl: emptyToNull(values.sourceUrl),
      verificationStatus: values.verificationStatus,
      ...(isEdit ? { verificationNote: emptyToNull(values.verificationNote) } : {}),
    };

    try {
      const response = await fetch(isEdit ? `/api/admin/places/${initial.id}` : "/api/admin/places", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = (await response.json()) as { error?: string; id?: string };
      if (!response.ok) {
        setServerError(body.error ?? "The facility could not be saved.");
        return;
      }
      setSuccess(isEdit ? "Facility record updated." : "Facility record created.");
      if (!isEdit && body.id) {
        router.push(`/admin/places/${body.id}`);
      } else {
        router.refresh();
      }
    } catch {
      setServerError("The facility could not be saved. Check your connection and try again.");
    }
  }

  async function archive() {
    if (!initial.id) return;
    if (!window.confirm("Archive this facility? It will be removed from the public directory but retained for audit.")) {
      return;
    }
    setArchiving(true);
    setServerError(null);
    try {
      const response = await fetch(`/api/admin/places/${initial.id}`, { method: "DELETE" });
      const body = (await response.json()) as { error?: string };
      if (!response.ok) {
        setServerError(body.error ?? "The facility could not be archived.");
        return;
      }
      router.push("/admin/places");
      router.refresh();
    } catch {
      setServerError("The facility could not be archived. Check your connection and try again.");
    } finally {
      setArchiving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {serverError ? (
        <Alert variant="danger" title="Could not save the facility">
          {serverError}
        </Alert>
      ) : null}
      {success ? (
        <Alert variant="success" title="Saved">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> {success}
          </span>
        </Alert>
      ) : null}

      <Card>
        <CardContent className="pt-5 sm:pt-6">
          <h2 className="text-base font-bold text-navy">Basic details</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="place-name">Facility name</Label>
              <Input id="place-name" {...register("name")} aria-invalid={Boolean(errors.name)} />
              {errors.name ? <p className="text-xs text-red-700" role="alert">{errors.name.message}</p> : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="place-category">Category</Label>
              <Select id="place-category" {...register("category")} aria-invalid={Boolean(errors.category)}>
                {PLACE_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </Select>
              {errors.category ? <p className="text-xs text-red-700" role="alert">{errors.category.message}</p> : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="place-status">Verification status</Label>
              <Select id="place-status" {...register("verificationStatus")}>
                {VERIFICATION_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {VERIFICATION_LABELS[status]}
                  </option>
                ))}
              </Select>
              <p className="text-[11px] text-muted-foreground">
                Only mark Verified after checking public access and cooling suitability.
              </p>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="place-address">Address</Label>
              <Input id="place-address" {...register("address")} aria-invalid={Boolean(errors.address)} />
              {errors.address ? <p className="text-xs text-red-700" role="alert">{errors.address.message}</p> : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="place-province">Province</Label>
              <Select id="place-province" {...register("provinceCode")} aria-invalid={Boolean(errors.provinceCode)}>
                {provinces.map((province) => (
                  <option key={province.code} value={province.code}>
                    {province.name}
                  </option>
                ))}
              </Select>
              {errors.provinceCode ? <p className="text-xs text-red-700" role="alert">{errors.provinceCode.message}</p> : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="place-locality">City or municipality</Label>
              <Select id="place-locality" {...register("localityCode")} aria-invalid={Boolean(errors.localityCode)}>
                {localities.map((locality) => (
                  <option key={locality.code} value={locality.code}>
                    {locality.name}
                  </option>
                ))}
              </Select>
              {errors.localityCode ? <p className="text-xs text-red-700" role="alert">{errors.localityCode.message}</p> : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="place-lat">Latitude</Label>
              <Input id="place-lat" inputMode="decimal" {...register("latitude")} aria-invalid={Boolean(errors.latitude)} />
              {errors.latitude ? <p className="text-xs text-red-700" role="alert">{errors.latitude.message}</p> : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="place-lon">Longitude</Label>
              <Input id="place-lon" inputMode="decimal" {...register("longitude")} aria-invalid={Boolean(errors.longitude)} />
              {errors.longitude ? <p className="text-xs text-red-700" role="alert">{errors.longitude.message}</p> : null}
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="place-source">Source URL</Label>
              <Input id="place-source" type="url" placeholder="https://…" {...register("sourceUrl")} aria-invalid={Boolean(errors.sourceUrl)} />
              <p className="text-[11px] text-muted-foreground">
                Link to the official page, OSM object, or other evidence used to check this record.
              </p>
              {errors.sourceUrl ? <p className="text-xs text-red-700" role="alert">{errors.sourceUrl.message}</p> : null}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-5 sm:pt-6">
          <h2 className="text-base font-bold text-navy">Facilities, access, and hours</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="place-hours">Operating hours</Label>
              <Input id="place-hours" placeholder="e.g. Mo-Fr 08:00-17:00; Sa 08:00-12:00" {...register("operatingHours")} />
              <p className="text-[11px] text-muted-foreground">
                Use OSM opening-hours syntax where possible. Do not guess.
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="place-contact">Contact information</Label>
              <Input id="place-contact" {...register("contactInformation")} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="place-amenities">Amenities (comma separated)</Label>
              <Input id="place-amenities" placeholder="Drinking water, Wheelchair access, Seating, Air-conditioning" {...register("amenities")} />
              <p className="text-[11px] text-muted-foreground">
                Record only amenities supported by the source or a review. Leave blank when unknown.
              </p>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="place-public-access">Public access details</Label>
              <Textarea id="place-public-access" rows={3} {...register("publicAccessDetails")} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="place-accessibility">Accessibility details</Label>
              <Textarea id="place-accessibility" rows={3} {...register("accessibilityDetails")} />
            </div>
            {isEdit ? (
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="place-note">Reviewer note</Label>
                <Textarea
                  id="place-note"
                  rows={3}
                  placeholder="What evidence supports the current verification status? Note any limits."
                  {...register("verificationNote")}
                />
                <p className="text-[11px] text-muted-foreground">
                  The note is shown publicly on a verified record. Do not include personal data.
                </p>
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {verificationStatus === "VERIFIED" ? (
        <Alert variant="warning" title="You are marking this record as verified">
          Verification means you checked the facility details, public access, and cooling suitability. It does not mean
          the facility is open right now or that conditions are safe. Record the evidence in the reviewer note.
        </Alert>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
          {isSubmitting ? (
            "Saving…"
          ) : (
            <>
              <Save className="h-4 w-4" aria-hidden="true" /> {isEdit ? "Save changes" : "Create facility"}
            </>
          )}
        </Button>
        {isEdit ? (
          <Button type="button" variant="outline" onClick={archive} disabled={archiving} className="w-full sm:w-auto">
            <Archive className="h-4 w-4" aria-hidden="true" /> {archiving ? "Archiving…" : "Archive record"}
          </Button>
        ) : null}
        <Button type="button" variant="ghost" onClick={() => router.back()} className="w-full sm:w-auto">
          Cancel
        </Button>
      </div>
    </form>
  );
}
