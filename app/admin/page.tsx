import Link from "next/link";
import { BookOpen, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getAuthorBooks } from "@/lib/supabase/books";
import { createClient } from "@/lib/supabase/client";

export default async function AdminDashboard() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  const books = user ? await getAuthorBooks(user.id) : [];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Books</h1>
          <p className="text-muted-foreground mt-1">
            Manage your published books and chapters
          </p>
        </div>
        <Link href="/admin/books/new">
          <Button className="rounded-full">
            <Plus className="h-4 w-4 mr-2" />
            Create Book
          </Button>
        </Link>
      </div>

      {books.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No books yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create your first book to start adding chapters and publishing
            </p>
            <Link href="/admin/books/new">
              <Button variant="outline" className="rounded-full">
                <Plus className="h-4 w-4 mr-2" />
                Create Book
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {books.map((book) => (
            <Link key={book.id} href={`/admin/books/${book.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <CardTitle className="line-clamp-1">{book.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {book.chapters.length} chapters
                  </p>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {book.description || "No description"}
                  </p>
                  <div className="mt-4 flex items-center gap-2">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        book.is_published
                          ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                          : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                      }`}
                    >
                      {book.is_published ? "Published" : "Draft"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {book.public_chapter_count} public
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
