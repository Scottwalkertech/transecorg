import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Search,
  Ship,
  Plane,
  Truck,
  ShieldCheck,
  Clock,
  Globe2,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TranSec Logistics — Global Freight, Air & Ground" },
      { name: "description", content: "Track shipments in real time and get quotes for global freight, air cargo, and ground delivery with TranSec Logistics." },
      { property: "og:title", content: "TranSec Logistics" },
      { property: "og:description", content: "Secure global logistics with real-time tracking." },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const navigate = useNavigate();
  const [tracking, setTracking] = useState("");

  function handleTrack(e: React.FormEvent) {
    e.preventDefault();
    const id = tracking.trim() || "TS-1029384756";
    navigate({ to: "/tracking", search: { id } });
  }

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-hero text-primary-foreground">
        <div className="absolute inset-0 grid-bg opacity-50" aria-hidden />
        <div className="absolute -right-32 top-1/2 h-[520px] w-[520px] -translate-y-1/2 rounded-full bg-secondary/20 blur-3xl" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/5 px-3 py-1 text-xs font-medium uppercase tracking-wider text-secondary">
                <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
                Trusted by 12,000+ enterprises
              </span>
              <h1 className="mt-5 font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
                Move the world,<br />
                <span className="text-secondary">securely & on time.</span>
              </h1>
              <p className="mt-5 max-w-xl text-base text-primary-foreground/75 sm:text-lg">
                Global freight, air cargo and ground delivery — with real-time GPS tracking, customs clearance, and 24/7 operations support.
              </p>

              {/* Track form */}
              <form
                onSubmit={handleTrack}
                className="mt-8 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-xl border border-primary-foreground/15 bg-background/95 p-2 shadow-elegant sm:flex sm:flex-row"
              >
                <div className="flex min-w-0 flex-1 items-center gap-2 px-3">
                  <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <input
                    value={tracking}
                    onChange={e => setTracking(e.target.value)}
                    placeholder="Enter tracking number (e.g. TS-1029384756)"
                    className="min-w-0 flex-1 bg-transparent py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-gradient-orange px-5 py-2.5 text-sm font-semibold text-secondary-foreground shadow-glow transition-transform hover:scale-[1.02]"
                >
                  Track <ArrowRight className="h-4 w-4" />
                </button>
              </form>

              <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-primary-foreground/70">
                <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-secondary" /> ISO 27001 Secure</span>
                <span className="flex items-center gap-1.5"><Globe2 className="h-4 w-4 text-secondary" /> 220+ Countries</span>
                <span className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-secondary" /> 24/7 Live Support</span>
              </div>
            </div>

            {/* Visual card */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl border border-primary-foreground/15 bg-primary-foreground/5 p-6 backdrop-blur-sm shadow-elegant">
                <div className="flex items-center justify-between text-xs">
                  <span className="rounded-full bg-success/20 px-2.5 py-1 font-semibold uppercase tracking-wider text-success">Live</span>
                  <span className="text-primary-foreground/60">TS-1029384756</span>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-primary-foreground/60">Origin</p>
                    <p className="mt-1 font-semibold">Rotterdam, NL</p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-primary-foreground/60">Destination</p>
                    <p className="mt-1 font-semibold">New York, US</p>
                  </div>
                </div>
                <div className="mt-6">
                  <div className="flex justify-between text-[11px] uppercase tracking-wider text-primary-foreground/60">
                    <span>In transit</span><span>72%</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-primary-foreground/10">
                    <div className="h-full w-[72%] rounded-full bg-gradient-orange" />
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-3 gap-3 text-center text-xs">
                  {[
                    { label: "Picked Up", on: true },
                    { label: "In Transit", on: true },
                    { label: "Delivered", on: false },
                  ].map(s => (
                    <div key={s.label} className={`rounded-lg border p-3 ${s.on ? "border-secondary/40 bg-secondary/10 text-secondary" : "border-primary-foreground/15 text-primary-foreground/60"}`}>
                      <CheckCircle2 className={`mx-auto h-4 w-4 ${s.on ? "text-secondary" : "text-primary-foreground/40"}`} />
                      <p className="mt-1.5 font-medium">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="border-y border-border bg-muted/40">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-y-6 px-4 py-10 sm:px-6 lg:grid-cols-4 lg:px-8">
          {[
            ["220+", "Countries served"],
            ["12K+", "Enterprise clients"],
            ["48hr", "Avg. global transit"],
            ["99.8%", "On-time delivery"],
          ].map(([n, l]) => (
            <div key={l} className="text-center">
              <p className="font-display text-3xl font-bold text-primary sm:text-4xl">{n}</p>
              <p className="mt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">{l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary">Our Services</span>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Logistics built for every lane
          </h2>
          <p className="mt-3 text-muted-foreground">
            Engineered solutions across ocean, air, and ground — backed by enterprise-grade visibility.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            {
              icon: Ship,
              title: "Ocean Freight",
              to: "/ocean-freight" as const,
              desc: "FCL & LCL shipping with port-to-door coverage in 200+ ports worldwide.",
              points: ["Customs clearance", "Container tracking", "Bonded warehousing"],
            },
            {
              icon: Plane,
              title: "Air Cargo",
              to: "/air-cargo" as const,
              desc: "Express and standard air freight with priority handling and same-day options.",
              points: ["Next-flight-out", "Cold chain", "Hazmat certified"],
            },
            {
              icon: Truck,
              title: "Ground Delivery",
              to: "/ground-logistics" as const,
              desc: "Regional and last-mile delivery powered by our 9,400-vehicle fleet.",
              points: ["LTL & FTL trucking", "White-glove service", "Reverse logistics"],
            },
          ].map(s => (
            <div
              key={s.title}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-7 shadow-card transition-all hover:-translate-y-1 hover:shadow-elegant"
            >
              <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-secondary/0 transition-colors group-hover:bg-secondary/10" aria-hidden />
              <div className="relative">
                <div className="inline-grid h-12 w-12 place-items-center rounded-xl bg-primary text-primary-foreground shadow-elegant">
                  <s.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 font-display text-xl font-bold text-foreground">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
                <ul className="mt-5 space-y-2">
                  {s.points.map(p => (
                    <li key={p} className="flex items-center gap-2 text-sm text-foreground/85">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-secondary" />
                      {p}
                    </li>
                  ))}
                </ul>
                <Link to={s.to} className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-glow">
                  Learn more <ArrowRight className="h-3.5 w-3.5" />

                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* QUOTE CTA */}
      <section id="quote" className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-hero p-10 text-primary-foreground shadow-elegant sm:p-14">
          <div className="absolute inset-0 grid-bg opacity-40" aria-hidden />
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-secondary/25 blur-3xl" aria-hidden />
          <div className="relative grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                Get a tailored quote in <span className="text-secondary">under 60 seconds.</span>
              </h2>
              <p className="mt-3 max-w-lg text-primary-foreground/75">
                Tell us about your lane and volume — our team will respond with options across ocean, air and ground.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href="mailto:quote@transec.example"
                  className="inline-flex items-center gap-2 rounded-lg bg-gradient-orange px-6 py-3 text-sm font-semibold text-secondary-foreground shadow-glow transition-transform hover:scale-[1.02]"
                >
                  Get a Quote <ArrowRight className="h-4 w-4" />
                </a>
                <a
                  href="/tracking"
                  className="inline-flex items-center gap-2 rounded-lg border border-primary-foreground/25 bg-primary-foreground/5 px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary-foreground/10"
                >
                  Track a shipment
                </a>
              </div>
            </div>
            <div className="rounded-2xl border border-primary-foreground/15 bg-primary-foreground/5 p-6 backdrop-blur-sm">
              <div className="grid grid-cols-2 gap-4">
                <Field label="From" value="City, Country" />
                <Field label="To" value="City, Country" />
                <Field label="Weight (kg)" value="0" />
                <Field label="Service" value="Air Express" />
              </div>
              <button className="mt-5 w-full rounded-lg bg-gradient-orange py-3 text-sm font-semibold text-secondary-foreground shadow-glow">
                Calculate estimate
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-primary-foreground/15 bg-background/95 px-3 py-2.5">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}
