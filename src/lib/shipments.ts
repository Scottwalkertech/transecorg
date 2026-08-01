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

