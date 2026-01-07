import { NextRequest, NextResponse } from "next/server";
import { getBookBySlug, getChapterContent } from "@/lib/supabase/books";
import { remark } from "remark";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookSlug = searchParams.get("bookSlug");
    const chapterSlug = searchParams.get("chapterSlug");

    console.log("=== Fetching chapter ===");
    console.log("Book slug:", bookSlug);
    console.log("Chapter slug:", chapterSlug);

    if (!bookSlug || !chapterSlug) {
      return NextResponse.json(
        { error: "Missing bookSlug or chapterSlug" },
        { status: 400 }
      );
    }

    const book = await getBookBySlug(bookSlug);
    if (!book) {
      console.log("Book not found for slug:", bookSlug);
      return NextResponse.json(
        { error: "Book not found" },
        { status: 404 }
      );
    }

    console.log("Book found:", {
      title: book.title,
      slug: book.slug,
      published: book.is_published,
      publicCount: book.public_chapter_count,
      chaptersCount: book.chapters.length
    });

    const chapter = book.chapters.find((ch) => ch.slug === chapterSlug);
    if (!chapter) {
      console.log("Chapter not found for slug:", chapterSlug);
      console.log("Available chapter slugs:", book.chapters.map((ch) => ch.slug));
      console.log("Available chapter titles:", book.chapters.map((ch) => ch.title));
      return NextResponse.json(
        { error: "Chapter not found" },
        { status: 404 }
      );
    }

    const chapterResult = await getChapterContent(bookSlug, chapterSlug);
    if (!chapterResult) {
      return NextResponse.json(
        { error: "Chapter content not found" },
        { status: 404 }
      );
    }

    const chapterIndex = book.chapters.findIndex((ch) => ch.slug === chapterSlug);
    const isPublic = chapterIndex < book.public_chapter_count;

    if (!isPublic) {
      return NextResponse.json(
        { error: "Premium content", premiumRequired: true },
        { status: 403 }
      );
    }

    const processedContent = await remark()
      .use(remarkGfm)
      .use(remarkRehype, { allowDangerousHtml: false })
      .use(rehypeSanitize)
      .use(rehypeStringify)
      .process(chapterResult.content);

    return NextResponse.json({
      book: {
        title: book.title,
        author: book.author_name,
        chapters: book.chapters,
      },
      chapter: {
        title: chapterResult.chapter.title,
        slug: chapterResult.chapter.slug,
      },
      content: processedContent.toString(),
      chapterIndex: book.chapters.findIndex((ch) => ch.slug === chapterSlug) - 1,
    });
  } catch (error) {
    console.error("Chapter fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
