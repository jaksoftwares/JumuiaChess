import { supabase } from '../config/supabase';

const log = (message: string) => {
  console.log(`[SEED] ${message}`);
};

export async function seedContent() {
  log('Starting seed process...');

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    log('Skipping content seeding because Supabase credentials are not configured.');
    return;
  }

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
        org_email: 'info@giftofchess.org',
        org_phone: '+254700000000',
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
          title: '1,000 Chess Boards Arrive in Kakuma Refugee Camp',
          slug: 'kakuma-boards-distribution',
          featured_image_url: '/images/kids.jpg',
          excerpt: 'In partnership with FIDE and UNHCR coordinators, we have distributed 1,000 chess sets to schools and youth clubs.',
          body: 'We are thrilled to announce that 1,000 high-quality chess boards have successfully arrived and been distributed within the Kakuma Refugee Camp in Kenya. Over the course of three weeks, community volunteers conducted introductory training sessions for over 500 children.',
          published: true,
          published_at: new Date().toISOString(),
        },
        {
          title: 'Expanding Our Autism Chess Program Globally',
          slug: 'expanding-autism-chess-program',
          featured_image_url: '/images/kids2.jpg',
          excerpt: 'Following successful pilots, we are introducing structured chess mentorship curricula specifically tailored for neurodiverse children.',
          body: 'Our Infinite Chess program has shown remarkable success in aiding concentration and logical sequencing in children diagnosed with autism spectrum disorder.',
          published: true,
          published_at: new Date().toISOString(),
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
