export type MockSession = {
  company: string;
  fullName: string;
  email: string;
  createdAt: string;
};

const KEY = "transec.session";

export function getSession(): MockSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as MockSession) : null;
  } catch {
    return null;
  }
}

export function setSession(s: MockSession) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(s));
  window.dispatchEvent(new Event("transec:session"));
}

export function clearSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
  window.dispatchEvent(new Event("transec:session"));
}

export function useSessionSync(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  const handler = () => cb();
  window.addEventListener("transec:session", handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener("transec:session", handler);
    window.removeEventListener("storage", handler);
  };
}
