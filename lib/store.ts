export type Contractor = {
  id: string;
  nickname: string;
  legalName: string;
  country: string;
  payoutMethod: "USDC" | "Bank";
  walletAddress?: string;
  bankName?: string;
  bankAccountLast4?: string;
  notes?: string;
  createdAt: string;
};

export type Payout = {
  id: string;
  contractorId: string;
  amount: number;
  currency: "USD" | "USDC";
  memo?: string;
  status: "draft" | "submitted" | "processing" | "completed" | "failed";
  railPaymentId?: string;
  createdAt: string;
};

const CONTRACTORS_KEY = "atlaspay_contractors_v1";
const PAYOUTS_KEY = "atlaspay_payouts_v1";

function safeParse<T>(raw: string | null, fallback: T): T { try { return raw ? (JSON.parse(raw) as T) : fallback; } catch { return fallback; } }

export function listContractors(): Contractor[] { if (typeof window === "undefined") return []; return safeParse<Contractor[]>(localStorage.getItem(CONTRACTORS_KEY), []); }
export function saveContractors(items: Contractor[]) { localStorage.setItem(CONTRACTORS_KEY, JSON.stringify(items)); }
export function upsertContractor(c: Contractor) { const list = listContractors(); const idx = list.findIndex(x => x.id === c.id); if (idx >= 0) list[idx] = c; else list.unshift(c); saveContractors(list); }
export function deleteContractor(id: string) { saveContractors(listContractors().filter(x => x.id !== id)); }

export function listPayouts(): Payout[] { if (typeof window === "undefined") return []; return safeParse<Payout[]>(localStorage.getItem(PAYOUTS_KEY), []); }
export function savePayouts(items: Payout[]) { localStorage.setItem(PAYOUTS_KEY, JSON.stringify(items)); }
export function upsertPayout(p: Payout) { const list = listPayouts(); const idx = list.findIndex(x => x.id === p.id); if (idx >= 0) list[idx] = p; else list.unshift(p); savePayouts(list); }
export function seedDemoData() {
  if (typeof window === "undefined") return;
  const c = listContractors(); if (c.length) return;
  const now = new Date().toISOString();
  saveContractors([
    { id: crypto.randomUUID(), nickname: "Shenzhen Design", legalName: "Shenzhen Design Studio Co., Ltd.", country: "CN", payoutMethod: "USDC", walletAddress: "0x0000000000000000000000000000000000000000", notes: "Preferred: USDC", createdAt: now },
    { id: crypto.randomUUID(), nickname: "Guangzhou QC", legalName: "Guangzhou Quality Partners", country: "CN", payoutMethod: "Bank", bankName: "ICBC", bankAccountLast4: "1234", notes: "Bank transfer", createdAt: now }
  ]);
}
