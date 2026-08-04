import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import {
  ShieldCheck,
  Plus,
  Trash2,
  Copy,
  Package,
  ArrowRight,
  Truck,
  MapPin,
  Calendar,
  Navigation,
  RefreshCw,
  Pencil,
  Save,
  LogOut,
  ChevronDown,
  ChevronUp,
  Lock,
} from "lucide-react";
import {
  createTrackingRow,
  deleteTrackingRow,
  generateTrackingNumber,
  normalizeStatus,
  TRACKING_STATUSES,
  updateTrackingRow,
  useTrackingRows,
  type TrackingRow,
  type TrackingStatus,
} from "@/lib/tracking-db";
import { signOut, useSupabaseSession } from "@/lib/supabase-auth";
import {
  calculateRoute,
  etaFromMiles,
  packLocation,
  toDateInput,
  usePlaceSuggestions,
  type GeoPlace,
  type RouteMeta,
} from "@/lib/geo";


export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — TranSec Logistics" },
      { name: "description", content: "Internal staff console for creating and managing TranSec shipments." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

const shipmentSchema = z.object({
  origin: z.string().trim().min(2, "Enter an origin city").max(120),
  destination: z.string().trim().min(2, "Enter a destination city").max(120),
  current_location: z.string().trim().min(2, "Enter the current location").max(160),
  status: z.enum(["Pending", "In Transit", "Out for Delivery", "Delivered"]),
  estimated_delivery: z.string().min(1, "Pick an estimated delivery date"),
});

type FormState = z.infer<typeof shipmentSchema>;

const EMPTY: FormState = {
  origin: "",
  destination: "",
  current_location: "",
  status: "Pending",
  estimated_delivery: "",
};

function AdminPage() {
  const navigate = useNavigate();
  const { user, isAdmin, loading } = useSupabaseSession();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/admin/login" });
  }, [loading, user, navigate]);

  if (loading || !user) {
    return <div className="grid min-h-[60vh] place-items-center text-sm text-muted-foreground">Verifying access…</div>;
  }

  if (!isAdmin) {
    return (
      <div className="grid min-h-[60vh] place-items-center px-4">
        <div className="max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-card">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-destructive/10 text-destructive">
            <Lock className="h-6 w-6" />
          </span>
          <h1 className="mt-4 font-display text-xl font-bold text-foreground">Administrator access required</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            You are signed in as <span className="font-medium text-foreground">{user.email}</span>, but this account has
            no admin role. Shipment management is read-only for your session.
          </p>
          <button
            onClick={async () => { await signOut(); navigate({ to: "/admin/login" }); }}
            className="mt-5 inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-semibold hover:bg-muted"
          >
            <LogOut className="h-3.5 w-3.5" /> Switch account
          </button>
        </div>
      </div>
    );
  }

  return <AdminConsole email={user.email ?? "admin"} />;
}

