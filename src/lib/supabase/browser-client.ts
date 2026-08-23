"use client";

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Browser Supabase client — RLS aktif. JANGAN pernah taruh service role key di sini.
export const browserSupabase = createClient(supabaseUrl, supabaseAnonKey);
