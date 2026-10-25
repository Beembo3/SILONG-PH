import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, HeartHandshake, Map, ShieldCheck, Sparkles, Users } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { geographyProvenance, provinces, region } from "@/lib/geography";

export const metadata: Metadata = {
  title: "About SILONG PH",
  description:
    "Why SILONG PH exists, what it does and does not do, how information is verified, and who maintains the project.",
};

const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL;

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">About</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-navy sm:text-4xl">
          Understand the heat. Find relief. Stay prepared.
        </h1>
        <p className="mt-3 text-base leading-relaxed text-slate-600">
          SILONG PH is an independent public-service web application for {region.name} ({region.shortName}). It brings
          together model weather, a clearly labelled estimated heat index, a map, a directory of public facilities with
          verification status, and practical preparedness guidance.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge variant="orange">Central Luzon</Badge>
          <Badge variant="outline">{provinces.length} provinces</Badge>
          <Badge variant="outline">130 cities and municipalities</Badge>
          <Badge variant="outline">PWA · mobile first</Badge>
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="pt-5 sm:pt-6">
            <ShieldCheck className="h-6 w-6 text-success" aria-hidden="true" />
            <h2 className="mt-2 text-lg font-bold text-navy">What this project does</h2>
            <ul className="mt-2 space-y-2 text-sm text-slate-600">
              <li className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                Shows current Open-Meteo model conditions and a 7-day forecast at a selected locality or province point.
              </li>
              <li className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                Calculates an estimated heat index and classifies it with the official PAGASA categories.
              </li>
              <li className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                Lists public facilities with explicit verification status, source, and review dates.
              </li>
              <li className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                Provides preparedness education, official-source links, and a moderated correction process.
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5 sm:pt-6">
            <Sparkles className="h-6 w-6 text-primary" aria-hidden="true" />
            <h2 className="mt-2 text-lg font-bold text-navy">What it does not do</h2>
            <ul className="mt-2 space-y-2 text-sm text-slate-600">
              <li className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" aria-hidden="true" />
                It does not claim that an application-calculated heat index is an official PAGASA reading.
              </li>
              <li className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" aria-hidden="true" />
                It does not invent live readings, advisories, cooling centres, or contact details.
              </li>
              <li className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" aria-hidden="true" />
                It does not replace emergency services, medical advice, or official LGU instructions.
              </li>
              <li className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" aria-hidden="true" />
                It does not guarantee that an unverified facility is open, cool, accessible, or safe.
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <section className="prose-silong mt-10" aria-labelledby="independence-heading">
        <h2 id="independence-heading">Independence and affiliation</h2>
        <p>
          SILONG PH is not affiliated with, endorsed by, or an official channel of DOST-PAGASA, the Department of
          Health, NDRRMC, or any local government unit. It links to official sources and clearly labels information
          recorded by administrators. If an official instruction conflicts with anything on this site, follow the
          official instruction.
        </p>

        <h2>How information is handled</h2>
        <p>
          Weather and forecasts come from Open-Meteo model data. The heat index is calculated by this application using
          the US National Weather Service regression with documented adjustments. PAGASA&apos;s published categories
          are used for classification, but the value itself is not an official PAGASA observation.
        </p>
        <p>
          Cooling-place records are imported from OpenStreetMap as <strong>unverified public facilities</strong> or
          created by an administrator. A record is shown as verified only after an authorised reviewer checks its
          details, public access, and cooling suitability. Verification is not a real-time occupancy guarantee.
        </p>
        <p>
          Official advisories are stored only when an administrator records a named issuer, issue time, affected area,
          and verifiable source URL. The application does not automatically ingest PAGASA or LGU advisories. An empty
          advisory list means no advisory has been recorded here, not that no advisory exists.
        </p>

        <h2>Coverage and geography</h2>
        <p>
          The application covers the seven provinces of {region.name}: Aurora, Bataan, Bulacan, Nueva Ecija, Pampanga,
          Tarlac, and Zambales, including 130 cities and municipalities. Angeles City and Olongapo City are independent
          cities included for regional coverage. Their source boundary files do not contain geometry, so they use
          geocoded representative points.
        </p>
        <p className="text-sm text-muted-foreground">
          Geography provenance: {geographyProvenance.names} {geographyProvenance.boundaries}{" "}
          <a href={geographyProvenance.boundaryUrl} target="_blank" rel="noreferrer">
            Boundary source <ExternalLink className="inline h-3.5 w-3.5" aria-hidden="true" />
          </a>
          .
        </p>

        <h2>Accessibility</h2>
        <p>
          The interface targets WCAG 2.2 AA: keyboard-operable controls, visible focus, semantic headings, text
          alternatives for maps and charts, reduced-motion support, and mobile-first layouts. Maps are accompanied by
          searchable text alternatives. If you find a barrier, please report it through the correction process or the
          operator contact below.
        </p>

        <h2>Corrections and community input</h2>
        <p>
          Each facility page has a report form for incorrect details, outdated hours, closures, accessibility
          information, and new locations. Reports go to a moderation queue and are not published automatically. You do
          not need an account to submit a report, and you should not include personal information about other people.
        </p>

        <h2>Operator and contact</h2>
        <p>
          {contactEmail ? (
            <>
              This deployment is operated by its maintainer. Contact:{" "}
              <a href={`mailto:${contactEmail}`}>{contactEmail}</a>. For local emergencies, contact 911 or your local
              DRRMO — not this project.
            </>
          ) : (
            <>
              No public operator contact address is configured for this deployment. Use the report form on a facility
              page for data corrections. For local emergencies, contact 911 or your local DRRMO — not this project.
            </>
          )}
        </p>
      </section>

      <Alert variant="warning" className="mt-8" title="Emergency and medical disclaimer">
        SILONG PH provides general heat-safety education, not medical advice or diagnosis. For suspected heat stroke or
        another life-threatening emergency, call 911 or local emergency services immediately. Do not delay emergency
        care to use this application.
      </Alert>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/methodology" className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-deep-blue">
          Read the methodology
        </Link>
        <Link href="/privacy" className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-orange-300">
          Privacy policy
        </Link>
        <Link href="/preparedness" className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-orange-300">
          Preparedness centre
        </Link>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-white p-4">
          <Users className="h-5 w-5 text-primary" aria-hidden="true" />
          <h2 className="mt-2 text-sm font-bold text-navy">For residents</h2>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Check conditions, plan around the hottest hours, and know where you can safely cool down.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-white p-4">
          <Map className="h-5 w-5 text-primary" aria-hidden="true" />
          <h2 className="mt-2 text-sm font-bold text-navy">For planners</h2>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Use province and locality pages to see model points and facility coverage. Do not treat them as
            barangay-level measurements.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-white p-4">
          <HeartHandshake className="h-5 w-5 text-primary" aria-hidden="true" />
          <h2 className="mt-2 text-sm font-bold text-navy">For communities</h2>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Report incorrect facility information so a reviewer can check it, and share official sources rather than
            screenshots.
          </p>
        </div>
      </div>
    </div>
  );
}
