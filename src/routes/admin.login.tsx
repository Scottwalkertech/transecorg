import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ShieldCheck, Lock, Mail, ArrowRight } from "lucide-react";
import { signInWithEmail, useSupabaseSession } from "@/lib/supabase-auth";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [
      { title: "Admin Sign In — TranSec Logistics" },
      { name: "description", content: "Restricted internal access for TranSec Logistics operations staff." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const navigate = useNavigate();
  const { user, isAdmin } = useSupabaseSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user && isAdmin) navigate({ to: "/admin" });
  }, [user, isAdmin, navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { data, error } = await signInWithEmail(email, password);
    setBusy(false);
    if (error) {
      toast.error("Access denied", { description: error.message });
      return;
    }
    if (!isAdminUser(data.user)) {
      toast.error("Not an administrator", { description: "This account has no admin role assigned." });
      return;
    }
    toast.success("Welcome, admin", { description: "Redirecting to the operations console." });
    navigate({ to: "/admin" });
  }

  return (
    <section className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-gradient-hero py-16 text-primary-foreground">
      <div className="absolute inset-0 grid-bg opacity-40" aria-hidden />
      <div className="relative mx-auto grid max-w-5xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
            <ShieldCheck className="h-3.5 w-3.5" /> Restricted Access
          </span>
          <h1 className="mt-4 font-display text-3xl font-bold sm:text-4xl">
            TranSec <span className="text-secondary">Operations Console</span>
          </h1>
          <p className="mt-3 max-w-md text-sm text-primary-foreground/75">
            Internal staff portal for creating, editing, and dispatching shipments across the TranSec global network. Public users should use the tracking page instead.
          </p>
          <div className="mt-6 rounded-xl border border-primary-foreground/15 bg-primary-foreground/5 p-4 text-xs text-primary-foreground/70">
            Sign in with your TranSec staff account. Access requires an{" "}
            <span className="font-mono text-secondary">admin</span> role on the account.
          </div>
        </div>

        <form
          onSubmit={onSubmit}
          className="rounded-2xl border border-border bg-card p-8 text-foreground shadow-elegant"
        >
          <h2 className="font-display text-xl font-bold">Administrator Sign In</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            This portal is separate from the public client account system.
          </p>

          <label className="mt-6 block">
            <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              <Mail className="h-3.5 w-3.5" /> Work email
            </span>
            <input
              required
              type="email"
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              placeholder="ops@transec.com"
            />
          </label>

          <label className="mt-4 block">
            <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              <Lock className="h-3.5 w-3.5" /> Password
            </span>
            <input
              required
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              placeholder="••••••••"
            />
          </label>

          <button
            type="submit"
            disabled={busy}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-orange px-4 py-2.5 text-sm font-semibold text-secondary-foreground shadow-glow transition-transform hover:scale-[1.01] disabled:opacity-60"
          >
            {busy ? "Signing in…" : (<>Sign in to console <ArrowRight className="h-4 w-4" /></>)}
          </button>

          <p className="mt-4 text-[11px] text-muted-foreground">
            Access is logged. Unauthorized use is prohibited.
          </p>
        </form>
      </div>
    </section>
  );
}
