import { Link } from "@tanstack/react-router";
import { Package } from "lucide-react";

const SERVICES = [
  { to: "/ocean-freight", label: "Ocean Freight" },
  { to: "/air-cargo", label: "Air Cargo" },
  { to: "/ground-logistics", label: "Ground Logistics" },
  { to: "/warehousing", label: "Warehousing" },
] as const;

const COMPANY = [
  { to: "/about", label: "About" },
  { to: "/network", label: "Network" },
  { to: "/careers", label: "Careers" },
  { to: "/press", label: "Press" },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div>
          <Link to="/" className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-orange text-secondary-foreground">
              <Package className="h-5 w-5" />
            </span>
            <span className="font-display text-lg font-bold">TranSec Logistics</span>
          </Link>
          <p className="mt-4 text-sm text-primary-foreground/70">
            Secure global logistics, engineered for enterprise scale.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-secondary">Services</h4>
          <ul className="mt-4 space-y-2 text-sm text-primary-foreground/75">
            {SERVICES.map(s => (
              <li key={s.to}>
                <Link to={s.to} className="transition-colors hover:text-secondary">{s.label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-secondary">Company</h4>
          <ul className="mt-4 space-y-2 text-sm text-primary-foreground/75">
            {COMPANY.map(c => (
              <li key={c.to}>
                <Link to={c.to} className="transition-colors hover:text-secondary">{c.label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-secondary">Contact</h4>
          <ul className="mt-4 space-y-2 text-sm text-primary-foreground/75">
            <li>1-800-TRANSEC</li>
            <li>support@transec.example</li>
            <li>24/7 Operations</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-primary-foreground/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-primary-foreground/60 sm:flex-row sm:px-6 lg:px-8">
          <span>© {new Date().getFullYear()} TranSec Logistics. All rights reserved.</span>
          <span>Privacy · Terms · Compliance</span>
        </div>
      </div>
    </footer>
  );
}
