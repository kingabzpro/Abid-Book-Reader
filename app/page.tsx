import Link from "next/link";
import { BookOpen, ArrowRight, Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAllBooks } from "@/app/actions/books";

export default async function HomePage() {
  const books = await getAllBooks();

  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden py-24 md:py-40">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-blob" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-blob animation-delay-2000" />
        
        <div className="container mx-auto px-4 relative">
          <div className="text-center max-w-4xl mx-auto animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-8">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">Free to read, anytime, anywhere</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
              <span className="gradient-text">Read Abid&apos;s Books</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              Immerse yourself in engaging content on programming and technology. 
              Read online for free with customizable settings and reading progress tracking.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/library">
                <Button size="lg" className="gap-2 text-base px-8 py-6 gradient-bg shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 rounded-full">
                  <BookOpen className="h-5 w-5" />
                  Browse Library
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 pb-24">
        {books.map((book, bookIndex) => (
          <section key={book.id} className="mb-24 animate-slide-up" style={{ animationDelay: `${bookIndex * 0.1}s` }}>
            <div className="mb-12">
              <div className="flex items-center gap-4 mb-4">
                <h2 className="text-3xl md:text-4xl font-bold">{book.meta.title}</h2>
                <span className="px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
                  {book.chapters.length} chapters
                </span>
              </div>
              <p className="text-lg text-muted-foreground max-w-3xl leading-relaxed">
                {book.meta.description}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {book.chapters.map((chapter, chapterIndex) => (
                <Link key={chapter.slug} href={`/read/${chapter.slug}`}>
                  <Card className="h-full transition-all duration-300 hover:shadow-lg hover:border-primary/30 group overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                            {chapterIndex + 1}
                          </span>
                          <div>
                            <CardTitle className="text-base line-clamp-1">{chapter.title}</CardTitle>
                            <CardDescription className="mt-0.5">
                              {chapter.isPublic ? (
                                <span className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
                                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                  Free
                                </span>
                              ) : (
                                <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                                  <Lock className="w-3 h-3" />
                                  Login required
                                </span>
                              )}
                            </CardDescription>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <Button 
                        className="w-full rounded-lg" 
                        variant={chapter.isPublic ? "default" : "outline"}
                      >
                        {chapter.isPublic ? "Read Now" : "Sign up to read"}
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>

      <section className="py-24 border-t border-border">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Start Reading Today</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of readers exploring programming concepts through interactive books.
          </p>
          <Link href="/library">
            <Button size="lg" variant="outline" className="gap-2 text-base px-8 py-6 rounded-full">
              Explore All Books
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
