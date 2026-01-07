import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

let cachedAdminClient: SupabaseClient | null = null;

function getSupabaseAdmin(): SupabaseClient {
  if (cachedAdminClient) {
    return cachedAdminClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !secretKey) {
    throw new Error(
      "Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY in your .env.local file."
    );
  }

  cachedAdminClient = createClient(supabaseUrl, secretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return cachedAdminClient;
}

export { getSupabaseAdmin as supabaseAdmin };

export async function isAuthor(userEmail: string): Promise<boolean> {
  const { data } = await supabaseAdmin()
    .from("authors")
    .select("id")
    .eq("email", userEmail)
    .single();

  return !!data;
}

export async function isAuthorByUserId(userId: string): Promise<boolean> {
  const { data: { user } } = await supabaseAdmin().auth.getUser(userId);
  if (!user?.email) return false;
  return isAuthor(user.email);
}

export function getAuthorEmails(): string[] {
  const emails = process.env.AUTHOR_EMAILS;
  return emails ? emails.split(",").map(e => e.trim()) : [];
}

export async function checkIsAuthor(userId: string): Promise<boolean> {
  const { data: { user } } = await supabaseAdmin().auth.getUser(userId);
  if (!user?.email) return false;

  const isInAllowlist = getAuthorEmails().includes(user.email);
  if (!isInAllowlist) return false;

  return isAuthor(user.email);
}
