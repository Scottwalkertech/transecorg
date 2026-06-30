import { createFileRoute } from "@tanstack/react-router";
import { Globe2, MapPin } from "lucide-react";
import { PageShell, CTASection } from "@/components/page-shell";

export const Route = createFileRoute("/network")({
  head: () => ({
    meta: [
      { title: "Global Network — TranSec Logistics" },
      { name: "description", content: "Explore TranSec's global hub network, key shipping lanes, and operational coverage across 80+ countries." },
      { property: "og:title", content: "Global Network — TranSec Logistics" },
      { property: "og:description", content: "Hubs, lanes, and coverage across six continents." },
    ],
  }),
  component: NetworkPage,
});

const hubs = [
  { name: "Rotterdam", region: "EMEA HQ", x: 50, y: 30 },
  { name: "Hamburg", region: "EU North", x: 53, y: 28 },
  { name: "Dubai", region: "MEA Hub", x: 62, y: 45 },
  { name: "Singapore", region: "APAC Hub", x: 76, y: 58 },
  { name: "Hong Kong", region: "APAC North", x: 78, y: 48 },
  { name: "Memphis", region: "Americas Air", x: 24, y: 42 },
  { name: "Los Angeles", region: "US West", x: 15, y: 42 },
  { name: "New York", region: "US East", x: 27, y: 38 },
  { name: "São Paulo", region: "LATAM", x: 32, y: 70 },
  { name: "Johannesburg", region: "Africa South", x: 55, y: 72 },
];

const stats = [
  { value: "80+", label: "Countries served" },
  { value: "42", label: "Owned hubs" },
  { value: "1,800+", label: "Partner stations" },
  { value: "220", label: "Trade lanes" },
];

function NetworkPage() {
  return (
    <PageShell
      eyebrow="Network"
      title="One operational fabric, spanning six continents"
      description="Owned hubs in every major economic corridor, connected by dedicated trade lanes and a partner network of 1,800+ stations."
      icon={Globe2}
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(s => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-6 text-center shadow-card">
            <p className="font-display text-3xl font-bold text-primary">{s.value}</p>
            <p className="mt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 overflow-hidden rounded-2xl border border-border bg-gradient-hero p-6 shadow-elegant sm:p-10">
        <h2 className="font-display text-xl font-bold text-primary-foreground">Global hub map</h2>
        <p className="mt-1 text-sm text-primary-foreground/70">Owned operational hubs across the TranSec network.</p>
        <div className="relative mt-6 aspect-[2/1] w-full overflow-hidden rounded-xl bg-primary/40 grid-bg">
          <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
            {hubs.map((h, i) =>
              hubs.slice(i + 1).map((h2, j) => (
                <line
                  key={`${i}-${j}`}
                  x1={h.x} y1={h.y} x2={h2.x} y2={h2.y}
                  stroke="oklch(0.72 0.19 47)" strokeOpacity="0.12" strokeWidth="0.15"
                />
              ))
            )}
          </svg>
          {hubs.map(h => (
            <div
              key={h.name}
              className="group absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${h.x}%`, top: `${h.y}%` }}
            >
              <span className="absolute inset-0 -m-2 animate-pulse-ring rounded-full bg-secondary/40" />
              <span className="relative grid h-3 w-3 place-items-center rounded-full bg-secondary shadow-glow ring-2 ring-primary-foreground/30">
                <MapPin className="h-2 w-2 text-secondary-foreground opacity-0" />
              </span>
              <span className="absolute left-1/2 top-full mt-1 hidden -translate-x-1/2 whitespace-nowrap rounded bg-primary-foreground px-1.5 py-0.5 text-[10px] font-semibold text-primary group-hover:block">
                {h.name}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          {hubs.map(h => (
            <div key={h.name} className="flex items-center gap-2 rounded-md bg-primary-foreground/5 px-3 py-2 text-sm text-primary-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
              <span className="font-semibold">{h.name}</span>
              <span className="ml-auto text-xs text-primary-foreground/60">{h.region}</span>
            </div>
          ))}
        </div>
      </div>

      <CTASection />
    </PageShell>
  );
}
