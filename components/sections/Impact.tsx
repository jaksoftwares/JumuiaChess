'use client';

import Image from 'next/image';
import { ImpactProgram } from '@/types';

const FALLBACK_PROGRAMS = [
  {
    title: 'Public Schools Chess Development',
    description: 'Over the past three years, we have distributed chess sets to several public schools and actively supported the chess club at Mwiki Primary School in Githurai. While the overall chess program is thriving, there is a noticeable gap in public primary schools chess participation. Our goal is to continue strengthening chess in public schools.',
    image_url: '/images/pawn.png',
  },
  {
    title: 'Chess for Informal Settlements',
    description: 'We have extended our chess programs into informal settlements, where access to structured extracurricular activities is often limited. Through the distribution of chess sets and partnerships with community based clubs (including Kibera Knights and Agape chess club), we are creating safe spaces for children and youth to learn, interact, and grow through chess. These initiatives aim to promote positive engagement and provide an alternative pathway away from negative social influences.',
    image_url: '/images/knight.png',
  },
  {
    title: 'Juvenile Rehabilitation & Freedom',
    description: 'We engage juveniles in correctional facilities through structured chess training and mentorship. Through the Chess for Freedom initiative, we have distributed chess sets to prisons across Kenya and participated for the past three years in the Online Chess for Freedom World Tournament.',
    image_url: '/images/rookie.png',
  },
  {
    title: 'Kakuma Refugee Camp Collaboration',
    description: 'We have partnered with FIDE and UNHCR under the Chess for Protection initiative in Kakuma Refugee Camp. Our work includes structured chess sessions, community engagement, and participation in mentorship activities, including those during International Chess Day.',
    image_url: '/images/bishop.png',
  },
  {
    title: 'Infinite Chess for Autism',
    description: 'Launched in January 2025 at Autism School International in Thika, this specialized program supports children on the autism spectrum. It uses chess as a therapeutic and developmental tool, helping improve focus, communication, and cognitive skills. We are seeking committed partners to help expand this initiative.',
    image_url: '/images/queen.png',
  },
  {
    title: "Children's Homes Development",
    description: "We have established and continue to support chess programs in children's homes across Kenya, including Familia Moja, Muthiga Hope, Happy Life, Ruiru, and Mully Children's Family. These programs focus on consistent training, mentorship, and exposure through tournaments.",
    image_url: '/images/king.png',
  },
  {
    title: 'Her MoveNext Kenyan Chapter',
    description: 'Dedicated to empowering girls and young women through chess education, leadership workshops, and targeted tournament exposure. This initiative builds confidence, critical thinking, and equal opportunities for girls and children across Kenya.',
    image_url: '/images/queen.png',
  },
  {
    title: 'Chess Tournaments & Exposure',
    description: 'We organize chess tournaments that attract top players from across East Africa. These events provide valuable exposure for young players from our programs, allowing them to interact with experienced players, improve their skills, and build confidence.',
    image_url: '/images/Elite Pieces Focal.png',
  },
  {
    title: 'Kenya Elite Chess Players Exchange Programme',
    description: "Connecting Kenya's top chess prodigies with international grandmasters and elite academies across the globe. Through structured player exchanges, high-level training camps, and international competition, we elevate Kenyan talent onto the world stage.",
    image_url: '/images/king.png',
  },
];

export default function Impact({ programs = [] }: { programs?: ImpactProgram[] }) {
  const displayPrograms = programs.length > 0 ? programs : FALLBACK_PROGRAMS;

  return (
    <section id="impact" className="py-24 px-6 bg-stone/10 relative scroll-mt-24 lg:scroll-mt-28">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <span className="font-sans text-xs font-semibold tracking-widest text-wood uppercase">
            Our Core Pillars
          </span>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-charcoal">
            Framework for Impact
          </h2>
          <p className="font-sans text-charcoal/70">
            Chess is more than a game&mdash;it is an engine for social intervention and development. We direct resources to specific focus areas.
          </p>
        </div>

        {/* 9 Program Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayPrograms.map((program, index) => {
              const isDark = index % 2 === 1;

              return (
                <div
                  key={program.title}
                  className={`p-8 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 group flex flex-col justify-between ${
                    isDark
                      ? 'bg-[#4A433D] text-white border border-transparent hover:border-white/30'
                      : 'bg-white text-charcoal border border-[#C8B195]/40 hover:border-wood/80'
                  }`}
                >
                  <div>
                    {/* Circle Image Wrapper */}
                    <div
                      className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-6 overflow-hidden transition-all duration-300 ${
                        isDark
                          ? 'bg-white/10 border border-white/20'
                          : 'bg-stone/5 border border-stone/20'
                      }`}
                    >
                      <div className="relative w-10 h-10 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 flex items-center justify-center">
                        <img
                          src={program.image_url}
                          alt={program.title}
                          className="object-contain w-full h-full max-w-[40px] max-h-[40px]"
                        />
                      </div>
                    </div>

                    <h3
                      className={`font-serif text-xl font-bold mb-3 ${
                        isDark ? 'text-white' : 'text-charcoal'
                      }`}
                    >
                      {program.title}
                    </h3>
                    <p
                      className={`font-sans text-sm leading-relaxed ${
                        isDark ? 'text-white/80' : 'text-charcoal/70'
                      }`}
                    >
                      {program.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
      </div>
    </section>
  );
}
