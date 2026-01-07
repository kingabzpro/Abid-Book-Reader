"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Plus,
  Upload,
  GripVertical,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";

interface Chapter {
  id: string;
  title: string;
  slug: string;
  order_index: number;
  storage_path: string;
}

interface BookData {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  author_name: string;
  is_published: boolean;
  public_chapter_count: number;
  chapters: Chapter[];
}

export default function BookManagementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [book, setBook] = useState<BookData | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [newChapterTitle, setNewChapterTitle] = useState("");
  const [newChapterSlug, setNewChapterSlug] = useState("");
  const [newChapterContent, setNewChapterContent] = useState("");
  const [publicChapterCount, setPublicChapterCount] = useState(0);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    params.then(async (resolvedParams) => {
      await loadBook(resolvedParams.id);
    });
  }, [params]);

  const loadBook = async (bookId: string) => {
    setLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from("books")
        .select("*, chapters(*)")
        .eq("id", bookId)
        .single();

      if (fetchError || !data) {
        setBook(null);
        return;
      }

      const sortedChapters = (data.chapters || []).sort(
        (a: Chapter, b: Chapter) => a.order_index - b.order_index
      );
      setBook({ ...data, chapters: sortedChapters });
      setPublicChapterCount(data.public_chapter_count || 0);
    } catch (err) {
      console.error("Error loading book:", err);
      setBook(null);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !book) return;

    const content = await file.text();
    await handleChapterSubmit(content, file.name);
  };

  const handleChapterSubmit = async (content: string, filename: string) => {
    if (!content.trim() || !book) return;

    setUploading(true);
    setError("");

    try {
      const chapterSlug = newChapterSlug || filename
        .replace(/\.md$/i, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      const orderIndex = book.chapters.length;
      const title = newChapterTitle || chapterSlugToTitle(chapterSlug);

      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token || "";

      // Create chapter record first
      const storagePath = `books/${book.slug}/chapters/${chapterSlug}.md`;

      console.log("=== Creating Chapter Record ===");
      console.log("Book ID:", book.id);
      console.log("Book slug:", book.slug);
      console.log("Chapter title:", title);
      console.log("Chapter slug:", chapterSlug);
      console.log("Storage path being saved:", storagePath);

      const chapterResponse = await fetch("/api/chapters", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          bookId: book.id,
          title,
          slug: chapterSlug,
          orderIndex,
          storagePath,
        }),
      });

      if (!chapterResponse.ok) {
        const errorData = await chapterResponse.json();
        throw new Error(errorData.error || "Failed to create chapter record");
      }

      // Upload content to storage
      const storagePath = `${book.slug}/chapters/${chapterSlug}.md`;
      console.log("=== Uploading to Storage ===");
      console.log("Storage path:", storagePath);
      console.log("Content length:", content.length);
      console.log("Book slug:", book.slug);
      console.log("Chapter slug:", chapterSlug);

      const { error: uploadError } = await supabaseAdmin().storage
        .from("books")
        .upload(storagePath, content, {
          contentType: "text/markdown",
          upsert: true,
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw new Error(`Failed to upload content: ${uploadError.message}`);
      }

      console.log("Upload successful");

      // Refresh book data
      await loadBook(book.id);
      setNewChapterTitle("");
      setNewChapterSlug("");
      setNewChapterContent("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      console.error("Upload error:", err);
      setError(err instanceof Error ? err.message : "Failed to upload chapter");
    } finally {
      setUploading(false);
    }
  };

  const togglePublish = async () => {
    if (!book) return;

    try {
      const { error: updateError } = await supabase
        .from("books")
        .update({ is_published: !book.is_published })
        .eq("id", book.id);

      if (updateError) {
        throw updateError;
      }

      setBook({ ...book, is_published: !book.is_published });
    } catch (err) {
      console.error("Error toggling publish:", err);
      setError("Failed to update publish status");
    }
  };

  const updatePublicChapterCount = async () => {
    if (!book) return;

    try {
      const { error: updateError } = await supabase
        .from("books")
        .update({ public_chapter_count: publicChapterCount })
        .eq("id", book.id);

      if (updateError) {
        throw updateError;
      }

      setBook({ ...book, public_chapter_count: publicChapterCount });
    } catch (err) {
      console.error("Error updating public chapter count:", err);
      setError("Failed to update public chapter count");
    }
  };

  const chapterSlugToTitle = (slug: string) =>
    slug
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!book) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Book not found</CardTitle>
        </CardHeader>
        <CardContent>
          <Link href="/admin">
            <Button className="w-full">Back to Dashboard</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
        <Button onClick={togglePublish} className="rounded-full">
          {book.is_published ? (
            <>
              <EyeOff className="h-4 w-4 mr-2" />
              Unpublish
            </>
          ) : (
            <>
              <Eye className="h-4 w-4 mr-2" />
              Publish
            </>
          )}
        </Button>
      </div>

      {error && (
        <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{book.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{book.description || "No description"}</p>
              <p className="text-sm text-muted-foreground mt-2">By {book.author_name}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Chapters</span>
                <span className="text-sm font-normal text-muted-foreground">
                  {book.chapters.length} chapters
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {book.chapters.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No chapters yet. Upload your first chapter below.
                </p>
              ) : (
                <div className="space-y-2">
                  {book.chapters.map((chapter, index) => (
                    <div
                      key={chapter.id}
                      className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30"
                    >
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                      <span className="flex-shrink-0 w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                        {index + 1}
                      </span>
                      <span className="flex-1 font-medium">{chapter.title}</span>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          index < book.public_chapter_count
                            ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                            : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                        }`}
                      >
                        {index < book.public_chapter_count ? "Public" : "Premium"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Add Chapter</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Chapter Title</Label>
                <Input
                  value={newChapterTitle}
                  onChange={(e) => setNewChapterTitle(e.target.value)}
                  placeholder="Chapter title (optional)"
                />
              </div>
              <div className="space-y-2">
                <Label>Chapter Slug</Label>
                <Input
                  value={newChapterSlug}
                  onChange={(e) => setNewChapterSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
                  placeholder="chapter-slug (optional, auto-generated from title)"
                />
              </div>
              <div className="space-y-2">
                <Label>Markdown Content</Label>
                <textarea
                  value={newChapterContent}
                  onChange={(e) => setNewChapterContent(e.target.value)}
                  placeholder="Paste your markdown content here..."
                  className="min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring font-mono"
                />
              </div>
              <Button
                onClick={() => handleChapterSubmit(newChapterContent, "")}
                disabled={!newChapterContent.trim() || uploading}
                className="w-full"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Save Chapter
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Public Chapters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Number of free chapters</Label>
                <Input
                  type="number"
                  min="0"
                  max={Math.max(book.chapters.length, 0)}
                  value={publicChapterCount}
                  onChange={(e) =>
                    setPublicChapterCount(Math.max(0, parseInt(e.target.value) || 0))
                  }
                />
                <p className="text-xs text-muted-foreground">
                  First {publicChapterCount} chapters will be free to read
                </p>
              </div>
              <Button
                onClick={updatePublicChapterCount}
                className="w-full"
                variant="outline"
              >
                Update
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <Link href={`/read/${book.slug}`} className="block">
                <Button variant="outline" className="w-full">
                  <Eye className="h-4 w-4 mr-2" />
                  View Book
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
