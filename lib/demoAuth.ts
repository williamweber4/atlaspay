export type DemoUser = { email: string };
const KEY = "atlaspay_demo_user_v1";
export function getDemoUser(): DemoUser | null {
  if (typeof window === "undefined") return null;
  try { const raw = localStorage.getItem(KEY); return raw ? (JSON.parse(raw) as DemoUser) : null; } catch { return null; }
}
export function setDemoUser(user: DemoUser){ localStorage.setItem(KEY, JSON.stringify(user)); }
export function clearDemoUser(){ localStorage.removeItem(KEY); }
