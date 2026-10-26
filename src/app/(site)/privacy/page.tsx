import type { Metadata } from "next";
import Link from "next/link";
import { Alert } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Patakaran sa privacy",
  description:
    "Ano ang iniimbak ng SILONG PH, ano ang nananatili sa device mo, paano hinahawakan ang reports at admin sessions, at paano gamitin ang privacy rights mo.",
};

const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL;
const updated = "25 October 2026";

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-7 sm:px-6 sm:py-9 lg:px-8">
      <div className="max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Privacy</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-navy sm:text-4xl">Patakaran sa privacy</h1>
        <p className="mt-2 text-sm text-muted-foreground">Huling na-update: {updated}</p>
        <p className="mt-3 text-base leading-relaxed text-slate-600">
          Dinisenyo ang SILONG PH para gumana nang walang account. Ipinapaliwanag ng policy na ito kung ano ang
          pinoproseso kapag nagba-browse ka, pumili ng lugar, nagpadala ng correction, o nag-sign in bilang admin.
        </p>
      </div>

      <Alert variant="info" className="mt-6" title="Maikling bersyon">
        Walang advertising o analytics tracker na naka-install. Nasa browser mo ang napiling lugar. Hihingin lang ang
        precise geolocation kapag pinindot mo ang location button. Iniimbak ang reports para sa moderation. Hindi
        iniimbak ng app ang raw IP address; keyed at truncated hash ang ginagamit para sa abuse prevention.
      </Alert>

      <div className="prose-silong mt-8">
        <h2>1. Impormasyong iniimbak sa device mo</h2>
        <p>
          Kapag pumili ka ng probinsya, lungsod, o munisipyo, iniimbak ng app ang locality code sa local storage ng
          browser mo para matandaan ang napili mo. Puwede mong burahin ito sa site data ng browser. Hindi iniimbak ng
          app ang pangalan, email address, o account details mo para sa ordinaryong pag-browse.
        </p>
        <p>
          Gumagamit ang progressive web app ng service worker para i-cache ang pages, static assets, at offline page.
          Nananatili sa device mo ang cached content hanggang mapalitan o mabura ang cache. Hindi naka-cache sa service
          worker ang weather API responses; malinaw na nilalagyan ng label ng interface ang stale server-side snapshots.
        </p>

        <h2>2. Geolocation</h2>
        <p>
          Humihingi lang ng browser geolocation ang “gamitin ang lokasyon ko” control kapag pinindot mo ito. Ginagamit
          ang coordinates sa browser mo para hanapin ang pinakamalapit na nakalista na lugar at i-sort ang pasilidad
          ayon sa layo. Hindi ipinapadala ng SILONG PH ang precise coordinates mo sa sarili nitong servers para iimbak.
          Ang representative coordinates ng napiling lugar, hindi ang exact GPS position mo, ang ginagamit sa weather
          request. Puwedeng humingi ng permission ang browser o operating system mo at i-record ang request ayon sa
          sarili nilang policy.
        </p>

        <h2>3. Mga report at correction</h2>
        <p>
          Kapag nagpadala ka ng facility report, iniimbak ng app ang report type, description mo, anumang proposed place
          name, address, at locality code, oras ng pagsumite, at moderation status. Huwag maglagay ng personal na
          impormasyon ng ibang tao. Nakikita ng awtorisadong admin ang reports at hindi ito awtomatikong napi-publish.
          Hindi kailangan ng account o email address ang report form.
        </p>

        <h2>4. Pagpigil sa abuse at technical logs</h2>
        <p>
          Para limitahan ang automated abuse, may rate limiting ang sign-in at report endpoints. Gumagawa ang app ng
          keyed at truncated hash mula sa IP address ng request at ginagamit ito bilang rate-limit key. Hindi isinusulat
          ng code na ito ang raw IP address sa application database o Redis. Kapag naka-configure ang Redis, doon
          iniimbak ang hash at short-lived counter; kung wala, nasa process memory sila.
        </p>
        <p>
          Puwedeng magtabi ang hosting provider o reverse proxy ng standard access logs (kasama ang IP address, user
          agent, at requested URL) sa ilalim ng sarili nilang policy. Responsable ang operator ng deployment na ito sa
          mga log na iyon at sa pag-configure ng angkop na retention period.
        </p>

        <h2>5. Mga admin account at audit log</h2>
        <p>
          Gumagamit ng email address at password ang admin sign-in. bcrypt hash ang iniimbak na password, hindi
          plaintext. Kapag successful ang sign-in, nagse-set ito ng HttpOnly, SameSite=Lax session cookie na mag-e-expire
          pagkatapos ng walong oras; sa production, naka-Secure din ito. Ang administrative actions tulad ng paggawa o
          pag-verify ng pasilidad, pag-moderate ng report, o pag-record ng official advisory ay isinusulat sa audit log
          kasama ang actor, action, entity, at oras. Puwedeng may hashed IP value sa audit log kung may ibinigay ang
          deployment.
        </p>

        <h2>6. Mga request sa third party</h2>
        <p>
          May requests ang app sa third parties para sa core functions nito. Natatanggap ng providers na ito ang
          technical information tulad ng IP address at user agent mo bilang bahagi ng normal na web request:
        </p>
        <ul>
          <li>
            <strong>Open-Meteo</strong> para sa model weather at forecast data. Tingnan ang{" "}
            <a href="https://open-meteo.com/en/terms" target="_blank" rel="noreferrer">
              terms ng Open-Meteo
            </a>
            .
          </li>
          <li>
            <strong>OpenStreetMap tile servers</strong> para sa base maps. Tingnan ang{" "}
            <a href="https://wiki.osmfoundation.org/wiki/Privacy_Policy" target="_blank" rel="noreferrer">
              privacy policy ng OpenStreetMap Foundation
            </a>
            .
          </li>
          <li>
            <strong>Official source links</strong> tulad ng PAGASA, DOH, at NDRRMC ay bubukas lang kapag pinili mo.
          </li>
        </ul>
        <p>
          Walang third-party advertising, social-media pixel, o analytics script sa release na ito.
        </p>

        <h2>7. Gaano katagal iniimbak</h2>
        <p>
          Iniimbak ang facility reports habang kailangan para sa moderation, correction, at audit. Iniimbak ang audit
          records para sa accountability at security. Awtomatikong nag-e-expire ang admin sessions. Dapat mag-configure
          ang operator ng deployment na ito ng documented retention schedule at magbura ng records na hindi na kailangan.
          Hindi awtomatikong nagbubura ng reports o audit entries ang code na ito.
        </p>

        <h2>8. Seguridad</h2>
        <p>
          Kailangan ng valid session at server-side role check ang administrative routes. Chine-check ng mutating requests
          ang request origin. Nililimitahan ng security headers ang framing, MIME sniffing, at hindi kailangang browser
          permissions. Walang perpektong secure na system; huwag magpadala ng sensitibong personal information sa
          correction form.
        </p>

        <h2>9. Mga karapatan mo</h2>
        <p>
          Nagbibigay ang Philippine Data Privacy Act of 2012 (Republic Act No. 10173) ng mga karapatan sa personal data,
          kasama ang right to be informed, to object, to access, to rectify, to erase or block, to damages, at to lodge a
          complaint sa National Privacy Commission. Dahil walang account na nagagawa sa ordinaryong pag-browse, maaaring
          hindi ka makilala ng app mula sa isang report maliban kung boluntaryo kang nagbigay ng contact details.
        </p>
        <p>
          Para magtanong tungkol sa report o audit record, makipag-ugnayan sa operator. Kung walang naka-configure na
          contact address, gamitin ang report form sa facility page at sabihing privacy request ang mensahe mo. Huwag
          magsama ng hindi kailangang identity documents.
        </p>

        <h2>10. Mga bata</h2>
        <p>
          Para sa general audience ang app at hindi ito para sa batang wala pang 13 taong gulang. Huwag magpadala ng
          personal information ng bata sa correction form. Kung kailangan ng bata ng tulong, dapat makipag-ugnayan ang
          adult sa lokal na pamahalaan o emergency service.
        </p>

        <h2>11. Mga pagbabago</h2>
        <p>
          Puwedeng ma-update ang policy na ito kapag nagbago ang app. Ipinapakita ng “huling na-update” na petsa sa itaas
          ng page ang kasalukuyang bersyon. Dapat ipaalam ng operator ang material changes.
        </p>

        <h2>12. Kontak</h2>
        <p>
          {contactEmail ? (
            <>
              Mga tanong sa privacy: <a href={`mailto:${contactEmail}`}>{contactEmail}</a>. Naka-configure ang address
              na ito ng operator ng deployment.
            </>
          ) : (
            <>
              Walang naka-configure na public operator contact address para sa deployment na ito. Para sa data
              corrections, gamitin ang report form sa facility page. Para sa emergency, tumawag sa 911 o sa lokal na
              DRRMO.
            </>
          )}
        </p>
      </div>

      <Card className="mt-8">
        <CardContent className="pt-5 sm:pt-6">
          <h2 className="text-base font-bold text-navy">Kaugnay na mga page</h2>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm font-semibold">
            <Link href="/about" className="inline-flex min-h-11 items-center text-primary hover:underline">
              Tungkol sa proyekto
            </Link>
            <Link href="/methodology" className="inline-flex min-h-11 items-center text-primary hover:underline">
              Saan galing ang datos
            </Link>
            <Link href="/preparedness" className="inline-flex min-h-11 items-center text-primary hover:underline">
              Paghahanda sa init
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
