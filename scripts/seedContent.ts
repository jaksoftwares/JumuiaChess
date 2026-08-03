import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load .env.local from the root of the project
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('Missing Supabase environment variables for Seeding script.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const log = (message: string) => {
  console.log(`[SEED] ${message}`);
};

export async function seedContent() {
  log('Starting seed process...');

  try {
    log('Attempting to reach Supabase tables...');

    const { data: existingSettings, error: settingsError } = await supabase
      .from('site_settings')
      .select('id')
      .eq('id', 1)
      .maybeSingle();

    if (settingsError) {
      console.error('[SEED] Failed reading site_settings:', settingsError);
      throw settingsError;
    }

    log(`site_settings query result: ${existingSettings ? 'found row' : 'no row'}`);

    if (!existingSettings) {
      log('Inserting default site_settings row...');
      const { error } = await supabase.from('site_settings').insert({
        id: 1,
        org_email: 'iykekonzolaw21@gmail.com',
        org_phone: '0722274720',
        mpesa_paybill: '174379',
        instagram_url: 'https://instagram.com/giftofchess',
        facebook_url: 'https://facebook.com/giftofchess',
        youtube_url: 'https://youtube.com/giftofchess',
        shop_enabled: true,
      });
      if (error) {
        console.error('[SEED] Failed inserting site_settings:', error);
        throw error;
      }
      log('site_settings inserted successfully');
    }

    const { data: existingProducts, error: productsError } = await supabase
      .from('products')
      .select('id')
      .limit(1);
    if (productsError) {
      console.error('[SEED] Failed reading products:', productsError);
      throw productsError;
    }
    log(`products query result: ${existingProducts.length > 0 ? 'found rows' : 'no rows'}`);
    if (existingProducts.length === 0) {
      log('Inserting default products...');
      const { error } = await supabase.from('products').insert([
        {
          name: 'Handcrafted Mahogany Board',
          image_url: '/images/king.png',
          price: 3500,
          description: 'A beautiful 12-inch chessboard set with premium finish, hand-carved mahogany and pine wooden chessmen. Each purchase funds 2 school boards.',
          in_stock: true,
        },
        {
          name: 'Weighted Tournament Pieces',
          image_url: '/images/queen.png',
          price: 1800,
          description: 'Regulation size, extra-weighted felt bottom chess pieces, perfect for tournament play and schools.',
          in_stock: true,
        },
        {
          name: 'Professional Digital Clock',
          image_url: '/images/knight.png',
          price: 4500,
          description: 'Digital chess timer with multiple delay, increment, and bonus settings. Standard for official events.',
          in_stock: true,
        },
      ]);
      if (error) {
        console.error('[SEED] Failed inserting products:', error);
        throw error;
      }
      log('products inserted successfully');
    }

    const { data: existingTournaments, error: tournamentsError } = await supabase
      .from('tournaments')
      .select('id')
      .limit(1);
    if (tournamentsError) {
      console.error('[SEED] Failed reading tournaments:', tournamentsError);
      throw tournamentsError;
    }
    log(`tournaments query result: ${existingTournaments.length > 0 ? 'found rows' : 'no rows'}`);
    if (existingTournaments.length === 0) {
      log('Inserting default tournaments...');
      const { error } = await supabase.from('tournaments').insert([
        {
          name: 'Junior Masters Championship',
          poster_url: '/images/kids.jpg',
          event_date: new Date(Date.now() + 86400000 * 10).toISOString(),
          venue: 'Mwiki Primary School, Githurai',
          categories: ['Under 12', 'Under 18'],
          entry_fee: 500,
          description: 'Competitive challenge designed for under-18 players to test their skills and earn official junior certifications and trophies.',
          status: 'upcoming',
        },
        {
          name: 'Jumuiya National Chess Open',
          poster_url: '/images/kids2.jpg',
          event_date: new Date(Date.now() + 86400000 * 20).toISOString(),
          venue: 'Nairobi National Museum',
          categories: ['Under 18', 'Open Category'],
          entry_fee: 1000,
          description: 'The premier national tournament bringing together top players across East Africa to compete for grand master points and cash prizes.',
          status: 'upcoming',
        },
      ]);
      if (error) {
        console.error('[SEED] Failed inserting tournaments:', error);
        throw error;
      }
      log('tournaments inserted successfully');
    }

    const { data: existingPosts, error: postsError } = await supabase
      .from('blog_posts')
      .select('id')
      .limit(1);
    if (postsError) {
      console.error('[SEED] Failed reading blog_posts:', postsError);
      throw postsError;
    }
    log(`blog_posts query result: ${existingPosts.length > 0 ? 'found rows' : 'no rows'}`);
    if (existingPosts.length === 0) {
      log('Inserting default blog posts...');
      const { error } = await supabase.from('blog_posts').insert([
        {
          title: 'Celebrating Minds of All Kinds: Infinite Chess Project in Kenya',
          slug: 'celebrating-minds-of-all-kinds-infinite-chess-kenya',
          featured_image_url: 'https://infinitechess.fide.com/wp-content/uploads/2026/04/Снимок-экрана-2026-04-22-123532-1536x856.png',
          excerpt: 'In partnership with FIDE, The Gift of Chess, and Kindness on the Board Foundation, structured chess mentorship is empowering neurodiverse children at Autism School International in Thika.',
          body: `This April, as the chess world recognizes Autism Awareness Month under the banner #CelebrateMindsOfAllKinds, the Kenya Infinite Chess Program is reporting meaningful progress in its work with children on the autism spectrum.\n\nRun by FIDE in partnership with The Gift of Chess and supported by Kindness on the Board Foundation, the program was launched in January 2025 at Autism School International in Thika. It uses chess as a structured yet flexible tool to support children with autism, helping them develop skills in a safe and supportive environment.\n\nThroughout this month, the program has centered its activities on creating inclusive spaces where children can learn, interact, and express themselves. The team has also focused on raising awareness about the importance of tailored learning approaches and inclusion.\n\nAccording to program coordinator in Kenya Phylis Ngigi, the children participating in the weekly sessions have shown encouraging progress in several key areas. These include improved focus, better communication, increased patience, and growing confidence.\n\nPhylis Ngigi explained that the structured nature of chess, combined with the flexibility to let each child learn at their own pace, has contributed to these positive changes. She noted that the benefits go beyond chess skills, pointing to the joy and meaningful engagement that the children now experience.\n\nThe Kenya Infinite Chess program is supported by a dedicated team. Lead Coach Claude Peter guides the chess sessions with patience and attention to the unique needs of each learner. His commitment has been essential to the progress seen so far.\n\nThe program also works closely with Autism School International in Thika. The school's director, Tr. Winnie, along with the support staff and teachers, joins the sessions and helps create a nurturing and enabling environment for the children.`,
          published: true,
          published_at: new Date('2026-04-22T10:00:00Z').toISOString(),
        },
        {
          title: "Nathan's Triumph: From Quiet Observer to Tournament Medalist",
          slug: 'nathans-triumph-quiet-observer-to-chess-champion',
          featured_image_url: 'https://infinitechess.fide.com/wp-content/uploads/2026/04/Снимок-экрана-2026-04-22-115432-1.png',
          excerpt: 'Meet Nathan. In January, he was a quiet observer on the sidelines. Today, he helps other children and earned 3rd place competing among players with disabilities.',
          body: `Look who’s playing now! As part of the #CelebrateMindsOfAllKinds initiative, the Infinite Chess project in Kenya is showing us what inclusion looks like in action.\n\nMeet Nathan. In January 2025, Nathan was a quiet observer sitting on the sidelines during chess sessions at Autism School International in Thika. Today? He is actively helping other children learn, competing in local tournaments, and recently earned 3rd place among players with disabilities.\n\nHis mother, Naomi Nyambura, shared her observations about the transformations she has seen in her son since joining the program:\n• Improved focus and concentration\n• A more thoughtful, deliberate approach to problem solving\n• Greater engagement and communication at home\n• Growing patience and self-confidence\n\n"Seeing the children grow in confidence, connection, and joy has been one of the most rewarding parts of my role," says Infinite Chess Coordinator Phylis Ngigi.\n\nCoach Claude Peter leads each session with patience, meeting every learner where they are. This is what happens when we create spaces where every mind can thrive.`,
          published: true,
          published_at: new Date('2026-04-22T14:30:00Z').toISOString(),
        },
        {
          title: '1,000 Chess Boards Arrive in Kakuma Refugee Camp',
          slug: 'kakuma-boards-distribution',
          featured_image_url: '/images/kids.jpg',
          excerpt: 'In partnership with FIDE and UNHCR coordinators, we have distributed 1,000 chess sets to schools and youth clubs across Kenya.',
          body: 'We are thrilled to announce that 1,000 high-quality chess boards have successfully arrived and been distributed within the Kakuma Refugee Camp in Kenya. Over the course of three weeks, community volunteers conducted introductory training sessions for over 500 children.',
          published: true,
          published_at: new Date('2026-03-15T09:00:00Z').toISOString(),
        },
      ]);
      if (error) {
        console.error('[SEED] Failed inserting blog_posts:', error);
        throw error;
      }
      log('blog_posts inserted successfully');
    }

    const { data: existingPartners, error: partnersError } = await supabase
      .from('partners')
      .select('id')
      .limit(1);
    if (partnersError) {
      console.error('[SEED] Failed reading partners:', partnersError);
      throw partnersError;
    }
    log(`partners query result: ${existingPartners.length > 0 ? 'found rows' : 'no rows'}`);
    if (existingPartners.length === 0) {
      log('Inserting default partners...');
      const { error } = await supabase.from('partners').insert([
        {
          name: 'FIDE',
          logo_url: '/images/king.png',
          website_url: 'https://fide.com',
        },
        {
          name: 'UNHCR',
          logo_url: '/images/queen.png',
          website_url: 'https://www.unhcr.org',
        },
        {
          name: 'Safaricom Foundation',
          logo_url: '/images/knight.png',
          website_url: 'https://www.safaricomfoundation.org',
        },
      ]);
      if (error) {
        console.error('[SEED] Failed inserting partners:', error);
        throw error;
      }
      log('partners inserted successfully');
    }

    log('Content seeding completed.');
  } catch (error) {
    console.error('[SEED] Failed to seed content:', error);
  }
}

seedContent();
