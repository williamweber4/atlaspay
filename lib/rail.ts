type RailEnv = "sandbox" | "production";

function railEnv(): RailEnv { return (process.env.RAIL_ENV as RailEnv) || "sandbox"; }
export function railEnvironment() { return railEnv(); }
export function railApiBase(): string { return railEnv() === "production" ? "https://layer2financial.com/api" : "https://sandbox.layer2financial.com/api"; }
function railAuthEndpoint(): string {
  return railEnv() === "production"
    ? "https://auth.layer2financial.com/oauth2/ausj0isa571aIN3mL696/v1/token"
    : "https://auth.layer2financial.com/oauth2/ausbdqlx69rH6OjWd696/v1/token";
}
function scopes(): string { return (process.env.RAIL_SCOPES || "payments:read payments:write").trim().replace(/\s+/g, " "); }
export function railScopes() { return scopes(); }
export function railMockMode() { return process.env.RAIL_MOCK === "true"; }
export function railCredentialsPresent() { return Boolean(process.env.RAIL_CLIENT_ID && process.env.RAIL_CLIENT_SECRET); }

let cached: { token: string; expiresAt: number } | null = null;

async function getOAuthToken(): Promise<string> {
  if (railMockMode()) return "mock-token";
  const id = process.env.RAIL_CLIENT_ID;
  const secret = process.env.RAIL_CLIENT_SECRET;
  if (!id || !secret) throw new Error("Missing RAIL_CLIENT_ID/RAIL_CLIENT_SECRET env vars.");
  const now = Date.now();
  if (cached && cached.expiresAt > now + 30000) return cached.token;

  const basic = Buffer.from(`${id}:${secret}`).toString("base64");
  const url = `${railAuthEndpoint()}?grant_type=client_credentials&scope=${encodeURIComponent(scopes())}`;
  const res = await fetch(url, { method: "POST", headers: { "Accept": "application/json", "Content-Type": "application/x-www-form-urlencoded", "Cache-Control": "no-cache", "Authorization": `Basic ${basic}` } });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`Rail auth failed (${res.status}): ${JSON.stringify(json)}`);
  const access_token = json.access_token as string | undefined;
  const expires_in = Number(json.expires_in ?? 900);
  if (!access_token) throw new Error("Rail auth response missing access_token.");
  cached = { token: access_token, expiresAt: Date.now() + expires_in * 1000 };
  return access_token;
}

function mockResponse(path: string, init?: RequestInit) {
  const headers = { "Content-Type": "application/json" };
  const body = typeof init?.body === "string" ? init.body : undefined;
  const parsedBody = body ? (() => { try { return JSON.parse(body); } catch { return undefined; } })() : undefined;
  if (path.includes("/status")) {
    const paymentIdFromPath = (() => {
      const parts = path.split("/").filter(Boolean);
      const statusIndex = parts.lastIndexOf("status");
      if (statusIndex > 0) return parts[statusIndex - 1];
      return parts.find(segment => segment.startsWith("mock_"));
    })();
    return new Response(JSON.stringify({ data: { id: parsedBody?.payment_id || paymentIdFromPath || `mock_${crypto.randomUUID()}`, status: "COMPLETED", updated_at: new Date().toISOString() } }), { status: 200, headers });
  }
  return new Response(JSON.stringify({ data: { ...parsedBody, id: `mock_${crypto.randomUUID()}`, status: "REQUESTED", created_at: new Date().toISOString() } }), { status: 200, headers });
}

export async function railFetch(path: string, init?: RequestInit) {
  if (railMockMode()) {
    return mockResponse(path, init);
  }
  const token = await getOAuthToken();
  const url = `${railApiBase()}${path.startsWith("/") ? path : `/${path}`}`;
  return fetch(url, {
    ...init,
    headers: {
      ...(init?.headers || {}),
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
      "Accept": "application/json"
    }
  });
}
