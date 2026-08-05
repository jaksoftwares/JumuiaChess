-- Create the 'videos' table if it doesn't exist
CREATE TABLE IF NOT EXISTS videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  youtube_url TEXT NOT NULL,
  description TEXT NOT NULL,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Delete existing default entries to prevent duplicates (optional, for idempotency)
DELETE FROM videos WHERE youtube_url IN ('https://www.youtube.com/watch?v=-XLfXDGkcbE', 'https://www.youtube.com/watch?v=dHQGNQwtgyA', 'https://www.youtube.com/watch?v=9yAMCRHL0og');

-- Insert the hardcoded videos from the frontend
INSERT INTO videos (title, youtube_url, description, is_featured) VALUES
(
  'Dina Belenkaya Live at Charlotte Chess Centre', 
  'https://www.youtube.com/watch?v=-XLfXDGkcbE', 
  'Dina Belenkaya live with the Kenya National Team Champions during their one-month chess exchange workshop at Charlotte Chess Centre.',
  true
),
(
  'Empowering Youth Through Chess', 
  'https://www.youtube.com/watch?v=dHQGNQwtgyA', 
  'Bringing board games, structured learning, and mentorship across Kenya.',
  false
),
(
  'The Gift of Chess Mission', 
  'https://www.youtube.com/watch?v=9yAMCRHL0og', 
  'Distributing 1 million chess sets to unlock strategic thinking worldwide.',
  false
);

-- Enable Row Level Security (RLS)
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- Allow public read access to videos
-- (Admin creates/updates/deletes bypass RLS using the Service Role Key)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'videos' AND policyname = 'Public can view videos'
  ) THEN
    CREATE POLICY "Public can view videos" 
    ON videos FOR SELECT 
    USING (true);
  END IF;
END $$;

