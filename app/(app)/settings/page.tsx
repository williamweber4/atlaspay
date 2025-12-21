"use client";

import { useEffect, useState } from "react";
import Topbar from "@/components/Topbar";
import { Button, Card, Input, Select } from "@/components/ui";

type Settings = { companyName: string; defaultCurrency: "USD" | "USDC"; extraFeeBps: string; railEnv: "sandbox" | "production"; };
const KEY = "atlaspay_settings_v1";

function loadSettings(): Settings {
  if (typeof window === "undefined") return { companyName: "AtlasPay", defaultCurrency: "USDC", extraFeeBps: "20", railEnv: "sandbox" };
  try { const raw = localStorage.getItem(KEY); return raw ? (JSON.parse(raw) as Settings) : { companyName: "AtlasPay", defaultCurrency: "USDC", extraFeeBps: "20", railEnv: "sandbox" }; } catch { return { companyName: "AtlasPay", defaultCurrency: "USDC", extraFeeBps: "20", railEnv: "sandbox" }; }
}

export default function SettingsPage() {
  const [s, setS] = useState<Settings>(loadSettings());
  const [saved, setSaved] = useState<string | null>(null);

  useEffect(() => setS(loadSettings()), []);

  function save() { localStorage.setItem(KEY, JSON.stringify(s)); setSaved("Saved."); setTimeout(() => setSaved(null), 2000); }

  return (
    <>
      <Topbar title="Settings" />
      <main className="p-6 space-y-6">
        <Card title="Business">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><div className="text-xs text-gray-600 mb-1">Company name</div><Input value={s.companyName} onChange={(e) => setS({ ...s, companyName: e.target.value })} /></div>
            <div><div className="text-xs text-gray-600 mb-1">Default currency</div>
              <Select value={s.defaultCurrency} onChange={(e) => setS({ ...s, defaultCurrency: e.target.value as any })}>
                <option value="USDC">USDC</option><option value="USD">USD</option>
              </Select>
            </div>
          </div>
        </Card>

        <Card title="Pricing (your markup)">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-gray-600 mb-1">Your fee (bps)</div>
              <Input value={s.extraFeeBps} onChange={(e) => setS({ ...s, extraFeeBps: e.target.value })} />
              <div className="mt-2 text-xs text-gray-500">Example: 20 bps = 0.20% added on top of Rail fees.</div>
            </div>
          </div>
        </Card>

        <Card title="Rail integration">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-gray-600 mb-1">Environment (display only)</div>
              <Select value={s.railEnv} onChange={(e) => setS({ ...s, railEnv: e.target.value as any })}>
                <option value="sandbox">sandbox</option><option value="production">production</option>
              </Select>
              <div className="mt-2 text-xs text-gray-500">Actual Rail env comes from <code>RAIL_ENV</code> in server env vars.</div>
            </div>
          </div>
        </Card>

        <div className="flex items-center gap-3"><Button onClick={save}>Save settings</Button>{saved && <div className="text-sm text-green-700">{saved}</div>}</div>
      </main>
    </>
  );
}
