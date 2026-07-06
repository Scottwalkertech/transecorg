import { createFileRoute } from "@tanstack/react-router";
import { Truck, MapPin, Route as RouteIcon, Boxes, Clock, ShieldCheck } from "lucide-react";
import { PageShell, FeatureCard, CTASection } from "@/components/page-shell";

export const Route = createFileRoute("/ground-logistics")({
  head: () => ({
    meta: [
      { title: "Ground Logistics — TranSec Logistics" },
      { name: "description", content: "Domestic trucking, LTL, FTL, and final-mile delivery powered by a nationwide carrier network." },
      { property: "og:title", content: "Ground Logistics — TranSec Logistics" },
      { property: "og:description", content: "LTL, FTL, and final-mile delivery across North America and Europe." },
    ],
  }),
  component: GroundPage,
});

function GroundPage() {
  return (
    <PageShell
      eyebrow="Ground Logistics"
      title="Ground Freight Transport"
      description="Comprehensive continental trucking networks and final-mile delivery options."
      icon={Truck}
      image="https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=2400&q=80"
    >
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-7 shadow-card">
          <Boxes className="h-7 w-7 text-secondary" />
          <h3 className="mt-4 font-display text-xl font-bold text-foreground">LTL</h3>
          <p className="mt-2 text-sm text-muted-foreground">Less-than-truckload consolidation for shipments between 150–10,000 lbs. Daily lanes across 48 states.</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-7 shadow-card">
          <Truck className="h-7 w-7 text-secondary" />
          <h3 className="mt-4 font-display text-xl font-bold text-foreground">FTL</h3>
          <p className="mt-2 text-sm text-muted-foreground">Dedicated full truckload with team drivers available for time-sensitive long hauls.</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-7 shadow-card">
          <MapPin className="h-7 w-7 text-secondary" />
          <h3 className="mt-4 font-display text-xl font-bold text-foreground">Final Mile</h3>
          <p className="mt-2 text-sm text-muted-foreground">White-glove residential and B2B delivery with two-person crews, install, and debris removal.</p>
        </div>
      </div>

      <h2 className="mt-16 font-display text-2xl font-bold text-foreground">Network capabilities</h2>
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <FeatureCard icon={RouteIcon} title="12,000+ carriers">Pre-qualified, insured, and continuously scored on on-time performance.</FeatureCard>
        <FeatureCard icon={Clock} title="Same-day & next-day">Regional same-day networks in 38 metros with sub-2-hour pickup.</FeatureCard>
        <FeatureCard icon={ShieldCheck} title="TSA-certified">High-value and TSA-screened freight handled under dual-driver protocol.</FeatureCard>
        <FeatureCard icon={MapPin} title="Live GPS visibility">Trailer-level telematics surfaced in your tracking dashboard.</FeatureCard>
        <FeatureCard icon={Boxes} title="Cross-dock">Strategic cross-dock terminals at 42 locations for hub-and-spoke routing.</FeatureCard>
        <FeatureCard icon={Truck} title="Specialized equipment">Reefer, flatbed, lift-gate, and hazmat-endorsed fleet on demand.</FeatureCard>
      </div>

      <CTASection />
    </PageShell>
  );
}
