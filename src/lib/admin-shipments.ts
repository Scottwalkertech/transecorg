import type { Shipment, ShipmentStage } from "./shipments";

export type AdminStatus = "Pending" | "In Transit" | "Out for Delivery" | "Delivered";

export type AdminShipment = {
  id: string;
  origin: string;
  destination: string;
  sender: string;
  receiver: string;
  status: AdminStatus;
  eta: string; // ISO date (yyyy-mm-dd)
  createdAt: string;
};

const KEY = "transec.admin.shipments";
const EVT = "transec:admin-shipments";

function read(): AdminShipment[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as AdminShipment[]) : [];
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

export function createAdminShipment(input: Omit<AdminShipment, "id" | "createdAt">): AdminShipment {
  const list = read();
  let id = generateTrackingId(input.destination);
  while (list.some(s => s.id === id)) id = generateTrackingId(input.destination);
  const shipment: AdminShipment = { ...input, id, createdAt: new Date().toISOString() };
  write([shipment, ...list]);
  return shipment;
}

export function updateAdminShipmentStatus(id: string, status: AdminStatus) {
  const list = read();
  const next = list.map(s => (s.id === id ? { ...s, status } : s));
  write(next);
}

export function deleteAdminShipment(id: string) {
  write(read().filter(s => s.id !== id));
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

export function toShipment(a: AdminShipment): Shipment {
  const stage = STATUS_STAGE[a.status];
  const progress = STATUS_PROGRESS[a.status];
  const etaFmt = a.status === "Delivered"
    ? `Delivered ${new Date(a.eta).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}`
    : new Date(a.eta).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });

  const events = [
    { ts: a.createdAt.replace("T", " ").slice(0, 16), loc: a.origin, event: `Shipment label created for ${a.receiver}`, stage: 0 as ShipmentStage },
  ];
  if (stage >= 1) events.push({ ts: a.createdAt.replace("T", " ").slice(0, 16), loc: a.origin, event: "Departed origin facility", stage: 1 });
  if (stage >= 2) events.push({ ts: new Date().toISOString().replace("T", " ").slice(0, 16), loc: a.destination, event: "Out for delivery", stage: 2 });
  if (stage >= 3) events.push({ ts: new Date().toISOString().replace("T", " ").slice(0, 16), loc: a.destination, event: `Delivered · Signed by ${a.receiver}`, stage: 3 });

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
    currentLocation: stage >= 3 ? `${a.destination} — Delivered` : stage >= 2 ? a.destination : stage >= 1 ? "In transit" : a.origin,
    live: stage === 1 || stage === 2,
    history: events,
  };
}
