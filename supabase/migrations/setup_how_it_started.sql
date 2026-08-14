-- Create how_it_started table
CREATE TABLE IF NOT EXISTS public.how_it_started (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL DEFAULT 'How It Started',
    heading TEXT NOT NULL DEFAULT 'A Simple Idea That Ignited a Movement.',
    image_url TEXT,
    paragraphs JSONB NOT NULL DEFAULT '["Our journey began not in grand tournament halls, but in local communities where potential was abundant but opportunities were scarce. We saw first-hand how the discipline and strategy of chess could captivate young minds and teach them invaluable life skills.", "What started with just a handful of chess sets and a few dedicated volunteers quickly grew. As children learned to think ahead on the board, they began to envision brighter futures for themselves. Today, that simple idea has blossomed into a global initiative, transforming thousands of lives one move at a time."]'::jsonb,
    stats JSONB NOT NULL DEFAULT '[{"value": "20+", "label": "Communities"}, {"value": "10k+", "label": "Lives Touched"}]'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.how_it_started ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for all users" ON public.how_it_started
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated admin users only" ON public.how_it_started
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated admin users only" ON public.how_it_started
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Insert default row if none exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.how_it_started) THEN
    INSERT INTO public.how_it_started (title, heading, image_url, paragraphs, stats)
    VALUES (
      'How It Started',
      'A Simple Idea That Ignited a Movement.',
      '/images/kids3.jpg',
      '["Our journey began not in grand tournament halls, but in local communities where potential was abundant but opportunities were scarce. We saw first-hand how the discipline and strategy of chess could captivate young minds and teach them invaluable life skills.", "What started with just a handful of chess sets and a few dedicated volunteers quickly grew. As children learned to think ahead on the board, they began to envision brighter futures for themselves. Today, that simple idea has blossomed into a global initiative, transforming thousands of lives one move at a time."]'::jsonb,
      '[{"value": "20+", "label": "Communities"}, {"value": "10k+", "label": "Lives Touched"}]'::jsonb
    );
  END IF;
END
$$;
