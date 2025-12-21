import { supabase } from "@/lib/supabase";
import { isSupabaseConfigured } from "@/lib/env";
import { clearDemoUser, getDemoUser, setDemoUser } from "@/lib/demoAuth";

export type AppUser = { email: string; mode: "supabase" | "demo" };

export async function getCurrentUser(): Promise<AppUser | null> {
  if (typeof window === "undefined") return null;
  if (isSupabaseConfigured() && supabase) {
    const { data } = await supabase.auth.getSession();
    const email = data.session?.user?.email ?? null;
    return email ? { email, mode: "supabase" } : null;
  }
  const demo = getDemoUser();
  return demo?.email ? { email: demo.email, mode: "demo" } : null;
}

export async function signIn(email: string, password: string): Promise<{ ok: boolean; error?: string }> {
  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  }
  if (!email.includes("@")) return { ok: false, error: "Enter a valid email." };
  setDemoUser({ email });
  return { ok: true };
}

export async function signOut(): Promise<void> {
  if (isSupabaseConfigured() && supabase) { await supabase.auth.signOut(); return; }
  clearDemoUser();
}
