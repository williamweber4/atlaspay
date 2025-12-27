"use client";

import { useEffect, useMemo, useState } from "react";
import Topbar from "@/components/Topbar";
import { Button, Card, Input, Select } from "@/components/ui";
import { Contractor, Payout, listContractors, seedDemoData, upsertPayout } from "@/lib/store";

async function createRailPayment(payload: any) {
  const res = await fetch("/api/rail/payments/create", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error || "Rail request failed");
  return json;
}

export default function SendPaymentPage() {
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [contractorId, setContractorId] = useState("");
  const [amount, setAmount] = useState("100");
  const [currency, setCurrency] = useState<"USD" | "USDC">("USDC");
  const [memo, setMemo] = useState("Invoice #");
  const [status, setStatus] = useState<string | null>(null);
  const [railConfig, setRailConfig] = useState<any>(null);
  const [configError, setConfigError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    seedDemoData();
    const list = listContractors();
    setContractors(list);
    if (list[0]) setContractorId(list[0].id);

    fetch("/api/rail/config")
      .then(res => res.json())
      .then(setRailConfig)
      .catch(() => setConfigError("Unable to load Rail config"));
  }, []);

  const selected = useMemo(() => contractors.find(c => c.id === contractorId) || null, [contractors, contractorId]);

  async function submit() {
    if (!selected) return;
    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0) return alert("Enter a valid amount.");

    if (railConfig && !railConfig.mock && !railConfig.credentialsPresent) {
      return alert("Rail credentials are missing. Set RAIL_CLIENT_ID/RAIL_CLIENT_SECRET or enable RAIL_MOCK=true.");
    }

    setLoading(true);
    setStatus(null);

    const payout: Payout = { id: crypto.randomUUID(), contractorId: selected.id, amount: amt, currency, memo, status: "draft", createdAt: new Date().toISOString() };
    upsertPayout(payout);

    try {
      const railRes = await createRailPayment({ contractor: selected, amount: amt, currency, memo });
      const railPaymentId = railRes?.data?.id || railRes?.id;
      upsertPayout({ ...payout, status: "submitted", railPaymentId });
      setStatus(`Submitted. Rail payment id: ${railPaymentId}`);
    } catch (e: any) {
      upsertPayout({ ...payout, status: "failed" });
      setStatus(`Failed: ${e?.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Topbar title="Send Payment" />
      <main className="p-6 space-y-6">
        <Card title="Create a payout">
          <div className="rounded-lg border bg-gray-50 p-3 text-sm text-gray-700">
            <div className="font-medium">Rail connectivity</div>
            {railConfig ? (
              <ul className="mt-1 list-disc pl-4 space-y-1 text-sm">
                <li>Environment: <b>{railConfig.env}</b> {railConfig.mock && <span className="text-amber-600">(mock mode)</span>}</li>
                <li>API base: {railConfig.apiBase}</li>
                <li>Scopes: {railConfig.scopes}</li>
                <li>Credentials: {railConfig.credentialsPresent ? "present" : "missing"}</li>
              </ul>
            ) : <div className="text-red-700">{configError || "Loading Rail config…"}</div>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-gray-600 mb-1">Contractor</div>
              <Select value={contractorId} onChange={(e) => setContractorId(e.target.value)}>
                {contractors.map(c => <option key={c.id} value={c.id}>{c.nickname} ({c.country}) • {c.payoutMethod}</option>)}
              </Select>
            </div>

            <div>
              <div className="text-xs text-gray-600 mb-1">Currency</div>
              <Select value={currency} onChange={(e) => setCurrency(e.target.value as any)}>
                <option value="USDC">USDC</option>
                <option value="USD">USD</option>
              </Select>
            </div>

            <div>
              <div className="text-xs text-gray-600 mb-1">Amount</div>
              <Input value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>

            <div>
              <div className="text-xs text-gray-600 mb-1">Memo</div>
              <Input value={memo} onChange={(e) => setMemo(e.target.value)} />
            </div>

            <div className="md:col-span-2 rounded-lg border bg-gray-50 p-3 text-sm text-gray-700">
              {selected ? (
                <div className="space-y-1">
                  <div><b>Paying:</b> {selected.legalName}</div>
                  <div><b>Method:</b> {selected.payoutMethod}</div>
                  {selected.payoutMethod === "USDC" ? <div><b>Wallet:</b> {selected.walletAddress}</div> : <div><b>Bank:</b> {selected.bankName} • ****{selected.bankAccountLast4}</div>}
                </div>
              ) : <div>No contractor selected.</div>}
            </div>

            <div className="md:col-span-2 flex items-center gap-3">
              <Button onClick={submit} disabled={loading || contractors.length === 0}>{loading ? "Submitting…" : "Send payment"}</Button>
              <div className="text-xs text-gray-500">Uses <code>/api/rail/payments/create</code>. Mock mode is on by default.</div>
            </div>

            {status && <div className="md:col-span-2 text-sm">{status}</div>}
          </div>
        </Card>
      </main>
    </>
  );
}
