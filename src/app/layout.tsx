import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Manrope } from "next/font/google";
import "leaflet/dist/leaflet.css";
import "./globals.css";
import { ServiceWorkerRegistration } from "@/components/pwa/service-worker-registration";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin", "latin-ext"],
  variable: "--font-bricolage",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin", "latin-ext"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: {
    default: "SILONG PH — Alamin ang init. Humanap ng silong. Maging handa.",
    template: "%s | SILONG PH",
  },
  description:
    "Alamin ang estimated heat index, opisyal na babala, preskong lugar, at mga dapat gawin para manatiling ligtas sa init sa Central Luzon.",
  applicationName: "SILONG PH",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icons/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SILONG PH",
  },
  other: {
    // Keep the legacy iOS meta tag alongside Next's mobile-web-app-capable
    // output so older iPhones launch the saved site in standalone mode.
    "apple-mobile-web-app-capable": "yes",
  },
  openGraph: {
    title: "SILONG PH",
    description: "Alamin ang init. Humanap ng silong. Maging handa.",
    type: "website",
    locale: "fil_PH",
    siteName: "SILONG PH",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#123B2E",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="fil-PH"
      className={`${bricolage.variable} ${manrope.variable}`}
      data-scroll-behavior="smooth"
    >
      <body>
        <a href="#main-content" className="skip-link">
          Laktawan papunta sa pangunahing nilalaman
        </a>
        {children}
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
