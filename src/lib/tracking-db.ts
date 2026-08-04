import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Shipment, ShipmentStage, HistoryEvent } from "./shipments";
import { unpackLocation } from "./geo";


export const TRACKING_TABLE = "tracking_shipments";

export type TrackingStatus = "Pending" | "In Transit" | "Out for Delivery" | "Delivered";

export const TRACKING_STATUSES: TrackingStatus[] = [
  "Pending",
  "In Transit",
  "Out for Delivery",
  "Delivered",
];

/** Row shape of public.tracking_shipments */
export type TrackingRow = {
  id: string;
  tracking_number: string;
  origin: string;
  destination: string;
  status: string;
  current_location: string | null;
  estimated_delivery: string | null;
  created_at: string;
  updated_at: string | null;
};

export type TrackingInput = {
  tracking_number: string;
  origin: string;
  destination: string;
  status: TrackingStatus;
  current_location: string;
  estimated_delivery: string;
};

const SELECT =
  "id, tracking_number, origin, destination, status, current_location, estimated_delivery, created_at, updated_at";

export function normalizeStatus(raw: string | null | undefined): TrackingStatus {
  const s = (raw ?? "").trim().toLowerCase().replace(/[_-]+/g, " ");
  if (s.startsWith("deliver") && !s.startsWith("out")) return "Delivered";
  if (s.startsWith("out")) return "Out for Delivery";
  if (s.includes("transit")) return "In Transit";
  return "Pending";
}

const STATUS_STAGE: Record<TrackingStatus, ShipmentStage> = {
  Pending: 0,
  "In Transit": 1,
  "Out for Delivery": 2,
  Delivered: 3,
};

const STATUS_PROGRESS: Record<TrackingStatus, number> = {
  Pending: 8,
  "In Transit": 48,
  "Out for Delivery": 82,
  Delivered: 100,
};

export function generateTrackingNumber(destination: string): string {
  const code = (destination.match(/,\s*([A-Za-z]{2,})\s*$/)?.[1] ?? destination.slice(0, 2))
    .toUpperCase()
    .slice(0, 2)
    .padEnd(2, "X");
  return `FTX-${Math.floor(100000 + Math.random() * 900000)}-${code}`;
}

function fmtTs(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toISOString().replace("T", " ").slice(0, 16);
}

/** Milestone timeline derived from the record's status, origin/destination and location. */
function buildHistory(row: TrackingRow, status: TrackingStatus, locationLabel: string): HistoryEvent[] {
  const stage = STATUS_STAGE[status];
  const created = row.created_at;
  const updated = row.updated_at ?? row.created_at;
  const here = locationLabel.trim() || row.origin;
  const events: HistoryEvent[] = [
    { ts: fmtTs(created), loc: row.origin, event: "Shipment label created", stage: 0 },
  ];
  if (stage >= 1) events.push({ ts: fmtTs(updated), loc: row.origin, event: "Departed origin facility", stage: 1 });
  if (stage === 1) events.push({ ts: fmtTs(updated), loc: here, event: "In transit — on schedule", stage: 1 });
  if (stage >= 2) events.push({ ts: fmtTs(updated), loc: here, event: "Out for delivery", stage: 2 });
  if (stage >= 3) events.push({ ts: fmtTs(updated), loc: row.destination, event: "Delivered · Signed for at destination", stage: 3 });
  return events;
}

export function rowToShipment(row: TrackingRow): Shipment {
  const status = normalizeStatus(row.status);
  const stage = STATUS_STAGE[status];
  const { label: locationLabel, meta } = unpackLocation(row.current_location);
  const eta = row.estimated_delivery
    ? new Date(row.estimated_delivery).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })
    : "Scheduling";

  return {
    id: row.tracking_number,
    status: status === "Pending" ? "Label Created" : status,
    stage,
    progress: STATUS_PROGRESS[status],
    eta: status === "Delivered" ? `Delivered ${eta}` : eta,
    origin: { city: row.origin, hub: "Origin Hub" },
    destination: { city: row.destination, hub: "Destination Hub" },
    weight: "—",
    packages: 1,
    service: "TranSec Managed",
    serviceNote: "Network-routed",
    insured: "Standard coverage",
    transit: meta ? `${Math.round(meta.miles / 60 + 8)} h estimated` : "Per network schedule",
    coords: meta?.dest ? `${meta.dest.lat.toFixed(3)}, ${meta.dest.lon.toFixed(3)}` : "—",
    currentLocation:
      locationLabel ||
      (stage >= 3 ? `${row.destination} — Delivered` : stage >= 1 ? "In transit" : row.origin),
    live: stage === 1 || stage === 2,
    route: meta,
    etaISO: meta?.eta ?? (row.estimated_delivery ? new Date(row.estimated_delivery).toISOString() : null),
    createdAt: row.created_at,
    history: buildHistory(row, status, locationLabel),
  };
}


/* ---------------- queries ---------------- */

export async function fetchTrackingRows(): Promise<TrackingRow[]> {
  const { data, error } = await supabase
    .from(TRACKING_TABLE)
    .select(SELECT)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as TrackingRow[];
}

export async function fetchTrackingByNumber(trackingNumber: string): Promise<TrackingRow | null> {
  const key = trackingNumber.trim();
  if (!key) return null;
  const { data, error } = await supabase
    .from(TRACKING_TABLE)
    .select(SELECT)
    .ilike("tracking_number", key)
    .maybeSingle();
  if (error) throw error;
  return (data as TrackingRow | null) ?? null;
}

export async function createTrackingRow(input: TrackingInput): Promise<TrackingRow> {
  const { data, error } = await supabase.from(TRACKING_TABLE).insert(input).select(SELECT).single();
  if (error) throw error;
  return data as TrackingRow;
}

export async function updateTrackingRow(id: string, patch: Partial<TrackingInput>): Promise<TrackingRow> {
  const { data, error } = await supabase
    .from(TRACKING_TABLE)
    .update(patch)
    .eq("id", id)
    .select(SELECT)
    .single();
  if (error) throw error;
  return data as TrackingRow;
}

export async function deleteTrackingRow(id: string): Promise<void> {
  const { error } = await supabase.from(TRACKING_TABLE).delete().eq("id", id);
  if (error) throw error;
}

/* ---------------- reactive hooks ---------------- */

function useRealtime(onChange: () => void) {
  useEffect(() => {
    const channel = supabase
      .channel(`public:${TRACKING_TABLE}:${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: TRACKING_TABLE }, () => onChange())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [onChange]);
}

export function useTrackingRows() {
  const [rows, setRows] = useState<TrackingRow[] | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(() => {
    fetchTrackingRows()
      .then(setRows)
      .catch(e => setError(e as Error));
  }, []);

  useEffect(load, [load]);
  useRealtime(load);

  return { rows: rows ?? [], loading: rows === null && !error, error, refresh: load };
}

export function useTrackedShipment(trackingNumber: string) {
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(() => {
    const key = trackingNumber.trim();
    if (!key) {
      setShipment(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchTrackingByNumber(key)
      .then(row => {
        setShipment(row ? rowToShipment(row) : null);
        setError(null);
      })
      .catch(e => setError(e as Error))
      .finally(() => setLoading(false));
  }, [trackingNumber]);

  useEffect(load, [load]);
  useRealtime(load);

  return { shipment, loading, error };
}
