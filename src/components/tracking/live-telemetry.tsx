import { memo, useEffect, useMemo, useRef, useState } from "react";
import { Gauge, Compass, Timer, Satellite, Radio } from "lucide-react";
import type { Shipment } from "@/lib/shipments";

/* ------------------------------------------------------------------ */
/* Live metric panel                                                   */
/* ------------------------------------------------------------------ */

function useTicker(intervalMs: number) {
  const [, force] = useState(0);
  useEffect(() => {
    const t = setInterval(() => force(n => n + 1), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return "00:00:00";
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

function bearing(a?: { lat: number; lon: number }, b?: { lat: number; lon: number }): number {
  if (!a || !b) return 74;
  const φ1 = (a.lat * Math.PI) / 180;
  const φ2 = (b.lat * Math.PI) / 180;
  const Δλ = ((b.lon - a.lon) * Math.PI) / 180;
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  return (Math.round((Math.atan2(y, x) * 180) / Math.PI) + 360) % 360;
}

const COMPASS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
const compassOf = (deg: number) => COMPASS[Math.round(deg / 45) % 8];

/** Speed simulator: 55-65 mph with small fluctuations, persisted across re-renders. */
function useSimulatedSpeed() {
  const speedRef = useRef(60 + (Math.random() * 4 - 2));
  const [speed, setSpeed] = useState(speedRef.current);
  useEffect(() => {
    const t = setInterval(() => {
      const next = Math.min(65, Math.max(55, speedRef.current + (Math.random() * 2.4 - 1.2)));
      speedRef.current = next;
      setSpeed(next);
    }, 3000);
    return () => clearInterval(t);
  }, []);
  return speed;
}

export const LiveTelemetryHUD = memo(function LiveTelemetryHUD({ shipment }: { shipment: Shipment }) {
  const speed = useSimulatedSpeed();
  useTicker(1000);

  const heading = useMemo(
    () => bearing(shipment.route?.origin, shipment.route?.dest),
    [shipment.route?.origin?.lat, shipment.route?.origin?.lon, shipment.route?.dest?.lat, shipment.route?.dest?.lon],
  );

  const etaMs = shipment.etaISO ? new Date(shipment.etaISO).getTime() : null;
  const remaining = etaMs ? etaMs - Date.now() : null;
  const miles = shipment.route?.miles ?? null;
  const covered = miles && remaining !== null ? Math.max(0, miles - (remaining / 3600_000) * speed) : null;
  const altitude = 320 + Math.round(Math.sin(Date.now() / 60000) * 40);

  return (
    <div className="overflow-hidden rounded-2xl border border-emerald-500/25 bg-slate-950 shadow-elegant">
      <div className="flex items-center justify-between border-b border-emerald-500/20 px-5 py-3">
        <p className="flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-400">
          <Radio className="h-3.5 w-3.5 animate-pulse" /> Live telemetry
        </p>
        <p className="font-mono text-[11px] text-emerald-400/60">
          {miles ? `${miles.toLocaleString()} mi route locked` : "route unregistered"}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-px bg-emerald-500/10 lg:grid-cols-4">
        <Metric icon={Gauge} label="Ground speed" value={speed.toFixed(1)} unit="mph" />
        <Metric icon={Compass} label="Heading" value={`${heading}°`} unit={compassOf(heading)} />
        <Metric icon={Satellite} label="Altitude" value={altitude.toLocaleString()} unit="ft AMSL" />
        <Metric
          icon={Timer}
          label="ETA countdown"
          value={remaining === null ? "--:--:--" : formatCountdown(remaining)}
          unit={remaining !== null && remaining <= 0 ? "arriving" : "hh:mm:ss"}
          accent
        />
      </div>

      {covered !== null && miles ? (
        <div className="px-5 py-4">
          <div className="flex justify-between font-mono text-[11px] text-emerald-400/70">
            <span>{covered.toFixed(1)} mi covered</span>
            <span>{Math.max(0, miles - covered).toFixed(1)} mi remaining</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-emerald-950">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-300 shadow-[0_0_12px_theme(colors.emerald.400)] transition-all duration-1000"
              style={{ width: `${Math.min(100, (covered / miles) * 100)}%` }}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
});

function Metric({
  icon: Icon,
  label,
  value,
  unit,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  unit: string;
  accent?: boolean;
}) {
  return (
    <div className="bg-slate-950 px-5 py-4">
      <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">
        <Icon className="h-3 w-3" /> {label}
      </p>
      <p
        className={`mt-1.5 font-mono text-2xl font-bold tabular-nums ${
          accent ? "text-orange-400 drop-shadow-[0_0_10px_rgba(251,146,60,0.35)]" : "text-emerald-300 drop-shadow-[0_0_10px_rgba(52,211,153,0.3)]"
        }`}
      >
        {value}
      </p>
      <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500">{unit}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Neon stepper                                                        */
/* ------------------------------------------------------------------ */

const NEON_STAGES = ["Ordered", "Sorting", "In Transit", "Out for Delivery", "Delivered"] as const;

/** Map the 0-3 shipment stage onto the 5-step neon stepper. */
function neonIndex(stage: number): number {
  return stage === 0 ? 1 : stage + 1;
}

export const NeonStepper = memo(function NeonStepper({ stage }: { stage: number }) {
  const current = neonIndex(stage);
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-elegant sm:p-8">
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-emerald-400">Milestone chain</p>
      <div className="mt-6 flex items-start">
        {NEON_STAGES.map((label, i) => {
          const done = i <= current;
          const active = i === current;
          return (
            <div key={label} className="flex min-w-0 flex-1 flex-col items-center">
              <div className="flex w-full items-center">
                <Segment filled={i <= current && i !== 0} hidden={i === 0} />
                <span
                  className={`relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full border text-[11px] font-bold ${
                    done
                      ? "border-emerald-400 bg-emerald-500/20 text-emerald-300 shadow-[0_0_16px_rgba(52,211,153,0.55)]"
                      : "border-slate-700 bg-slate-800 text-slate-500"
                  } ${active ? "animate-pulse" : ""}`}
                >
                  {i + 1}
                </span>
                <Segment filled={i < current} hidden={i === NEON_STAGES.length - 1} />
              </div>
              <p
                className={`mt-2 text-center text-[10px] font-semibold uppercase tracking-wider sm:text-[11px] ${
                  done ? "text-emerald-300" : "text-slate-500"
                }`}
              >
                {label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
});

function Segment({ filled, hidden }: { filled: boolean; hidden?: boolean }) {
  return (
    <span
      className={`h-1 flex-1 rounded-full ${hidden ? "opacity-0" : ""} ${
        filled
          ? "animate-pulse bg-gradient-to-r from-emerald-500 to-emerald-300 shadow-[0_0_10px_rgba(52,211,153,0.6)]"
          : "bg-gradient-to-r from-slate-700 to-slate-600"
      }`}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Satellite terminal log                                              */
/* ------------------------------------------------------------------ */

function utc(d: Date): string {
  return d.toISOString().slice(11, 19);
}

function seedLog(shipment: Shipment): string[] {
  const miles = shipment.route?.miles;
  const now = Date.now();
  const at = (minsAgo: number) => utc(new Date(now - minsAgo * 60000));
  const lines: string[] = [
    `[${at(720)} UTC] SESSION OPEN: secure channel established for ${shipment.id}`,
    `[${at(700)} UTC] ORIGIN LOCK: ${shipment.origin.city}`,
    miles
      ? `[${at(690)} UTC] ROUTE CALCULATION: ${miles.toLocaleString()} miles locked (${shipment.route?.osrm ? "OSRM road graph" : "great-circle estimate"})`
      : `[${at(690)} UTC] ROUTE CALCULATION: distance profile unavailable — using network schedule`,
    `[${at(660)} UTC] MANIFEST: 1 package sealed · tamper seal verified`,
    `[${at(540)} UTC] DEPARTURE: cleared origin facility, heading ${shipment.destination.city}`,
    `[${at(300)} UTC] TELEMETRY PING: active node ping acknowledged near ${shipment.currentLocation}`,
    `[${at(120)} UTC] CUSTOMS/CHECKPOINT: documentation cleared, no holds`,
    `[${at(20)} UTC] TELEMETRY PING: transit hub relay online · signal strength 97%`,
  ];
  return lines;
}

const PING_EVENTS = [
  "TELEMETRY PING: active node ping acknowledged near transit hub",
  "GEO FIX: satellite triangulation refreshed · accuracy ±11 m",
  "TEMP SENSOR: cargo bay nominal at 4.2°C",
  "LINK: uplink handover to relay cluster EU-WEST-3",
  "ROUTE INTEGRITY: no deviation detected on planned corridor",
  "VIBRATION: shock sensor within tolerance",
  "ETA RECALC: arrival window holding steady",
];

export const SatelliteTerminal = memo(function SatelliteTerminal({ shipment }: { shipment: Shipment }) {
  const [lines, setLines] = useState<string[]>(() => seedLog(shipment));
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setInterval(() => {
      const event = PING_EVENTS[Math.floor(Math.random() * PING_EVENTS.length)];
      setLines(prev => [...prev, `[${utc(new Date())} UTC] ${event}`].slice(-60));
    }, 4000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const el = boxRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines]);

  return (
    <div className="overflow-hidden rounded-2xl border border-emerald-500/25 bg-black shadow-elegant">
      <div className="flex items-center justify-between border-b border-emerald-500/20 px-5 py-3">
        <p className="flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-400">
          <Satellite className="h-3.5 w-3.5" /> Live satellite terminal
        </p>
        <span className="flex items-center gap-1.5 font-mono text-[10px] text-emerald-400/70">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" /> STREAMING
        </span>
      </div>
      <div ref={boxRef} className="max-h-72 overflow-y-auto px-5 py-4 font-mono text-[11px] leading-relaxed text-emerald-400 sm:text-xs">
        {lines.map((l, i) => (
          <p key={`${i}-${l}`} className="whitespace-pre-wrap break-words">
            {l}
          </p>
        ))}
        <p className="mt-1 animate-pulse text-emerald-300">_</p>
      </div>
    </div>
  );
});
