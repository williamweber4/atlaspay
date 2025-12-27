import { NextRequest, NextResponse } from "next/server";
import { railFetch } from "@/lib/rail";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { contractor, amount, currency, memo } = body || {};

    if (!contractor || typeof amount === "undefined" || !currency) {
      return NextResponse.json({ error: "Missing contractor, amount, or currency." }, { status: 400 });
    }

    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return NextResponse.json({ error: "Amount must be a positive number." }, { status: 400 });
    }

    const payload = {
      amount: numericAmount,
      currency,
      memo: memo || `Payment to ${contractor?.nickname || contractor?.legalName || "contractor"}`,
      counterparty: {
        name: contractor?.legalName || contractor?.nickname,
        country: contractor?.country,
        payout_method: contractor?.payoutMethod,
        wallet_address: contractor?.walletAddress,
        bank: contractor?.payoutMethod === "Bank" ? {
          name: contractor?.bankName,
          account_last4: contractor?.bankAccountLast4
        } : undefined
      }
    };

    const res = await railFetch("/v1/payments", { method: "POST", body: JSON.stringify(payload) });
    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      return NextResponse.json({ error: json?.error || "Rail request failed", details: json }, { status: res.status });
    }

    return NextResponse.json(json);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Unexpected error" }, { status: 500 });
  }
}
