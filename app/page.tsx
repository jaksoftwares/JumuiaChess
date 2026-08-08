import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { Product, BlogPost, Video, ImpactProgram } from '@/types';

// Sections
import Hero from '@/components/sections/Hero';
import OurStory from '@/components/sections/OurStory';
import MeetTheTeam from '@/components/sections/MeetTheTeam';
import Impact from '@/components/sections/Impact';
import Gallery from '@/components/sections/Gallery';
import PromoBanner from '@/components/sections/PromoBanner';
import Tournaments from '@/components/sections/Tournaments';
import Shop from '@/components/sections/Shop';
import BlogNews from '@/components/sections/BlogNews';
import Partners from '@/components/sections/Partners';
import ContactUs from '@/components/sections/ContactUs';

export const revalidate = 60; // revalidate every 60 seconds

export default async function Home() {
  // Fetch all necessary data concurrently on the server
  const [
    { data: productsData },
    { data: postsData },
    { data: videosData },
    { data: impactData }
  ] = await Promise.all([
    supabaseAdmin.from('products').select('*').order('created_at', { ascending: false }),
    supabaseAdmin.from('blog_posts').select('*').order('published_at', { ascending: false }),
    supabaseAdmin.from('videos').select('*').order('created_at', { ascending: false }),
    supabaseAdmin.from('impact_programs').select('*').order('created_at', { ascending: true })
  ]);

  const products = (productsData || []).filter(p => p.in_stock) as Product[];
  const posts = (postsData || []) as BlogPost[];
  const videos = (videosData || []) as Video[];
  const programs = (impactData || []) as ImpactProgram[];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': 'https://jumuiyachess.org/#organization',
        name: 'Jumuiya Chess Foundation',
        url: 'https://jumuiyachess.org',
        logo: 'https://jumuiyachess.org/images/logo.png',
        description: 'Transforming lives globally through the power of chess. We distribute chess boards, organize local tournaments, and foster communities.',
        sameAs: [
          'https://twitter.com/jumuiyachess',
          'https://instagram.com/jumuiyachess',
        ],
      },
      {
        '@type': 'WebSite',
        '@id': 'https://jumuiyachess.org/#website',
        url: 'https://jumuiyachess.org',
        name: 'Jumuiya Chess',
        publisher: {
          '@id': 'https://jumuiyachess.org/#organization',
        },
      },
    ],
  };

  return (
    <>
      <Navbar />
      <main className="flex-grow pt-[72px]">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* Sections ordered corresponding to anchor requirements */}
        <Hero />
        <OurStory />
        <MeetTheTeam />
        <Impact programs={programs} />
        <Gallery />
        <Tournaments />
        <PromoBanner />
        <Shop products={products} />
        <BlogNews posts={posts} videos={videos} />
        <Partners />
        <ContactUs />
      </main>
      <Footer />
    </>
  );
}
