export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      authors: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          created_at?: string;
        };
      };
      books: {
        Row: {
          id: string;
          slug: string;
          title: string;
          description: string | null;
          author_name: string;
          cover_image_url: string | null;
          is_published: boolean;
          public_chapter_count: number;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          description?: string;
          author_name: string;
          cover_image_url?: string;
          is_published?: boolean;
          public_chapter_count?: number;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          title?: string;
          description?: string;
          author_name?: string;
          cover_image_url?: string;
          is_published?: boolean;
          public_chapter_count?: number;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      chapters: {
        Row: {
          id: string;
          book_id: string;
          slug: string;
          title: string;
          order_index: number;
          storage_path: string;
          word_count: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          book_id: string;
          slug: string;
          title: string;
          order_index: number;
          storage_path: string;
          word_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          book_id?: string;
          slug?: string;
          title?: string;
          order_index?: number;
          storage_path?: string;
          word_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      reading_progress: {
        Row: {
          user_id: string;
          book_id: string;
          chapter_slug: string;
          scroll_y: number;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          book_id: string;
          chapter_slug: string;
          scroll_y?: number;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          book_id?: string;
          chapter_slug?: string;
          scroll_y?: number;
          updated_at?: string;
        };
      };
      reader_settings: {
        Row: {
          user_id: string;
          theme: string;
          font_size: number;
          line_height: number;
          content_width: string;
          font_family: string;
          reader_theme: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          theme?: string;
          font_size?: number;
          line_height?: number;
          content_width?: string;
          font_family?: string;
          reader_theme?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          theme?: string;
          font_size?: number;
          line_height?: number;
          content_width?: string;
          font_family?: string;
          reader_theme?: string;
          updated_at?: string;
        };
      };
    };
  };
}
