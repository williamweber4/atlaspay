import { createClient } from "@supabase/supabase-js";
import { isSupabaseConfigured } from "@/lib/env";
export const supabase = isSupabaseConfigured()
  ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  : null;
