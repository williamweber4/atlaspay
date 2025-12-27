import { NextRequest, NextResponse } from "next/server";
import { railFetch } from "@/lib/rail";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const paymentId = req.nextUrl.searchParams.get("payment_id");
  if (!paymentId) return NextResponse.json({ error: "payment_id is required" }, { status: 400 });

  try {
    const res = await railFetch(`/v1/payments/${encodeURIComponent(paymentId)}/status`, { method: "GET" });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) return NextResponse.json({ error: json?.error || "Rail request failed", details: json }, { status: res.status });
    return NextResponse.json(json);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Unexpected error" }, { status: 500 });
  }
}
