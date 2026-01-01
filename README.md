# Read Abid's Books

Interactive way of reading my books online for free.

## Features

- **Markdown-based content**: Books stored as Markdown files in the repository
- **Supabase authentication**: Email/password signup and login
- **Reading progress tracking**: Automatically saves your reading position
- **Customizable reader**: Adjust theme, font size, and line height
- **Access control**: Public preview chapters, login required for premium content
- **Keyboard navigation**: Use N/P keys for chapter navigation, T for settings

## Tech Stack

- **Framework**: Next.js 16.1.1 (App Router)
- **Language**: TypeScript 5.9.3
- **Styling**: Tailwind CSS 4.1.18
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Authentication**: @supabase/supabase-js
- **Database**: Supabase (PostgreSQL)
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
   - Copy your project URL and API keys from Supabase settings
   
   **Note:** This app uses the new Supabase API key format:
   
   - Use `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` for client-side operations
   - Legacy keys (`anon`, `service_role`) are supported until November 2025 but not recommended

4. Create a `.env.local` file:
   
   ```bash
   cp .env.example .env.local
   ```

5. Update `.env.local` with your Supabase credentials:
   
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_sb_publishable_key
   ```

**For server-side operations (optional):**

```env
SUPABASE_SECRET_KEY=your_sb_secret_key
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
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication pages
│   ├── library/           # Library page
│   ├── read/              # Reader pages (dynamic routes)
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── ...              # Custom components
├── content/books/        # Markdown book content
│   └── my-first-book/  # Example book
├── lib/                 # Utility functions
│   ├── supabase/       # Supabase client and helpers
│   └── ...            # Other utilities
└── supabase/           # Database schema
    └── schema.sql      # SQL for tables and RLS
```

## Adding New Books

1. Create a new directory under `content/books/your-book-name/`
2. Add a `meta.json` file:
   
   ```json
   {
   "title": "Your Book Title",
   "description": "Book description",
   "author": "Your Name",
   "coverImage": "/covers/your-book.jpg",
   "publicChapterCount": 1
   }
   ```
3. Add Markdown chapters (e.g., `01-intro.md`, `02-chapter-1.md`)

## 
