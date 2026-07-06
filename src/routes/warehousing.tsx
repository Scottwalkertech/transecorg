import { createFileRoute } from "@tanstack/react-router";
import { Warehouse, Boxes, Thermometer, ShieldCheck, BarChart3, Zap } from "lucide-react";
import { PageShell, FeatureCard, CTASection } from "@/components/page-shell";

export const Route = createFileRoute("/warehousing")({
  head: () => ({
    meta: [
      { title: "Warehousing & Fulfillment — TranSec Logistics" },
      { name: "description", content: "Climate-controlled storage, inventory management, and pick-pack-ship fulfillment across global hubs." },
      { property: "og:title", content: "Warehousing — TranSec Logistics" },
      { property: "og:description", content: "Secure, climate-controlled fulfillment centers." },
    ],
  }),
  component: WarehousingPage,
});

const stats = [
  { label: "Fulfillment centers", value: "42" },
  { label: "Total sq. ft.", value: "8.4M" },
  { label: "SKU accuracy", value: "99.98%" },
  { label: "Same-day ship", value: "97%" },
];

function WarehousingPage() {
  return (
    <PageShell
      eyebrow="Warehousing"
      title="Smart Storage & Warehousing"
      description="Highly automated inventory management, fulfillment, and distribution hubs."
      icon={Warehouse}
      image="https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=2400&q=80"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(s => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-6 text-center shadow-card">
            <p className="font-display text-3xl font-bold text-primary">{s.value}</p>
            <p className="mt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-16 font-display text-2xl font-bold text-foreground">What we offer</h2>
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <FeatureCard icon={Boxes} title="Inventory management">Real-time SKU-level visibility via WMS API with low-stock alerts and forecasting.</FeatureCard>
        <FeatureCard icon={Thermometer} title="Climate control">Ambient, chilled (2–8°C), frozen (-25°C), and humidity-controlled zones.</FeatureCard>
        <FeatureCard icon={ShieldCheck} title="Bonded & secure">CCTV, biometric access, on-site security, and FTZ/bonded warehouse status.</FeatureCard>
        <FeatureCard icon={Zap} title="Pick · Pack · Ship">Direct-to-consumer fulfillment with branded packaging and carrier rate shopping.</FeatureCard>
        <FeatureCard icon={BarChart3} title="Analytics dashboard">Throughput, dwell time, and order accuracy reporting in one place.</FeatureCard>
        <FeatureCard icon={Warehouse} title="Cross-dock & VAS">Kitting, labeling, returns processing, and quality inspection on demand.</FeatureCard>
      </div>

      <CTASection />
    </PageShell>
  );
}
