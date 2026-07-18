import { Link } from "@tanstack/react-router";
import { Package, Menu, X, LayoutDashboard, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { getSession, useSessionSync, type MockSession } from "@/lib/mock-session";
import { useServices, SERVICE_ROUTE } from "@/lib/services";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const { services } = useServices();
  const [session, setSession] = useState<MockSession | null>(null);
  useEffect(() => {
    const sync = () => setSession(getSession());
    sync();
    return useSessionSync(sync);
  }, []);
  const nav = [
    { to: "/", label: "Home" },
    { to: "/tracking", label: "Track" },
    { to: "/", label: "Services", hash: "services" },
    { to: "/", label: "Quote", hash: "quote" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2.5 group">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground shadow-elegant transition-transform group-hover:scale-105">
            <Package className="h-5 w-5" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-display text-lg font-bold tracking-tight text-foreground">
              TranSec
            </span>
            <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Logistics
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <Link to="/" className="rounded-md px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-muted hover:text-foreground">
            Home
          </Link>
          <Link to="/tracking" className="rounded-md px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-muted hover:text-foreground">
            Track Shipment
          </Link>
          <div
            className="relative"
            onMouseEnter={() => setServicesOpen(true)}
            onMouseLeave={() => setServicesOpen(false)}
          >
            <button
              type="button"
              onClick={() => setServicesOpen(v => !v)}
              className="inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-muted hover:text-foreground"
            >
              Services <ChevronDown className="h-3.5 w-3.5" />
            </button>
            {servicesOpen && (
              <div className="absolute left-0 top-full z-50 w-64 rounded-lg border border-border bg-popover p-1.5 shadow-elegant">
                {(services ?? []).map(s => {
                  const to = SERVICE_ROUTE[s.slug];
                  const cls = "block rounded-md px-3 py-2 text-sm text-foreground/85 hover:bg-muted";
                  return to ? (
                    <Link key={s.id} to={to} className={cls} onClick={() => setServicesOpen(false)}>
                      {s.title}
                    </Link>
                  ) : (
                    <span key={s.id} className="block rounded-md px-3 py-2 text-sm text-muted-foreground">{s.title}</span>
                  );
                })}
                {services && services.length === 0 && (
                  <span className="block px-3 py-2 text-xs text-muted-foreground">No services published</span>
                )}
              </div>
            )}
          </div>
          <a href="/#quote" className="rounded-md px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-muted hover:text-foreground">
            Get a Quote
          </a>
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {session ? (
            <Link
              to="/portal/dashboard"
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-sm font-medium text-foreground/85 hover:bg-muted"
            >
              <LayoutDashboard className="h-4 w-4" /> Dashboard
            </Link>
          ) : (
            <Link
              to="/portal"
              className="rounded-md px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-muted hover:text-foreground"
            >
              Sign In
            </Link>
          )}
          <a
            href="/#quote"
            className="inline-flex items-center rounded-md bg-gradient-orange px-4 py-2 text-sm font-semibold text-secondary-foreground shadow-glow transition-transform hover:scale-[1.02]"
          >
            Request Quote
          </a>
        </div>

        <button
          className="md:hidden grid h-9 w-9 place-items-center rounded-md border border-border"
          aria-label="Toggle menu"
          onClick={() => setOpen(v => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-background md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3 sm:px-6">
            {nav.map(n => (
              <a
                key={n.label}
                href={n.hash ? `/#${n.hash}` : n.to}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-foreground/85 hover:bg-muted"
              >
                {n.label}
              </a>
            ))}
            <div className="mt-1 border-t border-border pt-2">
              <span className="px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Services</span>
              {(services ?? []).map(s => {
                const to = SERVICE_ROUTE[s.slug];
                return to ? (
                  <Link
                    key={s.id}
                    to={to}
                    onClick={() => setOpen(false)}
                    className="block rounded-md px-3 py-2 text-sm text-foreground/85 hover:bg-muted"
                  >
                    {s.title}
                  </Link>
                ) : null;
              })}
            </div>
            <a
              href="/#quote"
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex items-center justify-center rounded-md bg-gradient-orange px-4 py-2 text-sm font-semibold text-secondary-foreground"
            >
              Request Quote
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
