import type { Shipment, ShipmentStage } from "./shipments";

export type AdminStatus = "Pending" | "In Transit" | "Out for Delivery" | "Delivered";

export type AdminEvent = {
  id: string;
  ts: string; // ISO datetime — displayed as timestamp
  location: string;
  description: string;
  stage: ShipmentStage;
};

export type AdminShipment = {
  id: string;
  origin: string;
  destination: string;
  sender: string;
  receiver: string;
  status: AdminStatus;
  eta: string; // ISO date (yyyy-mm-dd)
  createdAt: string;
  events: AdminEvent[];
};

const KEY = "transec.admin.shipments";
const EVT = "transec:admin-shipments";

function read(): AdminShipment[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const list = JSON.parse(raw) as AdminShipment[];
    // Backfill events for older records so tracking never renders empty history.
    return list.map(s => ({ ...s, events: Array.isArray(s.events) ? s.events : defaultEvents(s) }));
  } catch {
    return [];
  }
}

function write(list: AdminShipment[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new Event(EVT));
}

export function listAdminShipments(): AdminShipment[] {
  return read().sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export function generateTrackingId(destination: string): string {
  const countryCode = (destination.match(/,\s*([A-Za-z]{2,})\s*$/)?.[1] ?? destination.slice(0, 2))
    .toUpperCase()
    .slice(0, 2)
    .padEnd(2, "X");
  const digits = Math.floor(100000 + Math.random() * 900000);
  return `FTX-${digits}-${countryCode}`;
}

const STATUS_STAGE: Record<AdminStatus, ShipmentStage> = {
  "Pending": 0,
  "In Transit": 1,
  "Out for Delivery": 2,
  "Delivered": 3,
};

const STATUS_PROGRESS: Record<AdminStatus, number> = {
  "Pending": 8,
  "In Transit": 48,
  "Out for Delivery": 82,
  "Delivered": 100,
};

function defaultEvents(input: Omit<AdminShipment, "events">): AdminEvent[] {
  const stage = STATUS_STAGE[input.status];
  const now = new Date().toISOString();
  const events: AdminEvent[] = [
    {
      id: crypto.randomUUID(),
      ts: input.createdAt,
      location: input.origin,
      description: `Shipment label created for ${input.receiver}`,
      stage: 0,
    },
  ];
  if (stage >= 1) events.push({ id: crypto.randomUUID(), ts: now, location: input.origin, description: "Departed origin facility", stage: 1 });
  if (stage >= 2) events.push({ id: crypto.randomUUID(), ts: now, location: input.destination, description: "Out for delivery", stage: 2 });
  if (stage >= 3) events.push({ id: crypto.randomUUID(), ts: now, location: input.destination, description: `Delivered · Signed by ${input.receiver}`, stage: 3 });
  return events;
}

export function createAdminShipment(input: Omit<AdminShipment, "id" | "createdAt" | "events">): AdminShipment {
  const list = read();
  let id = generateTrackingId(input.destination);
  while (list.some(s => s.id === id)) id = generateTrackingId(input.destination);
  const createdAt = new Date().toISOString();
  const base = { ...input, id, createdAt };
  const shipment: AdminShipment = { ...base, events: defaultEvents(base) };
  write([shipment, ...list]);
  return shipment;
}

export function updateAdminShipmentStatus(id: string, status: AdminStatus) {
  const list = read();
  const next = list.map(s => (s.id === id ? { ...s, status } : s));
  write(next);
}

export function updateAdminShipment(id: string, patch: Partial<Omit<AdminShipment, "id" | "createdAt">>) {
  const list = read();
  const next = list.map(s => (s.id === id ? { ...s, ...patch } : s));
  write(next);
}

export function deleteAdminShipment(id: string) {
  write(read().filter(s => s.id !== id));
}

export function addAdminEvent(id: string, event: Omit<AdminEvent, "id">): AdminEvent {
  const list = read();
  const created: AdminEvent = { ...event, id: crypto.randomUUID() };
  const next = list.map(s => (s.id === id ? { ...s, events: [...s.events, created] } : s));
  write(next);
  return created;
}

export function updateAdminEvent(shipmentId: string, event: AdminEvent) {
  const list = read();
  const next = list.map(s =>
    s.id === shipmentId ? { ...s, events: s.events.map(e => (e.id === event.id ? event : e)) } : s,
  );
  write(next);
}

export function deleteAdminEvent(shipmentId: string, eventId: string) {
  const list = read();
  const next = list.map(s =>
    s.id === shipmentId ? { ...s, events: s.events.filter(e => e.id !== eventId) } : s,
  );
  write(next);
}

export function findAdminShipment(id: string): AdminShipment | null {
  const key = id.trim().toUpperCase();
  return read().find(s => s.id.toUpperCase() === key) ?? null;
}

export function subscribeAdminShipments(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = () => cb();
  window.addEventListener(EVT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(EVT, handler);
    window.removeEventListener("storage", handler);
  };
}

function fmtTs(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toISOString().replace("T", " ").slice(0, 16);
  } catch {
    return iso;
  }
}

export function toShipment(a: AdminShipment): Shipment {
  const events = [...a.events].sort((x, y) => (x.ts < y.ts ? -1 : 1));
  const latestStage = (events.length ? events[events.length - 1].stage : STATUS_STAGE[a.status]) as ShipmentStage;
  const stage = Math.max(STATUS_STAGE[a.status], latestStage) as ShipmentStage;
  const progress = STATUS_PROGRESS[a.status];
  const etaFmt = a.status === "Delivered"
    ? `Delivered ${new Date(a.eta).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}`
    : new Date(a.eta).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });

  const latest = events[events.length - 1];

  return {
    id: a.id,
    status: a.status === "Pending" ? "Label Created" : a.status,
    stage,
    progress,
    eta: etaFmt,
    origin: { city: a.origin, hub: `Origin Hub · ${a.sender}` },
    destination: { city: a.destination, hub: `Destination Hub · ${a.receiver}` },
    weight: "—",
    packages: 1,
    service: "TranSec Managed",
    serviceNote: `Sender: ${a.sender}`,
    insured: "Standard coverage",
    transit: "Per admin schedule",
    coords: "—",
    currentLocation: latest?.location ?? (stage >= 3 ? `${a.destination} — Delivered` : stage >= 1 ? "In transit" : a.origin),
    live: stage === 1 || stage === 2,
    history: events.map(e => ({ ts: fmtTs(e.ts), loc: e.location, event: e.description, stage: e.stage })),
  };
}
