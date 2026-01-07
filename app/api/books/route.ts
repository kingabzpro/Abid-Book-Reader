import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getAuthorEmails } from "@/lib/supabase/admin";

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

    const body = await request.json();
    const { title, slug, description, authorName } = body;

    if (!title || !slug || !authorName) {
      return NextResponse.json(
        { error: "Missing required fields: title, slug, authorName" },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const { data: existingBook } = await supabaseAdmin()
      .from("books")
      .select("id")
      .eq("slug", slug)
      .single();

    if (existingBook) {
      return NextResponse.json(
        { error: "A book with this slug already exists" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin()
      .from("books")
      .insert({
        slug,
        title,
        description: description || null,
        author_name: authorName,
        created_by: user.id,
        is_published: false,
        public_chapter_count: 0,
      })
      .select("id, slug, title, description, author_name, is_published, public_chapter_count, created_at")
      .single();

    if (error) {
      console.error("Error creating book:", error);
      return NextResponse.json(
        { error: error.message || "Failed to create book" },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Create book error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
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

    const { data, error } = await supabaseAdmin()
      .from("books")
      .select("id, slug, title, description, author_name, cover_image_url, is_published, public_chapter_count, created_at, updated_at")
      .eq("created_by", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching books:", error);
      return NextResponse.json(
        { error: error.message || "Failed to fetch books" },
        { status: 500 }
      );
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error("Fetch books error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
