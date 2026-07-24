import Image from 'next/image';

const PROGRAMS = [
  {
    title: 'Public Schools Chess Development',
    description: 'Over the past three years, we have distributed chess sets to several public schools and actively supported the chess club at Mwiki Primary School in Githurai. While the overall chess program is thriving, there is a noticeable gap in public primary schools chess participation. Our goal is to continue strengthening chess in public schools.',
    image: '/images/pawn.png',
  },
  {
    title: 'Chess for Informal Settlements',
    description: 'We have extended our chess programs into informal settlements, where access to structured extracurricular activities is often limited. Through the distribution of chess sets and partnerships with community based clubs (including Kibera Knights and Agape chess club), we are creating safe spaces for children and youth to learn, interact, and grow through chess. These initiatives aim to promote positive engagement and provide an alternative pathway away from negative social influences.',
    image: '/images/knight.png',
  },
  {
    title: 'Juvenile Rehabilitation & Freedom',
    description: 'We engage juveniles in correctional facilities through structured chess training and mentorship. Through the Chess for Freedom initiative, we have distributed chess sets to prisons across Kenya and participated for the past three years in the Online Chess for Freedom World Tournament.',
    image: '/images/rookie.png',
  },
  {
    title: 'Kakuma Refugee Camp Collaboration',
    description: 'We have partnered with FIDE and UNHCR under the Chess for Protection initiative in Kakuma Refugee Camp. Our work includes structured chess sessions, community engagement, and participation in mentorship activities, including those during International Chess Day.',
    image: '/images/bishop.png',
  },
  {
    title: 'Infinite Chess for Autism',
    description: 'Launched in January 2025 at Autism School International in Thika, this specialized program supports children on the autism spectrum. It uses chess as a therapeutic and developmental tool, helping improve focus, communication, and cognitive skills. We are seeking committed partners to help expand this initiative.',
    image: '/images/queen.png',
  },
  {
    title: "Children's Homes Development",
    description: "We have established and continue to support chess programs in children's homes across Kenya, including Familia Moja, Muthiga Hope, Happy Life, Ruiru, and Mully Children's Family. These programs focus on consistent training, mentorship, and exposure through tournaments.",
    image: '/images/king.png',
  },
  {
    title: 'Chess Tournaments & Exposure',
    description: 'We organize chess tournaments that attract top players from across East Africa. These events provide valuable exposure for young players from our programs, allowing them to interact with experienced players, improve their skills, and build confidence.',
    image: '/images/Elite Pieces Focal.png',
  },
];

export default function Impact() {
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

        {/* 7 Program Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {PROGRAMS.map((program, index) => {
            const isLast = index === PROGRAMS.length - 1;
            const isOdd = index % 2 !== 0;

            // Pattern logic:
            // For items 0..5: odd items are dark, even items are light.
            // For last item (index 6):
            // - On Mobile/Tablet (< lg): Light mode to maintain Light-Dark alternating pattern after item 5 (Dark).
            // - On Desktop (lg): Dark mode (brownish #4A433D) to maintain the desktop pattern & centered highlight.
            
            const isDark = isOdd && !isLast;

            return (
              <div
                key={program.title}
                className={`p-8 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 group flex flex-col justify-between ${
                  isLast
                    ? 'bg-white text-charcoal border border-[#C8B195]/40 hover:border-wood/80 lg:bg-[#4A433D] lg:text-white lg:border-transparent lg:hover:border-white/30 lg:col-start-2'
                    : isDark
                    ? 'bg-[#4A433D] text-white border border-transparent hover:border-white/30'
                    : 'bg-white text-charcoal border border-[#C8B195]/40 hover:border-wood/80'
                }`}
              >
                <div>
                  {/* Circle Image Wrapper */}
                  <div
                    className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-6 overflow-hidden transition-all duration-300 ${
                      isLast
                        ? 'bg-stone/5 border border-stone/20 lg:bg-white/10 lg:border-white/20'
                        : isDark
                        ? 'bg-white/10 border border-white/20'
                        : 'bg-stone/5 border border-stone/20'
                    }`}
                  >
                    <div className="relative w-10 h-10 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                      <Image
                        src={program.image}
                        alt={program.title}
                        fill
                        sizes="40px"
                        className="object-contain"
                      />
                    </div>
                  </div>

                  <h3
                    className={`font-serif text-xl font-bold mb-3 ${
                      isLast
                        ? 'text-charcoal lg:text-white'
                        : isDark
                        ? 'text-white'
                        : 'text-charcoal'
                    }`}
                  >
                    {program.title}
                  </h3>
                  <p
                    className={`font-sans text-sm leading-relaxed ${
                      isLast
                        ? 'text-charcoal/70 lg:text-white/80'
                        : isDark
                        ? 'text-white/80'
                        : 'text-charcoal/70'
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
