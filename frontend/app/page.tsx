import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

// Sections
import Hero from '@/components/sections/Hero';
import OurStory from '@/components/sections/OurStory';
import Impact from '@/components/sections/Impact';
import PromoBanner from '@/components/sections/PromoBanner';
import Tournaments from '@/components/sections/Tournaments';
import Shop from '@/components/sections/Shop';
import BlogNews from '@/components/sections/BlogNews';
import Partners from '@/components/sections/Partners';
import ContactUs from '@/components/sections/ContactUs';

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-grow pt-[72px]">
        {/* Sections ordered corresponding to anchor requirements */}
        <Hero />
        <OurStory />
        <Impact />
        <PromoBanner />
        <Tournaments />
        <Shop />
        <BlogNews />
        <Partners />
        <ContactUs />
      </main>
      <Footer />
    </>
  );
}
