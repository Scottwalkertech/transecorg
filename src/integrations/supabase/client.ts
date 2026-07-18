import { createClient } from "@supabase/supabase-js";

// Publishable (anon) key — safe to ship to the browser. Row-Level Security
// on your Supabase project is what actually protects data.
const SUPABASE_URL = "https://fmhbiglxjmndgwqtdzhs.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtaGJpZ2x4am1uZGd3cXRkemhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQzNTcyODMsImV4cCI6MjA5OTkzMzI4M30.fiLodZYKHBMNVYh4X8WlQRj1eM1VKHg_F_brOxE5JNQ";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== "undefined" ? window.localStorage : undefined,
  },
});
