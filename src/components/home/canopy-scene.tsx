import { cn } from "@/lib/utils";

/**
 * Original SILONG PH hero illustration. A low sun sits behind layered canopy
 * shapes; the cream arch is the "silong" — a cool opening in the shade.
 */
export function CanopyScene({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 520 430"
      aria-hidden="true"
      className={cn("w-full", className)}
      fill="none"
      preserveAspectRatio="xMidYMax slice"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="355" cy="145" r="124" fill="var(--sun)" />
      <circle cx="355" cy="145" r="154" stroke="var(--sun)" strokeOpacity=".3" strokeWidth="1.5" />
      <circle cx="355" cy="145" r="186" stroke="var(--sun)" strokeOpacity=".16" strokeWidth="1.5" />
      <g stroke="var(--sun-ink)" strokeOpacity=".18" strokeWidth="1.4" strokeLinecap="round">
        <path d="M355 2v18" />
        <path d="M416 15l-9 16" />
        <path d="M470 62l-16 9" />
        <path d="M498 122h-18" />
      </g>

      <g stroke="var(--forest)" strokeOpacity=".16" strokeWidth="1.3" fill="none">
        <path d="M22 204c66-42 136-49 208-22 78 29 146 27 218-12" />
        <path d="M14 230c70-38 141-42 211-16 78 29 146 25 222-16" />
        <path d="M8 258c74-33 146-35 214-10 79 29 148 24 226-18" />
      </g>

      <path
        d="M-18 331C74 211 178 186 271 233c90 45 160 39 267-32v229H-18V331Z"
        fill="var(--canopy)"
      />
      <path
        d="M-18 365C81 259 187 247 277 292c87 43 158 36 261-21v159H-18V365Z"
        fill="var(--forest)"
      />
      <path
        d="M-18 402C88 316 190 306 287 345c92 37 162 24 251-23v108H-18v-28Z"
        fill="var(--deep-blue)"
      />

      <path
        d="M197 430v-81c0-38 26-67 63-67s63 29 63 67v81H197Z"
        fill="var(--ivory)"
      />
      <path
        d="M220 430v-78c0-25 17-45 40-45s40 20 40 45v78h-80Z"
        fill="var(--sun)"
      />
      <path
        d="M231 430v-76c0-18 13-31 29-31s29 13 29 31v76h-58Z"
        fill="var(--sun-ink)"
        fillOpacity=".22"
      />

      <g stroke="var(--leaf)" strokeOpacity=".65" strokeWidth="2" strokeLinecap="round">
        <path d="M69 360c25-18 51-22 78-12" />
        <path d="M347 354c25-12 52-14 79-5" />
        <path d="M111 386c19-10 39-12 61-6" />
        <path d="M358 386c20-9 41-9 61-1" />
      </g>

      <g fill="var(--leaf)" fillOpacity=".9">
        <path d="M427 269c18-20 39-24 61-12-10 23-30 33-61 12Z" />
        <path d="M452 286c14-14 31-17 48-8-8 18-24 25-48 8Z" />
      </g>
      <path
        d="M457 281c12-14 24-24 38-31"
        stroke="var(--forest)"
        strokeOpacity=".55"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
