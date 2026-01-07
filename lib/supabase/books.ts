import { supabaseAdmin } from "./admin";

export interface BookWithChapters {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  author_name: string;
  cover_image_url: string | null;
  is_published: boolean;
  public_chapter_count: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  chapters: ChapterInfo[];
}

export interface ChapterInfo {
  id: string;
  slug: string;
  title: string;
  order_index: number;
  isPublic: boolean;
  storage_path: string;
}

interface RawBook {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  author_name: string;
  cover_image_url: string | null;
  is_published: boolean;
  public_chapter_count: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

interface RawChapter {
  id: string;
  book_id: string;
  slug: string;
  title: string;
  order_index: number;
  storage_path: string;
  word_count: number | null;
  created_at: string;
  updated_at: string;
}

function mapBookToBookWithChapters(book: RawBook, chapters: RawChapter[]): BookWithChapters {
  const sortedChapters = [...chapters].sort((a, b) => a.order_index - b.order_index);
  return {
    ...book,
    chapters: sortedChapters.map((ch) => ({
      ...ch,
      isPublic: ch.order_index < book.public_chapter_count,
    })),
  };
}

function mapRawToBook(data: Record<string, unknown>): RawBook {
  return {
    id: data.id as string,
    slug: data.slug as string,
    title: data.title as string,
    description: data.description as string | null,
    author_name: data.author_name as string,
    cover_image_url: data.cover_image_url as string | null,
    is_published: Boolean(data.is_published),
    public_chapter_count: Number(data.public_chapter_count),
    created_by: data.created_by as string | null,
    created_at: data.created_at as string,
    updated_at: data.updated_at as string,
  };
}

function mapRawToChapter(data: Record<string, unknown>): RawChapter {
  return {
    id: data.id as string,
    book_id: data.book_id as string,
    slug: data.slug as string,
    title: data.title as string,
    order_index: Number(data.order_index),
    storage_path: data.storage_path as string,
    word_count: data.word_count ? Number(data.word_count) : null,
    created_at: data.created_at as string,
    updated_at: data.updated_at as string,
  };
}

export async function getPublishedBooks(): Promise<BookWithChapters[]> {
  const { data: booksData, error: booksError } = await supabaseAdmin()
    .from("books")
    .select("id, slug, title, description, author_name, cover_image_url, is_published, public_chapter_count, created_by, created_at, updated_at")
    .eq("is_published", "true")
    .order("created_at", { ascending: false });

  if (booksError || !booksData) {
    console.error("Error fetching published books:", booksError);
    return [];
  }

  const books = booksData.map(mapRawToBook);

  if (books.length === 0) {
    return [];
  }

  const bookIds = books.map((b) => b.id);

  const { data: chaptersData, error: chaptersError } = await supabaseAdmin()
    .from("chapters")
    .select("id, book_id, slug, title, order_index, storage_path, word_count, created_at, updated_at")
    .in("book_id", bookIds)
    .order("order_index", { ascending: true });

  if (chaptersError) {
    console.error("Error fetching chapters:", chaptersError);
  }

  const chapters = (chaptersData || []).map(mapRawToChapter);

  return books.map((book) => {
    const bookChapters = chapters.filter((c) => c.book_id === book.id);
    return mapBookToBookWithChapters(book, bookChapters);
  });
}

export async function getBookBySlug(slug: string): Promise<BookWithChapters | null> {
  console.log("Fetching book by slug:", slug);

  const { data: bookData, error: bookError } = await supabaseAdmin()
    .from("books")
    .select("id, slug, title, description, author_name, cover_image_url, is_published, public_chapter_count, created_by, created_at, updated_at")
    .eq("slug", slug)
    .single();

  if (bookError || !bookData) {
    console.error("Error fetching book by slug:", bookError, "Slug requested:", slug);
    return null;
  }

  console.log("Book found:", bookData.slug, bookData.title);

  const book = mapRawToBook(bookData);

  const { data: chaptersData, error: chaptersError } = await supabaseAdmin()
    .from("chapters")
    .select("id, book_id, slug, title, order_index, storage_path, word_count, created_at, updated_at")
    .eq("book_id", book.id)
    .order("order_index", { ascending: true });

  if (chaptersError) {
    console.error("Error fetching chapters:", chaptersError);
  }

  console.log("Chapters found:", chaptersData?.length, chaptersData?.map((ch) => ({ slug: ch.slug, title: ch.title })));

  const chapters = (chaptersData || []).map(mapRawToChapter);
  return mapBookToBookWithChapters(book, chapters);
}

export async function getChapterContent(
  bookSlug: string,
  chapterSlug: string
): Promise<{ chapter: ChapterInfo; content: string } | null> {
  const book = await getBookBySlug(bookSlug);
  if (!book) return null;

  const chapter = book.chapters.find((c) => c.slug === chapterSlug);
  if (!chapter) return null;

  console.log("=== Getting Chapter Content ===");
  console.log("Book:", bookSlug, "Chapter:", chapterSlug);
  console.log("Storage path from DB:", chapter.storage_path);
  console.log("Storage path attempted:", chapter.storage_path);

  try {
    const { data, error } = await supabaseAdmin().storage
      .from("books")
      .download(chapter.storage_path);

    if (error || !data) {
      console.error("Error downloading chapter content:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
      return null;
    }

    const content = await data.text();
    console.log("Content fetched successfully, length:", content.length);
    return { chapter, content };
  } catch (err) {
    console.error("Error reading chapter content:", err);
    return null;
  }
}

export async function getAuthorBooks(userId: string): Promise<BookWithChapters[]> {
  const { data: booksData, error } = await supabaseAdmin()
    .from("books")
    .select("id, slug, title, description, author_name, cover_image_url, is_published, public_chapter_count, created_by, created_at, updated_at")
    .eq("created_by", userId)
    .order("created_at", { ascending: false });

  if (error || !booksData) {
    console.error("Error fetching author books:", error);
    return [];
  }

  const books = booksData.map(mapRawToBook);

  if (books.length === 0) {
    return [];
  }

  const bookIds = books.map((b) => b.id);

  const { data: chaptersData } = await supabaseAdmin()
    .from("chapters")
    .select("id, book_id, slug, title, order_index, storage_path, word_count, created_at, updated_at")
    .in("book_id", bookIds)
    .order("order_index", { ascending: true });

  const chapters = (chaptersData || []).map(mapRawToChapter);

  return books.map((book) => {
    const bookChapters = chapters.filter((c) => c.book_id === book.id);
    return mapBookToBookWithChapters(book, bookChapters);
  });
}

export async function getBookById(bookId: string): Promise<BookWithChapters | null> {
  const { data: bookData, error: bookError } = await supabaseAdmin()
    .from("books")
    .select("id, slug, title, description, author_name, cover_image_url, is_published, public_chapter_count, created_by, created_at, updated_at")
    .eq("id", bookId)
    .single();

  if (bookError || !bookData) {
    return null;
  }

  const book = mapRawToBook(bookData);

  const { data: chaptersData, error: chaptersError } = await supabaseAdmin()
    .from("chapters")
    .select("id, book_id, slug, title, order_index, storage_path, word_count, created_at, updated_at")
    .eq("book_id", book.id)
    .order("order_index", { ascending: true });

  if (chaptersError) {
    console.error("Error fetching chapters:", chaptersError);
  }

  console.log("Chapters found:", chaptersData?.length, chaptersData?.map((ch) => ({ slug: ch.slug, title: ch.title })));

  const chapters = (chaptersData || []).map(mapRawToChapter);
  return mapBookToBookWithChapters(book, chapters);
}
