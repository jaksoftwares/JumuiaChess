-- site_settings
CREATE TABLE IF NOT EXISTS site_settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    org_email TEXT NOT NULL,
    org_phone TEXT NOT NULL,
    mpesa_paybill TEXT NOT NULL,
    instagram_url TEXT,
    facebook_url TEXT,
    youtube_url TEXT,
    shop_enabled BOOLEAN NOT NULL DEFAULT true,
    our_story_title TEXT,
    our_story_heading TEXT,
    our_story_paragraph_1 TEXT,
    our_story_paragraph_2 TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select for site settings" 
    ON site_settings FOR SELECT 
    USING (true);

-- Insert default site settings singleton
INSERT INTO site_settings (
    id, 
    org_email, 
    org_phone, 
    mpesa_paybill, 
    shop_enabled,
    our_story_title,
    our_story_heading,
    our_story_paragraph_1,
    our_story_paragraph_2
)
VALUES (
    1, 
    'info@jumuiyachess.org', 
    '+254722274720', 
    '174379', 
    true,
    'Our Story',
    'Elevating Strategy from the Board to the Community.',
    'The Gift of Chess is a nonprofit organization dedicated to using chess as a tool for education, personal development, and social transformation. Since our inception, we have worked with schools, children''s homes, prisons, and refugee communities across Kenya to nurture talent, build critical thinking, and provide safe, constructive spaces where children and youth can grow and thrive.',
    'In Kenya, we have also integrated an environmental sustainability component into our work. In partnership with Kijiji Solutions, we recycle plastic waste to produce chess sets, turning waste into meaningful tools that expand access to chess while contributing to climate action.'
)
ON CONFLICT (id) DO NOTHING;
