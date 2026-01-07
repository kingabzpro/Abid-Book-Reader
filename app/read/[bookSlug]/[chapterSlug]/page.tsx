"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { BookOpen, ArrowLeft, ArrowRight, Menu, X, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReaderSettings } from "@/components/reader-settings";
import { useAuth } from "@/components/auth-context";

export default function ChapterPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isPremium, setIsPremium] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [bookTitle, setBookTitle] = useState("");
  const [chapters, setChapters] = useState<any[]>([]);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [fontSize, setFontSize] = useState(18);
  const [lineHeight, setLineHeight] = useState(1.8);
  const [contentWidth, setContentWidth] = useState("normal");
  const [fontFamily, setFontFamily] = useState("system-ui, sans-serif");
  const [readerTheme, setReaderTheme] = useState("light");

  useEffect(() => {
    if (params.bookSlug && params.chapterSlug) {
      loadChapter(params.bookSlug as string, params.chapterSlug as string);
    }
  }, [params.bookSlug, params.chapterSlug]);

  const loadChapter = async (bookSlug: string, chapterSlug: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/chapter?bookSlug=${bookSlug}&chapterSlug=${chapterSlug}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.premiumRequired) {
          setIsPremium(true);
          setLoading(false);
          return;
        }
        throw new Error(errorData.error || "Failed to load chapter");
      }

      const data = await response.json();
      setContent(data.content);
      setTitle(data.chapter.title);
      setBookTitle(data.book.title);
      setChapters(data.book.chapters);
      setCurrentChapterIndex(data.chapterIndex);
      setIsPremium(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load chapter");
      setContent("");
    } finally {
      setLoading(false);
    }
  };

  const goToChapter = (index: number) => {
    const chapter = chapters[index];
    if (chapter) {
      router.push(`/read/${params.bookSlug}/${chapter.slug}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading chapter...</p>
        </div>
      </div>
    );
  }

  if (isPremium && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full p-6 space-y-6 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <BookOpen className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold mb-2">Premium Content</h1>
            <p className="text-muted-foreground mb-6">
              This chapter is available exclusively for premium readers.
              <br />
              Sign in to access this content.
            </p>
            <div className="space-y-3">
              <Link href="/auth/login">
                <Button className="w-full">Sign In</Button>
              </Link>
              <Link href="/auth/signup">
                <Button variant="outline" className="w-full">Create Account</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isPremium && user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full p-6 space-y-6 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <BookOpen className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold mb-2">Premium Content</h1>
            <p className="text-muted-foreground mb-6">
              This chapter is available exclusively for premium readers.
              <br />
              Upgrade your account to access this content.
            </p>
            <Button className="w-full">Upgrade to Premium</Button>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md p-6 space-y-4 text-center">
          <h1 className="text-2xl font-bold">Error</h1>
          <p className="text-muted-foreground">{error}</p>
          <Link href={`/read/${params.bookSlug}`}>
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Book
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/read/${params.bookSlug}`}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="font-semibold text-sm md:text-base truncate max-w-[150px] md:max-w-[300px]">
                {bookTitle}
              </h1>
              <p className="text-xs text-muted-foreground">{title}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <ReaderSettings
              fontSize={fontSize}
              lineHeight={lineHeight}
              contentWidth={contentWidth}
              fontFamily={fontFamily}
              readerTheme={readerTheme}
              onFontSizeChange={setFontSize}
              onLineHeightChange={setLineHeight}
              onContentWidthChange={setContentWidth}
              onFontFamilyChange={setFontFamily}
              onReaderThemeChange={setReaderTheme}
            />
          </div>
        </div>
      </header>

      {/* Sidebar */}
      {isSidebarOpen && (
        <div className="fixed inset-y-0 left-0 z-50 w-80 bg-background border-r overflow-y-auto">
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Chapters</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSidebarOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="space-y-1">
              {chapters.map((chapter, index) => (
                <Link
                  key={chapter.slug}
                  href={`/read/${params.bookSlug}/${chapter.slug}`}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`block px-4 py-3 rounded-lg transition-colors ${
                    index === currentChapterIndex
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded bg-primary/20 flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </span>
                    <span className="text-sm">{chapter.title}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <article className="max-w-2xl mx-auto">
          <div
            className="prose prose-slate dark:prose-invert max-w-none reader-content"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </article>
      </main>

      {/* Navigation */}
      <nav className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => goToChapter(currentChapterIndex - 1)}
            disabled={currentChapterIndex === 0}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          <Link href={`/read/${params.bookSlug}`}>
            <Button variant="ghost">Back to Book</Button>
          </Link>
          <Button
            onClick={() => goToChapter(currentChapterIndex + 1)}
            disabled={currentChapterIndex === chapters.length - 1}
          >
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </nav>
    </div>
  );
}
