import { createFileRoute } from "@tanstack/react-router";
import { Truck, MapPin, Route as RouteIcon, Boxes, Clock, ShieldCheck } from "lucide-react";
import { PageShell, FeatureCard, FeatureBand, CTASection } from "@/components/page-shell";
import { useService } from "@/lib/services";

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
  const { service } = useService("ground-logistics");
  return (
    <PageShell
      eyebrow="Ground Logistics"
      title={service?.title ?? "Ground Freight Transport"}
      description={service?.description ?? "Comprehensive continental trucking networks and final-mile delivery options."}
      icon={Truck}
      image={service?.image_url && service.image_url.startsWith("http") && service.image_url !== "https://unsplash.com"
        ? service.image_url
        : "https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=2400&q=80"}
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

      <FeatureBand
        title="Network capabilities"
        subtitle="A vetted 12,000-carrier fleet with trailer-level telematics across 48 states."
        image="https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=2400&q=80"
      >
        <FeatureCard variant="glass" icon={RouteIcon} title="12,000+ carriers">Pre-qualified, insured, and continuously scored on on-time performance.</FeatureCard>
        <FeatureCard variant="glass" icon={Clock} title="Same-day & next-day">Regional same-day networks in 38 metros with sub-2-hour pickup.</FeatureCard>
        <FeatureCard variant="glass" icon={ShieldCheck} title="TSA-certified">High-value and TSA-screened freight handled under dual-driver protocol.</FeatureCard>
        <FeatureCard variant="glass" icon={MapPin} title="Live GPS visibility">Trailer-level telematics surfaced in your tracking dashboard.</FeatureCard>
        <FeatureCard variant="glass" icon={Boxes} title="Cross-dock">Strategic cross-dock terminals at 42 locations for hub-and-spoke routing.</FeatureCard>
        <FeatureCard variant="glass" icon={Truck} title="Specialized equipment">Reefer, flatbed, lift-gate, and hazmat-endorsed fleet on demand.</FeatureCard>
      </FeatureBand>

      <CTASection />
    </PageShell>
  );
}
