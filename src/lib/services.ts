import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Service = {
  id: string;
  slug: string;
  title: string;
  description: string;
  image_url: string;
  status: string;
  created_at: string;
};

/**
 * Map DB slug -> in-app route. Adding new routes: extend this map (and create
 * the corresponding route file). Services with slugs not in this map are
 * still returned by the queries, but rendered as non-linked nav items.
 */
export const SERVICE_ROUTE: Record<string, string> = {
  "ocean-freight": "/ocean-freight",
  "air-cargo": "/air-cargo",
  "ground-logistics": "/ground-logistics",
  "warehousing": "/warehousing",
};

const TABLE = "shipments";
const CHANNEL = "public:shipments";

async function fetchAll(): Promise<Service[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("id, slug, title, description, image_url, status, created_at")
    .eq("status", "active")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Service[];
}

/**
 * Reactive list of active services. Subscribes to Supabase Realtime so any
 * INSERT/UPDATE/DELETE on the `shipments` table refreshes the UI immediately.
 */
export function useServices() {
  const [services, setServices] = useState<Service[] | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchAll()
      .then(rows => { if (!cancelled) setServices(rows); })
      .catch(e => { if (!cancelled) setError(e as Error); });

    const channel = supabase
      .channel(CHANNEL)
      .on("postgres_changes", { event: "*", schema: "public", table: TABLE }, () => {
        fetchAll()
          .then(rows => { if (!cancelled) setServices(rows); })
          .catch(e => { if (!cancelled) setError(e as Error); });
      })
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, []);

  return { services, loading: services === null && !error, error };
}

/** Reactive lookup for a single service by slug. */
export function useService(slug: string) {
  const { services, loading, error } = useServices();
  const service = services?.find(s => s.slug === slug) ?? null;
  return { service, loading, error };
}
