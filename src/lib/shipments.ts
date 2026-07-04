export type ShipmentStage = 0 | 1 | 2 | 3;

export type HistoryEvent = {
  ts: string;
  loc: string;
  event: string;
  stage: ShipmentStage;
};

export type Shipment = {
  id: string;
  status: "Label Created" | "In Transit" | "Out for Delivery" | "Delivered";
  stage: ShipmentStage;
  progress: number; // 0-100
  eta: string;
  origin: { city: string; hub: string };
  destination: { city: string; hub: string };
  weight: string;
  packages: number;
  service: string;
  serviceNote: string;
  insured: string;
  transit: string;
  coords: string;
  currentLocation: string;
  history: HistoryEvent[];
  live: boolean; // whether progress should animate
};

const SHIPMENTS: Record<string, Shipment> = {
  "TRAX123": {
    id: "TRAX123",
    status: "Out for Delivery",
    stage: 2,
    progress: 82,
    eta: "Today, 5:45 PM",
    origin: { city: "Rotterdam, Netherlands", hub: "Hub TSR-01" },
    destination: { city: "New York, United States", hub: "Brooklyn Depot" },
    weight: "24.6 kg",
    packages: 3,
    service: "Air Express",
    serviceNote: "Priority handling",
    insured: "$ 12,400 USD",
    transit: "48 hours",
    coords: "40.6892° N, 74.0445° W",
    currentLocation: "Brooklyn, NY",
    live: true,
    history: [
      { ts: "2026-06-28 09:12", loc: "Rotterdam Hub, NL", event: "Shipment label created", stage: 0 },
      { ts: "2026-06-28 14:48", loc: "Rotterdam Hub, NL", event: "Picked up by carrier", stage: 0 },
      { ts: "2026-06-28 22:05", loc: "Schiphol AMS, NL", event: "Departed origin facility", stage: 1 },
      { ts: "2026-06-29 02:31", loc: "In flight — AMS → JFK", event: "On board flight TS-441", stage: 1 },
      { ts: "2026-06-29 11:18", loc: "JFK Cargo, US", event: "Arrived at destination airport", stage: 1 },
      { ts: "2026-06-29 16:22", loc: "JFK Customs, US", event: "Released by customs", stage: 1 },
      { ts: "2026-07-01 06:40", loc: "Brooklyn Depot, US", event: "Out for delivery", stage: 2 },
    ],
  },
  "TRAX456": {
    id: "TRAX456",
    status: "In Transit",
    stage: 1,
    progress: 45,
    eta: "Fri, Jul 3 — 12:00 PM",
    origin: { city: "Shanghai, China", hub: "Hub TSS-08" },
    destination: { city: "Los Angeles, United States", hub: "LA Long Beach Port" },
    weight: "1,240 kg",
    packages: 12,
    service: "Ocean Freight (FCL)",
    serviceNote: "20ft container",
    insured: "$ 84,000 USD",
    transit: "18 days",
    coords: "34.0522° N, 140.7128° W",
    currentLocation: "Pacific Ocean",
    live: true,
    history: [
      { ts: "2026-06-20 08:00", loc: "Shanghai Warehouse, CN", event: "Shipment label created", stage: 0 },
      { ts: "2026-06-20 15:30", loc: "Shanghai Warehouse, CN", event: "Picked up and consolidated", stage: 0 },
      { ts: "2026-06-21 09:45", loc: "Port of Shanghai, CN", event: "Container loaded onto vessel MV TranSec Pacific", stage: 1 },
      { ts: "2026-06-22 04:12", loc: "East China Sea", event: "Vessel departed origin port", stage: 1 },
      { ts: "2026-06-27 18:22", loc: "Mid-Pacific", event: "In transit — on schedule", stage: 1 },
    ],
  },
  "TRAX789": {
    id: "TRAX789",
    status: "Delivered",
    stage: 3,
    progress: 100,
    eta: "Delivered Mon, Jun 29 — 2:14 PM",
    origin: { city: "Berlin, Germany", hub: "Hub TSB-03" },
    destination: { city: "Paris, France", hub: "Paris CDG Depot" },
    weight: "3.2 kg",
    packages: 1,
    service: "Ground Express",
    serviceNote: "Signature required",
    insured: "$ 1,800 USD",
    transit: "36 hours",
    coords: "48.8566° N, 2.3522° E",
    currentLocation: "Paris, FR — Delivered",
    live: false,
    history: [
      { ts: "2026-06-27 10:00", loc: "Berlin Hub, DE", event: "Shipment label created", stage: 0 },
      { ts: "2026-06-27 13:20", loc: "Berlin Hub, DE", event: "Picked up by carrier", stage: 0 },
      { ts: "2026-06-27 20:45", loc: "Berlin — Autobahn A2", event: "Departed origin facility", stage: 1 },
      { ts: "2026-06-28 06:10", loc: "Frankfurt Sort Center, DE", event: "Arrived at sort facility", stage: 1 },
      { ts: "2026-06-28 19:30", loc: "Paris CDG Depot, FR", event: "Arrived at destination depot", stage: 1 },
      { ts: "2026-06-29 08:12", loc: "Paris, FR", event: "Out for delivery", stage: 2 },
      { ts: "2026-06-29 14:14", loc: "Paris, FR — 11 Rue de Rivoli", event: "Delivered · Signed by M. Dubois", stage: 3 },
    ],
  },
};

export const DEMO_TRACKING_IDS = ["TRAX123", "TRAX456", "TRAX789"] as const;

export function getShipment(id: string): Shipment {
  const found = findShipment(id);
  if (found) return found;
  return { ...SHIPMENTS["TRAX456"], id: id.trim() || "TRAX456" };
}

/**
 * Strict lookup: returns the shipment if it exists in the built-in demo set
 * or in the admin-created store, otherwise returns null. Used by the public
 * tracking search to reject unregistered tracking numbers.
 */
export function findShipment(id: string): Shipment | null {
  const key = id.trim().toUpperCase();
  if (!key) return null;
  if (SHIPMENTS[key]) return SHIPMENTS[key];
  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem("transec.admin.shipments");
      if (raw) {
        const list = JSON.parse(raw) as Array<{ id: string }>;
        const match = list.find(s => s.id.toUpperCase() === key);
        if (match) {
          // Lazy import to avoid a circular dep at module load
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          const { toShipment } = require("./admin-shipments") as typeof import("./admin-shipments");
          return toShipment(match as import("./admin-shipments").AdminShipment);
        }
      }
    } catch { /* ignore */ }
  }
  return null;
}