function AdminConsole({ email }: { email: string }) {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const { rows, loading, error, refresh } = useTrackingRows();

  // Smart route engine state
  const [originPlace, setOriginPlace] = useState<GeoPlace | null>(null);
  const [destPlace, setDestPlace] = useState<GeoPlace | null>(null);
  const [route, setRoute] = useState<RouteMeta | null>(null);
  const [routing, setRouting] = useState(false);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(f => ({ ...f, [key]: value }));
  }

  // Auto-calculate distance + ETA as soon as both endpoints have coordinates.
  useEffect(() => {
    if (!originPlace || !destPlace) {
      setRoute(null);
      return;
    }
    let cancelled = false;
    setRouting(true);
    calculateRoute(originPlace, destPlace)
      .then(meta => {
        if (cancelled) return;
        setRoute(meta);
        setForm(f => ({
          ...f,
          estimated_delivery: toDateInput(meta.eta ? new Date(meta.eta) : etaFromMiles(meta.miles)),
        }));
        toast.success("Route calculated", {
          description: `${meta.miles.toLocaleString()} mi · ETA auto-set (${meta.osrm ? "OSRM road distance" : "great-circle fallback"})`,
        });
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setRouting(false); });
    return () => { cancelled = true; };
  }, [originPlace, destPlace]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = shipmentSchema.safeParse(form);
    if (!parsed.success) {
      toast.error("Please fix the form", { description: parsed.error.issues[0]?.message ?? "Invalid input" });
      return;
    }
    setBusy(true);
    try {
      const created = await createTrackingRow({
        ...parsed.data,
        current_location: packLocation(parsed.data.current_location, route),
        tracking_number: generateTrackingNumber(parsed.data.destination),
      });
      toast.success("Shipment created", {
        description: `Tracking ID ${created.tracking_number} saved. Now searchable on the public tracker.`,
      });
      setForm(EMPTY);
      setOriginPlace(null);
      setDestPlace(null);
      setRoute(null);
      refresh();
    } catch (err) {
      toast.error("Could not create shipment", { description: (err as Error).message });
    } finally {
      setBusy(false);
    }
  }


  async function onDelete(row: TrackingRow) {
    try {
      await deleteTrackingRow(row.id);
      toast.success("Shipment removed", { description: row.tracking_number });
      if (expanded === row.id) setExpanded(null);
      refresh();
    } catch (err) {
      toast.error("Delete failed", { description: (err as Error).message });
    }
  }

  async function onStatusChange(row: TrackingRow, status: TrackingStatus) {
    try {
      await updateTrackingRow(row.id, { status });
      toast.success("Status updated", { description: `${row.tracking_number} → ${status}` });
      refresh();
    } catch (err) {
      toast.error("Update failed", { description: (err as Error).message });
    }
  }

  function copy(value: string) {
    navigator.clipboard?.writeText(value).catch(() => {});
    toast.success("Copied", { description: value });
  }

  const stats = {
    total: rows.length,
    pending: rows.filter(r => normalizeStatus(r.status) === "Pending").length,
    inTransit: rows.filter(r => ["In Transit", "Out for Delivery"].includes(normalizeStatus(r.status))).length,
    delivered: rows.filter(r => normalizeStatus(r.status) === "Delivered").length,
  };

  return (
    <div className="bg-muted/30">
      <section className="bg-gradient-hero text-primary-foreground">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
                <ShieldCheck className="h-3.5 w-3.5" /> Internal · Admin
              </p>
              <h1 className="mt-3 font-display text-3xl font-bold sm:text-4xl">Operations Dashboard</h1>
              <p className="mt-2 max-w-2xl text-sm text-primary-foreground/75">
                Signed in as {email}. Records are stored live in the tracking database — public tracking reflects your
                changes instantly.
              </p>
            </div>
            <div className="flex flex-col items-end gap-3">
              <button
                onClick={async () => { await signOut(); toast.success("Signed out"); navigate({ to: "/admin/login" }); }}
                className="inline-flex items-center gap-1.5 rounded-md border border-primary-foreground/20 bg-primary-foreground/5 px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary-foreground/10"
              >
                <LogOut className="h-3.5 w-3.5" /> Sign out
              </button>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {([["Total", stats.total], ["Pending", stats.pending], ["Active", stats.inTransit], ["Delivered", stats.delivered]] as const).map(([l, v]) => (
                  <div key={l} className="rounded-xl border border-primary-foreground/15 bg-primary-foreground/5 px-4 py-3 text-center">
                    <p className="font-display text-2xl font-bold text-secondary">{v}</p>
                    <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground/70">{l}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-3 lg:px-8">
        {/* CREATE FORM */}
        <form
          onSubmit={onSubmit}
          className="rounded-2xl border border-border bg-card p-6 shadow-card lg:col-span-1 lg:sticky lg:top-24 lg:self-start"
        >
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-secondary text-secondary-foreground shadow-glow">
              <Plus className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-display text-lg font-bold text-foreground">Create Shipment</h2>
              <p className="text-xs text-muted-foreground">Tracking ID auto-generated on submit.</p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <AddressField
              label="Origin"
              placeholder="Rotterdam, NL"
              value={form.origin}
              onChange={v => { set("origin", v); setOriginPlace(null); }}
              onSelect={p => { set("origin", p.name); setOriginPlace(p); }}
              place={originPlace}
            />
            <AddressField
              label="Destination"
              placeholder="New York, US"
              value={form.destination}
              onChange={v => { set("destination", v); setDestPlace(null); }}
              onSelect={p => { set("destination", p.name); setDestPlace(p); }}
              place={destPlace}
            />

            <div className="rounded-xl border border-border bg-muted/40 px-3 py-2.5 text-xs">
              {routing ? (
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Calculating optimal route…
                </span>
              ) : route ? (
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-semibold text-foreground">
                    {route.miles.toLocaleString()} mi · {route.km.toLocaleString()} km
                  </span>
                  <span className="text-muted-foreground">
                    {Math.round(route.miles / 60 + 8)} h transit @ 60 mph + 8 h buffer
                    {route.osrm ? "" : " · est."}
                  </span>
                </div>
              ) : (
                <span className="text-muted-foreground">
                  Pick both addresses from the suggestions to auto-calculate distance and ETA.
                </span>
              )}
            </div>

            <Field label="Current Location" icon={Navigation}>
              <input required value={form.current_location} onChange={e => set("current_location", e.target.value)} placeholder="Rotterdam Hub, NL" className={inputCls} />
            </Field>
            <Field label="Current Status" icon={Truck}>
              <select value={form.status} onChange={e => set("status", e.target.value as TrackingStatus)} className={inputCls}>
                {TRACKING_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Estimated Delivery Date" icon={Calendar}>
              <input required type="date" value={form.estimated_delivery} onChange={e => set("estimated_delivery", e.target.value)} className={inputCls} />
            </Field>
          </div>


          <button
            type="submit"
            disabled={busy}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-orange px-4 py-2.5 text-sm font-semibold text-secondary-foreground shadow-glow transition-transform hover:scale-[1.01] disabled:opacity-60"
          >
            <Plus className="h-4 w-4" /> {busy ? "Saving…" : "Create & generate Tracking ID"}
          </button>
          <p className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <RefreshCw className="h-3 w-3" /> Format: <code className="rounded bg-muted px-1 font-mono">FTX-######-CC</code>
          </p>
        </form>

        {/* TABLE */}
        <div className="rounded-2xl border border-border bg-card shadow-card lg:col-span-2">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <div>
              <h2 className="font-display text-lg font-bold text-foreground">Active Shipments</h2>
              <p className="text-xs text-muted-foreground">
                {loading ? "Loading from database…" : `${rows.length} shipment${rows.length === 1 ? "" : "s"} in the tracking database`}
              </p>
            </div>
            <Link
              to="/tracking"
              className="hidden items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-semibold text-foreground/80 hover:bg-muted sm:inline-flex"
            >
              Open tracker <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {error ? (
            <div className="px-6 py-12 text-center text-sm text-destructive">{error.message}</div>
          ) : rows.length === 0 && !loading ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-muted text-muted-foreground">
                <Package className="h-7 w-7" />
              </div>
              <p className="mt-4 font-semibold text-foreground">No shipments yet</p>
              <p className="mt-1 text-sm text-muted-foreground">Create your first shipment using the form to generate a tracking ID.</p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {rows.map(r => {
                const status = normalizeStatus(r.status);
                return (
                  <li key={r.id} className="px-4 py-4 sm:px-6">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <Link to="/tracking" search={{ id: r.tracking_number }} className="font-mono text-xs font-semibold text-primary hover:underline">
                            {r.tracking_number}
                          </Link>
                          <button onClick={() => copy(r.tracking_number)} className="text-muted-foreground hover:text-foreground" aria-label="Copy tracking ID">
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                          <span className={`rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${statusCls(status)}`}>
                            {status}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-foreground">
                          <span className="font-medium">{r.origin}</span> <span className="text-muted-foreground">→</span> <span className="font-medium">{r.destination}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {unpackLocation(r.current_location).label || "Location pending"}
                          {unpackLocation(r.current_location).meta ? ` · ${unpackLocation(r.current_location).meta!.miles.toLocaleString()} mi route` : ""}
                          {r.estimated_delivery ? ` · ETA ${new Date(r.estimated_delivery).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}` : ""}
                        </p>

                      </div>
                      <div className="flex items-center gap-2">
                        <select
                          value={status}
                          onChange={e => onStatusChange(r, e.target.value as TrackingStatus)}
                          className={`rounded-md border px-2 py-1 text-xs font-semibold ${statusCls(status)}`}
                        >
                          {TRACKING_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <button
                          onClick={() => setExpanded(expanded === r.id ? null : r.id)}
                          className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1 text-xs font-semibold text-foreground/80 hover:bg-muted"
                        >
                          <Pencil className="h-3.5 w-3.5" /> Manage
                          {expanded === r.id ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                        </button>
                        <button
                          onClick={() => onDelete(r)}
                          className="inline-flex items-center gap-1 rounded-md border border-destructive/30 px-2.5 py-1 text-xs font-semibold text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Delete
                        </button>
                      </div>
                    </div>

                    {expanded === r.id && <ShipmentEditor row={r} onSaved={refresh} />}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function ShipmentEditor({ row, onSaved }: { row: TrackingRow; onSaved: () => void }) {
  const meta = unpackLocation(row.current_location).meta;
  const [details, setDetails] = useState({
    origin: row.origin,
    destination: row.destination,
    current_location: unpackLocation(row.current_location).label,
    estimated_delivery: row.estimated_delivery?.slice(0, 10) ?? "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDetails({
      origin: row.origin,
      destination: row.destination,
      current_location: unpackLocation(row.current_location).label,
      estimated_delivery: row.estimated_delivery?.slice(0, 10) ?? "",
    });
  }, [row.id, row.updated_at]);

  async function saveDetails() {
    setSaving(true);
    try {
      await updateTrackingRow(row.id, {
        ...details,
        current_location: packLocation(details.current_location, meta),
      });
      toast.success("Shipment updated", { description: row.tracking_number });

      onSaved();
    } catch (err) {
      toast.error("Update failed", { description: (err as Error).message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-4 rounded-xl border border-border bg-muted/40 p-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MiniField label="Origin">
          <input value={details.origin} onChange={e => setDetails(d => ({ ...d, origin: e.target.value }))} className={miniInput} />
        </MiniField>
        <MiniField label="Destination">
          <input value={details.destination} onChange={e => setDetails(d => ({ ...d, destination: e.target.value }))} className={miniInput} />
        </MiniField>
        <MiniField label="Current location">
          <input value={details.current_location} onChange={e => setDetails(d => ({ ...d, current_location: e.target.value }))} className={miniInput} />
        </MiniField>
        <MiniField label="ETA">
          <input type="date" value={details.estimated_delivery} onChange={e => setDetails(d => ({ ...d, estimated_delivery: e.target.value }))} className={miniInput} />
        </MiniField>
      </div>
      <div className="mt-3 flex justify-end">
        <button
          onClick={saveDetails}
          disabled={saving}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
        >
          <Save className="h-3.5 w-3.5" /> {saving ? "Saving…" : "Save details"}
        </button>
      </div>
      <p className="mt-3 text-[11px] text-muted-foreground">
        The public milestone timeline is generated from status, location and dates on this record.
      </p>
    </div>
  );
}

const inputCls =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary";

const miniInput =
  "w-full rounded-md border border-input bg-background px-2 py-1.5 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary";

function Field({ label, icon: Icon, children }: { label: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3.5 w-3.5" /> {label}
      </span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

function MiniField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

function statusCls(s: TrackingStatus): string {
  switch (s) {
    case "Pending": return "border-muted bg-muted text-foreground";
    case "In Transit": return "border-primary/25 bg-primary/10 text-primary";
    case "Out for Delivery": return "border-secondary/30 bg-secondary/15 text-secondary";
    case "Delivered": return "border-success/30 bg-success/15 text-success";
  }
}
