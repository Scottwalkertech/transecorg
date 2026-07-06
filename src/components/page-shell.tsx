import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { ChevronRight, type LucideIcon } from "lucide-react";

export function PageHeader({
  eyebrow,
  title,
  description,
  image,
}: {
  eyebrow: string;
  title: string;
  description: string;
  image: string;
}) {
  return (
    <section className="relative isolate overflow-hidden">
      <div className="relative h-[360px] w-full sm:h-[400px] lg:aspect-[3/1] lg:h-auto">
        <img
          src={image}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-slate-900/55 backdrop-brightness-90" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/30 to-transparent" />
        <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-end px-4 py-10 text-white sm:px-6 sm:py-14 lg:px-8 lg:py-16">
          <nav className="mb-4 flex items-center gap-1.5 text-xs text-white/75">
            <Link to="/" className="hover:text-secondary">Home</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-white/90">{eyebrow}</span>
          </nav>
          <span className="inline-flex w-fit items-center rounded-full border border-secondary/50 bg-secondary/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-secondary backdrop-blur">
            {eyebrow}
          </span>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-bold leading-tight drop-shadow-md sm:text-5xl">
            {title}
          </h1>
          <p className="mt-3 max-w-2xl text-base text-white/85 sm:text-lg">{description}</p>
        </div>
      </div>
    </section>
  );
}

export function PageShell({
  eyebrow,
  title,
  description,
  icon: Icon,
  image,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  icon?: LucideIcon;
  image?: string;
  children: ReactNode;
}) {
  return (
    <>
      {image ? (
        <PageHeader eyebrow={eyebrow} title={title} description={description} image={image} />
      ) : (
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
      )}
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
