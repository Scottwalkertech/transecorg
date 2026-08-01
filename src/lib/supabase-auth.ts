import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

/**
 * Reads the admin role from Supabase auth metadata. The database's RLS
 * policies are the real enforcement — this only drives UI affordances.
 */
export function isAdminUser(user: User | null | undefined): boolean {
  if (!user) return false;
  const meta = { ...(user.app_metadata ?? {}), ...(user.user_metadata ?? {}) } as Record<string, unknown>;
  const role = meta["role"] ?? meta["user_role"];
  if (typeof role === "string" && role.toLowerCase() === "admin") return true;
  const roles = meta["roles"];
  return Array.isArray(roles) && roles.some(r => String(r).toLowerCase() === "admin");
}

export function useSupabaseSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setLoading(false);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const user = session?.user ?? null;
  return { session, user, isAdmin: isAdminUser(user), loading };
}

export async function signInWithEmail(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email: email.trim(), password });
}

export async function signOut() {
  await supabase.auth.signOut();
}
