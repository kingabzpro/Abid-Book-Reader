"use server";

import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { Book, Chapter, BookMeta } from "@/lib/markdown";

const CONTENT_DIR = path.join(process.cwd(), "content", "books");

export async function getBook(bookId: string): Promise<Book | null> {
  const bookPath = path.join(CONTENT_DIR, bookId);

  if (!fs.existsSync(bookPath)) {
    return null;
  }

  const metaPath = path.join(bookPath, "meta.json");
  if (!fs.existsSync(metaPath)) {
    return null;
  }

  const metaContent = fs.readFileSync(metaPath, "utf-8");
  const meta: BookMeta = JSON.parse(metaContent);

  const chaptersDir = path.join(bookPath);
  const chapterFiles = fs.readdirSync(chaptersDir)
    .filter(file => file.endsWith(".md") && file !== "README.md")
    .sort();

  const chapters: Chapter[] = chapterFiles.map((file, index) => {
    const filePath = path.join(chaptersDir, file);
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(fileContent);

    const slug = file.replace(".md", "");
    const isPublic = index < meta.publicChapterCount;
    const title = (data.title as string) || slugToTitle(slug);

    return {
      slug,
      title,
      isPublic,
      content,
    };
  });

  return {
    id: bookId,
    meta,
    chapters,
  };
}

export async function getAllBooks(): Promise<Book[]> {
  if (!fs.existsSync(CONTENT_DIR)) {
    return [];
  }

  const bookIds = fs.readdirSync(CONTENT_DIR);
  const books: Book[] = [];

  for (const bookId of bookIds) {
    const book = await getBook(bookId);
    if (book) {
      books.push(book);
    }
  }

  return books;
}

export async function getChapter(bookId: string, chapterSlug: string): Promise<Chapter | null> {
  const book = await getBook(bookId);
  if (!book) {
    return null;
  }

  return book.chapters.find(chapter => chapter.slug === chapterSlug) || null;
}

export async function getChapterNavigation(
  bookId: string,
  chapterSlug: string
): Promise<{ prev: Chapter | null; next: Chapter | null } | null> {
  const book = await getBook(bookId);
  if (!book) {
    return null;
  }

  const currentIndex = book.chapters.findIndex(
    chapter => chapter.slug === chapterSlug
  );

  if (currentIndex === -1) {
    return null;
  }

  return {
    prev: book.chapters[currentIndex - 1] || null,
    next: book.chapters[currentIndex + 1] || null,
  };
}

function slugToTitle(slug: string): string {
  return slug
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
