import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, BookOpen, ExternalLink, Phone, ShieldCheck, Sun } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MEDICAL_DISCLAIMER, preparednessSections, preparednessSources } from "@/data/preparedness";

export const metadata: Metadata = {
  title: "Heat preparedness centre",
  description:
    "Practical before, during, and after guidance for extreme heat in Central Luzon, including heat-illness warning signs and official sources.",
};

export default function PreparednessPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Preparedness centre</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-navy sm:text-4xl">
          Prepare for the heat before it peaks
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Practical guidance for households, workers, schools, and communities in Central Luzon. This page is general
          heat-safety education, not medical advice or an official advisory.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge variant="orange">
            <Sun className="h-3.5 w-3.5" aria-hidden="true" /> Before · During · After
          </Badge>
          <Badge variant="outline">
            <BookOpen className="h-3.5 w-3.5" aria-hidden="true" /> English and Taglish
          </Badge>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
        <Alert variant="danger" title="Suspected heat stroke is an emergency">
          <p>
            Call <strong>911</strong> or your local emergency service immediately if someone has confusion, slurred
            speech, seizures, loss of consciousness, collapse, or a very high body temperature. Begin cooling the person
            while waiting for help. Do not give fluids to someone who is confused or unconscious.
          </p>
        </Alert>
        <Card>
          <CardContent className="pt-5 sm:pt-6">
            <h2 className="flex items-center gap-2 text-base font-bold text-navy">
              <Phone className="h-4 w-4 text-primary" aria-hidden="true" /> Emergency contacts
            </h2>
            <ul className="mt-2 space-y-1.5 text-sm text-slate-700">
              <li>National emergency hotline: 911</li>
              <li>Local DRRMO or city/municipal hall</li>
              <li>Nearest hospital or health centre</li>
            </ul>
            <p className="mt-2 text-xs text-muted-foreground">
              SILONG PH does not dispatch emergency services and cannot confirm local hotline numbers.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 space-y-6">
        {preparednessSections.map((section) => (
          <section key={section.id} id={section.id} aria-labelledby={`${section.id}-heading`}>
            <Card>
              <CardContent className="pt-5 sm:pt-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
                      {section.taglishTitle}
                    </p>
                    <h2 id={`${section.id}-heading`} className="mt-1 text-2xl font-extrabold tracking-tight text-navy">
                      {section.title}
                    </h2>
                    <p className="mt-1 max-w-3xl text-sm leading-relaxed text-muted-foreground">{section.summary}</p>
                  </div>
                  <Badge variant="outline">{section.items.length} actions</Badge>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {section.items.map((item) => (
                    <div key={item.title} className="rounded-lg border border-border bg-muted/30 p-4">
                      <h3 className="text-sm font-bold text-navy">{item.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-slate-600">{item.detail}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>
        ))}
      </div>

      <section className="mt-10" aria-labelledby="sources-heading">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Evidence and links</p>
            <h2 id="sources-heading" className="mt-1 text-2xl font-extrabold tracking-tight text-navy">
              Official sources
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              SILONG PH links to these sources; it does not automatically republish their advisories.
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/alerts">See official alerts</Link>
          </Button>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {preparednessSources.map((source) => (
            <a
              key={source.url}
              href={source.url}
              target="_blank"
              rel="noreferrer"
              className="group rounded-xl border border-border bg-white p-4 transition-colors hover:border-orange-300"
            >
              <p className="flex items-center justify-between gap-2 text-sm font-bold text-navy">
                {source.title}
                <ExternalLink className="h-3.5 w-3.5 shrink-0 text-slate-400 group-hover:text-primary" aria-hidden="true" />
              </p>
              <p className="mt-0.5 text-xs font-semibold text-primary">{source.publisher}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{source.note}</p>
            </a>
          ))}
        </div>
      </section>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <Alert variant="warning" title="Medical disclaimer">
          {MEDICAL_DISCLAIMER}
        </Alert>
        <Card>
          <CardContent className="pt-5 sm:pt-6">
            <h2 className="flex items-center gap-2 text-base font-bold text-navy">
              <ShieldCheck className="h-4 w-4 text-primary" aria-hidden="true" /> Make a personal plan
            </h2>
            <ul className="mt-2 space-y-2 text-sm text-slate-700">
              <li className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                Identify a cool place you can reach safely and confirm it is open.
              </li>
              <li className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                Keep water, medicine, and a phone charger ready.
              </li>
              <li className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                Agree on a check-in plan for older relatives, neighbours living alone, and anyone with a disability.
              </li>
            </ul>
            <div className="mt-3 flex flex-wrap gap-3 text-sm font-semibold">
              <Link href="/cool-places" className="text-primary hover:underline">
                Find a cool place
              </Link>
              <Link href="/map" className="text-primary hover:underline">
                Check the heat map
              </Link>
              <Link href="/methodology" className="text-primary hover:underline">
                Read the methodology
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 flex items-start gap-2 rounded-lg border border-border bg-muted/60 p-3 text-xs leading-relaxed text-muted-foreground">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <p>
          Heat guidance can change with local conditions and official directives. Follow the latest instructions from
          PAGASA, DOH, your LGU, and your workplace or school. If this page conflicts with an official emergency
          instruction, follow the official instruction.
        </p>
      </div>
    </div>
  );
}
