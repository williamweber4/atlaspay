"use client";

import { useEffect, useMemo, useState } from "react";
import Topbar from "@/components/Topbar";
import { Button, Card, Input, Select } from "@/components/ui";
import { Contractor, deleteContractor, listContractors, seedDemoData, upsertContractor } from "@/lib/store";
import { Table, Th, Td } from "@/components/Table";

function emptyContractor(): Contractor {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    nickname: "",
    legalName: "",
    country: "CN",
    payoutMethod: "USDC",
    walletAddress: "",
    bankName: "",
    bankAccountLast4: "",
    notes: "",
    createdAt: now
  };
}

export default function ContractorsPage() {
  const [items, setItems] = useState<Contractor[]>([]);
  const [editing, setEditing] = useState<Contractor | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    seedDemoData();
    setItems(listContractors());
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(c =>
      [c.nickname, c.legalName, c.country].some(v => (v || "").toLowerCase().includes(q))
    );
  }, [items, query]);

  function refresh() { setItems(listContractors()); }
  function startAdd() { setEditing(emptyContractor()); }
  function startEdit(c: Contractor) { setEditing({ ...c }); }
  function remove(id: string) { if (!confirm("Delete contractor?")) return; deleteContractor(id); refresh(); }

  function save() {
    if (!editing) return;
    if (!editing.nickname.trim() || !editing.legalName.trim()) return alert("Nickname and Legal name are required.");
    if (editing.payoutMethod === "USDC" && !editing.walletAddress?.trim()) return alert("Wallet address required for USDC payouts.");
    upsertContractor(editing);
    setEditing(null);
    refresh();
  }

  return (
    <>
      <Topbar title="Contractors" />
      <main className="p-6 space-y-6">
        <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div className="w-full md:max-w-sm">
            <Input placeholder="Search contractors…" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <Button onClick={startAdd}>Add contractor</Button>
        </div>

        <Table>
          <thead><tr><Th>Nickname</Th><Th>Legal name</Th><Th>Country</Th><Th>Method</Th><Th className="text-right">Actions</Th></tr></thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id}>
                <Td className="font-medium">{c.nickname}</Td>
                <Td>{c.legalName}</Td>
                <Td>{c.country}</Td>
                <Td>{c.payoutMethod}</Td>
                <Td className="text-right space-x-2">
                  <Button variant="ghost" onClick={() => startEdit(c)}>Edit</Button>
                  <Button variant="danger" onClick={() => remove(c.id)}>Delete</Button>
                </Td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><Td className="text-gray-500" colSpan={5}>No contractors yet.</Td></tr>}
          </tbody>
        </Table>

        {editing && (
          <Card title={items.some(x => x.id === editing.id) ? "Edit contractor" : "New contractor"} right={
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
              <Button onClick={save}>Save</Button>
            </div>
          }>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><div className="text-xs text-gray-600 mb-1">Nickname</div><Input value={editing.nickname} onChange={(e) => setEditing({ ...editing, nickname: e.target.value })} /></div>
              <div><div className="text-xs text-gray-600 mb-1">Legal name</div><Input value={editing.legalName} onChange={(e) => setEditing({ ...editing, legalName: e.target.value })} /></div>
              <div><div className="text-xs text-gray-600 mb-1">Country (ISO)</div><Input value={editing.country} onChange={(e) => setEditing({ ...editing, country: e.target.value.toUpperCase() })} /></div>
              <div><div className="text-xs text-gray-600 mb-1">Payout method</div>
                <Select value={editing.payoutMethod} onChange={(e) => setEditing({ ...editing, payoutMethod: e.target.value as any })}>
                  <option value="USDC">USDC (wallet)</option>
                  <option value="Bank">Bank transfer</option>
                </Select>
              </div>

              {editing.payoutMethod === "USDC" ? (
                <div className="md:col-span-2">
                  <div className="text-xs text-gray-600 mb-1">Wallet address</div>
                  <Input value={editing.walletAddress || ""} onChange={(e) => setEditing({ ...editing, walletAddress: e.target.value })} />
                </div>
              ) : (
                <>
                  <div><div className="text-xs text-gray-600 mb-1">Bank name</div><Input value={editing.bankName || ""} onChange={(e) => setEditing({ ...editing, bankName: e.target.value })} /></div>
                  <div><div className="text-xs text-gray-600 mb-1">Account last 4</div><Input value={editing.bankAccountLast4 || ""} onChange={(e) => setEditing({ ...editing, bankAccountLast4: e.target.value })} /></div>
                </>
              )}

              <div className="md:col-span-2"><div className="text-xs text-gray-600 mb-1">Notes</div><Input value={editing.notes || ""} onChange={(e) => setEditing({ ...editing, notes: e.target.value })} /></div>
            </div>
          </Card>
        )}
      </main>
    </>
  );
}
