"use client";

import { useEffect } from "react";

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    // In development, remove any previously installed worker so cached pages
    // and chunks cannot mask hot-reload changes. Test the PWA with a production
    // build (`npm run build && npm start`).
    if (process.env.NODE_ENV !== "production") {
      navigator.serviceWorker
        .getRegistrations()
        .then((registrations) => Promise.all(registrations.map((registration) => registration.unregister())))
        .catch(() => undefined);
      return;
    }

    let registration: ServiceWorkerRegistration | null = null;
    let lastUpdateCheck = 0;

    const checkForUpdate = () => {
      if (!registration || document.visibilityState !== "visible") return;
      const now = Date.now();
      if (now - lastUpdateCheck < 60 * 60 * 1000) return;
      lastUpdateCheck = now;
      registration.update().catch(() => undefined);
    };

    const register = async () => {
      try {
        registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
          updateViaCache: "none",
        });
        // Check once shortly after load, then at most once an hour when the
        // installed app returns to the foreground.
        window.setTimeout(checkForUpdate, 5_000);
      } catch {
        // A failed service-worker registration must not break the app.
      }
    };

    const onVisible = () => {
      if (document.visibilityState === "visible") checkForUpdate();
    };

    if (document.readyState === "complete") void register();
    else window.addEventListener("load", register, { once: true });
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      window.removeEventListener("load", register);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);
  return null;
}
