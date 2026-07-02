import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { LogIn, UserPlus, ShieldCheck, Package, ArrowRight, Lock, Mail, Building2, User } from "lucide-react";

export const Route = createFileRoute("/portal")({
  head: () => ({
    meta: [
      { title: "Client Portal — TranSec Logistics" },
      { name: "description", content: "Sign in or create your TranSec Logistics client account to manage shipments, quotes, and invoices." },
      { property: "og:title", content: "Client Portal — TranSec Logistics" },
      { property: "og:description", content: "Secure client portal for TranSec Logistics customers." },
    ],
  }),
  component: PortalPage,
});

const signInSchema = z.object({
  email: z.string().trim().email("Enter a valid business email").max(255),
  password: z.string().min(8, "Password must be at least 8 characters").max(120),
});

const signUpSchema = z.object({
  company: z.string().trim().min(2, "Company name is required").max(120),
  fullName: z.string().trim().min(2, "Full name is required").max(120),
  email: z.string().trim().email("Enter a valid business email").max(255),
  password: z.string().min(8, "Password must be at least 8 characters").max(120),
});

function PortalPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [signIn, setSignIn] = useState({ email: "", password: "" });
  const [signUp, setSignUp] = useState({ company: "", fullName: "", email: "", password: "" });

  function submitSignIn(e: React.FormEvent) {
    e.preventDefault();
    const r = signInSchema.safeParse(signIn);
    if (!r.success) return toast.error("Check your details", { description: r.error.issues[0]?.message });
    toast.success("Welcome back", { description: `Signed in as ${r.data.email}` });
    setSignIn({ email: "", password: "" });
  }

  function submitSignUp(e: React.FormEvent) {
    e.preventDefault();
    const r = signUpSchema.safeParse(signUp);
    if (!r.success) return toast.error("Check your details", { description: r.error.issues[0]?.message });
    toast.success("Account created", { description: `Welcome to TranSec, ${r.data.fullName}. Check ${r.data.email} to verify.` });
    setSignUp({ company: "", fullName: "", email: "", password: "" });
  }

  return (
    <section className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-gradient-hero text-primary-foreground">
      <div className="absolute inset-0 grid-bg opacity-40" aria-hidden />
      <div className="absolute -right-32 top-1/3 h-[520px] w-[520px] rounded-full bg-secondary/20 blur-3xl" aria-hidden />
      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-24">
        {/* Left copy */}
        <div className="flex flex-col justify-center">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-secondary">
            <ShieldCheck className="h-3.5 w-3.5" /> Client Portal
          </span>
          <h1 className="mt-5 font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            Your shipments, <span className="text-secondary">under one login.</span>
          </h1>
          <p className="mt-4 max-w-lg text-primary-foreground/75">
            Book quotes, manage invoices, and get live GPS visibility across every lane — from a single secure dashboard.
          </p>
          <ul className="mt-8 space-y-3 text-sm">
            {[
              { icon: Package, text: "Live tracking across ocean, air, and ground" },
              { icon: ShieldCheck, text: "SOC 2 & ISO 27001 audited infrastructure" },
              { icon: Lock, text: "SSO, MFA, and role-based team access" },
            ].map(f => (
              <li key={f.text} className="flex items-center gap-3 text-primary-foreground/85">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary-foreground/10 text-secondary">
                  <f.icon className="h-4 w-4" />
                </span>
                {f.text}
              </li>
            ))}
          </ul>
        </div>

        {/* Right card */}
        <div className="flex items-center justify-center">
          <div className="w-full max-w-md rounded-3xl border border-primary-foreground/15 bg-background/95 p-8 shadow-elegant backdrop-blur">
            <div className="flex gap-2 rounded-lg bg-muted p-1">
              <button
                onClick={() => setMode("signin")}
                className={`flex-1 rounded-md px-3 py-2 text-sm font-semibold transition-colors ${mode === "signin" ? "bg-background text-foreground shadow-card" : "text-muted-foreground hover:text-foreground"}`}
              >
                <span className="inline-flex items-center gap-1.5"><LogIn className="h-4 w-4" /> Sign In</span>
              </button>
              <button
                onClick={() => setMode("signup")}
                className={`flex-1 rounded-md px-3 py-2 text-sm font-semibold transition-colors ${mode === "signup" ? "bg-background text-foreground shadow-card" : "text-muted-foreground hover:text-foreground"}`}
              >
                <span className="inline-flex items-center gap-1.5"><UserPlus className="h-4 w-4" /> Create Account</span>
              </button>
            </div>

            {mode === "signin" ? (
              <form onSubmit={submitSignIn} className="mt-6 space-y-4">
                <Field icon={Mail} label="Business Email" type="email" value={signIn.email} placeholder="you@company.com" onChange={v => setSignIn(s => ({ ...s, email: v }))} />
                <Field icon={Lock} label="Password" type="password" value={signIn.password} placeholder="••••••••" onChange={v => setSignIn(s => ({ ...s, password: v }))} />
                <div className="flex items-center justify-between text-xs">
                  <label className="inline-flex items-center gap-2 text-muted-foreground">
                    <input type="checkbox" className="h-3.5 w-3.5 accent-primary" /> Remember me
                  </label>
                  <a href="#" className="font-semibold text-primary hover:text-primary-glow">Forgot password?</a>
                </div>
                <button type="submit" className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-elegant transition-transform hover:scale-[1.01]">
                  Sign In <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            ) : (
              <form onSubmit={submitSignUp} className="mt-6 space-y-4">
                <Field icon={Building2} label="Company Name" value={signUp.company} placeholder="Acme Logistics Co." onChange={v => setSignUp(s => ({ ...s, company: v }))} />
                <Field icon={User} label="Full Name" value={signUp.fullName} placeholder="Jane Doe" onChange={v => setSignUp(s => ({ ...s, fullName: v }))} />
                <Field icon={Mail} label="Business Email" type="email" value={signUp.email} placeholder="you@company.com" onChange={v => setSignUp(s => ({ ...s, email: v }))} />
                <Field icon={Lock} label="Password" type="password" value={signUp.password} placeholder="Minimum 8 characters" onChange={v => setSignUp(s => ({ ...s, password: v }))} />
                <button type="submit" className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-orange py-3 text-sm font-semibold text-secondary-foreground shadow-glow transition-transform hover:scale-[1.01]">
                  Create Account <ArrowRight className="h-4 w-4" />
                </button>
                <p className="text-center text-xs text-muted-foreground">
                  By continuing you agree to our Terms & Privacy Policy.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({
  icon: Icon,
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2 rounded-lg border border-input bg-background px-3 shadow-sm transition-colors focus-within:ring-1 focus-within:ring-ring">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />
      </div>
    </label>
  );
}
