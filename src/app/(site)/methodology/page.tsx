import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, Info, ShieldCheck } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { geographyProvenance, region } from "@/lib/geography";
import { HEAT_RISK_CATEGORIES, PAGASA_SOURCE } from "@/lib/heat-index";

export const metadata: Metadata = {
  title: "Data sources and methodology",
  description:
    "How SILONG PH sources weather, calculates estimated heat index, classifies risk with PAGASA categories, handles stale data, verifies facilities, and records official advisories.",
};

const categories = [
  HEAT_RISK_CATEGORIES.below_caution,
  HEAT_RISK_CATEGORIES.caution,
  HEAT_RISK_CATEGORIES.extreme_caution,
  HEAT_RISK_CATEGORIES.danger,
  HEAT_RISK_CATEGORIES.extreme_danger,
];

export default function MethodologyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Transparency</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-navy sm:text-4xl">
          Data sources and methodology
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          This page explains exactly what the application receives, what it calculates, what it stores, and where the
          limits are. It is written for residents, journalists, planners, and reviewers who need to judge whether a
          number is fit for their purpose.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge variant="outline">Open-Meteo model data</Badge>
          <Badge variant="outline">PAGASA categories</Badge>
          <Badge variant="outline">PSGC geography</Badge>
          <Badge variant="outline">OpenStreetMap facilities</Badge>
        </div>
      </div>

      <Alert variant="warning" className="mt-6" title="The central distinction">
        An <strong>official observation</strong> is a value published by an official authority such as PAGASA. A{" "}
        <strong>forecast</strong> is a prediction. An <strong>application estimate</strong> is a value this application
        calculates from model temperature and humidity. SILONG PH never labels its calculated heat index as an
        official PAGASA reading.
      </Alert>

      <div className="prose-silong mt-8">
        <h2>1. Weather and forecast data</h2>
        <p>
          Current conditions and forecasts come from the{" "}
          <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">
            Open-Meteo forecast API <ExternalLink className="inline h-3.5 w-3.5" aria-hidden="true" />
          </a>
          . The application requests temperature at 2 metres, relative humidity at 2 metres, apparent temperature,
          precipitation, weather code, wind speed, and daily extremes for seven days. Data is requested for the
          Asia/Manila timezone.
        </p>
        <p>
          Open-Meteo provides model grid data interpolated to a coordinate. The grid is typically several kilometres
          wide. A reading at a locality centre is therefore not a barangay-level measurement, not a station observation,
          and not a guarantee of conditions at your exact position. Elevation, urban heat islands, shade, and local wind
          can produce large differences within a few kilometres.
        </p>
        <p>
          The interface labels current conditions as model data, hourly and daily values as forecasts, and the heat index
          as an application estimate. Where the provider does not return enough inputs, the application shows
          &ldquo;unavailable&rdquo; rather than filling the gap with a synthetic value.
        </p>

        <h2>2. Heat-index calculation</h2>
        <p>
          Heat index combines air temperature and relative humidity to describe how hot the air feels. SILONG PH
          converts the inputs from Celsius to Fahrenheit and applies the US National Weather Service / Rothfusz
          regression, including the documented low-humidity and high-humidity adjustments. The result is converted back
          to Celsius and rounded to one decimal place.
        </p>
        <p>
          The calculation is valid only within the input ranges used by the regression. If relative humidity is outside
          1–100%, or temperature is outside 20–50 °C, the application returns no heat-index value. It also returns no
          value when the polynomial result would exceed 60 °C, because those combinations lie outside the NWS chart and
          produce implausible numbers. This is deliberate: extrapolating outside the validated range would produce a
          confident-looking but unreliable result.
        </p>
        <p>
          Heat index is not the same as air temperature, apparent temperature, or a wet-bulb globe temperature. Shade,
          wind, activity, clothing, hydration, age, pregnancy, disability, and chronic illness all affect risk. A single
          number cannot capture all of those factors.
        </p>

        <h2>3. PAGASA categories</h2>
        <p>
          Classification uses the official DOST-PAGASA heat-index categories. PAGASA publishes integer bands with gaps
          between them; the application uses each band&apos;s lower bound for continuous values. For example, 32.5 °C is
          treated as Caution and 33.0 °C as Extreme Caution.
        </p>
        <div className="not-prose mt-4 overflow-x-auto rounded-xl border border-border bg-white">
          <table className="w-full min-w-[34rem] text-left text-sm">
            <caption className="sr-only">PAGASA heat-index categories used by SILONG PH</caption>
            <thead className="bg-muted text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th scope="col" className="px-4 py-3">Category</th>
                <th scope="col" className="px-4 py-3">Heat index</th>
                <th scope="col" className="px-4 py-3">What it means</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.level} className="border-t border-border align-top">
                  <td className="px-4 py-3 font-semibold text-navy">{category.label}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-700">{category.rangeLabel}</td>
                  <td className="px-4 py-3 text-slate-600">{category.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-sm text-muted-foreground">
          Source:{" "}
          <a href={PAGASA_SOURCE.url} target="_blank" rel="noreferrer">
            {PAGASA_SOURCE.title} <ExternalLink className="inline h-3.5 w-3.5" aria-hidden="true" />
          </a>
          , accessed {PAGASA_SOURCE.accessed}. Categories are used for classification; the calculated value remains an
          application estimate.
        </p>

        <h2>4. Freshness, caching, and stale data</h2>
        <p>
          Weather snapshots are cached for 10 minutes. If the provider is unavailable, the application may show the last
          successful snapshot for up to 3 hours, with a visible stale warning, the original retrieval time, and an
          explanation. It never replaces a failed reading with a made-up one.
        </p>
        <p>
          An in-process cache is always available. When Redis is configured, fresh and stale snapshots are shared across
          application instances, and rate-limit counters are shared as well. If Redis is unreachable, the application
          falls back to process memory rather than failing requests. A scheduled endpoint can warm the regional cache
          every 10 minutes; see the deployment guide.
        </p>
        <p>
          The interface shows the model time and the retrieval time separately. A forecast can be current even when a
          provider request is old, and a retrieval can be recent even when the model itself has not updated. Treat both
          timestamps as information, not decoration.
        </p>

        <h2>5. Geography</h2>
        <p>
          Province and city/municipality names and codes come from the Philippine Standard Geographic Code (PSGC)
          system. Boundaries come from the{" "}
          <a href={geographyProvenance.boundaryUrl} target="_blank" rel="noreferrer">
            faeldon/philippines-json-maps <ExternalLink className="inline h-3.5 w-3.5" aria-hidden="true" />
          </a>{" "}
          dataset (MIT), based on PSA geography. The application stores 10-digit PSGC codes and uses 2023 boundaries.
        </p>
        <p>
          {region.name} contains seven provinces and 130 cities and municipalities in the dataset. Angeles City and
          Olongapo City are independent cities included for regional coverage; their source boundary files do not
          include geometry, so they use geocoded representative points and are marked accordingly. A province weather
          point is the provincial capital or a representative point, not a province-wide average.
        </p>
        <p>
          Map boundaries are administrative geography. They do not represent heat zones, risk zones, or measurements.
          The map&apos;s province fill is an overview of one model point per province and must not be read as a
          continuous surface.
        </p>

        <h2>6. Cooling-place records and verification</h2>
        <p>
          Public-facility records are imported from OpenStreetMap contributors under the Open Database License (ODbL),
          or created by an authorised administrator. Imported records begin with the status{" "}
          <strong>Unverified</strong>. They are public facilities from an external source, not confirmed cooling
          centres. The application does not claim that an unverified place has air-conditioning, water, seating, or
          public access.
        </p>
        <p>
          A reviewer can set a record to Pending verification, Verified, Temporarily unavailable, Closed, or Unverified.
          Verification requires checking the facility details, public access, and cooling suitability. The record shows
          the verification date, last review date, reviewer note where available, and source. Verification is not a
          real-time occupancy or availability signal, and conditions can change without notice.
        </p>
        <p>
          Operating-hours labels are derived only from listed hours using the Asia/Manila timezone. They can be
          incomplete or wrong. A label such as &ldquo;Open now&rdquo; means only that the listed hours include the
          current time; it does not mean the facility is staffed, cool, or accepting visitors.
        </p>

        <h2>7. Official advisories</h2>
        <p>
          The application does not automatically ingest PAGASA, DOH, NDRRMC, or LGU advisories. An administrator may
          record an advisory only with a title, description, affected area, severity, named issuer, issue time, optional
          expiry, and a verifiable source URL. The public alerts page shows only active, unexpired records and links to
          the source.
        </p>
        <p>
          An empty official-advisory list means no advisory has been recorded in this application. It does not mean no
          advisory is in effect. Application-generated heat notices are calculated from the estimated heat index and are
          labelled &ldquo;not official&rdquo; wherever they appear.
        </p>

        <h2>8. What is deliberately not included</h2>
        <ul>
          <li>No synthetic live readings, fabricated advisories, or invented cooling centres.</li>
          <li>No claim that a model point represents an entire province or barangay.</li>
          <li>No automatic publication of user reports as verified facts.</li>
          <li>No real-time facility occupancy, which the available sources do not provide.</li>
          <li>No medical diagnosis or individualized health advice.</li>
        </ul>

        <h2>9. Quality checks</h2>
        <p>
          Automated tests cover heat-index category boundaries and input validation, weather-response normalization,
          stale-data handling, operating-hours parsing, geography lookups, authentication helpers, place validation, and
          moderation rules. The production build and TypeScript checks are run before release. Automated checks cannot
          prove that a facility is open or that a model point matches your street; human review and official sources
          remain necessary.
        </p>

        <h2>10. Sources</h2>
        <ul>
          <li>
            <a href={PAGASA_SOURCE.url} target="_blank" rel="noreferrer">
              DOST-PAGASA Heat Index
            </a>{" "}
            — official categories and heat-index monitoring.
          </li>
          <li>
            <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">
              Open-Meteo
            </a>{" "}
            — model weather and forecast API, with attribution and license terms.
          </li>
          <li>
            <a href={geographyProvenance.psgcUrl} target="_blank" rel="noreferrer">
              Philippine Statistics Authority PSGC
            </a>{" "}
            — geographic codes and names.
          </li>
          <li>
            <a href={geographyProvenance.boundaryUrl} target="_blank" rel="noreferrer">
              faeldon/philippines-json-maps
            </a>{" "}
            — boundary geometry (MIT).
          </li>
          <li>
            <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">
              OpenStreetMap contributors
            </a>{" "}
            — public-facility source data (ODbL).
          </li>
        </ul>
      </div>

      <Card className="mt-8">
        <CardContent className="pt-5 sm:pt-6">
          <h2 className="flex items-center gap-2 text-base font-bold text-navy">
            <ShieldCheck className="h-4 w-4 text-success" aria-hidden="true" /> Corrections are welcome
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            If a facility record is wrong, use the report form on its page. If you believe a data source or method is
            misrepresented, contact the operator through the channel listed on the About page. Please include the
            specific page and the official source that supports the correction.
          </p>
          <div className="mt-3 flex flex-wrap gap-3 text-sm font-semibold">
            <Link href="/about" className="text-primary hover:underline">
              About and contact
            </Link>
            <Link href="/privacy" className="text-primary hover:underline">
              Privacy policy
            </Link>
            <Link href="/cool-places" className="text-primary hover:underline">
              Cool places directory
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 flex items-start gap-2 rounded-lg border border-border bg-muted/60 p-3 text-xs leading-relaxed text-muted-foreground">
        <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <p>
          Methodology last reviewed 25 October 2026. This page describes the behaviour of this codebase; a deployment
          may have different data, configuration, or operator contacts. Check the About page for deployment-specific
          information.
        </p>
      </div>
    </div>
  );
}
