CREATE TABLE IF NOT EXISTS impact_programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE impact_programs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select for impact programs"
    ON impact_programs FOR SELECT
    USING (true);

INSERT INTO impact_programs (title, description, image_url, sort_order)
VALUES 
    ('Public Schools Chess Development', 'Over the past three years, we have distributed chess sets to several public schools and actively supported the chess club at Mwiki Primary School in Githurai. While the overall chess program is thriving, there is a noticeable gap in public primary schools chess participation. Our goal is to continue strengthening chess in public schools.', '/images/pawn.png', 1),
    ('Chess for Informal Settlements', 'We have extended our chess programs into informal settlements, where access to structured extracurricular activities is often limited. Through the distribution of chess sets and partnerships with community based clubs (including Kibera Knights and Agape chess club), we are creating safe spaces for children and youth to learn, interact, and grow through chess. These initiatives aim to promote positive engagement and provide an alternative pathway away from negative social influences.', '/images/knight.png', 2),
    ('Juvenile Rehabilitation & Freedom', 'We engage juveniles in correctional facilities through structured chess training and mentorship. Through the Chess for Freedom initiative, we have distributed chess sets to prisons across Kenya and participated for the past three years in the Online Chess for Freedom World Tournament.', '/images/rookie.png', 3),
    ('Kakuma Refugee Camp Collaboration', 'We have partnered with FIDE and UNHCR under the Chess for Protection initiative in Kakuma Refugee Camp. Our work includes structured chess sessions, community engagement, and participation in mentorship activities, including those during International Chess Day.', '/images/bishop.png', 4),
    ('Infinite Chess for Autism', 'Launched in January 2025 at Autism School International in Thika, this specialized program supports children on the autism spectrum. It uses chess as a therapeutic and developmental tool, helping improve focus, communication, and cognitive skills. We are seeking committed partners to help expand this initiative.', '/images/queen.png', 5),
    ('Children''s Homes Development', 'We have established and continue to support chess programs in children''s homes across Kenya, including Familia Moja, Muthiga Hope, Happy Life, Ruiru, and Mully Children''s Family. These programs focus on consistent training, mentorship, and exposure through tournaments.', '/images/king.png', 6),
    ('Her MoveNext Kenyan Chapter', 'Dedicated to empowering girls and young women through chess education, leadership workshops, and targeted tournament exposure. This initiative builds confidence, critical thinking, and equal opportunities for girls and children across Kenya.', '/images/queen.png', 7),
    ('Chess Tournaments & Exposure', 'We organize chess tournaments that attract top players from across East Africa. These events provide valuable exposure for young players from our programs, allowing them to interact with experienced players, improve their skills, and build confidence.', '/images/Elite Pieces Focal.png', 8),
    ('Kenya Elite Chess Players Exchange Programme', 'Connecting Kenya''s top chess prodigies with international grandmasters and elite academies across the globe. Through structured player exchanges, high-level training camps, and international competition, we elevate Kenyan talent onto the world stage.', '/images/king.png', 9);
