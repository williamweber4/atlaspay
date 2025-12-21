"use client";
import { useEffect, useState } from "react";
import Topbar from "@/components/Topbar";
import { Button, Card } from "@/components/ui";
import { getCurrentUser, signOut } from "@/lib/auth";

export default function AccountPage() {
  const [email, setEmail] = useState("");
  useEffect(() => { (async () => { const u = await getCurrentUser(); setEmail(u?.email ?? ""); })(); }, []);
  async function logout(){ await signOut(); window.location.href="/login"; }

  return (
    <>
      <Topbar title="Account" />
      <main className="p-6 space-y-6">
        <Card title="User">
          <div className="text-sm text-gray-700"><div><b>Email:</b> {email || "-"}</div></div>
          <div className="mt-4"><Button onClick={logout} variant="danger">Logout</Button></div>
        </Card>

        <Card title="Notes">
          <div className="text-sm text-gray-700 space-y-2">
            <div>This is an MVP dashboard scaffold. Contractor + payout data is stored locally.</div>
            <div>Next: move contractors/payouts into Supabase tables and map the “Send Payment” payload to Rail’s <code className="mx-1">/v1/payments</code> schema.</div>
          </div>
        </Card>
      </main>
    </>
  );
}
