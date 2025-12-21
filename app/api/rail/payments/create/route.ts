import { NextResponse } from "next/server";
import { railFetch } from "@/lib/rail";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const payload = {
      reference: body?.memo || "AtlasPay payout",
      amount: body?.amount,
      currency: body?.currency,
      metadata: {
        contractor_nickname: body?.contractor?.nickname,
        contractor_country: body?.contractor?.country,
        payout_method: body?.contractor?.payoutMethod
      }
    };

    const res = await railFetch("/v1/payments", { method: "POST", body: JSON.stringify(payload) });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) return NextResponse.json({ error: json?.error || json || "Rail create payment failed" }, { status: res.status });
    return NextResponse.json(json);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
