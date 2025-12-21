import { NextResponse } from "next/server";
import { railFetch } from "@/lib/rail";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const res = await railFetch("/v1/withdrawals", { method: "POST", body: JSON.stringify(body) });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) return NextResponse.json({ error: json?.error || json || "Rail create withdrawal failed" }, { status: res.status });
    return NextResponse.json(json);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
