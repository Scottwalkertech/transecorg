import { createFileRoute } from "@tanstack/react-router";
import { Plane, Zap, Clock, Globe2, ShieldCheck, Package } from "lucide-react";
import { PageShell, FeatureCard, FeatureBand, CTASection } from "@/components/page-shell";
import { useService } from "@/lib/services";

export const Route = createFileRoute("/air-cargo")({
  head: () => ({
    meta: [
      { title: "Air Cargo — TranSec Logistics" },
      { name: "description", content: "Express and time-sensitive global air freight with standard and expedited transit options." },
      { property: "og:title", content: "Air Cargo — TranSec Logistics" },
      { property: "og:description", content: "Time-critical air shipping across 220+ airports." },
    ],
  }),
  component: AirCargoPage,
});

const tiers = [
  {
    name: "Express",
    days: "24–48h",
    desc: "Next-flight-out priority handling for time-critical shipments.",
    color: "from-secondary/85 via-orange-600/70 to-slate-950/85",
    badge: "Fastest",
    image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1600&q=80",
  },
  {
    name: "Expedited",
    days: "2–4 days",
    desc: "Premium scheduled air freight with guaranteed lift on each leg.",
    color: "from-primary/85 via-primary/70 to-slate-950/90",
    badge: "Popular",
    image: "https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&w=1600&q=80",
  },
  {
    name: "Standard",
    days: "5–8 days",
    desc: "Cost-effective consolidated air freight with reliable transit windows.",
    color: "from-slate-700/85 via-slate-800/75 to-slate-950/90",
    badge: "Value",
    image: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1600&q=80",
  },
];

function AirCargoPage() {
  const { service } = useService("air-cargo");
  return (
    <PageShell
      eyebrow="Air Cargo"
      title={service?.title ?? "Express Air Cargo"}
      description={service?.description ?? "Time-critical air freight logistics with global reach and fast clearance."}
      icon={Plane}
      image={service?.image_url && service.image_url.startsWith("http") && service.image_url !== "https://unsplash.com"
        ? service.image_url
        : "https://images.unsplash.com/photo-1583445095369-9c651e7e5d34?auto=format&fit=crop&w=2400&q=80"}
    >
      <h2 className="font-display text-2xl font-bold text-foreground">Transit options</h2>
      <p className="mt-2 text-sm text-muted-foreground">Choose the speed tier that matches your cost-vs-urgency profile.</p>
      <div className="mt-6 grid gap-5 md:grid-cols-3">
        {tiers.map(t => (
          <div key={t.name} className="overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-all hover:-translate-y-0.5 hover:shadow-elegant">
            <div className="relative isolate min-h-[180px] px-6 py-5 text-white">
              <img
                src={t.image}
                alt=""
                aria-hidden="true"
                loading="lazy"
                className="absolute inset-0 -z-10 h-full w-full object-cover"
              />
              <div className={`absolute inset-0 -z-10 bg-gradient-to-br ${t.color}`} />
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider opacity-90">{t.badge}</span>
                <Plane className="h-5 w-5 opacity-90" />
              </div>
              <h3 className="mt-6 font-display text-2xl font-bold drop-shadow">{t.name}</h3>
              <p className="mt-1 text-3xl font-bold drop-shadow">{t.days}</p>
            </div>
            <div className="p-6">
              <p className="text-sm text-muted-foreground">{t.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <FeatureBand
        title="Built for time-sensitive cargo"
        subtitle="Charter lift, pharma-grade cold chain, and live milestones on 220+ airport pairs."
        image="https://images.unsplash.com/photo-1583829962247-a0f60c1a2f5f?auto=format&fit=crop&w=2400&q=80"
      >
        <FeatureCard variant="glass" icon={Zap} title="Next-flight-out">24/7 dispatch desk books the very next commercial or charter lift.</FeatureCard>
        <FeatureCard variant="glass" icon={Globe2} title="220+ airport pairs">Direct connections through every major hub: HKG, MEM, FRA, DXB, LAX.</FeatureCard>
        <FeatureCard variant="glass" icon={ShieldCheck} title="Pharma & cold chain">CEIV Pharma certified handling with active temperature control.</FeatureCard>
        <FeatureCard variant="glass" icon={Package} title="Dangerous goods">IATA DGR certified team for batteries, chemicals, and regulated cargo.</FeatureCard>
        <FeatureCard variant="glass" icon={Clock} title="Live milestone tracking">Booked, tendered, manifested, departed, arrived, delivered — pushed live.</FeatureCard>
        <FeatureCard variant="glass" icon={Plane} title="Charter solutions">Full or part-charter aircraft for outsized or AOG shipments.</FeatureCard>
      </FeatureBand>

      <CTASection />
    </PageShell>
  );
}
