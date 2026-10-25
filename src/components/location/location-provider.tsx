"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";
import { DEFAULT_LOCALITY_CODE, getDefaultLocality, getLocality, getProvince } from "@/lib/geography";
import type { Locality, Province } from "@/lib/geography-types";

const STORAGE_KEY = "silong.location.v1";
const listeners = new Set<() => void>();
let memoryCode: string | null = null;

function readStoredCode(): string {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored && getLocality(stored)) return stored;
  } catch {
    // localStorage may be unavailable in private browsing.
  }
  return memoryCode && getLocality(memoryCode) ? memoryCode : DEFAULT_LOCALITY_CODE;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      // Re-read the external value, including a removal from another tab.
      memoryCode = null;
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function writeStoredCode(code: string): void {
  memoryCode = code;
  try {
    window.localStorage.setItem(STORAGE_KEY, code);
  } catch {
    // Ignore storage failures; the in-memory selection still works.
  }
  for (const listener of listeners) listener();
}

const subscribeHydration = () => () => {};
const getHydrated = () => true;
const getServerHydrated = () => false;

interface LocationContextValue {
  locality: Locality;
  province: Province;
  hydrated: boolean;
  setLocalityCode: (code: string) => void;
}

const LocationContext = createContext<LocationContextValue | null>(null);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const fallback = useMemo(() => getDefaultLocality(), []);
  const localityCode = useSyncExternalStore(
    subscribe,
    readStoredCode,
    () => DEFAULT_LOCALITY_CODE,
  );
  const hydrated = useSyncExternalStore(subscribeHydration, getHydrated, getServerHydrated);

  const setLocalityCode = useCallback((code: string) => {
    const locality = getLocality(code);
    if (!locality) return;
    writeStoredCode(locality.code);
  }, []);

  const locality = getLocality(localityCode) ?? fallback;
  const province = getProvince(locality.provinceCode) ?? getProvince(getDefaultLocality().provinceCode)!;

  const value = useMemo(
    () => ({ locality, province, hydrated, setLocalityCode }),
    [locality, province, hydrated, setLocalityCode],
  );

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}

export function useLocation(): LocationContextValue {
  const value = useContext(LocationContext);
  if (!value) throw new Error("useLocation must be used inside LocationProvider");
  return value;
}

export { DEFAULT_LOCALITY_CODE, STORAGE_KEY };
