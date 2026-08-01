'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { apiRequest } from '@/lib/api';
import { SiteSettings } from '@/types';

export default function OurStory() {
  const [storyContent, setStoryContent] = useState<{
    title: string;
    heading: string;
    paragraph1: string;
    paragraph2: string;
  }>({
    title: 'Our Story',
    heading: 'Elevating Strategy from the Board to the Community.',
    paragraph1: "The Gift of Chess is a nonprofit organization dedicated to using chess as a tool for education, personal development, and social transformation. Since our inception, we have worked with schools, children's homes, prisons, and refugee communities across Kenya to nurture talent, build critical thinking, and provide safe, constructive spaces where children and youth can grow and thrive.",
    paragraph2: "In Kenya, we have also integrated an environmental sustainability component into our work. In partnership with Kijiji Solutions, we recycle plastic waste to produce chess sets, turning waste into meaningful tools that expand access to chess while contributing to climate action.",
  });

  useEffect(() => {
    async function fetchStoryContent() {
      try {
        const res = await apiRequest<SiteSettings>('/settings');
        if (res?.success && res?.data) {
          setStoryContent({
            title: res.data.our_story_title || 'Our Story',
            heading: res.data.our_story_heading || 'Elevating Strategy from the Board to the Community.',
            paragraph1: res.data.our_story_paragraph_1 || "The Gift of Chess is a nonprofit organization dedicated to using chess as a tool for education, personal development, and social transformation. Since our inception, we have worked with schools, children's homes, prisons, and refugee communities across Kenya to nurture talent, build critical thinking, and provide safe, constructive spaces where children and youth can grow and thrive.",
            paragraph2: res.data.our_story_paragraph_2 || "In Kenya, we have also integrated an environmental sustainability component into our work. In partnership with Kijiji Solutions, we recycle plastic waste to produce chess sets, turning waste into meaningful tools that expand access to chess while contributing to climate action.",
          });
        }
      } catch (err) {
        console.error('[OurStory Section] Error loading dynamic content:', err);
      }
    }
    fetchStoryContent();
  }, []);

  return (
    <section id="our-story" className="relative py-24 px-6 md:px-12 lg:px-16 xl:px-24 bg-white overflow-hidden scroll-mt-24 lg:scroll-mt-28">
      {/* Background Image with opacity for clean overlay effect */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/background.png"
          alt="Chessboard Background"
          fill
          sizes="100vw"
          className="object-cover opacity-[0.18]"
          priority
        />
      </div>

      <div className="relative max-w-7xl mx-auto w-full z-10">
        {/* Section Title */}
        <div className="mb-10">
          <span className="font-sans text-[10px] md:text-xs font-bold tracking-[0.25em] text-wood uppercase">
            {storyContent.title}
          </span>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Left Column: Heading & Underline */}
          <div className="space-y-6">
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-charcoal leading-[1.1] max-w-xl">
              {storyContent.heading}
            </h2>
            <div className="w-20 h-[3px] bg-charcoal/80 rounded-full" />
          </div>

          {/* Right Column: Narrative */}
          <div className="space-y-6 font-sans text-sm md:text-base lg:text-lg text-charcoal/85 leading-relaxed max-w-2xl">
            <p>{storyContent.paragraph1}</p>
            {storyContent.paragraph2 && <p>{storyContent.paragraph2}</p>}
          </div>
        </div>
      </div>
    </section>
  );
}
