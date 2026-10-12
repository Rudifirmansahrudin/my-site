// lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && key);

// Placeholder biar build gak error kalau .env.local belum diisi
export const supabase = createClient(url || "https://placeholder.supabase.co", key || "placeholder-key");
