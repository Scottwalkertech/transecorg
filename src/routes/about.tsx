import { createFileRoute } from "@tanstack/react-router";
import { Building2, Target, Compass, ShieldCheck, Users, Leaf } from "lucide-react";
import { PageShell, FeatureCard, CTASection } from "@/components/page-shell";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — TranSec Logistics" },
      { name: "description", content: "TranSec Logistics: our history, mission, and commitment to secure global logistics." },
      { property: "og:title", content: "About TranSec Logistics" },
      { property: "og:description", content: "Engineering trust into every shipment since 2004." },
    ],
  }),
  component: AboutPage,
});

const milestones = [
  { year: "2004", text: "Founded in Rotterdam as a niche customs brokerage." },
  { year: "2009", text: "Expanded into ocean freight with first FCL trade lane." },
  { year: "2014", text: "Acquired air-cargo division, opened MEM and HKG hubs." },
  { year: "2019", text: "Launched real-time visibility platform and developer API." },
  { year: "2024", text: "Crossed 1M shipments per year across 80+ countries." },
];

function AboutPage() {
  return (
    <PageShell
      eyebrow="About"
      title="Engineering trust into every shipment"
      description="TranSec Logistics combines two decades of freight expertise with modern software to deliver a logistics experience that's secure, transparent, and accountable."
      icon={Building2}
    >
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-card">
          <Target className="h-7 w-7 text-secondary" />
          <h2 className="mt-4 font-display text-2xl font-bold text-foreground">Our Mission</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            To make global trade radically more reliable. We believe shippers deserve real-time visibility, predictable pricing, and the same security standards as financial institutions — applied to every box, pallet, and container they move.
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-8 shadow-card">
          <Compass className="h-7 w-7 text-secondary" />
          <h2 className="mt-4 font-display text-2xl font-bold text-foreground">Our Approach</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            We operate as a single integrated platform across ocean, air, ground, and warehousing — so your data, your team, and your shipments stay connected from origin to last-mile signature.
          </p>
        </div>
      </div>

      <h2 className="mt-16 font-display text-2xl font-bold text-foreground">Two decades of trusted delivery</h2>
      <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card shadow-card">
        <ul className="divide-y divide-border">
          {milestones.map(m => (
            <li key={m.year} className="flex items-start gap-6 p-5 sm:p-6">
              <span className="grid h-12 w-16 shrink-0 place-items-center rounded-md bg-primary font-display text-sm font-bold text-primary-foreground">
                {m.year}
              </span>
              <p className="text-sm text-foreground/85 sm:text-base">{m.text}</p>
            </li>
          ))}
        </ul>
      </div>

      <h2 className="mt-16 font-display text-2xl font-bold text-foreground">What we stand for</h2>
      <div className="mt-6 grid gap-5 sm:grid-cols-3">
        <FeatureCard icon={ShieldCheck} title="Security first">ISO 27001 systems, TAPA FSR audited facilities, end-to-end chain of custody.</FeatureCard>
        <FeatureCard icon={Users} title="People who answer">Named account teams, 24/7 ops desk, no chatbot mazes.</FeatureCard>
        <FeatureCard icon={Leaf} title="Lower-carbon routing">SBTi-aligned targets and per-shipment CO₂ reporting on every booking.</FeatureCard>
      </div>

      <CTASection />
    </PageShell>
  );
}
