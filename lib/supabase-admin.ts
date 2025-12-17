import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const globalForSupabaseAdmin = globalThis as unknown as {
  supabaseAdmin?: SupabaseClient;
};

function getSupabaseUrl() {
  return process.env.SUPABASE_URL?.trim() || process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
}

export function getSupabaseAdminClient() {
  const url = getSupabaseUrl();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Missing SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) / SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  if (!globalForSupabaseAdmin.supabaseAdmin) {
    globalForSupabaseAdmin.supabaseAdmin = createClient(url, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  return globalForSupabaseAdmin.supabaseAdmin;
}

