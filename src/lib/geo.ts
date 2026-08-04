/**
 * Smart route calculation helpers.
 * - Nominatim (OpenStreetMap) address autosuggest
 * - OSRM driving distance with a Haversine fallback
 * - ETA derived from distance @ 60 mph + 8h processing buffer
 * - Route metadata is packed into the flexible `current_location` text column
 *   so no schema change is required.
 */

import { useEffect, useRef, useState } from "react";

export type GeoPlace = {
  name: string;
  lat: number;
  lon: number;
};

export type RouteMeta = {
  miles: number;
  km: number;
  origin?: { lat: number; lon: number };
  dest?: { lat: number; lon: number };
  /** ISO timestamp of the computed arrival */
  eta?: string;
  /** true when OSRM answered, false when the Haversine fallback was used */
  osrm?: boolean;
};

export const AVG_SPEED_MPH = 60;
export const PROCESSING_BUFFER_HOURS = 8;

/* ------------------------------------------------------------------ */
/* Address autosuggest                                                 */
/* ------------------------------------------------------------------ */

export async function searchPlaces(query: string, signal?: AbortSignal): Promise<GeoPlace[]> {
  const q = query.trim();
  if (q.length < 3) return [];
  const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=0&q=${encodeURIComponent(q)}&limit=5`;
  const res = await fetch(url, { signal, headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`Address lookup failed (${res.status})`);
  const json = (await res.json()) as Array<{ display_name: string; lat: string; lon: string }>;
  return json.map(r => ({ name: r.display_name, lat: Number(r.lat), lon: Number(r.lon) }));
}

/** Debounced Nominatim suggestions for a controlled input. */
export function usePlaceSuggestions(query: string, enabled = true) {
  const [results, setResults] = useState<GeoPlace[]>([]);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!enabled || query.trim().length < 3) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const t = setTimeout(() => {
      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;
      searchPlaces(query, ac.signal)
        .then(setResults)
        .catch(() => {})
        .finally(() => setLoading(false));
    }, 450);
    return () => clearTimeout(t);
  }, [query, enabled]);

  useEffect(() => () => abortRef.current?.abort(), []);

  return { results, loading, clear: () => setResults([]) };
}

/* ------------------------------------------------------------------ */
/* Distance + ETA                                                      */
/* ------------------------------------------------------------------ */

export function haversineKm(a: { lat: number; lon: number }, b: { lat: number; lon: number }): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lon - a.lon) * Math.PI) / 180;
  const la1 = (a.lat * Math.PI) / 180;
  const la2 = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export const kmToMiles = (km: number) => km * 0.621371;

/** True ground distance via OSRM, falling back to great-circle distance. */
export async function calculateRoute(
  origin: { lat: number; lon: number },
  dest: { lat: number; lon: number },
): Promise<RouteMeta> {
  let km: number | null = null;
  let osrm = false;
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${origin.lon},${origin.lat};${dest.lon},${dest.lat}?overview=false`;
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (res.ok) {
      const json = (await res.json()) as { routes?: Array<{ distance: number }> };
      const meters = json.routes?.[0]?.distance;
      if (typeof meters === "number" && meters > 0) {
        km = meters / 1000;
        osrm = true;
      }
    }
  } catch {
    /* fall through to Haversine */
  }
  if (km === null) km = haversineKm(origin, dest);

  const miles = kmToMiles(km);
  return {
    km: Math.round(km * 10) / 10,
    miles: Math.round(miles * 10) / 10,
    origin,
    dest,
    osrm,
    eta: etaFromMiles(miles).toISOString(),
  };
}

/** Transit hours = miles / 60 mph + 8h processing buffer. */
export function transitHours(miles: number): number {
  return miles / AVG_SPEED_MPH + PROCESSING_BUFFER_HOURS;
}

export function etaFromMiles(miles: number, from: Date = new Date()): Date {
  return new Date(from.getTime() + transitHours(miles) * 3600_000);
}

export function toDateInput(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/* ------------------------------------------------------------------ */
/* Metadata packing (schema-free)                                      */
/* ------------------------------------------------------------------ */

const OPEN = "\u27E6";
const CLOSE = "\u27E7";
const META_RE = new RegExp(`${OPEN}(.*?)${CLOSE}`, "s");

/** Pack route metadata into a plain text location value. */
export function packLocation(label: string, meta: RouteMeta | null | undefined): string {
  const clean = label.trim();
  if (!meta) return clean;
  return `${clean} ${OPEN}${JSON.stringify(meta)}${CLOSE}`;
}

/** Split a stored location string back into its label and route metadata. */
export function unpackLocation(raw: string | null | undefined): { label: string; meta: RouteMeta | null } {
  const value = raw ?? "";
  const match = value.match(META_RE);
  if (!match) return { label: value.trim(), meta: null };
  let meta: RouteMeta | null = null;
  try {
    meta = JSON.parse(match[1] as string) as RouteMeta;
  } catch {
    meta = null;
  }
  return { label: value.replace(META_RE, "").trim(), meta };
}
