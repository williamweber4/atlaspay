"use client";
import { useState } from "react";
import { signIn } from "@/lib/auth";
import { appName, isSupabaseConfigured } from "@/lib/env";
import { Button, Input } from "@/components/ui";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = e.target as HTMLFormElement;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;
    const res = await signIn(email, password);
    setLoading(false);
    if (!res.ok) setError(res.error || "Login failed.");
    else window.location.href = "/dashboard";
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm rounded-2xl border bg-white p-6 shadow-sm">
        <div className="text-center">
          <div className="text-2xl font-bold">{appName()}</div>
          <div className="mt-1 text-sm text-gray-600">{isSupabaseConfigured() ? "Sign in" : "Demo mode (no Supabase keys set)"}</div>
        </div>

        <div className="mt-6 space-y-3">
          <Input name="email" type="email" placeholder="Email" required />
          <Input name="password" type="password" placeholder="Password" required />
        </div>

        {error && <div className="mt-3 text-sm text-red-600">{error}</div>}

        <div className="mt-5">
          <Button className="w-full" type="submit" disabled={loading}>{loading ? "Signing in…" : "Sign In"}</Button>
        </div>

        <div className="mt-4 text-xs text-gray-500">Next: add contractors → send payment → track payout status.</div>
      </form>
    </div>
  );
}
