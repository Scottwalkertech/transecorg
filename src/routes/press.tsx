import { createFileRoute } from "@tanstack/react-router";
import { Newspaper, ArrowUpRight } from "lucide-react";
import { PageShell, CTASection } from "@/components/page-shell";

export const Route = createFileRoute("/press")({
  head: () => ({
    meta: [
      { title: "Press & Newsroom — TranSec Logistics" },
      { name: "description", content: "Latest press releases, announcements, and media coverage from TranSec Logistics." },
      { property: "og:title", content: "Press & Newsroom — TranSec Logistics" },
      { property: "og:description", content: "Company announcements and media." },
    ],
  }),
  component: PressPage,
});

const RELEASES = [
  { date: "Jun 18, 2026", tag: "Network", title: "TranSec opens new automated fulfillment hub in Singapore", excerpt: "The 220,000 sq ft facility doubles APAC same-day delivery capacity and introduces robotic put-walls." },
  { date: "May 02, 2026", tag: "Product", title: "Real-time CO₂ reporting now available on every shipment", excerpt: "TranSec customers can now view per-leg emissions in their tracking dashboard and export verified reports." },
  { date: "Mar 14, 2026", tag: "Partnership", title: "TranSec partners with Mercury Pharma for cold-chain network expansion", excerpt: "A new dedicated CEIV Pharma corridor connects Frankfurt, Singapore, and Memphis." },
  { date: "Jan 21, 2026", tag: "Company", title: "TranSec Logistics crosses one million shipments in a single quarter", excerpt: "Volume growth of 38% YoY driven by new ground and air capacity across North America." },
  { date: "Nov 09, 2025", tag: "Security", title: "TranSec achieves ISO 27001 and TAPA FSR Level A certifications globally", excerpt: "All 42 owned facilities now operate under harmonized security and information-management standards." },
];

function PressPage() {
  return (
    <PageShell
      eyebrow="Press"
      title="Newsroom & company announcements"
      description="Press releases, milestones, and media coverage. For interview requests, contact press@transec.example."
      icon={Newspaper}
    >
      <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
        <div className="space-y-5">
          {RELEASES.map(r => (
            <article key={r.title} className="group rounded-2xl border border-border bg-card p-6 shadow-card transition-all hover:border-secondary/40 hover:shadow-elegant sm:p-8">
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="font-mono">{r.date}</span>
                <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                <span className="rounded-full bg-secondary/10 px-2.5 py-0.5 font-semibold uppercase tracking-wider text-secondary">{r.tag}</span>
              </div>
              <h2 className="mt-3 font-display text-xl font-bold text-foreground sm:text-2xl">{r.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground sm:text-base">{r.excerpt}</p>
              <button className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary group-hover:text-secondary">
                Read full release <ArrowUpRight className="h-4 w-4" />
              </button>
            </article>
          ))}
        </div>
        <aside className="space-y-5">
          <div className="rounded-2xl border border-border bg-primary p-6 text-primary-foreground shadow-elegant">
            <h3 className="font-display text-lg font-bold">Media inquiries</h3>
            <p className="mt-2 text-sm text-primary-foreground/80">For interviews, statements, or imagery, reach our press office directly.</p>
            <p className="mt-4 text-sm font-semibold text-secondary">press@transec.example</p>
            <p className="text-xs text-primary-foreground/70">Mon–Fri · 09:00–18:00 CET</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <h3 className="font-display text-lg font-bold text-foreground">Brand assets</h3>
            <p className="mt-2 text-sm text-muted-foreground">Logos, color guidelines, and executive headshots.</p>
            <button className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-secondary">
              Download press kit <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
        </aside>
      </div>

      <CTASection />
    </PageShell>
  );
}
