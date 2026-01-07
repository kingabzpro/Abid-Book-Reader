import Link from "next/link";
import { BookOpen, Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAllBooks } from "@/app/actions/books";

export default async function LibraryPage() {
  const books = await getAllBooks();

  return (
    <div className="min-h-screen">
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
              <BookOpen className="h-4 w-4" />
              <span className="text-sm font-medium">Your Personal Library</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
              <span className="gradient-text">Library</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">
              Explore our collection of books and chapters. Start reading instantly with customizable settings and progress tracking.
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 pb-24">
        <div className="grid gap-8 md:grid-cols-2">
          {books.map((book, bookIndex) => (
            <Card key={book.id} className="card-shadow hover:card-shadow-hover transition-all duration-300 animate-slide-up" style={{ animationDelay: `${bookIndex * 0.1}s` }}>
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <CardHeader className="relative">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-2xl mb-2">{book.meta.title}</CardTitle>
                    <CardDescription className="text-base">By {book.meta.author}</CardDescription>
                  </div>
                  <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
                    <BookOpen className="h-4 w-4 mr-1" />
                    {book.chapters.length}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="relative pt-0">
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {book.meta.description}
                </p>

                <div className="space-y-3">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Chapters</h3>
                  <div className="space-y-2">
                    {book.chapters.map((chapter, chapterIndex) => (
                      <Link key={chapter.slug} href={`/read/${book.id}/${chapter.slug}`}>
                        <div className="flex items-center justify-between p-4 rounded-xl border bg-muted/20 hover:bg-muted/40 hover:border-primary/20 transition-all duration-200 group">
                          <div className="flex items-center gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                              {chapterIndex + 1}
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
                            variant={chapter.isPublic ? "ghost" : "ghost"}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            {chapter.isPublic ? "Read" : "Login"}
                            <ArrowRight className="ml-2 h-3 w-3 transition-transform group-hover:translate-x-1" />
                          </Button>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
