"use client";
import { useEffect, useState } from "react";
import { getCurrentUser } from "@/lib/auth";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    (async () => {
      const u = await getCurrentUser();
      setAuthed(Boolean(u));
      setReady(true);
      if (!u) window.location.href = "/login";
    })();
  }, []);

  if (!ready) return <div className="p-6 text-sm text-gray-600">Loading…</div>;
  if (!authed) return null;
  return <>{children}</>;
}
