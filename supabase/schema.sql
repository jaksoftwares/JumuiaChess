-- Enable UUID extension if not active
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. CONTENT TABLES

-- tournaments
CREATE TABLE IF NOT EXISTS tournaments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    poster_url TEXT,
    event_date TIMESTAMP WITH TIME ZONE NOT NULL,
    venue TEXT NOT NULL,
    categories TEXT[] NOT NULL,
    entry_fee NUMERIC(10, 2) NOT NULL,
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
    max_participants INTEGER DEFAULT 100,
    registration_deadline TIMESTAMP WITH TIME ZONE,
    terms_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select for tournaments" 
    ON tournaments FOR SELECT 
    USING (true);

-- blog_posts
CREATE TABLE IF NOT EXISTS blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    featured_image_url TEXT,
    excerpt TEXT NOT NULL,
    body TEXT NOT NULL,
    published BOOLEAN NOT NULL DEFAULT false,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select for published blog posts" 
    ON blog_posts FOR SELECT 
    USING (published = true);

-- gallery_images
CREATE TABLE IF NOT EXISTS gallery_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    image_url TEXT NOT NULL,
    caption TEXT NOT NULL,
    category TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select for gallery images" 
    ON gallery_images FOR SELECT 
    USING (true);

-- team_members
CREATE TABLE IF NOT EXISTS team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    bio TEXT NOT NULL,
    image_url TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select for team members"
    ON team_members FOR SELECT
    USING (true);

-- products
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    image_url TEXT NOT NULL,
    images TEXT[] DEFAULT '{}',
    price NUMERIC(10, 2) NOT NULL,
    description TEXT NOT NULL,
    in_stock BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select for in-stock products" 
    ON products FOR SELECT 
    USING (in_stock = true);

-- partners
CREATE TABLE IF NOT EXISTS partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    logo_url TEXT NOT NULL,
    website_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE partners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select for partners" 
    ON partners FOR SELECT 
    USING (true);

-- impact_programs
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
    '+254700000000', 
    '174379', 
    true,
    'Our Story',
    'Elevating Strategy from the Board to the Community.',
    'The Gift of Chess is a nonprofit organization dedicated to using chess as a tool for education, personal development, and social transformation. Since our inception, we have worked with schools, children''s homes, prisons, and refugee communities across Kenya to nurture talent, build critical thinking, and provide safe, constructive spaces where children and youth can grow and thrive.',
    'In Kenya, we have also integrated an environmental sustainability component into our work. In partnership with Kijiji Solutions, we recycle plastic waste to produce chess sets, turning waste into meaningful tools that expand access to chess while contributing to climate action.'
)
ON CONFLICT (id) DO NOTHING;


-- 2. TRANSACTIONAL TABLES (RLS Enabled, No Public Policies)

-- registrations
CREATE TABLE IF NOT EXISTS registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
    player_name TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    email TEXT, -- email to send Resend confirmations
    age INTEGER NOT NULL,
    date_of_birth DATE,
    gender TEXT,
    country TEXT DEFAULT 'Kenya',
    fide_id TEXT,
    school TEXT,
    category TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    accompanying_person TEXT,
    consent_given BOOLEAN DEFAULT false,
    amount NUMERIC(10, 2) NOT NULL,
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed')),
    checkout_request_id TEXT UNIQUE,
    mpesa_receipt TEXT,
    ticket_number TEXT UNIQUE,
    attendance_status TEXT NOT NULL DEFAULT 'registered' CHECK (attendance_status IN ('registered', 'checked-in')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- shop_orders
CREATE TABLE IF NOT EXISTS shop_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    items JSONB NOT NULL, -- list of items purchased
    amount NUMERIC(10, 2) NOT NULL,
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed')),
    checkout_request_id TEXT UNIQUE,
    mpesa_receipt TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE shop_orders ENABLE ROW LEVEL SECURITY;

-- contact_messages
CREATE TABLE IF NOT EXISTS contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
