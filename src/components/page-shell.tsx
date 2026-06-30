import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { ChevronRight, type LucideIcon } from "lucide-react";

export function PageShell({
  eyebrow,
  title,
  description,
  icon: Icon,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  icon?: LucideIcon;
  children: ReactNode;
}) {
  return (
    <>
      <section className="relative overflow-hidden bg-gradient-hero text-primary-foreground">
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-secondary/20 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <nav className="mb-6 flex items-center gap-1.5 text-xs text-primary-foreground/70">
            <Link to="/" className="hover:text-secondary">Home</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-primary-foreground/90">{eyebrow}</span>
          </nav>
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <span className="inline-flex items-center rounded-full border border-secondary/40 bg-secondary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-secondary">
                {eyebrow}
              </span>
              <h1 className="mt-4 text-4xl font-bold leading-tight sm:text-5xl">{title}</h1>
              <p className="mt-4 text-base text-primary-foreground/80 sm:text-lg">{description}</p>
            </div>
            {Icon && (
              <div className="hidden md:block">
                <div className="relative grid h-32 w-32 place-items-center rounded-2xl bg-gradient-orange shadow-glow">
                  <Icon className="h-16 w-16 text-secondary-foreground" />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        {children}
      </section>
    </>
  );
}

export function FeatureCard({
  icon: Icon,
  title,
  children,
}: {
  icon: LucideIcon;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-elegant">
      <span className="grid h-11 w-11 place-items-center rounded-lg bg-primary/5 text-primary">
        <Icon className="h-5 w-5" />
      </span>
      <h3 className="mt-4 font-display text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{children}</p>
    </div>
  );
}

export function CTASection() {
  return (
    <div className="mt-16 overflow-hidden rounded-2xl bg-primary p-8 text-primary-foreground sm:p-12">
      <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <div>
          <h2 className="font-display text-2xl font-bold sm:text-3xl">Ready to ship with TranSec?</h2>
          <p className="mt-2 text-sm text-primary-foreground/80 sm:text-base">
            Get a tailored quote or track an existing shipment in seconds.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/"
            hash="quote"
            className="inline-flex items-center rounded-md bg-gradient-orange px-5 py-2.5 text-sm font-semibold text-secondary-foreground shadow-glow"
          >
            Get a Quote
          </Link>
          <Link
            to="/tracking"
            className="inline-flex items-center rounded-md border border-primary-foreground/30 bg-primary-foreground/5 px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-foreground/10"
          >
            Track Shipment
          </Link>
        </div>
      </div>
    </div>
  );
}
