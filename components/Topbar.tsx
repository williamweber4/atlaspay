"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui";
import { getCurrentUser, signOut } from "@/lib/auth";

export default function Topbar({ title }: { title: string }) {
  const [email, setEmail] = useState("");
  useEffect(() => { (async () => { const u = await getCurrentUser(); setEmail(u?.email ?? ""); })(); }, []);
  async function logout() { await signOut(); window.location.href = "/login"; }

  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-6">
      <div className="font-semibold">{title}</div>
      <div className="flex items-center gap-3">
        <div className="text-xs text-gray-600 hidden sm:block">{email}</div>
        <Button variant="ghost" onClick={() => (window.location.href = "/account")}>Account</Button>
        <Button variant="ghost" onClick={logout}>Logout</Button>
      </div>
    </header>
  );
}
