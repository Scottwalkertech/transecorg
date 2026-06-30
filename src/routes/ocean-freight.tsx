import { createFileRoute, Link } from "@tanstack/react-router";
import { Ship, Container, Anchor, Globe2, ShieldCheck, Clock } from "lucide-react";
import { PageShell, FeatureCard, CTASection } from "@/components/page-shell";

export const Route = createFileRoute("/ocean-freight")({
  head: () => ({
    meta: [
      { title: "Ocean Freight — TranSec Logistics" },
      { name: "description", content: "International sea shipping with FCL & LCL container options, global port logistics, and customs clearance." },
      { property: "og:title", content: "Ocean Freight — TranSec Logistics" },
      { property: "og:description", content: "FCL, LCL, and port-to-port ocean freight solutions." },
    ],
  }),
  component: OceanFreightPage,
});

function OceanFreightPage() {
  return (
    <PageShell
      eyebrow="Ocean Freight"
      title="Reliable international sea shipping at enterprise scale"
      description="From single pallets to full container loads, TranSec moves cargo across every major trade lane with transparent rates and real-time visibility."
      icon={Ship}
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-card">
          <span className="inline-flex items-center rounded-full bg-secondary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-secondary">
            FCL · Full Container Load
          </span>
          <h2 className="mt-4 font-display text-2xl font-bold text-foreground">Dedicated container, sealed at origin</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Ideal for shipments over 15 CBM. Choose 20', 40', 40'HC, or specialized reefer and open-top equipment. Direct port-to-port routing with priority loading.
          </p>
          <ul className="mt-5 space-y-2 text-sm text-foreground/85">
            <li className="flex gap-2"><span className="text-secondary">✓</span> 20ft / 40ft / 40ft High Cube</li>
            <li className="flex gap-2"><span className="text-secondary">✓</span> Refrigerated (Reefer) containers</li>
            <li className="flex gap-2"><span className="text-secondary">✓</span> Flat rack & open-top for oversized cargo</li>
          </ul>
        </div>
        <div className="rounded-2xl border border-border bg-card p-8 shadow-card">
          <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
            LCL · Less than Container Load
          </span>
          <h2 className="mt-4 font-display text-2xl font-bold text-foreground">Share container space, pay only for what you ship</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Cost-effective consolidation for shipments between 1–15 CBM. Weekly sailings on every major trade lane with end-to-end tracking.
          </p>
          <ul className="mt-5 space-y-2 text-sm text-foreground/85">
            <li className="flex gap-2"><span className="text-secondary">✓</span> Weekly consolidation schedules</li>
            <li className="flex gap-2"><span className="text-secondary">✓</span> Door-to-door or port-to-port</li>
            <li className="flex gap-2"><span className="text-secondary">✓</span> Customs brokerage included</li>
          </ul>
        </div>
      </div>

      <h2 className="mt-16 font-display text-2xl font-bold text-foreground">Port logistics & coverage</h2>
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <FeatureCard icon={Anchor} title="180+ ports of call">Direct service to every major deep-sea port across Asia, Europe, the Americas, and MEA.</FeatureCard>
        <FeatureCard icon={Container} title="Customs brokerage">In-house licensed brokers handle filings, duties, and clearance in 60+ jurisdictions.</FeatureCard>
        <FeatureCard icon={Globe2} title="Trade lane optimization">AI-driven routing balances cost, transit time, and carbon footprint per shipment.</FeatureCard>
        <FeatureCard icon={ShieldCheck} title="Cargo insurance">All-risk coverage up to declared CIF value, backed by AA-rated underwriters.</FeatureCard>
        <FeatureCard icon={Clock} title="Real-time ETAs">Vessel tracking and port congestion alerts pushed to your dashboard.</FeatureCard>
        <FeatureCard icon={Ship} title="Dedicated account team">A named coordinator owns your bookings from quote to delivery.</FeatureCard>
      </div>

      <CTASection />
    </PageShell>
  );
}
