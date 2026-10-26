"use client";

import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

export function OfflineBanner() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const update = () => setOffline(!navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  if (!offline) return null;
  return (
    <div className="border-b border-amber-300 bg-amber-50 px-4 py-2 text-center text-sm text-amber-950" role="status">
      <WifiOff className="mr-1.5 inline h-4 w-4" aria-hidden="true" />
      Wala kang internet. Ipinapakita ang mga naka-cache na page at malinaw na may label na lumang weather data. I-check ang koneksyon at subukan muli.
    </div>
  );
}
