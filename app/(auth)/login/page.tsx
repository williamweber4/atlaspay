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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 px-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-lg space-y-6"
      >
        <div className="text-center space-y-1">
          <div className="text-2xl font-bold tracking-tight">{appName()}</div>
          <div className="text-sm text-gray-600">
            {isSupabaseConfigured() ? "Sign in to continue" : "Demo mode (no Supabase keys set)"}
          </div>
        </div>

        <div className="space-y-3">
          <Input name="email" type="email" placeholder="Email" required autoComplete="email" />
          <Input name="password" type="password" placeholder="Password" required autoComplete="current-password" />
        </div>

        {error && <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md p-2">{error}</div>}

        <Button className="w-full" type="submit" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </Button>

        <div className="text-xs text-gray-500 leading-5 text-center">
          Next: add contractors → send payment → track payout status. Demo data is stored locally in your browser.
        </div>
      </form>
    </div>
  );
}
