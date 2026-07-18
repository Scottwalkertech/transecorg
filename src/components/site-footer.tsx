import { Link } from "@tanstack/react-router";
import { Package, Mail, ArrowRight } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { useServices, SERVICE_ROUTE } from "@/lib/services";

const COMPANY = [
  { to: "/about", label: "About" },
  { to: "/network", label: "Network" },
  { to: "/careers", label: "Careers" },
  { to: "/press", label: "Press" },
  { to: "/portal", label: "Client Portal" },
] as const;

const emailSchema = z.string().trim().email("Enter a valid email address").max(255);

export function SiteFooter() {
  const [email, setEmail] = useState("");

  function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    const r = emailSchema.safeParse(email);
    if (!r.success) {
      toast.error("Invalid email", { description: r.error.issues[0]?.message });
      return;
    }
    toast.success("You're subscribed", {
      description: `We'll send logistics insights and product updates to ${r.data}.`,
    });
    setEmail("");
  }

  return (
    <footer className="border-t border-border bg-primary text-primary-foreground">
      {/* Newsletter banner */}
      <div className="border-b border-primary-foreground/10">
        <div className="mx-auto grid max-w-7xl items-center gap-6 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <h3 className="font-display text-2xl font-bold tracking-tight">
              Stay ahead of the freight market.
            </h3>
            <p className="mt-1.5 text-sm text-primary-foreground/70">
              Weekly briefings on capacity, rates, and TranSec product releases — straight to your inbox.
            </p>
          </div>
          <form
            onSubmit={handleSubscribe}
            className="flex flex-col gap-2 sm:flex-row sm:items-center"
          >
            <div className="flex flex-1 items-center gap-2 rounded-lg border border-primary-foreground/20 bg-primary-foreground/5 px-3 py-2.5 backdrop-blur">
              <Mail className="h-4 w-4 text-secondary" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@company.com"
                aria-label="Email address"
                className="min-w-0 flex-1 bg-transparent text-sm text-primary-foreground outline-none placeholder:text-primary-foreground/50"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-orange px-5 py-2.5 text-sm font-semibold text-secondary-foreground shadow-glow transition-transform hover:scale-[1.02]"
            >
              Subscribe <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>

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
