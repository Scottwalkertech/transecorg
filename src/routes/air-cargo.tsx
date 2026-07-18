import { createFileRoute } from "@tanstack/react-router";
import { Plane, Zap, Clock, Globe2, ShieldCheck, Package } from "lucide-react";
import { PageShell, FeatureCard, CTASection } from "@/components/page-shell";
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
  { name: "Express", days: "24–48h", desc: "Next-flight-out priority handling for time-critical shipments.", color: "from-secondary to-orange-500", badge: "Fastest" },
  { name: "Expedited", days: "2–4 days", desc: "Premium scheduled air freight with guaranteed lift on each leg.", color: "from-primary-glow to-primary", badge: "Popular" },
  { name: "Standard", days: "5–8 days", desc: "Cost-effective consolidated air freight with reliable transit windows.", color: "from-muted-foreground/60 to-muted-foreground", badge: "Value" },
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
          <div key={t.name} className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
            <div className={`bg-gradient-to-br ${t.color} px-6 py-5 text-white`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider opacity-90">{t.badge}</span>
                <Plane className="h-5 w-5 opacity-90" />
              </div>
              <h3 className="mt-2 font-display text-2xl font-bold">{t.name}</h3>
              <p className="mt-1 text-3xl font-bold">{t.days}</p>
            </div>
            <div className="p-6">
              <p className="text-sm text-muted-foreground">{t.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <h2 className="mt-16 font-display text-2xl font-bold text-foreground">Built for time-sensitive cargo</h2>
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <FeatureCard icon={Zap} title="Next-flight-out">24/7 dispatch desk books the very next commercial or charter lift.</FeatureCard>
        <FeatureCard icon={Globe2} title="220+ airport pairs">Direct connections through every major hub: HKG, MEM, FRA, DXB, LAX.</FeatureCard>
        <FeatureCard icon={ShieldCheck} title="Pharma & cold chain">CEIV Pharma certified handling with active temperature control.</FeatureCard>
        <FeatureCard icon={Package} title="Dangerous goods">IATA DGR certified team for batteries, chemicals, and regulated cargo.</FeatureCard>
        <FeatureCard icon={Clock} title="Live milestone tracking">Booked, tendered, manifested, departed, arrived, delivered — pushed live.</FeatureCard>
        <FeatureCard icon={Plane} title="Charter solutions">Full or part-charter aircraft for outsized or AOG shipments.</FeatureCard>
      </div>

      <CTASection />
    </PageShell>
  );
}
