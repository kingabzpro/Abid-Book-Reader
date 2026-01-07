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

    const { bookId, title, slug, orderIndex, storagePath } = await request.json();

    console.log("=== Creating Chapter in API ===");
    console.log("Book ID:", bookId);
    console.log("Title:", title);
    console.log("Slug:", slug);
    console.log("Order index:", orderIndex);
    console.log("Storage path:", storagePath);

    if (!bookId || !title || !slug || orderIndex === undefined || !storagePath) {
      return NextResponse.json(
        { error: "Missing required fields: bookId, title, slug, orderIndex, storagePath" },
        { status: 400 }
      );
    }

    // Verify user owns the book
    const { data: book, error: bookError } = await supabaseAdmin()
      .from("books")
      .select("id, created_by")
      .eq("id", bookId)
      .single();

    if (bookError || !book) {
      return NextResponse.json(
        { error: "Book not found" },
        { status: 404 }
      );
    }

    if (book.created_by !== user.id) {
      return NextResponse.json(
        { error: "You don't have permission to add chapters to this book" },
        { status: 403 }
      );
    }

    // Check if chapter order already exists
    const { data: existingChapter } = await supabaseAdmin()
      .from("chapters")
      .select("id")
      .eq("book_id", bookId)
      .eq("order_index", orderIndex)
      .single();

    if (existingChapter) {
      return NextResponse.json(
        { error: "A chapter with this order already exists" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin()
      .from("chapters")
      .insert({
        book_id: bookId,
        title,
        slug,
        order_index: orderIndex,
        storage_path: storagePath,
      })
      .select("id, book_id, slug, title, order_index, storage_path, created_at")
      .single();

    if (error) {
      console.error("Error creating chapter:", error);
      return NextResponse.json(
        { error: error.message || "Failed to create chapter" },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Create chapter error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookId = searchParams.get("bookId");

    if (!bookId) {
      return NextResponse.json(
        { error: "Missing bookId parameter" },
        { status: 400 }
      );
    }

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

    // Verify user owns the book
    const { data: book } = await supabaseAdmin()
      .from("books")
      .select("created_by")
      .eq("id", bookId)
      .single();

    if (!book || book.created_by !== user.id) {
      return NextResponse.json(
        { error: "Book not found or access denied" },
        { status: 403 }
      );
    }

    const { data, error } = await supabaseAdmin()
      .from("chapters")
      .select("id, book_id, slug, title, order_index, storage_path, word_count, created_at, updated_at")
      .eq("book_id", bookId)
      .order("order_index", { ascending: true });

    if (error) {
      console.error("Error fetching chapters:", error);
      return NextResponse.json(
        { error: error.message || "Failed to fetch chapters" },
        { status: 500 }
      );
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error("Fetch chapters error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
