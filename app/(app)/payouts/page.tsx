"use client";

import { useEffect, useMemo, useState } from "react";
import Topbar from "@/components/Topbar";
import { Button, Input } from "@/components/ui";
import { Contractor, Payout, listContractors, listPayouts, savePayouts } from "@/lib/store";
import { Table, Th, Td } from "@/components/Table";

async function refreshRailStatus(railPaymentId: string) {
  const res = await fetch(`/api/rail/payments/status?payment_id=${encodeURIComponent(railPaymentId)}`);
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error || "Status fetch failed");
  return json;
}

export default function PayoutsPage() {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [query, setQuery] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => { setPayouts(listPayouts()); setContractors(listContractors()); }, []);

  const contractorById = useMemo(() => {
    const m = new Map<string, Contractor>();
    contractors.forEach(c => m.set(c.id, c));
    return m;
  }, [contractors]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return payouts;
    return payouts.filter(p => {
      const c = contractorById.get(p.contractorId);
      return (
        String(p.amount).includes(q) ||
        (p.currency || "").toLowerCase().includes(q) ||
        (p.status || "").toLowerCase().includes(q) ||
        (c?.nickname || "").toLowerCase().includes(q) ||
        (c?.legalName || "").toLowerCase().includes(q) ||
        (p.railPaymentId || "").toLowerCase().includes(q)
      );
    });
  }, [payouts, query, contractorById]);

  function updatePayout(id: string, patch: Partial<Payout>) {
    const next = payouts.map(p => (p.id === id ? { ...p, ...patch } : p));
    setPayouts(next);
    savePayouts(next);
  }

  async function checkStatus(p: Payout) {
    if (!p.railPaymentId) return;
    setLoadingId(p.id);
    try {
      const res = await refreshRailStatus(p.railPaymentId);
      const status = res?.data?.status || res?.status || "REQUESTED";
      updatePayout(p.id, { status: (String(status).toLowerCase() as any) });
    } catch (e: any) {
      alert(e?.message || "Failed to refresh status");
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <>
      <Topbar title="Payouts" />
      <main className="p-6 space-y-4">
        <div className="max-w-sm"><Input placeholder="Search payouts…" value={query} onChange={(e) => setQuery(e.target.value)} /></div>

        <Table>
          <thead><tr><Th>Date</Th><Th>Contractor</Th><Th>Amount</Th><Th>Status</Th><Th>Rail ID</Th><Th className="text-right">Actions</Th></tr></thead>
          <tbody>
            {filtered.map(p => {
              const c = contractorById.get(p.contractorId);
              return (
                <tr key={p.id}>
                  <Td>{new Date(p.createdAt).toLocaleString()}</Td>
                  <Td className="font-medium">{c?.nickname || "Unknown"}</Td>
                  <Td>{p.amount} {p.currency}</Td>
                  <Td>{p.status}</Td>
                  <Td className="font-mono text-xs">{p.railPaymentId || "-"}</Td>
                  <Td className="text-right">
                    {p.railPaymentId ? (
                      <Button variant="ghost" onClick={() => checkStatus(p)} disabled={loadingId === p.id}>{loadingId === p.id ? "Checking…" : "Refresh"}</Button>
                    ) : <span className="text-xs text-gray-500">—</span>}
                  </Td>
                </tr>
              );
            })}
            {filtered.length === 0 && <tr><Td colSpan={6} className="text-gray-500">No payouts yet. Create one in “Send Payment”.</Td></tr>}
          </tbody>
        </Table>
      </main>
    </>
  );
}
