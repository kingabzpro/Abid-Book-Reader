import Link from "next/link";
import { BookOpen, ArrowLeft, Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getBook, getChapterContentForReading } from "@/app/actions/books";

export default async function BookPage({
  params,
}: {
  params: Promise<{ bookSlug: string }>;
}) {
  const { bookSlug } = await params;
  const book = await getBook(bookSlug);

  if (!book) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Book Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              The book you're looking for doesn't exist or isn't published.
            </p>
            <Link href="/library">
              <Button className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Library
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          <Link
            href="/library"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Library
          </Link>

          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
              <BookOpen className="h-4 w-4" />
              <span className="text-sm font-medium">Published Book</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
              {book.meta.title}
            </h1>

            <p className="text-lg text-muted-foreground mb-2">
              By {book.meta.author}
            </p>

            {book.meta.description && (
              <p className="text-muted-foreground mb-8 leading-relaxed">
                {book.meta.description}
              </p>
            )}

            <div className="flex items-center gap-4 mb-8">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium">
                  {book.chapters.length} chapter{book.chapters.length !== 1 ? "s" : ""}
                </span>
              </div>
              {book.meta.publicChapterCount > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {book.meta.publicChapterCount} free
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 pb-24">
        <div className="max-w-4xl">
          <Card>
            <CardHeader>
              <CardTitle>Chapters</CardTitle>
              <CardDescription>
                {book.chapters.length} chapter{book.chapters.length !== 1 ? "s" : ""} available
              </CardDescription>
            </CardHeader>
            <CardContent>
              {book.chapters.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No chapters available yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {book.chapters.map((chapter, index) => (
                    <Link key={chapter.slug} href={`/read/${bookSlug}/${chapter.slug}`}>
                      <div className="flex items-center justify-between p-4 rounded-xl border bg-muted/20 hover:bg-muted/40 hover:border-primary/20 transition-all duration-200 group">
                        <div className="flex items-center gap-3">
                          <span className="flex-shrink-0 w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                            {index + 1}
                          </span>
                          <span className="flex items-center gap-2 font-medium">
                            {!chapter.isPublic && (
                              <Lock className="h-3 w-3 text-muted-foreground" />
                            )}
                            <span className="truncate">{chapter.title}</span>
                          </span>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          Read
                          <Loader2 className="ml-2 h-3 w-3" />
                        </Button>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
