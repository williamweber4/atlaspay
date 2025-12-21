type RailEnv = "sandbox" | "production";
function railEnv(): RailEnv { return (process.env.RAIL_ENV as RailEnv) || "sandbox"; }
function railApiBase(): string { return railEnv() === "production" ? "https://layer2financial.com/api" : "https://sandbox.layer2financial.com/api"; }
function railAuthEndpoint(): string {
  return railEnv() === "production"
    ? "https://auth.layer2financial.com/oauth2/ausj0isa571aIN3mL696/v1/token"
    : "https://auth.layer2financial.com/oauth2/ausbdqlx69rH6OjWd696/v1/token";
}
function scopes(): string { return (process.env.RAIL_SCOPES || "payments:read payments:write").trim().replace(/\s+/g, " "); }

let cached: { token: string; expiresAt: number } | null = null;

async function getOAuthToken(): Promise<string> {
  if (process.env.RAIL_MOCK === "true") return "mock-token";
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

export async function railFetch(path: string, init?: RequestInit) {
  if (process.env.RAIL_MOCK === "true") {
    return { ok: true, status: 200, json: async () => ({ data: { id: "mock_" + crypto.randomUUID(), status: "REQUESTED" } }) } as Response;
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
