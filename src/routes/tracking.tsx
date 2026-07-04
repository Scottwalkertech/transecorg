import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import {
  Package,
  Truck,
  Plane,
  CheckCircle2,
  Clock,
  MapPin,
  Weight,
  ChevronDown,
  ChevronUp,
  Navigation,
  Search,
  ShieldCheck,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { findShipment } from "@/lib/shipments";
import { subscribeAdminShipments } from "@/lib/admin-shipments";

const searchSchema = z.object({
  id: z.string().optional().default(""),
});

export const Route = createFileRoute("/tracking")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Live Shipment Tracking — TranSec Logistics" },
      { name: "description", content: "Real-time GPS tracking, delivery progress, and full event history for your TranSec shipment." },
      { property: "og:title", content: "Live Shipment Tracking — TranSec" },
      { property: "og:description", content: "Real-time visibility for every TranSec shipment." },
    ],
  }),
  component: TrackingPage,
});

const STAGES = [
  { key: "label", label: "Label Created", icon: Package },
  { key: "transit", label: "In Transit", icon: Plane },
  { key: "out", label: "Out for Delivery", icon: Truck },
  { key: "delivered", label: "Delivered", icon: CheckCircle2 },
] as const;

function TrackingPage() {
  const { id } = Route.useSearch();
  const navigate = Route.useNavigate();

  // Subscribe to admin-shipment mutations so tracking re-resolves live
  const [tick, setTick] = useState(0);
  useEffect(() => subscribeAdminShipments(() => setTick(t => t + 1)), []);

  const shipment = useMemo(() => findShipment(id), [id, tick]);
  const [input, setInput] = useState(id);
  const [progress, setProgress] = useState(shipment?.progress ?? 0);
  const [historyOpen, setHistoryOpen] = useState(true);

  useEffect(() => {
    setInput(id);
    setProgress(shipment?.progress ?? 0);
  }, [id, shipment?.id, shipment?.progress]);

  useEffect(() => {
    if (!shipment?.live) return;
    const base = shipment.progress;
    const ceiling = Math.min(base + 10, 94);
    const t = setInterval(() => {
      setProgress((p: number) => {
        const next = p + Math.random() * 0.6;
        return next > ceiling ? base : next;
      });
    }, 1800);
    return () => clearInterval(t);
  }, [shipment?.live, shipment?.progress]);

  if (!shipment) {
    return <NotFoundView id={id} input={input} setInput={setInput} onSubmit={(v: string) => navigate({ search: { id: v } })} />;
  }

  const currentStage = shipment.stage;
  const isDelivered = shipment.stage === 3;

  return (
    <div className="bg-muted/30">
      {/* Sub-header */}
      <section className="border-b border-border bg-background">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:flex-wrap sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">Live tracking · {shipment.status}</p>
              <h1 className="mt-1 truncate font-display text-2xl font-bold text-foreground sm:text-3xl">
                Shipment {shipment.id}
              </h1>
            </div>
            <div className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
              <span className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 font-semibold ${isDelivered ? "bg-primary/10 text-primary" : "bg-success/15 text-success"}`}>
                <span className="relative flex h-2 w-2">
                  {!isDelivered && <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-success/60" />}
                  <span className={`relative inline-flex h-2 w-2 rounded-full ${isDelivered ? "bg-primary" : "bg-success"}`} />
                </span>
                {isDelivered ? "DELIVERED" : "LIVE"}
              </span>
              {!isDelivered && <RefreshCw className="h-4 w-4 animate-truck text-muted-foreground" />}
              <span>Updated just now</span>
            </div>
          </div>

          <form
            onSubmit={e => {
              e.preventDefault();
              navigate({ search: { id: input.trim() || shipment.id } });
            }}
            className="mt-5 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-xl border border-border bg-card p-2 shadow-card sm:flex"
          >
            <div className="flex min-w-0 flex-1 items-center gap-2 px-3">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Enter tracking number (try TRAX123, TRAX456, TRAX789)"
                className="min-w-0 flex-1 bg-transparent py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
            </div>
            <button className="shrink-0 rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-glow">
              Track
            </button>
          </form>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-3 lg:px-8">
        {/* MAIN */}
        <div className="space-y-6 lg:col-span-2">
          {/* Stepper */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card sm:p-8">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:justify-between">
              <div className="min-w-0">
                <h2 className="font-display text-lg font-bold text-foreground">Delivery progress</h2>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {isDelivered ? "Status: " : "Estimated arrival: "}
                  <span className="font-semibold text-foreground">{shipment.eta}</span>
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-secondary/15 px-3 py-1 text-xs font-bold text-secondary">{Math.round(progress)}%</span>
            </div>

            {/* Progress bar */}
            <div className="mt-6 h-2.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-gradient-orange transition-all duration-700 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Steps */}
            <div className="mt-8 grid grid-cols-4 gap-2 sm:gap-4">
              {STAGES.map((s, i) => {
                const done = i < currentStage || (i === currentStage && isDelivered);
                const active = i === currentStage && !isDelivered;
                const Icon = s.icon;
                return (
                  <div key={s.key} className="flex flex-col items-center text-center">
                    <div
                      className={`relative grid h-12 w-12 place-items-center rounded-full border-2 transition-all ${
                        done
                          ? "border-success bg-success text-success-foreground"
                          : active
                          ? "border-secondary bg-secondary text-secondary-foreground shadow-glow"
                          : "border-border bg-background text-muted-foreground"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      {active && (
                        <span className="absolute -inset-1 animate-pulse-ring rounded-full border-2 border-secondary/50" />
                      )}
                    </div>
                    <p className={`mt-2 text-[11px] font-semibold uppercase tracking-wider sm:text-xs ${
                      done || active ? "text-foreground" : "text-muted-foreground"
                    }`}>
                      {s.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Map */}
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <div>
                <h2 className="font-display text-lg font-bold text-foreground">Live location</h2>
                <p className="text-xs text-muted-foreground">{shipment.currentLocation} · {shipment.coords}</p>
              </div>
              <span className="hidden sm:inline-flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                <Navigation className="h-3.5 w-3.5" /> GPS
              </span>
            </div>
            <MapVisual progress={progress} origin={shipment.origin.city.split(",")[0]} destination={shipment.destination.city.split(",")[0]} />
          </div>
        </div>

        {/* SIDEBAR */}
        <div className="space-y-6">
          {/* Facts */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <h2 className="font-display text-lg font-bold text-foreground">Shipment Facts</h2>
            <dl className="mt-5 space-y-4 text-sm">
              <Fact icon={MapPin} label="Origin" value={shipment.origin.city} sub={shipment.origin.hub} />
              <Fact icon={MapPin} label="Destination" value={shipment.destination.city} sub={shipment.destination.hub} />
              <Fact icon={Weight} label="Weight" value={shipment.weight} sub={`${shipment.packages} package${shipment.packages > 1 ? "s" : ""}`} />
              <Fact icon={Plane} label="Service Type" value={shipment.service} sub={shipment.serviceNote} />
              <Fact icon={ShieldCheck} label="Insured Value" value={shipment.insured} sub="Full coverage" />
              <Fact icon={Clock} label="Transit Time" value={shipment.transit} sub="Door-to-door" />
            </dl>
          </div>

          {/* Quote CTA */}
          <div className="rounded-2xl bg-gradient-hero p-6 text-primary-foreground shadow-elegant">
            <h3 className="font-display text-lg font-bold">Need another shipment?</h3>
            <p className="mt-1 text-sm text-primary-foreground/75">Get an instant quote across air, ocean and ground.</p>
            <Link
              to="/"
              hash="quote"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-gradient-orange px-4 py-2 text-sm font-semibold text-secondary-foreground shadow-glow"
            >
              Get a Quote
            </Link>
          </div>
        </div>

        {/* History — full width */}
        <div className="lg:col-span-3">
          <div className="rounded-2xl border border-border bg-card shadow-card">
            <button
              onClick={() => setHistoryOpen(v => !v)}
              className="flex w-full items-center justify-between px-6 py-5 text-left"
            >
              <div>
                <h2 className="font-display text-lg font-bold text-foreground">Tracking history</h2>
                <p className="text-xs text-muted-foreground">{shipment.history.length} events recorded</p>
              </div>
              {historyOpen ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
            </button>
            {historyOpen && (
              <div className="border-t border-border px-6 py-6">
                <ol className="relative space-y-6 before:absolute before:left-[7px] before:top-1 before:h-[calc(100%-0.5rem)] before:w-px before:bg-border">
                  {[...shipment.history].reverse().map((h, i) => (
                    <li key={i} className="relative grid grid-cols-[auto_minmax(0,1fr)] items-start gap-4">
                      <span className={`relative z-10 mt-1.5 h-3.5 w-3.5 shrink-0 rounded-full border-2 ${i === 0 ? "border-secondary bg-secondary shadow-glow" : "border-primary bg-background"}`} />
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                          <p className="font-semibold text-foreground">{h.event}</p>
                          <span className="text-xs font-medium text-muted-foreground">{h.ts}</span>
                        </div>
                        <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5 shrink-0 text-secondary" />
                          {h.loc}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Fact({ icon: Icon, label, value, sub }: { icon: React.ElementType; label: string; value: string; sub?: string }) {
  return (
    <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-3">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/8 text-primary">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</dt>
        <dd className="mt-0.5 truncate font-semibold text-foreground">{value}</dd>
        {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
      </div>
    </div>
  );
}

function MapVisual({ progress, origin, destination }: { progress: number; origin: string; destination: string }) {
  const x = 8 + (progress / 100) * 84;
  return (
    <div className="relative h-72 w-full overflow-hidden bg-gradient-to-br from-primary/95 via-primary to-primary-glow sm:h-96">
      <div className="absolute inset-0 grid-bg opacity-40" aria-hidden />
      <svg viewBox="0 0 800 400" className="absolute inset-0 h-full w-full opacity-25" aria-hidden>
        <path d="M40,220 Q120,160 200,200 T360,180 Q420,150 480,210 Q540,260 620,220 T780,240" stroke="white" strokeWidth="1.2" fill="none" />
        <path d="M60,120 Q180,80 280,140 T520,120 Q620,90 760,140" stroke="white" strokeWidth="0.8" fill="none" />
        <path d="M30,320 Q200,300 380,330 T780,320" stroke="white" strokeWidth="0.8" fill="none" />
        <path d="M80,150 q40,-30 90,-10 q40,15 30,55 q-10,40 -60,40 q-70,0 -60,-85z" fill="white" opacity="0.35" />
        <path d="M500,90 q60,-25 130,5 q50,30 30,75 q-25,55 -100,45 q-90,-15 -60,-125z" fill="white" opacity="0.35" />
        <path d="M280,250 q70,-20 130,15 q50,40 10,80 q-50,40 -120,15 q-80,-30 -20,-110z" fill="white" opacity="0.3" />
      </svg>

      <svg viewBox="0 0 100 50" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        <defs>
          <linearGradient id="route" x1="0" x2="1">
            <stop offset="0%" stopColor="oklch(0.72 0.19 47)" />
            <stop offset="100%" stopColor="oklch(0.72 0.19 47 / 0.3)" />
          </linearGradient>
        </defs>
        <path d="M8,32 Q35,8 50,25 T92,18" stroke="rgba(255,255,255,0.25)" strokeWidth="0.5" fill="none" strokeDasharray="1.5 1.5" />
        <path d="M8,32 Q35,8 50,25 T92,18" stroke="url(#route)" strokeWidth="0.7" fill="none"
          strokeDasharray="100"
          strokeDashoffset={100 - progress} />
      </svg>

      <Pin top="64%" left="8%" label={origin} tone="muted" />
      <Pin top="36%" left="92%" label={destination} tone="muted" />

      <div
        className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-700 ease-out"
        style={{
          left: `${x}%`,
          top: `${32 + Math.sin((progress / 100) * Math.PI) * -18}%`,
        }}
      >
        <span className="absolute inset-0 -m-2 animate-pulse-ring rounded-full bg-secondary/70" />
        <span className="relative grid h-10 w-10 place-items-center rounded-full bg-gradient-orange text-secondary-foreground shadow-glow ring-4 ring-background/20 animate-truck">
          <Plane className="h-5 w-5 -rotate-12" />
        </span>
      </div>
    </div>
  );
}

function Pin({ top, left, label, tone }: { top: string; left: string; label: string; tone: "muted" | "active" }) {
  return (
    <div className="absolute -translate-x-1/2 -translate-y-full" style={{ top, left }}>
      <div className="flex flex-col items-center">
        <span className={`rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${tone === "active" ? "bg-secondary text-secondary-foreground" : "bg-background/90 text-foreground"}`}>
          {label}
        </span>
        <span className="mt-1 h-3 w-3 rounded-full border-2 border-background bg-secondary shadow" />
      </div>
    </div>
  );
}

function NotFoundView({
  id,
  input,
  setInput,
  onSubmit,
}: {
  id: string;
  input: string;
  setInput: (v: string) => void;
  onSubmit: (v: string) => void;
}) {
  return (
    <div className="bg-muted/30">
      <section className="border-b border-border bg-background">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-destructive">Tracking · Not Found</p>
          <h1 className="mt-1 font-display text-2xl font-bold text-foreground sm:text-3xl">
            {id ? <>Shipment <span className="text-destructive">{id}</span></> : "Enter a tracking number"}
          </h1>
          <form
            onSubmit={e => { e.preventDefault(); onSubmit(input.trim()); }}
            className="mt-5 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-xl border border-border bg-card p-2 shadow-card sm:flex"
          >
            <div className="flex min-w-0 flex-1 items-center gap-2 px-3">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Enter tracking number"
                className="min-w-0 flex-1 bg-transparent py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
            </div>
            <button className="shrink-0 rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-glow">
              Track
            </button>
          </form>
        </div>
      </section>

      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-destructive/25 bg-card p-10 text-center shadow-card">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle className="h-7 w-7" />
          </div>
          <h2 className="mt-5 font-display text-xl font-bold text-foreground">
            Tracking ID not recognized.
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Please verify your number or contact support.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-2 sm:flex-row">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted"
            >
              Back to home
            </Link>
            <a
              href="mailto:support@transec.example"
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-orange px-4 py-2 text-sm font-semibold text-secondary-foreground shadow-glow"
            >
              Contact support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
