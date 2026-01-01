import { createClient } from "@/lib/supabase/client";

export interface ReadingProgress {
  user_id: string;
  book_id: string;
  chapter_slug: string;
  scroll_y: number;
  updated_at: string;
}

export async function saveReadingProgress(
  bookId: string,
  chapterSlug: string,
  scrollY: number = 0
): Promise<void> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return;
  }

  const { error } = await supabase
    .from("reading_progress")
    .upsert({
      user_id: user.id,
      book_id: bookId,
      chapter_slug: chapterSlug,
      scroll_y: scrollY,
    }, {
      onConflict: "user_id,book_id",
    });

  if (error) {
    console.error("Error saving reading progress:", error);
  }
}

export async function getReadingProgress(
  bookId: string
): Promise<ReadingProgress | null> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("reading_progress")
    .select("*")
    .eq("user_id", user.id)
    .eq("book_id", bookId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    console.error("Error fetching reading progress:", error);
    return null;
  }

  return data;
}

export async function getAllReadingProgress(): Promise<ReadingProgress[]> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("reading_progress")
    .select("*")
    .eq("user_id", user.id);

  if (error) {
    console.error("Error fetching all reading progress:", error);
    return [];
  }

  return data || [];
}
