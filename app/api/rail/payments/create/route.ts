import { NextResponse } from "next/server";
import { railFetch } from "@/lib/rail";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body?.contractor?.id) return NextResponse.json({ error: "contractor is required" }, { status: 400 });
    if (!body?.amount || Number(body.amount) <= 0) return NextResponse.json({ error: "amount must be greater than zero" }, { status: 400 });

    const contractor = body.contractor;
    const payoutMethod = contractor.payoutMethod === "USDC" ? "CRYPTO" : "BANK";
    const payoutDetails = payoutMethod === "CRYPTO"
      ? { method: "CRYPTO", asset: body?.currency || "USDC", wallet_address: contractor.walletAddress }
      : { method: "BANK_TRANSFER", bank_name: contractor.bankName, account_last4: contractor.bankAccountLast4, country: contractor.country };

    if (payoutMethod === "CRYPTO" && !payoutDetails.wallet_address) {
      return NextResponse.json({ error: "wallet_address is required for USDC payouts" }, { status: 400 });
    }

    if (payoutMethod === "BANK" && !(contractor.bankName && contractor.bankAccountLast4)) {
      return NextResponse.json({ error: "bankName and bankAccountLast4 required for bank payouts" }, { status: 400 });
    }

    const payload = {
      reference: body?.memo || "AtlasPay payout",
      amount: body?.amount,
      currency: body?.currency,
      counterparty: {
        legal_name: contractor.legalName,
        country: contractor.country,
        alias: contractor.nickname
      },
      payout: payoutDetails,
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
