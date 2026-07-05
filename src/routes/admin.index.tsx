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
  User,
  Calendar,
  RefreshCw,
  Pencil,
  Save,
  X,
  LogOut,
  ChevronDown,
  ChevronUp,
  Clock,
} from "lucide-react";
import {
  addAdminEvent,
  createAdminShipment,
  deleteAdminEvent,
  deleteAdminShipment,
  listAdminShipments,
  subscribeAdminShipments,
  updateAdminEvent,
  updateAdminShipment,
  updateAdminShipmentStatus,
  type AdminEvent,
  type AdminShipment,
  type AdminStatus,
} from "@/lib/admin-shipments";
import { isAdminAuthed, signOutAdmin, subscribeAdminAuth } from "@/lib/admin-auth";
import type { ShipmentStage } from "@/lib/shipments";

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

const STATUSES: AdminStatus[] = ["Pending", "In Transit", "Out for Delivery", "Delivered"];
const STAGE_LABELS: Record<ShipmentStage, string> = { 0: "Label Created", 1: "In Transit", 2: "Out for Delivery", 3: "Delivered" };

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
  const navigate = useNavigate();
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    const sync = () => setAuthed(isAdminAuthed());
    sync();
    return subscribeAdminAuth(sync);
  }, []);

  useEffect(() => {
    if (authed === false) navigate({ to: "/admin/login" });
  }, [authed, navigate]);

  if (!authed) {
    return (
      <div className="grid min-h-[60vh] place-items-center text-sm text-muted-foreground">
        Verifying access…
      </div>
    );
  }
  return <AdminConsole />;
}

