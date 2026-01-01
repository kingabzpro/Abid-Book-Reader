"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ReaderSettings } from "@/components/reader-settings";
import { markdownToHtml } from "@/lib/markdown";
import { getChapter, getChapterNavigation, getAllBooks } from "@/app/actions/books";
import { saveReadingProgress } from "@/lib/supabase/reading-progress";
import { getReaderSettings, saveReaderSettings } from "@/lib/supabase/reader-settings";
import { useTheme } from "next-themes";
import { useAuth } from "@/components/auth-context";

interface ReaderPageProps {
  params: Promise<{ chapterSlug: string }>;
}

export default function ReaderPage({ params }: ReaderPageProps) {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const [chapterSlug, setChapterSlug] = useState<string>("");
  const [htmlContent, setHtmlContent] = useState<string>("");
  const [fontSize, setFontSize] = useState(18);
  const [lineHeight, setLineHeight] = useState(1.8);
  const [prevChapter, setPrevChapter] = useState<any>(null);
  const [nextChapter, setNextChapter] = useState<any>(null);
  const [bookId, setBookId] = useState<string>("");
  const [currentChapter, setCurrentChapter] = useState<any>(null);
  const [currentBook, setCurrentBook] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    params.then((resolvedParams) => {
      setChapterSlug(resolvedParams.chapterSlug);
      loadChapter(resolvedParams.chapterSlug);
    });
  }, [params]);

  const loadChapter = async (slug: string) => {
    setLoading(true);
    const books = await getAllBooks();
    let chapter = null;
    let currentBookId = null;
    let foundBook = null;

    for (const book of books) {
      const foundChapter = book.chapters.find((ch) => ch.slug === slug);
      if (foundChapter) {
        chapter = foundChapter;
        currentBookId = book.id;
        foundBook = book;
        break;
      }
    }

    if (!chapter) {
      setLoading(false);
      return;
    }

    if (currentBookId) {
      const navigation = await getChapterNavigation(currentBookId, slug);
      setPrevChapter(navigation?.prev || null);
      setNextChapter(navigation?.next || null);
      setBookId(currentBookId);

      await saveReadingProgress(currentBookId, slug, 0);
    }

    const html = await markdownToHtml(chapter.content);
    setHtmlContent(html);
    setCurrentChapter(chapter);
    setCurrentBook(foundBook);
    setLoading(false);
  };

  useEffect(() => {
    const loadSettings = async () => {
      const settings = await getReaderSettings();
      if (settings) {
        setFontSize(settings.font_size);
        setLineHeight(settings.line_height);
        setTheme(settings.theme);
      }
    };
    loadSettings();
  }, [setTheme]);

  useEffect(() => {
    const saveSettings = async () => {
      await saveReaderSettings({
        theme,
        font_size: fontSize,
        line_height: lineHeight,
      });
    };
    saveSettings();
  }, [theme, fontSize, lineHeight]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "n" || e.key === "N") {
        if (nextChapter) {
          window.location.href = `/read/${nextChapter.slug}`;
        }
      } else if (e.key === "p" || e.key === "P") {
        if (prevChapter) {
          window.location.href = `/read/${prevChapter.slug}`;
        }
      } else if (e.key === "t" || e.key === "T") {
        e.preventDefault();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextChapter, prevChapter]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-fade-in text-center">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading chapter...</p>
        </div>
      </div>
    );
  }

  const chapter = currentChapter;
  const book = currentBook;

  if (!chapter || !book) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Chapter not found</CardTitle>
          </CardHeader>
          <CardContent>
            <Link href="/library">
              <Button className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Library
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!chapter.isPublic && !user) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-md mx-auto card-shadow">
          <CardHeader>
            <CardTitle className="text-center">Login Required</CardTitle>
            <CardDescription className="text-center">
              You need to be logged in to read this chapter.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-center">
              Sign up for a free account to access all chapters and save your reading progress.
            </p>
            <div className="flex gap-2">
              <Link href={`/auth/login?next=/read/${chapterSlug}`} className="flex-1">
                <Button className="w-full gradient-bg">Login</Button>
              </Link>
              <Link href={`/auth/signup?next=/read/${chapterSlug}`} className="flex-1">
                <Button variant="outline" className="w-full">Sign Up</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/library">
              <Button variant="ghost" size="sm" className="hover:bg-accent/50 rounded-full px-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">{book.meta.title}</span>
              </Button>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <ReaderSettings
              fontSize={fontSize}
              lineHeight={lineHeight}
              onFontSizeChange={setFontSize}
              onLineHeightChange={setLineHeight}
            />
          </div>
        </div>
      </div>

      <article className="container mx-auto px-4 py-12 md:py-16 max-w-2xl animate-fade-in">
        <div className="mb-12">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <span>{book.meta.title}</span>
            <span className="text-border">•</span>
            <span>Chapter {chapter.slug.split("-")[0]}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">{chapter.title}</h1>
        </div>
        
        <div
          className="reader-content animate-slide-up"
          style={{
            fontSize: `${fontSize}px`,
            lineHeight: lineHeight,
          }}
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </article>

      <div className="border-t bg-muted/30">
        <div className="container mx-auto px-4 py-8 md:py-12 flex flex-col sm:flex-row justify-between items-center gap-4 max-w-4xl">
          {prevChapter ? (
            <Link href={`/read/${prevChapter.slug}`} className="w-full sm:w-auto order-2 sm:order-1">
              <Button variant="outline" className="w-full md:w-auto rounded-xl">
                <ChevronLeft className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Previous</span>
                <span className="sm:hidden">Prev</span>
              </Button>
            </Link>
          ) : (
            <div className="hidden sm:block order-2 sm:order-1" />
          )}

          {nextChapter ? (
            <Link href={`/read/${nextChapter.slug}`} className="w-full sm:w-auto order-1 sm:order-2">
              <Button className="w-full md:w-auto rounded-xl gradient-bg shadow-lg shadow-primary/25">
                <span className="hidden sm:inline">Next</span>
                <span className="sm:hidden">Next</span>
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          ) : (
            <div className="hidden sm:block order-1 sm:order-2" />
          )}
        </div>
      </div>

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-10">
        <div className="glass px-5 py-2.5 rounded-full text-sm text-muted-foreground shadow-lg border">
          <span className="font-semibold">N</span>ext / <span className="font-semibold">P</span>rev / <span className="font-semibold">T</span>heme
        </div>
      </div>
    </div>
  );
}
