-- Create reading_progress table
CREATE TABLE IF NOT EXISTS reading_progress (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id TEXT NOT NULL,
  chapter_slug TEXT NOT NULL,
  scroll_y INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, book_id)
);

-- Create reader_settings table
CREATE TABLE IF NOT EXISTS reader_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'system',
  font_size INTEGER DEFAULT 18,
  line_height NUMERIC DEFAULT 1.8,
  content_width TEXT DEFAULT 'normal',
  font_family TEXT DEFAULT 'Georgia, serif',
  reader_theme TEXT DEFAULT 'light',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on reading_progress
ALTER TABLE reading_progress ENABLE ROW LEVEL SECURITY;

-- Enable RLS on reader_settings
ALTER TABLE reader_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only read their own reading progress
CREATE POLICY "Users can read own reading progress"
  ON reading_progress FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own reading progress
CREATE POLICY "Users can insert own reading progress"
  ON reading_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own reading progress
CREATE POLICY "Users can update own reading progress"
  ON reading_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own reading progress
CREATE POLICY "Users can delete own reading progress"
  ON reading_progress FOR DELETE
  USING (auth.uid() = user_id);

-- Policy: Users can read their own reader settings
CREATE POLICY "Users can read own reader settings"
  ON reader_settings FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own reader settings
CREATE POLICY "Users can insert own reader settings"
  ON reader_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own reader settings
CREATE POLICY "Users can update own reader settings"
  ON reader_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own reader settings
CREATE POLICY "Users can delete own reader settings"
  ON reader_settings FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_reading_progress_user_book ON reading_progress(user_id, book_id);
CREATE INDEX IF NOT EXISTS idx_reader_settings_user ON reader_settings(user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at on reading_progress
CREATE TRIGGER update_reading_progress_updated_at
  BEFORE UPDATE ON reading_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to auto-update updated_at on reader_settings
CREATE TRIGGER update_reader_settings_updated_at
  BEFORE UPDATE ON reader_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
