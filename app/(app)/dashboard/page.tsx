"use client";
import { useEffect, useState } from "react";
import Topbar from "@/components/Topbar";
import StatCard from "@/components/StatCard";
import { listContractors, listPayouts, seedDemoData } from "@/lib/store";

export default function DashboardPage() {
  const [contractorsCount, setContractorsCount] = useState(0);
  const [payoutsCount, setPayoutsCount] = useState(0);
  const [processingCount, setProcessingCount] = useState(0);

  useEffect(() => {
    seedDemoData();
    const contractors = listContractors();
    const payouts = listPayouts();
    setContractorsCount(contractors.length);
    setPayoutsCount(payouts.length);
    setProcessingCount(payouts.filter(p => ["submitted","processing"].includes(p.status)).length);
  }, []);

  return (
    <>
      <Topbar title="Dashboard" />
      <main className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard label="Contractors" value={String(contractorsCount)} />
          <StatCard label="Total payouts" value={String(payoutsCount)} />
          <StatCard label="In flight" value={String(processingCount)} />
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="font-semibold">Next steps</div>
          <ol className="mt-2 list-decimal pl-5 text-sm text-gray-700 space-y-1">
            <li>Go to <b>Contractors</b> and add the people/companies you pay.</li>
            <li>Go to <b>Send Payment</b> and create a payout (USDC or bank transfer).</li>
            <li>Track status in <b>Payouts</b>.</li>
          </ol>
          <div className="mt-3 text-xs text-gray-500">
            Rail integration is wired through <code>/api/rail/*</code> and runs in mock mode by default.
          </div>
        </div>
      </main>
    </>
  );
}
