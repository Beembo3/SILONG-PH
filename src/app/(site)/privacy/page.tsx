import type { Metadata } from "next";
import Link from "next/link";
import { Alert } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Privacy policy",
  description:
    "What SILONG PH stores, what stays on your device, how reports and administrator sessions are handled, and how to exercise your privacy rights.",
};

const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL;
const updated = "25 October 2026";

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Privacy</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-navy sm:text-4xl">Privacy policy</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: {updated}</p>
        <p className="mt-3 text-base leading-relaxed text-slate-600">
          SILONG PH is designed to work without an account. This policy explains what is processed when you browse,
          choose a location, submit a correction, or sign in as an administrator.
        </p>
      </div>

      <Alert variant="info" className="mt-6" title="Short version">
        No advertising or analytics trackers are installed. Your selected locality is stored in your browser. Precise
        geolocation is requested only when you press the location button. Reports are stored for moderation. Raw IP
        addresses are not stored by the application; a keyed, truncated hash is used for abuse prevention.
      </Alert>

      <div className="prose-silong mt-8">
        <h2>1. Information stored on your device</h2>
        <p>
          When you choose a province, city, or municipality, the application stores the locality code in your
          browser&apos;s local storage so the dashboard remembers your choice. You can clear it by clearing site data
          in your browser. The application does not store your name, email address, or account details for ordinary
          browsing.
        </p>
        <p>
          The progressive web app uses a service worker to cache pages, static assets, and an offline page. Cached
          content stays on your device until the cache is replaced or cleared. Weather API responses are not cached by
          the service worker; the interface labels stale server-side snapshots explicitly.
        </p>

        <h2>2. Geolocation</h2>
        <p>
          The &ldquo;use my location&rdquo; control requests browser geolocation only after you press it. The
          coordinates are used in your browser to find the nearest listed locality and to sort facilities by distance.
          SILONG PH does not send your precise coordinates to its own servers for storage. The weather request uses the
          selected locality&apos;s representative coordinates, not your exact GPS position. Your browser or operating
          system may ask for permission and may record the request according to its own policies.
        </p>

        <h2>3. Reports and corrections</h2>
        <p>
          If you submit a facility report, the application stores the report type, your description, any proposed place
          name, address, and locality code, the time of submission, and moderation status. Do not include personal
          information about other people. Reports are visible to authorised administrators and are not published
          automatically. The report form does not require an account or an email address.
        </p>

        <h2>4. Abuse prevention and technical logs</h2>
        <p>
          To limit automated abuse, sign-in and report endpoints use rate limiting. The application derives a
          keyed, truncated hash from the request&apos;s IP address and uses that hash as the rate-limit key. Raw IP
          addresses are not written to the application database or to Redis by this code. If Redis is configured, the
          hash and a short-lived counter are stored there; otherwise they are held in process memory.
        </p>
        <p>
          The hosting provider or reverse proxy may keep standard access logs (including IP address, user agent, and
          requested URL) under its own policy. The operator of this deployment is responsible for those logs and for
          configuring an appropriate retention period.
        </p>

        <h2>5. Administrator accounts and audit logs</h2>
        <p>
          Administrator sign-in uses an email address and password. Passwords are stored as bcrypt hashes, never as
          plaintext. A successful sign-in sets an HttpOnly, SameSite=Lax session cookie that expires after eight hours;
          in production it is also marked Secure. Administrative actions such as creating or verifying a facility,
          moderating a report, or recording an official advisory are written to an audit log with the actor, action,
          entity, and time. The audit log may include a hashed IP value if one is supplied by the deployment.
        </p>

        <h2>6. Third-party requests</h2>
        <p>
          The application makes requests to third parties to provide its core functions. Those providers receive
          technical information such as your IP address and user agent as part of a normal web request:
        </p>
        <ul>
          <li>
            <strong>Open-Meteo</strong> for model weather and forecast data. See{" "}
            <a href="https://open-meteo.com/en/terms" target="_blank" rel="noreferrer">
              Open-Meteo&apos;s terms
            </a>
            .
          </li>
          <li>
            <strong>OpenStreetMap tile servers</strong> for base maps. See the{" "}
            <a href="https://wiki.osmfoundation.org/wiki/Privacy_Policy" target="_blank" rel="noreferrer">
              OpenStreetMap Foundation privacy policy
            </a>
            .
          </li>
          <li>
            <strong>Official source links</strong> such as PAGASA, DOH, and NDRRMC open only when you choose them.
          </li>
        </ul>
        <p>
          The application does not include third-party advertising, social-media pixels, or analytics scripts in this
          release.
        </p>

        <h2>7. Retention</h2>
        <p>
          Facility reports are retained while they are needed for moderation, correction, and audit. Audit records are
          retained to support accountability and security. Administrator sessions expire automatically. The operator of
          this deployment should configure a documented retention schedule and delete records that are no longer
          needed. This code does not automatically delete reports or audit entries.
        </p>

        <h2>8. Security</h2>
        <p>
          Administrative routes require a valid session and server-side role check. Mutating requests verify the request
          origin. Security headers restrict framing, MIME sniffing, and unnecessary browser permissions. No system is
          perfectly secure; do not submit sensitive personal information through the correction form.
        </p>

        <h2>9. Your rights</h2>
        <p>
          The Philippine Data Privacy Act of 2012 (Republic Act No. 10173) provides rights in relation to personal data,
          including the right to be informed, to object, to access, to rectify, to erase or block, to damages, and to
          lodge a complaint with the National Privacy Commission. Because ordinary browsing does not create an account,
          the application may not be able to identify you from a report unless you provide contact details voluntarily.
        </p>
        <p>
          To ask about a report or an audit record, contact the operator. If no contact address is configured, use the
          report form on a facility page and state that your message is a privacy request. Do not include unnecessary
          identity documents.
        </p>

        <h2>10. Children</h2>
        <p>
          The application is intended for a general audience and is not directed at children under 13. Do not submit a
          child&apos;s personal information through the correction form. If a child needs help, an adult should contact
          the local government or emergency service.
        </p>

        <h2>11. Changes</h2>
        <p>
          This policy may be updated when the application changes. The &ldquo;last updated&rdquo; date at the top of
          this page shows the current version. Material changes should be announced by the operator.
        </p>

        <h2>12. Contact</h2>
        <p>
          {contactEmail ? (
            <>
              Privacy questions: <a href={`mailto:${contactEmail}`}>{contactEmail}</a>. This address is configured by
              the operator of this deployment.
            </>
          ) : (
            <>
              No public operator contact address is configured for this deployment. For data corrections, use the report
              form on a facility page. For emergencies, contact 911 or your local DRRMO.
            </>
          )}
        </p>
      </div>

      <Card className="mt-8">
        <CardContent className="pt-5 sm:pt-6">
          <h2 className="text-base font-bold text-navy">Related pages</h2>
          <div className="mt-2 flex flex-wrap gap-3 text-sm font-semibold">
            <Link href="/about" className="text-primary hover:underline">
              About the project
            </Link>
            <Link href="/methodology" className="text-primary hover:underline">
              Data sources and methodology
            </Link>
            <Link href="/preparedness" className="text-primary hover:underline">
              Preparedness centre
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
