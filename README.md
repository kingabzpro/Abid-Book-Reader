# Read Abid's Books

Interactive way of reading my books online for free.

## Features

- **Supabase-powered content**: Books and chapters stored in Supabase database
- **Markdown-based content**: Chapters uploaded as Markdown files
- **Supabase authentication**: Email/password signup and login
- **Reading progress tracking**: Automatically saves your reading position
- **Customizable reader**: Adjust theme, font size, and line height
- **Access control**: Public preview chapters, login required for premium content
- **Keyboard navigation**: Use N/P keys for chapter navigation
- **Author console**: Built-in admin interface for managing books and chapters

## Tech Stack

- **Framework**: Next.js 16.1.1 (App Router)
- **Language**: TypeScript 5.9.3
- **Styling**: Tailwind CSS 4.1.18
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Authentication**: @supabase/supabase-js
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage for chapter files
- **Markdown**: unified/remark/rehype with sanitization
- **Runtime**: Bun

## Setup

### Prerequisites

- Bun installed on your machine
- A Supabase project

### Installation

1. Clone the repository:
   
   ```bash
   git clone https://github.com/kingabzpro/Abid-Book-Reader
   cd Abid-Book-Reader
   ```

2. Install dependencies:
   
   ```bash
   bun install
   ```

3. Set up Supabase:
   
   - Create a new project at https://supabase.com
   - Run the SQL schema from `supabase/schema.sql` in your Supabase SQL editor
   - Create a storage bucket named "books" in Supabase Storage
   - Copy your project URL and API keys from Supabase settings

4. Create a `.env.local` file:
   
   ```bash
   cp .env.example .env.local
   ```

5. Update `.env.local` with your Supabase credentials:
   
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_sb_publishable_key
    SUPABASE_SECRET_KEY=your_sb_secret_key
    AUTHOR_EMAILS=author@example.com,another-author@example.com
    ```

### Running the App

Development:

```bash
bun dev
```

Production build:

```bash
bun run build
bun start
```

### Linting

```bash
bun run lint
```

## Deployment to Vercel

1. Push your code to GitHub
2. Import your repository in Vercel
3. Configure environment variables in Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_SECRET_KEY`
   - `AUTHOR_EMAILS`
4. Deploy!

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── admin/             # Author console pages
│   ├── api/               # API route handlers
│   ├── auth/              # Authentication pages
│   ├── library/           # Library page
│   ├── read/              # Reader pages (dynamic routes)
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── ...              # Custom components
├── lib/                 # Utility functions
│   ├── supabase/       # Supabase client and helpers
│   └── ...            # Other utilities
├── types/               # TypeScript type definitions
└── supabase/           # Database schema
    └── schema.sql      # SQL for tables and RLS
```

## Author Guide

### Becoming an Author

Authors are managed via an email allowlist. Add emails to your `.env.local`:

```env
AUTHOR_EMAILS=author1@example.com,author2@example.com
```

Then manually insert into the `authors` table in Supabase SQL editor:

```sql
INSERT INTO authors (email, name) VALUES 
('author1@example.com', 'Author One'),
('author2@example.com', 'Author Two');
```

### Creating a Book

1. Sign in with an authorized email
2. Visit `/admin` to access the Author Console
3. Click "Create Book" and fill in:
   - **Title**: Your book title
   - **URL Slug**: Auto-generated from title (lowercase, hyphens)
   - **Author Name**: Your name (defaults to email username)
   - **Description**: Optional book description
4. Click "Create Book"

### Adding Chapters

1. Open your book in `/admin/books/[book-id]`
2. Under "Upload Chapter":
   - Enter an optional chapter title (defaults to filename)
   - Select a `.md` Markdown file
   - Click upload
3. The chapter will be automatically numbered based on upload order

**Chapter File Format:**
- Filename becomes the chapter slug (e.g., `01-introduction.md` → slug: `01-introduction`)
- Front matter is optional but supported
- Plain Markdown content

### Managing Public Chapters

Use the "Public Chapters" section to set how many chapters are free to read without logging in. The first N chapters (where N is your setting) will be publicly accessible.

### Publishing

1. Click "Publish" to make your book visible in the library
2. Click "Unpublish" to hide it (chapters can still be edited)

### Cover Images (Optional)

Cover images can be uploaded to `storage/books/covers/[book-slug].[ext]` via Supabase Storage dashboard or use external URLs.

## Migration from Filesystem (Legacy)

If you're migrating from the old filesystem-based content:

1. **Database Setup**: Run `supabase/schema.sql` to create the new tables
2. **Storage**: Upload your chapter `.md` files to Supabase Storage under `books/[book-slug]/chapters/`
3. **Data Migration**: Insert your books and chapters into the database:
   ```sql
   -- Insert book
   INSERT INTO books (slug, title, description, author_name, is_published, public_chapter_count, created_by)
   VALUES ('your-book-slug', 'Book Title', 'Description', 'Author Name', true, 1, 'user-id');
   
   -- Insert chapter
   INSERT INTO chapters (book_id, slug, title, order_index, storage_path)
   VALUES ('book-id', '01-intro', 'Introduction', 0, 'books/your-book-slug/chapters/01-intro.md');
   ```
4. **Update Environment**: Add `AUTHOR_EMAILS` to `.env.local`
5. **Test**: Verify books appear in library and chapters load correctly
