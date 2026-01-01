import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

// Create a mock Supabase client for development without configuration
function createMockClient(): SupabaseClient {
  return {
    auth: {
      signInWithPassword: async () => ({ error: { message: "Supabase not configured" } }),
      signUp: async () => ({ error: { message: "Supabase not configured" } }),
      signOut: async () => ({ error: null, data: null }),
      getSession: async () => ({ data: { session: null }, error: null }),
      getUser: async () => ({ data: { user: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {}, id: "" } } }),
      refreshSession: async () => ({ error: null, data: { session: null } }),
    },
    from: () => createMockClient(),
  } as any;
}

export function createClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Check if environment variables are properly set (not placeholders)
  const isPlaceholder = !supabaseUrl ||
    !supabaseKey ||
    supabaseUrl === "https://placeholder.supabase.co" ||
    supabaseKey === "placeholder_key";

  if (isPlaceholder || !supabaseUrl || !supabaseKey) {
    console.warn("Supabase environment variables not configured. Update your .env.local file.");
    return createMockClient();
  }

  return createSupabaseClient(supabaseUrl, supabaseKey);
}
