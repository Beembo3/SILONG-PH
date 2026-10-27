"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Download, MoreVertical, Share, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

type Platform = "ios" | "android" | "other";

function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return "other";
  const ua = navigator.userAgent;
  const iPadOs = /Macintosh/i.test(ua) && navigator.maxTouchPoints > 1;
  if (/iPad|iPhone|iPod/i.test(ua) || iPadOs) return "ios";
  if (/Android/i.test(ua)) return "android";
  return "other";
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function InstallAppButton({
  className,
  variant = "outline",
  size = "sm",
  label,
}: {
  className?: string;
  variant?: "outline" | "ghost" | "secondary";
  size?: "sm" | "default";
  label?: string;
}) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [platform, setPlatform] = useState<Platform>("other");
  const [instructionsOpen, setInstructionsOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    // Read browser-only capabilities after hydration, not during render.
    const timer = window.setTimeout(() => {
      setPlatform(detectPlatform());
      setInstalled(isStandalone());
    }, 0);

    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
      setInstructionsOpen(false);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed) return null;

  const buttonLabel =
    label ??
    (deferredPrompt
      ? "I-install ang app"
      : platform === "ios"
        ? "Idagdag sa Home Screen"
        : "I-install ang app");

  async function install() {
    if (!deferredPrompt) {
      setInstructionsOpen(true);
      return;
    }
    setBusy(true);
    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") setInstalled(true);
      setDeferredPrompt(null);
    } catch {
      // If the browser rejects the prompt, fall back to written instructions.
      setInstructionsOpen(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={size}
        className={cn("justify-start gap-2", className)}
        onClick={install}
        disabled={busy}
      >
        <Download className="h-4 w-4 shrink-0" aria-hidden="true" />
        {busy ? "Binubuksan ang install prompt…" : buttonLabel}
      </Button>

      <Dialog open={instructionsOpen} onOpenChange={setInstructionsOpen}>
        <DialogContent className="max-w-md">
          <DialogTitle>I-install ang SILONG PH</DialogTitle>
          <DialogDescription>
            I-install ang app para mabilis mong makita ang lagay ng init, preskong lugar, at mga dapat gawin. Opsyonal
            lang ito; patuloy pa ring gumagana ang website kahit hindi mo i-install.
          </DialogDescription>

          {platform === "ios" ? (
            <ol className="mt-5 space-y-4 text-sm leading-7 text-[#3f5146]">
              <li className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#f3eadb] text-xs font-bold text-[#7a4300]">
                  1
                </span>
                <span>
                  Sa Safari, i-tap ang <strong>Share</strong> button
                  <Share className="mx-1 inline h-4 w-4" aria-hidden="true" />
                  sa toolbar.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#f3eadb] text-xs font-bold text-[#7a4300]">
                  2
                </span>
                <span>
                  Mag-scroll pababa at i-tap ang <strong>Add to Home Screen</strong>.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#f3eadb] text-xs font-bold text-[#7a4300]">
                  3
                </span>
                <span>
                  I-tap ang <strong>Add</strong>. Lalabas ang SILONG PH sa Home Screen mo.
                </span>
              </li>
            </ol>
          ) : (
            <ol className="mt-5 space-y-4 text-sm leading-7 text-[#3f5146]">
              <li className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#f3eadb] text-xs font-bold text-[#7a4300]">
                  1
                </span>
                <span>
                  Buksan ang menu ng browser
                  <MoreVertical className="mx-1 inline h-4 w-4" aria-hidden="true" />
                  .
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#f3eadb] text-xs font-bold text-[#7a4300]">
                  2
                </span>
                <span>
                  Piliin ang <strong>Install app</strong>, <strong>Add to Home screen</strong>, o ang pinakamalapit na
                  katumbas nito.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#f3eadb] text-xs font-bold text-[#7a4300]">
                  3
                </span>
                <span>Kumpirmahin ang installation.</span>
              </li>
            </ol>
          )}

          <div className="mt-5 flex items-start gap-2 rounded-2xl border border-border/80 bg-[#f8f3e9] p-3 text-xs leading-relaxed text-muted-foreground">
            <Smartphone className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <p>
              Available ang installation kapag sinusuportahan ito ng browser mo. Kung walang install option, gamitin
              lang ang SILONG PH sa browser. Puwede mong isara ang gabay na ito anumang oras.
            </p>
          </div>

          <div className="mt-5 flex items-center gap-2 text-xs font-semibold text-[#24563c]">
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            Tuloy pa ring magagamit ang buong website kahit hindi i-install.
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
