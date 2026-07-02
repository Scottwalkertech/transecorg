import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Building2, Mail, User, LogOut, Package, Plus, ArrowRight,
  MapPin, Clock, CheckCircle2, Truck, Plane, Ship, ShieldCheck, TrendingUp,
} from "lucide-react";
import { getSession, clearSession, useSessionSync, type MockSession } from "@/lib/mock-session";
import { DEMO_TRACKING_IDS, getShipment, type Shipment } from "@/lib/shipments";

export const Route = createFileRoute("/portal/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — TranSec Client Portal" },
      { name: "description", content: "Manage your company profile, review recent shipments, and track deliveries from the TranSec client dashboard." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const navigate = useNavigate();
  const [session, setSession] = useState<MockSession | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => setSession(getSession());
    sync();
    setReady(true);
    return useSessionSync(sync);
  }, []);

  useEffect(() => {
    if (ready && !session) navigate({ to: "/portal" });
  }, [ready, session, navigate]);

  if (!session) return null;

  const shipments: Shipment[] = DEMO_TRACKING_IDS.map(id => getShipment(id));
  const inTransit = shipments.filter(s => s.stage === 1 || s.stage === 2).length;
  const delivered = shipments.filter(s => s.stage === 3).length;

  function handleSignOut() {
    clearSession();
    toast.success("Signed out", { description: "See you soon." });
    navigate({ to: "/portal" });
  }

  const initials = session.fullName
    .split(" ").map(p => p[0]).slice(0, 2).join("").toUpperCase();

  return (
    <section className="bg-muted/30 min-h-[calc(100vh-4rem)]">
      {/* Header band */}
      <div className="relative overflow-hidden bg-gradient-hero text-primary-foreground">
        <div className="absolute inset-0 grid-bg opacity-30" aria-hidden />
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-secondary/20 blur-3xl" aria-hidden />
        <div className="relative mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-secondary text-secondary-foreground text-xl font-bold shadow-glow">
              {initials || "TS"}
            </div>
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary-foreground/20 bg-primary-foreground/5 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-secondary">
                <ShieldCheck className="h-3 w-3" /> Verified Client
              </span>
              <h1 className="mt-2 font-display text-3xl font-bold sm:text-4xl">
                Welcome back, {session.fullName.split(" ")[0]}
              </h1>
              <p className="text-sm text-primary-foreground/70">
                {session.company} · Member since {new Date(session.createdAt).toLocaleDateString(undefined, { month: "short", year: "numeric" })}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/"
              hash="quote"
              className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-orange px-4 py-2.5 text-sm font-semibold text-secondary-foreground shadow-glow transition-transform hover:scale-[1.02]"
            >
              <Plus className="h-4 w-4" /> New Quote
            </Link>
            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 rounded-lg border border-primary-foreground/20 bg-primary-foreground/5 px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-foreground/10"
            >
              <LogOut className="h-4 w-4" /> Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: "Active Shipments", value: inTransit, icon: Truck, tint: "bg-primary/10 text-primary" },
            { label: "Delivered (30d)", value: delivered, icon: CheckCircle2, tint: "bg-emerald-500/10 text-emerald-600" },
            { label: "Spend This Quarter", value: "$ 128,400", icon: TrendingUp, tint: "bg-secondary/15 text-secondary" },
          ].map(s => (
            <div key={s.label} className="rounded-2xl border border-border bg-background p-5 shadow-card">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{s.label}</span>
                <span className={`grid h-9 w-9 place-items-center rounded-lg ${s.tint}`}>
                  <s.icon className="h-4 w-4" />
                </span>
              </div>
              <div className="mt-3 font-display text-3xl font-bold text-foreground">{s.value}</div>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {/* Company profile */}
          <div className="rounded-2xl border border-border bg-background p-6 shadow-card lg:col-span-1">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-foreground">Company Profile</h2>
              <button className="text-xs font-semibold text-primary hover:text-primary-glow">Edit</button>
            </div>
            <dl className="mt-5 space-y-4 text-sm">
              <ProfileRow icon={Building2} label="Company" value={session.company} />
              <ProfileRow icon={User} label="Primary Contact" value={session.fullName} />
              <ProfileRow icon={Mail} label="Email" value={session.email} />
              <ProfileRow icon={ShieldCheck} label="Account Tier" value="Business · Priority" />
              <ProfileRow icon={MapPin} label="Default Origin" value="Rotterdam Hub, NL" />
            </dl>
            <div className="mt-6 rounded-xl border border-dashed border-border p-4 text-xs text-muted-foreground">
              Need dedicated lanes or volume pricing? <a href="/#quote" className="font-semibold text-primary hover:text-primary-glow">Talk to sales →</a>
            </div>
          </div>

          {/* Recent shipments */}
          <div className="rounded-2xl border border-border bg-background shadow-card lg:col-span-2">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <div>
                <h2 className="font-display text-lg font-bold text-foreground">Recent Shipments</h2>
                <p className="text-xs text-muted-foreground">Live status across ocean, air, and ground lanes</p>
              </div>
              <Link to="/tracking" className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-glow">
                Open tracker <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <ul className="divide-y divide-border">
              {shipments.map(s => (
                <li key={s.id}>
                  <Link
                    to="/tracking"
                    search={{ id: s.id }}
                    className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-muted/50"
                  >
                    <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${serviceTint(s.service)}`}>
                      {serviceIcon(s.service)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-sm font-semibold text-foreground">{s.id}</span>
                        <StatusBadge status={s.status} />
                      </div>
                      <div className="mt-1 truncate text-xs text-muted-foreground">
                        {s.origin.city} → {s.destination.city} · {s.service}
                      </div>
                      <div className="mt-2 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-gradient-orange transition-all"
                          style={{ width: `${s.progress}%` }}
                        />
                      </div>
                    </div>
                    <div className="hidden text-right sm:block">
                      <div className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" /> ETA
                      </div>
                      <div className="text-sm font-semibold text-foreground">{s.eta}</div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProfileRow({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 grid h-8 w-8 place-items-center rounded-lg bg-muted text-primary">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</dt>
        <dd className="truncate text-sm font-medium text-foreground">{value}</dd>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: Shipment["status"] }) {
  const map: Record<Shipment["status"], string> = {
    "Label Created": "bg-muted text-foreground",
    "In Transit": "bg-primary/10 text-primary",
    "Out for Delivery": "bg-secondary/15 text-secondary",
    "Delivered": "bg-emerald-500/10 text-emerald-600",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${map[status]}`}>
      {status}
    </span>
  );
}

function serviceIcon(service: string) {
  if (service.toLowerCase().includes("air")) return <Plane className="h-5 w-5" />;
  if (service.toLowerCase().includes("ocean")) return <Ship className="h-5 w-5" />;
  if (service.toLowerCase().includes("ground")) return <Truck className="h-5 w-5" />;
  return <Package className="h-5 w-5" />;
}
function serviceTint(service: string) {
  if (service.toLowerCase().includes("air")) return "bg-primary/10 text-primary";
  if (service.toLowerCase().includes("ocean")) return "bg-sky-500/10 text-sky-600";
  if (service.toLowerCase().includes("ground")) return "bg-secondary/15 text-secondary";
  return "bg-muted text-foreground";
}
