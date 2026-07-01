import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
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
  Quote,
  Star,
} from "lucide-react";
import heroCourier from "@/assets/hero-courier.jpg";
import teamSupport from "@/assets/team-support.jpg";
import teamWarehouse from "@/assets/team-warehouse.jpg";
import teamDriver from "@/assets/team-driver.jpg";
import testimonial1 from "@/assets/testimonial-1.jpg";
import testimonial2 from "@/assets/testimonial-2.jpg";
import testimonial3 from "@/assets/testimonial-3.jpg";


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

const quoteSchema = z.object({
  from: z.string().trim().min(2, "Enter an origin city").max(80),
  to: z.string().trim().min(2, "Enter a destination city").max(80),
  weight: z.coerce.number().positive("Weight must be greater than 0").max(100000, "Weight too large"),
  email: z.string().trim().email("Enter a valid email").max(255),
});

function HomePage() {
  const navigate = useNavigate();
  const [tracking, setTracking] = useState("");
  const [quote, setQuote] = useState({ from: "", to: "", weight: "", email: "" });

  function handleTrack(e: React.FormEvent) {
    e.preventDefault();
    const id = tracking.trim() || "TRAX123";
    toast.success("Locating your shipment…", { description: `Opening live tracking for ${id.toUpperCase()}` });
    navigate({ to: "/tracking", search: { id } });
  }

  function handleQuote(e: React.FormEvent) {
    e.preventDefault();
    const result = quoteSchema.safeParse(quote);
    if (!result.success) {
      toast.error("Please check your quote details", {
        description: result.error.issues[0]?.message ?? "Some fields are invalid.",
      });
      return;
    }
    toast.success("Quote request received", {
      description: `We'll email ${result.data.email} within 60 seconds with options for ${result.data.from} → ${result.data.to}.`,
    });
    setQuote({ from: "", to: "", weight: "", email: "" });
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
                    placeholder="Enter tracking number (try TRAX123, TRAX456, TRAX789)"
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

            {/* Visual: courier photo with floating tracking card */}
            <div className="lg:col-span-5">
              <div className="relative">
                <div className="relative overflow-hidden rounded-3xl border border-primary-foreground/15 shadow-elegant">
                  <img
                    src={heroCourier}
                    alt="Smiling TranSec logistics professional holding a tablet in a warehouse"
                    width={1024}
                    height={1280}
                    className="h-[520px] w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-primary/10 to-transparent" />
                  <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-background/90 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-primary shadow-card">
                    <span className="h-1.5 w-1.5 rounded-full bg-success" /> Live agent · Amir
                  </div>
                </div>
                <div className="absolute -bottom-6 -left-4 w-[88%] rounded-2xl border border-border bg-background/95 p-5 shadow-elegant backdrop-blur sm:-left-6 sm:w-[86%]">
                  <div className="flex items-center justify-between text-xs">
                    <span className="rounded-full bg-success/15 px-2.5 py-1 font-semibold uppercase tracking-wider text-success">Live</span>
                    <span className="text-muted-foreground">TRAX123</span>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Origin</p>
                      <p className="mt-1 font-semibold text-foreground">Rotterdam, NL</p>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Destination</p>
                      <p className="mt-1 font-semibold text-foreground">New York, US</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex justify-between text-[11px] uppercase tracking-wider text-muted-foreground">
                      <span>In transit</span><span>72%</span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                      <div className="h-full w-[72%] rounded-full bg-gradient-orange" />
                    </div>
                  </div>
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

      {/* WHY CHOOSE US / TEAM */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-5">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary">Why TranSec</span>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              People you can trust with every package.
            </h2>
            <p className="mt-4 text-muted-foreground">
              Behind every shipment is a real person — from our 24/7 support desk to warehouse teams and last-mile drivers. We hire for care as much as capability.
            </p>
            <ul className="mt-6 space-y-3 text-sm">
              {[
                "Dedicated account manager on every enterprise lane",
                "Multilingual support in 14 languages, 24/7",
                "Background-checked drivers and vetted facility staff",
              ].map(p => (
                <li key={p} className="flex items-start gap-2 text-foreground/85">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-secondary" /> {p}
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-7">
            <div className="grid grid-cols-2 gap-4 sm:gap-5">
              {[
                { src: teamSupport, name: "Priya", role: "Customer Success", tall: true },
                { src: teamWarehouse, name: "Marcus", role: "Warehouse Lead" },
                { src: teamDriver, name: "Jonas", role: "Fleet Driver" },
              ].map((m, i) => (
                <div
                  key={m.name}
                  className={`group relative overflow-hidden rounded-2xl border border-border shadow-card ${
                    i === 0 ? "row-span-2" : ""
                  }`}
                >
                  <img
                    src={m.src}
                    alt={`${m.name}, ${m.role} at TranSec Logistics`}
                    loading="lazy"
                    width={800}
                    height={1000}
                    className={`w-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                      m.tall ? "h-full min-h-[420px]" : "h-56 sm:h-64"
                    }`}
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-primary/90 via-primary/40 to-transparent p-4">
                    <p className="font-display text-base font-semibold text-primary-foreground">{m.name}</p>
                    <p className="text-xs uppercase tracking-wider text-secondary">{m.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
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

                </Link>

              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="border-t border-border bg-muted/40">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary">Customer Stories</span>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Loved by shippers worldwide
            </h2>
            <p className="mt-3 text-muted-foreground">
              From boutique brands to Fortune 500 supply chains — hear why teams choose TranSec.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                photo: testimonial1,
                name: "Elena Marchetti",
                title: "COO, Nordic Apparel Co.",
                quote:
                  "TranSec cut our EU-to-US transit time by 30% and their support desk actually picks up. Game changer for our launches.",
              },
              {
                photo: testimonial2,
                name: "David Chen",
                title: "Founder, Vessel Coffee",
                quote:
                  "The real-time tracking is unmatched. Our wholesale customers know exactly when to expect their pallets — every single time.",
              },
              {
                photo: testimonial3,
                name: "Amara Okafor",
                title: "VP Ops, Lumen Health",
                quote:
                  "Cold-chain integrity, customs paperwork, temperature logs — TranSec handles the details so our team can focus on patients.",
              },
            ].map(t => (
              <figure
                key={t.name}
                className="relative flex flex-col rounded-2xl border border-border bg-card p-7 shadow-card transition-all hover:-translate-y-1 hover:shadow-elegant"
              >
                <Quote className="h-8 w-8 text-secondary/60" />
                <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-foreground/85">
                  "{t.quote}"
                </blockquote>
                <div className="mt-5 flex items-center gap-1 text-secondary" aria-label="5 out of 5 stars">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <figcaption className="mt-5 flex items-center gap-3 border-t border-border pt-5">
                  <img
                    src={t.photo}
                    alt={t.name}
                    loading="lazy"
                    width={512}
                    height={512}
                    className="h-12 w-12 rounded-full object-cover ring-2 ring-secondary/30"
                  />
                  <div>
                    <p className="font-display text-sm font-semibold text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.title}</p>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
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
                <Link
                  to="/tracking"
                  search={{ id: "TRAX123" }}
                  className="inline-flex items-center gap-2 rounded-lg border border-primary-foreground/25 bg-primary-foreground/5 px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary-foreground/10"
                >
                  Track a shipment <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
            <form
              onSubmit={handleQuote}
              className="rounded-2xl border border-primary-foreground/15 bg-primary-foreground/5 p-6 backdrop-blur-sm"
            >
              <div className="grid grid-cols-2 gap-4">
                <QuoteField label="From" placeholder="City, Country" value={quote.from} onChange={v => setQuote(q => ({ ...q, from: v }))} />
                <QuoteField label="To" placeholder="City, Country" value={quote.to} onChange={v => setQuote(q => ({ ...q, to: v }))} />
                <QuoteField label="Weight (kg)" placeholder="0" type="number" value={quote.weight} onChange={v => setQuote(q => ({ ...q, weight: v }))} />
                <QuoteField label="Email" placeholder="you@company.com" type="email" value={quote.email} onChange={v => setQuote(q => ({ ...q, email: v }))} />
              </div>
              <button
                type="submit"
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-orange py-3 text-sm font-semibold text-secondary-foreground shadow-glow transition-transform hover:scale-[1.01]"
              >
                Get a Quote <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}

function QuoteField({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="block rounded-lg border border-primary-foreground/15 bg-background/95 px-3 py-2">
      <span className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-0.5 w-full bg-transparent text-sm font-medium text-foreground outline-none placeholder:text-muted-foreground/70"
      />
    </label>
  );
}

