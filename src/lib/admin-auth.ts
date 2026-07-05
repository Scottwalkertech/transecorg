// Mock admin authentication. Client-side only — treats a shared password as a
// gate for the demo admin surface. Do not use for real security.
const KEY = "transec.admin.auth";
const EVT = "transec:admin-auth";

// Demo credentials. In a production build these would be validated on the server.
export const ADMIN_USERNAME = "admin";
export const ADMIN_PASSWORD = "transec2026";

export function isAdminAuthed(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(KEY) === "1";
}

export function signInAdmin(username: string, password: string): boolean {
  if (username.trim().toLowerCase() !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    return false;
  }
  if (typeof window !== "undefined") {
    window.localStorage.setItem(KEY, "1");
    window.dispatchEvent(new Event(EVT));
  }
  return true;
}

export function signOutAdmin() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
  window.dispatchEvent(new Event(EVT));
}

export function subscribeAdminAuth(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = () => cb();
  window.addEventListener(EVT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(EVT, handler);
    window.removeEventListener("storage", handler);
  };
}
