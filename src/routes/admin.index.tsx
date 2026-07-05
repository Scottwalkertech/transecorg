import { createFileRoute, Link } from "@tanstack/react-router";
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
  User,
  Calendar,
  RefreshCw,
} from "lucide-react";
import {
  createAdminShipment,
  deleteAdminShipment,
  listAdminShipments,
  subscribeAdminShipments,
  updateAdminShipmentStatus,
  type AdminShipment,
  type AdminStatus,
} from "@/lib/admin-shipments";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — TranSec Logistics" },
      { name: "description", content: "Internal staff console for creating and managing TranSec shipments." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

const STATUSES: AdminStatus[] = ["Pending", "In Transit", "Out for Delivery", "Delivered"];

const shipmentSchema = z.object({
  origin: z.string().trim().min(2, "Enter an origin city").max(120),
  destination: z.string().trim().min(2, "Enter a destination city").max(120),
  sender: z.string().trim().min(2, "Enter the sender name").max(80),
  receiver: z.string().trim().min(2, "Enter the receiver name").max(80),
  status: z.enum(["Pending", "In Transit", "Out for Delivery", "Delivered"]),
  eta: z.string().min(1, "Pick an estimated delivery date"),
});

type FormState = z.infer<typeof shipmentSchema>;

const EMPTY: FormState = {
  origin: "",
  destination: "",
  sender: "",
  receiver: "",
  status: "Pending",
  eta: "",
};

function AdminPage() {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [rows, setRows] = useState<AdminShipment[]>([]);

  useEffect(() => {
    const sync = () => setRows(listAdminShipments());
    sync();
    return subscribeAdminShipments(sync);
  }, []);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(f => ({ ...f, [key]: value }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = shipmentSchema.safeParse(form);
    if (!parsed.success) {
      toast.error("Please fix the form", { description: parsed.error.issues[0]?.message ?? "Invalid input" });
      return;
    }
    const created = createAdminShipment(parsed.data);
    toast.success("Shipment created", {
      description: `Tracking ID ${created.id} generated. Share it with the customer.`,
    });
    setForm(EMPTY);
  }

  function onDelete(id: string) {
    deleteAdminShipment(id);
    toast.success("Shipment removed", { description: id });
  }

  function onStatusChange(id: string, status: AdminStatus) {
    updateAdminShipmentStatus(id, status);
    toast.success("Status updated", { description: `${id} → ${status}` });
  }

  function copy(id: string) {
    navigator.clipboard?.writeText(id).catch(() => {});
    toast.success("Copied", { description: id });
  }

  const stats = {
    total: rows.length,
    inTransit: rows.filter(r => r.status === "In Transit" || r.status === "Out for Delivery").length,
    delivered: rows.filter(r => r.status === "Delivered").length,
    pending: rows.filter(r => r.status === "Pending").length,
  };

  return (
    <div className="bg-muted/30">
      {/* Header band */}
      <section className="bg-gradient-hero text-primary-foreground">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
                <ShieldCheck className="h-3.5 w-3.5" /> Internal · Admin
              </p>
              <h1 className="mt-3 font-display text-3xl font-bold sm:text-4xl">Operations Dashboard</h1>
              <p className="mt-2 max-w-2xl text-sm text-primary-foreground/75">
                Create new shipments, monitor active loads, and manage status updates across every lane.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                ["Total", stats.total],
                ["Pending", stats.pending],
                ["Active", stats.inTransit],
                ["Delivered", stats.delivered],
              ].map(([l, v]) => (
                <div key={l as string} className="rounded-xl border border-primary-foreground/15 bg-primary-foreground/5 px-4 py-3 text-center">
                  <p className="font-display text-2xl font-bold text-secondary">{v}</p>
                  <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground/70">{l}</p>
                </div>
              ))}
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
            <Field label="Origin" icon={MapPin}>
              <input required value={form.origin} onChange={e => set("origin", e.target.value)} placeholder="Rotterdam, NL" className={inputCls} />
            </Field>
            <Field label="Destination" icon={MapPin}>
              <input required value={form.destination} onChange={e => set("destination", e.target.value)} placeholder="New York, US" className={inputCls} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Sender" icon={User}>
                <input required value={form.sender} onChange={e => set("sender", e.target.value)} placeholder="Acme Corp." className={inputCls} />
              </Field>
              <Field label="Receiver" icon={User}>
                <input required value={form.receiver} onChange={e => set("receiver", e.target.value)} placeholder="J. Chen" className={inputCls} />
              </Field>
            </div>
            <Field label="Current Status" icon={Truck}>
              <select value={form.status} onChange={e => set("status", e.target.value as AdminStatus)} className={inputCls}>
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Estimated Delivery Date" icon={Calendar}>
              <input required type="date" value={form.eta} onChange={e => set("eta", e.target.value)} className={inputCls} />
            </Field>
          </div>

          <button
            type="submit"
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-orange px-4 py-2.5 text-sm font-semibold text-secondary-foreground shadow-glow transition-transform hover:scale-[1.01]"
          >
            <Plus className="h-4 w-4" /> Create & generate Tracking ID
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
              <p className="text-xs text-muted-foreground">{rows.length} shipment{rows.length === 1 ? "" : "s"} in operational database</p>
            </div>
            <Link
              to="/tracking"
              className="hidden items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-semibold text-foreground/80 hover:bg-muted sm:inline-flex"
            >
              Open tracker <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {rows.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-muted text-muted-foreground">
                <Package className="h-7 w-7" />
              </div>
              <p className="mt-4 font-semibold text-foreground">No shipments yet</p>
              <p className="mt-1 text-sm text-muted-foreground">Create your first shipment using the form to generate a tracking ID.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-6 py-3 text-left">Tracking</th>
                    <th className="px-6 py-3 text-left">Route</th>
                    <th className="px-6 py-3 text-left">Parties</th>
                    <th className="px-6 py-3 text-left">Status</th>
                    <th className="px-6 py-3 text-left">ETA</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {rows.map(r => (
                    <tr key={r.id} className="hover:bg-muted/30">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Link
                            to="/tracking"
                            search={{ id: r.id }}
                            className="font-mono text-xs font-semibold text-primary hover:underline"
                          >
                            {r.id}
                          </Link>
                          <button onClick={() => copy(r.id)} className="text-muted-foreground hover:text-foreground" aria-label="Copy tracking ID">
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                          {new Date(r.createdAt).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-foreground">{r.origin}</p>
                        <p className="text-xs text-muted-foreground">→ {r.destination}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-foreground">{r.sender}</p>
                        <p className="text-xs text-muted-foreground">to {r.receiver}</p>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={r.status}
                          onChange={e => onStatusChange(r.id, e.target.value as AdminStatus)}
                          className={`rounded-md border px-2 py-1 text-xs font-semibold ${statusCls(r.status)}`}
                        >
                          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td className="px-6 py-4 text-xs text-foreground/85">
                        {new Date(r.eta).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => onDelete(r.id)}
                          className="inline-flex items-center gap-1.5 rounded-md border border-destructive/30 px-2.5 py-1 text-xs font-semibold text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const inputCls =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary";

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

function statusCls(s: AdminStatus): string {
  switch (s) {
    case "Pending": return "border-muted bg-muted text-foreground";
    case "In Transit": return "border-primary/25 bg-primary/10 text-primary";
    case "Out for Delivery": return "border-secondary/30 bg-secondary/15 text-secondary";
    case "Delivered": return "border-success/30 bg-success/15 text-success";
  }
}
