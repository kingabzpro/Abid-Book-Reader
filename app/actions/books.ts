"use server";

import { getPublishedBooks, getBookBySlug, getChapterContent } from "@/lib/supabase/books";
import type { Book, Chapter } from "@/lib/markdown";

export async function getAllBooks(): Promise<Book[]> {
  const dbBooks = await getPublishedBooks();
  
  return dbBooks.map((dbBook) => ({
    id: dbBook.slug,
    meta: {
      title: dbBook.title,
      description: dbBook.description || "",
      author: dbBook.author_name,
      coverImage: dbBook.cover_image_url || undefined,
      publicChapterCount: dbBook.public_chapter_count,
    },
    chapters: dbBook.chapters.map((ch) => ({
      slug: ch.slug,
      title: ch.title,
      isPublic: ch.isPublic,
      content: "", // Will be loaded separately
    })),
  }));
}

export async function getBook(bookId: string): Promise<Book | null> {
  const dbBook = await getBookBySlug(bookId);
  
  if (!dbBook) return null;

  return {
    id: dbBook.slug,
    meta: {
      title: dbBook.title,
      description: dbBook.description || "",
      author: dbBook.author_name,
      coverImage: dbBook.cover_image_url || undefined,
      publicChapterCount: dbBook.public_chapter_count,
    },
    chapters: dbBook.chapters.map((ch) => ({
      slug: ch.slug,
      title: ch.title,
      isPublic: ch.isPublic,
      content: "",
    })),
  };
}

export async function getChapter(bookId: string, chapterSlug: string): Promise<Chapter | null> {
  const book = await getBook(bookId);
  if (!book) return null;

  return book.chapters.find((chapter) => chapter.slug === chapterSlug) || null;
}

export async function getChapterNavigation(
  bookId: string,
  chapterSlug: string
): Promise<{ prev: Chapter | null; next: Chapter | null } | null> {
  const book = await getBook(bookId);
  if (!book) return null;

  const currentIndex = book.chapters.findIndex(
    (chapter) => chapter.slug === chapterSlug
  );

  if (currentIndex === -1) return null;

  return {
    prev: book.chapters[currentIndex - 1] || null,
    next: book.chapters[currentIndex + 1] || null,
  };
}

export async function getChapterContentForReading(
  bookSlug: string,
  chapterSlug: string
): Promise<{ chapter: Chapter; content: string } | null> {
  const result = await getChapterContent(bookSlug, chapterSlug);
  
  if (!result) return null;

  return {
    chapter: {
      slug: result.chapter.slug,
      title: result.chapter.title,
      isPublic: result.chapter.isPublic,
      content: result.content,
    },
    content: result.content,
  };
}
