ALTER TABLE site_settings
ADD COLUMN IF NOT EXISTS our_story_title TEXT,
ADD COLUMN IF NOT EXISTS our_story_heading TEXT,
ADD COLUMN IF NOT EXISTS our_story_paragraph_1 TEXT,
ADD COLUMN IF NOT EXISTS our_story_paragraph_2 TEXT;

UPDATE site_settings
SET 
  our_story_title = COALESCE(our_story_title, 'Our Story'),
  our_story_heading = COALESCE(our_story_heading, 'Elevating Strategy from the Board to the Community.'),
  our_story_paragraph_1 = COALESCE(our_story_paragraph_1, 'The Gift of Chess is a nonprofit organization dedicated to using chess as a tool for education, personal development, and social transformation. Since our inception, we have worked with schools, children''s homes, prisons, and refugee communities across Kenya to nurture talent, build critical thinking, and provide safe, constructive spaces where children and youth can grow and thrive.'),
  our_story_paragraph_2 = COALESCE(our_story_paragraph_2, 'In Kenya, we have also integrated an environmental sustainability component into our work. In partnership with Kijiji Solutions, we recycle plastic waste to produce chess sets, turning waste into meaningful tools that expand access to chess while contributing to climate action.')
WHERE id = 1;
