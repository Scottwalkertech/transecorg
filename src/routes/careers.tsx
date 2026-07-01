import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Briefcase, MapPin, Clock, X, Send, Upload, FileText } from "lucide-react";
import { PageShell } from "@/components/page-shell";

export const Route = createFileRoute("/careers")({
  head: () => ({
    meta: [
      { title: "Careers — TranSec Logistics" },
      { name: "description", content: "Join TranSec Logistics. Open roles across operations, engineering, and field teams worldwide." },
      { property: "og:title", content: "Careers at TranSec Logistics" },
      { property: "og:description", content: "Build the future of secure global logistics." },
    ],
  }),
  component: CareersPage,
});

type Job = {
  id: string;
  title: string;
  team: string;
  location: string;
  type: string;
  summary: string;
};

const JOBS: Job[] = [
  { id: "log-coord", title: "Logistics Coordinator", team: "Operations", location: "Rotterdam, NL", type: "Full-time", summary: "Coordinate ocean and air shipments across EMEA trade lanes." },
  { id: "fleet-driver", title: "Fleet Driver (Class A CDL)", team: "Ground Network", location: "Memphis, TN", type: "Full-time", summary: "Long-haul and regional routes with a modern, well-maintained fleet." },
  { id: "swe", title: "Senior Software Engineer", team: "Platform Engineering", location: "Remote (EU/US)", type: "Full-time", summary: "Build the visibility platform tracking millions of shipments in real time." },
  { id: "warehouse-mgr", title: "Warehouse Operations Manager", team: "Fulfillment", location: "Singapore", type: "Full-time", summary: "Run a 220k sq ft fulfillment center with a 60-person team." },
  { id: "customs-spec", title: "Customs Brokerage Specialist", team: "Trade Compliance", location: "Hong Kong", type: "Full-time", summary: "Manage filings, duties, and clearance for APAC import/export clients." },
  { id: "data-analyst", title: "Logistics Data Analyst", team: "Insights", location: "London, UK", type: "Full-time", summary: "Turn operational data into routing, pricing, and SLA recommendations." },
];

function CareersPage() {
  const [active, setActive] = useState<Job | null>(null);

  return (
    <PageShell
      eyebrow="Careers"
      title="Build the future of global logistics"
      description="We're hiring across operations, engineering, and field teams. Find your next role on the TranSec team."
      icon={Briefcase}
    >
      <div className="mb-6 flex items-end justify-between">
        <h2 className="font-display text-2xl font-bold text-foreground">Open roles</h2>
        <span className="text-sm text-muted-foreground">{JOBS.length} positions</span>
      </div>
      <div className="space-y-3">
        {JOBS.map(job => (
          <div key={job.id} className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-card transition-all hover:border-secondary/40 hover:shadow-elegant sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h3 className="font-display text-lg font-semibold text-foreground">{job.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{job.summary}</p>
              <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" />{job.team}</span>
                <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{job.location}</span>
                <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{job.type}</span>
              </div>
            </div>
            <button
              onClick={() => setActive(job)}
              className="inline-flex shrink-0 items-center justify-center rounded-md bg-gradient-orange px-5 py-2 text-sm font-semibold text-secondary-foreground shadow-glow transition-transform hover:scale-[1.02]"
            >
              Apply Now
            </button>
          </div>
        ))}
      </div>

      {active && <ApplyModal job={active} onClose={() => setActive(null)} />}
    </PageShell>
  );
}

const applicationSchema = z.object({
  first: z.string().trim().min(1, "First name is required").max(60),
  last: z.string().trim().min(1, "Last name is required").max(60),
  email: z.string().trim().email("Enter a valid email address").max(255),
  url: z.string().trim().url("Enter a valid URL").max(255).or(z.literal("")),
  reason: z.string().trim().min(10, "Tell us a little more (10+ chars)").max(2000),
  resume: z.string().min(1, "Please attach your resume"),
});

function ApplyModal({ job, onClose }: { job: Job; onClose: () => void }) {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ first: "", last: "", email: "", url: "", reason: "", resume: "" });

  function update<K extends keyof typeof form>(k: K, v: string) {
    setForm(f => ({ ...f, [k]: v }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = applicationSchema.safeParse(form);
    if (!result.success) {
      toast.error("Please fix the highlighted fields", {
        description: result.error.issues[0]?.message ?? "Some fields are invalid.",
      });
      return;
    }
    toast.success("Application submitted", {
      description: `Thanks ${result.data.first}! We'll review your application for ${job.title} and reply within 5 business days.`,
    });
    setSubmitted(true);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/60 p-4 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-card shadow-elegant animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="bg-gradient-hero px-6 py-5 text-primary-foreground">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-md bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
          <p className="text-xs font-semibold uppercase tracking-wider text-secondary">Apply for</p>
          <h3 className="mt-1 font-display text-xl font-bold">{job.title}</h3>
          <p className="mt-1 text-xs text-primary-foreground/70">{job.team} · {job.location}</p>
        </div>
        {submitted ? (
          <div className="p-8 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-success/15 text-success">
              <Send className="h-5 w-5" />
            </div>
            <h4 className="mt-4 font-display text-lg font-bold text-foreground">Application received</h4>
            <p className="mt-2 text-sm text-muted-foreground">Our talent team will be in touch within 5 business days.</p>
            <button onClick={onClose} className="mt-6 inline-flex items-center rounded-md bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">Close</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="First name" value={form.first} onChange={v => update("first", v)} />
              <Field label="Last name" value={form.last} onChange={v => update("last", v)} />
            </div>
            <Field label="Email" type="email" value={form.email} onChange={v => update("email", v)} />
            <Field label="LinkedIn / Portfolio URL" type="url" value={form.url} onChange={v => update("url", v)} placeholder="https://" />

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Resume</label>
              <label className="mt-1.5 flex cursor-pointer items-center justify-between gap-3 rounded-md border border-dashed border-input bg-muted/30 px-3 py-3 text-sm transition-colors hover:border-secondary hover:bg-muted/50">
                <span className="flex min-w-0 items-center gap-2 text-muted-foreground">
                  {form.resume ? <FileText className="h-4 w-4 shrink-0 text-secondary" /> : <Upload className="h-4 w-4 shrink-0" />}
                  <span className="truncate">{form.resume || "Upload PDF or DOCX (max 5 MB)"}</span>
                </span>
                <span className="shrink-0 rounded bg-primary px-2.5 py-1 text-[11px] font-semibold text-primary-foreground">Browse</span>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={e => update("resume", e.target.files?.[0]?.name ?? "")}
                />
              </label>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Why TranSec?</label>
              <textarea
                rows={4}
                value={form.reason}
                onChange={e => update("reason", e.target.value)}
                className="mt-1.5 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="Tell us a bit about your interest and experience."
              />
            </div>
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-gradient-orange px-5 py-2.5 text-sm font-semibold text-secondary-foreground shadow-glow transition-transform hover:scale-[1.01]"
            >
              <Send className="h-4 w-4" /> Submit application
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1.5 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      />
    </div>
  );
}
