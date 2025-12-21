import { NextResponse } from "next/server";
import { railFetch } from "@/lib/rail";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const payment_id = url.searchParams.get("payment_id");
    if (!payment_id) return NextResponse.json({ error: "payment_id required" }, { status: 400 });

    const res = await railFetch(`/v1/payments/${encodeURIComponent(payment_id)}/status`, { method: "GET" });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) return NextResponse.json({ error: json?.error || json || "Rail status fetch failed" }, { status: res.status });
    return NextResponse.json(json);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
