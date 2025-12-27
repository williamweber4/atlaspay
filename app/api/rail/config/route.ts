import { NextResponse } from "next/server";
import { railApiBase, railCredentialsPresent, railEnvironment, railMockMode, railScopes } from "@/lib/rail";

export const runtime = "nodejs";

export function GET() {
  return NextResponse.json({
    env: railEnvironment(),
    apiBase: railApiBase(),
    scopes: railScopes(),
    mock: railMockMode(),
    credentialsPresent: railCredentialsPresent()
  });
}
