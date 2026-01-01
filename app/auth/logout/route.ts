import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  console.log("Logout - URL:", supabaseUrl ? "***" : "undefined");
  console.log("Logout - Key:", supabaseKey ? "***" + supabaseKey.slice(-4) : "undefined");

  // Skip logout if Supabase is not configured
  if (!supabaseUrl || !supabaseKey || supabaseUrl === "https://placeholder.supabase.co") {
    console.log("Supabase not configured, redirecting to home");
    redirect("/");
  }

  try {
    const supabase = createSupabaseClient(supabaseUrl, supabaseKey);
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.log("Sign out error:", error.message);
    } else {
      console.log("Sign out successful");
    }
    
    revalidatePath("/", "layout");
    redirect("/");
  } catch (err) {
    console.error("Logout error:", err);
    redirect("/");
  }
}
