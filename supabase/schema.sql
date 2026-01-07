-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Authors table (for email-based author allowlist)
CREATE TABLE IF NOT EXISTS authors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Books table
CREATE TABLE IF NOT EXISTS books (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  author_name TEXT NOT NULL,
  cover_image_url TEXT,
  is_published BOOLEAN DEFAULT FALSE,
  public_chapter_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chapters table
CREATE TABLE IF NOT EXISTS chapters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  book_id UUID REFERENCES books(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  storage_path TEXT NOT NULL,
  word_count INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(book_id, order_index)
);

-- Enable RLS on all new tables
ALTER TABLE authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;

-- Authors policies
CREATE POLICY "Public read access to authors" ON authors FOR SELECT USING (true);
CREATE POLICY "Authors can be inserted by admins" ON authors FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authors can be updated by admins" ON authors FOR UPDATE USING (auth.role() = 'authenticated');

-- Books policies
CREATE POLICY "Anyone can view published books" ON books FOR SELECT
  USING (is_published = true);

CREATE POLICY "Authors can view their own books" ON books FOR SELECT
  USING (created_by = auth.uid() OR auth.uid() IN (SELECT id FROM authors));

CREATE POLICY "Authors can insert books" ON books FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT id FROM authors));

CREATE POLICY "Authors can update their own books" ON books FOR UPDATE
  USING (created_by = auth.uid() OR auth.uid() IN (SELECT id FROM authors));

CREATE POLICY "Authors can delete their own books" ON books FOR DELETE
  USING (created_by = auth.uid() OR auth.uid() IN (SELECT id FROM authors));

-- Chapters policies
CREATE POLICY "Anyone can view chapters of published books" ON chapters FOR SELECT
  USING (
    book_id IN (SELECT id FROM books WHERE is_published = true)
  );

CREATE POLICY "Authors can view chapters of their own books" ON chapters FOR SELECT
  USING (
    book_id IN (SELECT id FROM books WHERE created_by = auth.uid())
    OR auth.uid() IN (SELECT id FROM authors)
  );

CREATE POLICY "Authors can insert chapters" ON chapters FOR INSERT
  WITH CHECK (
    book_id IN (SELECT id FROM books WHERE created_by = auth.uid())
    OR auth.uid() IN (SELECT id FROM authors)
  );

CREATE POLICY "Authors can update chapters" ON chapters FOR UPDATE
  USING (
    book_id IN (SELECT id FROM books WHERE created_by = auth.uid())
    OR auth.uid() IN (SELECT id FROM authors)
  );

CREATE POLICY "Authors can delete chapters" ON chapters FOR DELETE
  USING (
    book_id IN (SELECT id FROM books WHERE created_by = auth.uid())
    OR auth.uid() IN (SELECT id FROM authors)
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_books_slug ON books(slug);
CREATE INDEX IF NOT EXISTS idx_books_published ON books(is_published);
CREATE INDEX IF NOT EXISTS idx_chapters_book_order ON chapters(book_id, order_index);
CREATE INDEX IF NOT EXISTS idx_authors_email ON authors(email);

-- Updated triggers for updated_at
CREATE TRIGGER update_books_updated_at
  BEFORE UPDATE ON books
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chapters_updated_at
  BEFORE UPDATE ON chapters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Storage bucket setup (run this in Supabase Dashboard Storage or SQL)
-- The following creates the bucket and RLS policies:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('books', 'books', true);
-- RLS policies are applied to storage.objects table
