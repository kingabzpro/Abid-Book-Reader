import { createClient } from "@/lib/supabase/client";

export interface ReaderSettings {
  user_id: string;
  theme: string;
  font_size: number;
  line_height: number;
  updated_at: string;
}

export async function saveReaderSettings(settings: {
  theme?: string;
  font_size?: number;
  line_height?: number;
}): Promise<void> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return;
  }

  const { data: existing } = await supabase
    .from("reader_settings")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (existing) {
    const { error } = await supabase
      .from("reader_settings")
      .update(settings)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error updating reader settings:", error);
    }
  } else {
    const { error } = await supabase
      .from("reader_settings")
      .insert({
        user_id: user.id,
        ...settings,
      });

    if (error) {
      console.error("Error saving reader settings:", error);
    }
  }
}

export async function getReaderSettings(): Promise<ReaderSettings | null> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("reader_settings")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    console.error("Error fetching reader settings:", error);
    return null;
  }

  return data;
}
