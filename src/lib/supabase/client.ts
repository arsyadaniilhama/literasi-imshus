"use client";

import { createBrowserClient } from "@supabase/ssr";

// Supabase client untuk Client Components.
export function createBrowserSupabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
