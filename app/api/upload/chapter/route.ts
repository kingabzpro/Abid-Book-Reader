import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getAuthorEmails } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    const { data: { user } } = await supabaseAdmin().auth.getUser(
      authHeader?.replace("Bearer ", "")
    );

    if (!user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAuthor = getAuthorEmails().includes(user.email);
    if (!isAuthor) {
      return NextResponse.json({ error: "Not an author" }, { status: 403 });
    }

    const { bookSlug, chapterSlug, filename } = await request.json();

    if (!bookSlug || !chapterSlug || !filename) {
      return NextResponse.json(
        { error: "Missing required fields: bookSlug, chapterSlug, filename" },
        { status: 400 }
      );
    }

    // Validate filename extension
    if (!filename.toLowerCase().endsWith(".md")) {
      return NextResponse.json(
        { error: "Only .md files are allowed" },
        { status: 400 }
      );
    }

    // Validate chapter slug format
    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(chapterSlug)) {
      return NextResponse.json(
        { error: "Chapter slug can only contain lowercase letters, numbers, and hyphens" },
        { status: 400 }
      );
    }

    const storagePath = `books/${bookSlug}/chapters/${chapterSlug}.md`;

    // Check if file already exists and delete it
    const { error: removeError } = await supabaseAdmin().storage
      .from("books")
      .remove([storagePath]);

    if (removeError && !removeError.message?.includes("not found")) {
      console.error("Error removing existing file:", removeError);
      return NextResponse.json(
        { error: "Failed to prepare upload" },
        { status: 500 }
      );
    }

    const { data, error } = await supabaseAdmin().storage
      .from("books")
      .createSignedUploadUrl(storagePath);

    if (error) {
      console.error("Error creating signed upload URL:", error);
      return NextResponse.json(
        { error: `Failed to create upload URL: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      signedUrl: data.signedUrl,
      path: storagePath,
    });
  } catch (error) {
    console.error("Upload URL error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
