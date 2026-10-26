import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, Info, ShieldCheck } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { geographyProvenance, region } from "@/lib/geography";
import { HEAT_RISK_CATEGORIES, PAGASA_SOURCE } from "@/lib/heat-index";

export const metadata: Metadata = {
  title: "Saan galing ang datos?",
  description:
    "Paano kinukuha ng SILONG PH ang weather, paano kinukuwenta ang estimated heat index, paano inuuri gamit ang PAGASA categories, paano hinahawakan ang lumang data, at paano bine-verify ang mga pasilidad at official advisory.",
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
    <div className="mx-auto max-w-4xl px-4 py-7 sm:px-6 sm:py-9 lg:px-8">
      <div className="max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Transparency</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-navy sm:text-4xl">
          Saan galing ang datos?
        </h1>
        <p className="mt-2 text-base leading-relaxed text-slate-600">
          Ipinapaliwanag ng page na ito kung ano ang natatanggap ng app, ano ang kinukuwenta nito, ano ang iniimbak, at
          saan ang mga limitasyon. Para ito sa residente, journalist, planner, at reviewer na kailangang malaman kung
          angkop ang isang numero sa gamit nila.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge variant="outline">Open-Meteo model data</Badge>
          <Badge variant="outline">PAGASA categories</Badge>
          <Badge variant="outline">PSGC geography</Badge>
          <Badge variant="outline">OpenStreetMap facilities</Badge>
        </div>
      </div>

      <Alert variant="warning" className="mt-6" title="Ang pinakamahalagang pagkakaiba">
        Ang <strong>official observation</strong> ay value na inilathala ng official authority tulad ng PAGASA. Ang{" "}
        <strong>forecast</strong> ay prediction. Ang <strong>application estimate</strong> ay value na kinukuwenta ng app
        mula sa model temperature at humidity. Hindi kailanman nilalagyan ng SILONG PH ng label na official PAGASA
        reading ang heat index na kinukuwenta nito.
      </Alert>

      <div className="prose-silong mt-8">
        <h2>1. Weather at forecast data</h2>
        <p>
          Galing sa{" "}
          <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">
            Open-Meteo forecast API <ExternalLink className="inline h-3.5 w-3.5" aria-hidden="true" />
          </a>{" "}
          ang kasalukuyang kondisyon at forecast. Humihingi ang app ng temperature sa 2 metro, relative humidity sa 2
          metro, apparent temperature, precipitation, weather code, wind speed, at daily extremes para sa pitong araw.
          Asia/Manila timezone ang ginagamit.
        </p>
        <p>
          Model grid data na naka-interpolate sa isang coordinate ang ibinibigay ng Open-Meteo. Karaniwang ilang
          kilometro ang lapad ng grid. Kaya ang reading sa center ng isang lugar ay hindi barangay-level measurement,
          hindi station observation, at hindi garantiya ng kondisyon sa eksaktong kinaroroonan mo. Puwedeng malaki ang
          pagkakaiba sa loob ng ilang kilometro dahil sa elevation, urban heat island, lilim, at lokal na hangin.
        </p>
        <p>
          Nilalagyan ng interface ng label na model data ang kasalukuyang kondisyon, forecast ang hourly at daily values,
          at application estimate ang heat index. Kapag kulang ang input mula sa provider, “hindi available” ang
          ipinapakita ng app, hindi gawa-gawang value.
        </p>

        <h2>2. Paano kinukuwenta ang heat index</h2>
        <p>
          Pinagsasama ng heat index ang air temperature at relative humidity para ilarawan kung gaano kainit ang
          pakiramdam. Kino-convert ng SILONG PH ang input mula Celsius papuntang Fahrenheit at inilalapat ang US National
          Weather Service / Rothfusz regression, kasama ang documented low-humidity at high-humidity adjustments. Binalik
          sa Celsius ang resulta at ni-round sa isang decimal place.
        </p>
        <p>
          Valid lang ang calculation sa loob ng input range ng regression. Kung nasa labas ng 1–100% ang relative
          humidity, o nasa labas ng 20–50 °C ang temperature, walang heat-index value na ibinabalik ang app. Wala rin
          itong value kapag lalampas sa 60 °C ang polynomial result, dahil nasa labas ng NWS chart ang mga kombinasyong
          iyon at magbubalik ng imposibleng numero. Sadya ito: ang pag-extrapolate sa labas ng validated range ay
          magbibigay ng mukhang-confident pero hindi mapagkakatiwalaang resulta.
        </p>
        <p>
          Hindi kapareho ng heat index ang air temperature, apparent temperature, o wet-bulb globe temperature. May
          epekto sa risk ang lilim, hangin, aktibidad, damit, hydration, edad, pagbubuntis, disability, at chronic
          illness. Hindi kayang saklawin ng isang numero ang lahat ng iyon.
        </p>

        <h2>3. PAGASA categories</h2>
        <p>
          Official DOST-PAGASA heat-index categories ang ginagamit sa pag-uuri. May integer bands na may pagitan ang
          PAGASA; ginagamit ng app ang lower bound ng bawat band para sa continuous values. Halimbawa, 32.5 °C ay
          itinuturing na Caution at 33.0 °C ay Extreme Caution.
        </p>
        <div className="not-prose mt-4 overflow-x-auto rounded-xl border border-border bg-white" tabIndex={0} role="region" aria-label="Talaan ng PAGASA heat-index categories">
          <table className="w-full min-w-[34rem] text-left text-sm">
            <caption className="sr-only">Mga PAGASA heat-index category na ginagamit ng SILONG PH</caption>
            <thead className="bg-muted text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th scope="col" className="px-4 py-3">Kategorya</th>
                <th scope="col" className="px-4 py-3">Heat index</th>
                <th scope="col" className="px-4 py-3">Ano ang ibig sabihin</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.level} className="border-t border-border align-top">
                  <td className="px-4 py-3 font-semibold text-navy">
                    {category.taglishLabel}
                    <span className="mt-0.5 block text-[11px] font-normal text-muted-foreground">
                      Official: {category.label}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-700">{category.taglishRangeLabel}</td>
                  <td className="px-4 py-3 text-slate-600">{category.taglishDescription}</td>
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
          , accessed {PAGASA_SOURCE.accessed}. Ginagamit ang categories sa pag-uuri; application estimate pa rin ang
          kinukwentang value.
        </p>

        <h2>4. Freshness, caching, at lumang data</h2>
        <p>
          Naka-cache ang weather snapshots nang 10 minuto. Kapag hindi available ang provider, puwedeng ipakita ng app
          ang huling successful snapshot hanggang 3 oras, may visible stale warning, orihinal na oras ng pagkuha, at
          paliwanag. Hindi nito pinapalitan ng gawa-gawang value ang failed reading.
        </p>
        <p>
          Laging may in-process cache. Kapag naka-configure ang Redis, shared ang fresh at stale snapshots sa mga app
          instance, at shared din ang rate-limit counters. Kapag hindi maabot ang Redis, bumabalik ang app sa process
          memory sa halip na mag-fail ang request. May scheduled endpoint na puwedeng mag-warm ng regional cache kada 10
          minuto; tingnan ang deployment guide.
        </p>
        <p>
          Hiwalay na ipinapakita ng interface ang model time at retrieval time. Puwedeng current ang forecast kahit luma
          ang provider request, at puwedeng recent ang retrieval kahit hindi pa nag-update ang model. Information ang
          dalawang timestamp, hindi dekorasyon.
        </p>

        <h2>5. Heograpiya</h2>
        <p>
          Galing sa Philippine Standard Geographic Code (PSGC) system ang pangalan at code ng probinsya at lungsod o
          munisipyo. Galing sa{" "}
          <a href={geographyProvenance.boundaryUrl} target="_blank" rel="noreferrer">
            faeldon/philippines-json-maps <ExternalLink className="inline h-3.5 w-3.5" aria-hidden="true" />
          </a>{" "}
          dataset (MIT), base sa PSA geography, ang boundaries. Nag-iimbak ang app ng 10-digit PSGC codes at gumagamit ng
          2023 boundaries.
        </p>
        <p>
          May pitong probinsya at 130 lungsod at munisipyo sa dataset ng {region.name}. Kasama ang Angeles City at
          Olongapo City bilang independent cities para sa regional coverage; wala ang geometry nila sa source boundary
          files, kaya geocoded representative points ang gamit at may marka ito. Ang province weather point ay capital o
          representative point, hindi province-wide average.
        </p>
        <p>
          Administrative geography ang map boundaries. Hindi ito heat zones, risk zones, o measurements. Overview ng
          isang model point kada probinsya ang province fill ng mapa at hindi dapat basahin bilang continuous surface.
        </p>

        <h2>6. Cooling-place records at verification</h2>
        <p>
          Galing sa OpenStreetMap contributors sa ilalim ng Open Database License (ODbL) ang public-facility records, o
          ginawa ng awtorisadong admin. Nagsisimula ang imported records sa status na <strong>Unverified</strong>.
          Pampublikong pasilidad sila mula sa external source, hindi kumpirmadong cooling center. Hindi sinasabi ng app
          na may aircon, tubig, upuan, o public access ang isang hindi pa beripikadong lugar.
        </p>
        <p>
          Puwedeng gawing Pending verification, Verified, Temporarily unavailable, Closed, o Unverified ng reviewer ang
          record. Kailangan sa verification ang pagsuri sa detalye ng pasilidad, public access, at pagiging angkop bilang
          cooling place. Ipinapakita ng record ang verification date, last review date, reviewer note kung mayroon, at
          source. Hindi real-time occupancy o availability signal ang verification, at puwedeng magbago ang kondisyon nang
          walang abiso.
        </p>
        <p>
          Galing lang sa nakalistang oras, gamit ang Asia/Manila timezone, ang operating-hours label. Puwedeng kulang o
          mali. Ang label na “Bukas ngayon” ay ibig sabihin lang na kasama ang kasalukuyang oras sa nakalistang oras;
          hindi ibig sabihin may staff, malamig, o tumatanggap ng bisita ang pasilidad.
        </p>

        <h2>7. Official advisories</h2>
        <p>
          Hindi awtomatikong kumukuha ng PAGASA, DOH, NDRRMC, o LGU advisories ang app. Puwede lang mag-record ng
          advisory ang admin kapag may title, description, affected area, severity, named issuer, issue time, optional
          expiry, at mapapatunayang source URL. Aktibo at hindi pa expired na record lang ang ipinapakita sa public alerts
          page, at may link sa source.
        </p>
        <p>
          Ang walang laman na official-advisory list ay ibig sabihin walang naitalang advisory sa app na ito. Hindi ibig
          sabihin na walang advisory na umiiral. Ang heat notices na gawa ng app ay kinukuwenta mula sa estimated heat
          index at may label na “hindi official” saanman ito lumabas.
        </p>

        <h2>8. Mga sadyang hindi kasama</h2>
        <ul>
          <li>Walang gawa-gawang live reading, fabricated advisory, o invented cooling center.</li>
          <li>Walang claim na kinakatawan ng isang model point ang buong probinsya o barangay.</li>
          <li>Walang awtomatikong pag-publish ng user report bilang verified fact.</li>
          <li>Walang real-time facility occupancy, dahil wala ito sa available sources.</li>
          <li>Walang medical diagnosis o individualized health advice.</li>
        </ul>

        <h2>9. Quality checks</h2>
        <p>
          Sinasaklaw ng automated tests ang heat-index category boundaries at input validation, weather-response
          normalization, stale-data handling, operating-hours parsing, geography lookups, authentication helpers, place
          validation, at moderation rules. Pinapatakbo ang production build at TypeScript checks bago ang release. Hindi
          kayang patunayan ng automated checks na bukas ang isang pasilidad o tugma ang model point sa kalsada mo;
          kailangan pa rin ang human review at official sources.
        </p>

        <h2>10. Mga source</h2>
        <ul>
          <li>
            <a href={PAGASA_SOURCE.url} target="_blank" rel="noreferrer">
              DOST-PAGASA Heat Index
            </a>{" "}
            — official categories at heat-index monitoring.
          </li>
          <li>
            <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">
              Open-Meteo
            </a>{" "}
            — model weather at forecast API, may attribution at license terms.
          </li>
          <li>
            <a href={geographyProvenance.psgcUrl} target="_blank" rel="noreferrer">
              Philippine Statistics Authority PSGC
            </a>{" "}
            — geographic codes at pangalan.
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
            <ShieldCheck className="h-4 w-4 text-success" aria-hidden="true" /> Malugod ang mga correction
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Kung mali ang facility record, gamitin ang report form sa page nito. Kung sa tingin mo ay mali ang
            representasyon ng data source o method, makipag-ugnayan sa operator sa channel na nakalista sa Tungkol page.
            Isama ang specific page at official source na sumusuporta sa correction.
          </p>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm font-semibold">
            <Link href="/about" className="inline-flex min-h-11 items-center text-primary hover:underline">
              Tungkol at contact
            </Link>
            <Link href="/privacy" className="inline-flex min-h-11 items-center text-primary hover:underline">
              Patakaran sa privacy
            </Link>
            <Link href="/cool-places" className="inline-flex min-h-11 items-center text-primary hover:underline">
              Directory ng preskong lugar
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 flex items-start gap-2 rounded-lg border border-border bg-muted/60 p-3 text-xs leading-relaxed text-muted-foreground">
        <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <p>
          Huling sinuri ang methodology noong 25 October 2026. Inilalarawan ng page na ito ang behavior ng codebase na
          ito; puwedeng iba ang data, configuration, o operator contact ng isang deployment. Tingnan ang About page para
          sa deployment-specific information.
        </p>
      </div>
    </div>
  );
}