function AdminConsole() {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [rows, setRows] = useState<AdminShipment[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

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
      description: `Tracking ID ${created.id} generated. Now searchable on the public tracker.`,
    });
    setForm(EMPTY);
  }

  function onDelete(id: string) {
    deleteAdminShipment(id);
    toast.success("Shipment removed", { description: id });
    if (expanded === id) setExpanded(null);
  }

  function onStatusChange(id: string, status: AdminStatus) {
    updateAdminShipmentStatus(id, status);
    toast.success("Status updated", { description: `${id} → ${status}` });
  }

  function copy(id: string) {
    navigator.clipboard?.writeText(id).catch(() => {});
    toast.success("Copied", { description: id });
  }

  function handleSignOut() {
    signOutAdmin();
    toast.success("Signed out");
    navigate({ to: "/admin/login" });
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
                Create new shipments, edit milestone events, and dispatch updates across every lane. Public tracking reflects your changes instantly.
              </p>
            </div>
            <div className="flex flex-col items-end gap-3">
              <button
                onClick={handleSignOut}
                className="inline-flex items-center gap-1.5 rounded-md border border-primary-foreground/20 bg-primary-foreground/5 px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary-foreground/10"
              >
                <LogOut className="h-3.5 w-3.5" /> Sign out
              </button>
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
            <ul className="divide-y divide-border">
              {rows.map(r => (
                <li key={r.id} className="px-4 py-4 sm:px-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
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
                        <span className={`rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${statusCls(r.status)}`}>
                          {r.status}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-foreground">
                        <span className="font-medium">{r.origin}</span> <span className="text-muted-foreground">→</span> <span className="font-medium">{r.destination}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {r.sender} → {r.receiver} · ETA {new Date(r.eta).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })} · {r.events.length} milestone{r.events.length === 1 ? "" : "s"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={r.status}
                        onChange={e => onStatusChange(r.id, e.target.value as AdminStatus)}
                        className={`rounded-md border px-2 py-1 text-xs font-semibold ${statusCls(r.status)}`}
                      >
                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <button
                        onClick={() => setExpanded(expanded === r.id ? null : r.id)}
                        className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1 text-xs font-semibold text-foreground/80 hover:bg-muted"
                      >
                        <Pencil className="h-3.5 w-3.5" /> Manage
                        {expanded === r.id ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                      </button>
                      <button
                        onClick={() => onDelete(r.id)}
                        className="inline-flex items-center gap-1 rounded-md border border-destructive/30 px-2.5 py-1 text-xs font-semibold text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </button>
                    </div>
                  </div>

                  {expanded === r.id && <ShipmentEditor shipment={r} />}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function ShipmentEditor({ shipment }: { shipment: AdminShipment }) {
  const [details, setDetails] = useState({
    origin: shipment.origin,
    destination: shipment.destination,
    sender: shipment.sender,
    receiver: shipment.receiver,
    eta: shipment.eta,
  });

  useEffect(() => {
    setDetails({
      origin: shipment.origin,
      destination: shipment.destination,
      sender: shipment.sender,
      receiver: shipment.receiver,
      eta: shipment.eta,
    });
  }, [shipment.id]);

  function saveDetails() {
    updateAdminShipment(shipment.id, details);
    toast.success("Shipment updated", { description: shipment.id });
  }

  return (
    <div className="mt-4 rounded-xl border border-border bg-muted/40 p-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <MiniField label="Origin">
          <input value={details.origin} onChange={e => setDetails(d => ({ ...d, origin: e.target.value }))} className={miniInput} />
        </MiniField>
        <MiniField label="Destination">
          <input value={details.destination} onChange={e => setDetails(d => ({ ...d, destination: e.target.value }))} className={miniInput} />
        </MiniField>
        <MiniField label="Sender">
          <input value={details.sender} onChange={e => setDetails(d => ({ ...d, sender: e.target.value }))} className={miniInput} />
        </MiniField>
        <MiniField label="Receiver">
          <input value={details.receiver} onChange={e => setDetails(d => ({ ...d, receiver: e.target.value }))} className={miniInput} />
        </MiniField>
        <MiniField label="ETA">
          <input type="date" value={details.eta} onChange={e => setDetails(d => ({ ...d, eta: e.target.value }))} className={miniInput} />
        </MiniField>
      </div>
      <div className="mt-3 flex justify-end">
        <button
          onClick={saveDetails}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
        >
          <Save className="h-3.5 w-3.5" /> Save details
        </button>
      </div>

      <MilestoneManager shipment={shipment} />
    </div>
  );
}

function MilestoneManager({ shipment }: { shipment: AdminShipment }) {
  const [draft, setDraft] = useState({
    ts: new Date().toISOString().slice(0, 16),
    location: shipment.destination,
    description: "",
    stage: 1 as ShipmentStage,
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<AdminEvent | null>(null);

  function onAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.description.trim() || !draft.location.trim()) {
      toast.error("Location and description are required");
      return;
    }
    addAdminEvent(shipment.id, {
      ts: new Date(draft.ts).toISOString(),
      location: draft.location.trim(),
      description: draft.description.trim(),
      stage: draft.stage,
    });
    toast.success("Milestone added");
    setDraft(d => ({ ...d, description: "" }));
  }

  function beginEdit(evt: AdminEvent) {
    setEditingId(evt.id);
    setEditValues({ ...evt, ts: evt.ts.slice(0, 16) });
  }

  function saveEdit() {
    if (!editValues) return;
    updateAdminEvent(shipment.id, { ...editValues, ts: new Date(editValues.ts).toISOString() });
    toast.success("Milestone updated");
    setEditingId(null);
    setEditValues(null);
  }

  function removeEvent(id: string) {
    deleteAdminEvent(shipment.id, id);
    toast.success("Milestone removed");
  }

  const sorted = [...shipment.events].sort((a, b) => (a.ts < b.ts ? -1 : 1));

  return (
    <div className="mt-6">
      <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <Clock className="h-3.5 w-3.5" /> Milestone Timeline
      </div>

      <ul className="space-y-2">
        {sorted.length === 0 && (
          <li className="rounded-md border border-dashed border-border bg-background/50 p-3 text-xs text-muted-foreground">
            No milestones yet — add the first event below.
          </li>
        )}
        {sorted.map(evt => (
          <li key={evt.id} className="rounded-md border border-border bg-background p-3">
            {editingId === evt.id && editValues ? (
              <div className="grid gap-2 sm:grid-cols-[auto_1fr_1fr_auto_auto]">
                <input type="datetime-local" value={editValues.ts} onChange={e => setEditValues(v => v && { ...v, ts: e.target.value })} className={miniInput} />
                <input value={editValues.location} onChange={e => setEditValues(v => v && { ...v, location: e.target.value })} placeholder="Location" className={miniInput} />
                <input value={editValues.description} onChange={e => setEditValues(v => v && { ...v, description: e.target.value })} placeholder="Description" className={miniInput} />
                <select value={editValues.stage} onChange={e => setEditValues(v => v && { ...v, stage: Number(e.target.value) as ShipmentStage })} className={miniInput}>
                  {([0, 1, 2, 3] as ShipmentStage[]).map(s => <option key={s} value={s}>{STAGE_LABELS[s]}</option>)}
                </select>
                <div className="flex gap-1">
                  <button onClick={saveEdit} className="inline-flex items-center gap-1 rounded-md bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground hover:bg-primary/90">
                    <Save className="h-3.5 w-3.5" /> Save
                  </button>
                  <button onClick={() => { setEditingId(null); setEditValues(null); }} className="inline-flex items-center rounded-md border border-border px-2 py-1 text-xs hover:bg-muted">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-mono text-muted-foreground">{new Date(evt.ts).toLocaleString()}</p>
                  <p className="text-sm font-medium text-foreground">{evt.description}</p>
                  <p className="text-xs text-muted-foreground">{evt.location} · {STAGE_LABELS[evt.stage]}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => beginEdit(evt)} className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs hover:bg-muted">
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </button>
                  <button onClick={() => removeEvent(evt.id)} className="inline-flex items-center gap-1 rounded-md border border-destructive/30 px-2 py-1 text-xs text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>

      <form onSubmit={onAdd} className="mt-4 grid gap-2 rounded-md border border-border bg-background p-3 sm:grid-cols-[auto_1fr_1fr_auto_auto]">
        <input type="datetime-local" value={draft.ts} onChange={e => setDraft(d => ({ ...d, ts: e.target.value }))} className={miniInput} />
        <input value={draft.location} onChange={e => setDraft(d => ({ ...d, location: e.target.value }))} placeholder="Location (e.g. JFK Cargo, US)" className={miniInput} />
        <input value={draft.description} onChange={e => setDraft(d => ({ ...d, description: e.target.value }))} placeholder="Milestone description" className={miniInput} />
        <select value={draft.stage} onChange={e => setDraft(d => ({ ...d, stage: Number(e.target.value) as ShipmentStage }))} className={miniInput}>
          {([0, 1, 2, 3] as ShipmentStage[]).map(s => <option key={s} value={s}>{STAGE_LABELS[s]}</option>)}
        </select>
        <button type="submit" className="inline-flex items-center gap-1 rounded-md bg-gradient-orange px-3 py-1.5 text-xs font-semibold text-secondary-foreground shadow-glow">
          <Plus className="h-3.5 w-3.5" /> Add
        </button>
      </form>
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

function statusCls(s: AdminStatus): string {
  switch (s) {
    case "Pending": return "border-muted bg-muted text-foreground";
    case "In Transit": return "border-primary/25 bg-primary/10 text-primary";
    case "Out for Delivery": return "border-secondary/30 bg-secondary/15 text-secondary";
    case "Delivered": return "border-success/30 bg-success/15 text-success";
  }
}
