import Image from 'next/image';

export default function HowItStarted() {
  return (
    <section id="how-it-started" className="relative py-24 px-6 md:px-12 lg:px-16 xl:px-24 bg-stone-50 overflow-hidden scroll-mt-24 lg:scroll-mt-28">
      <div className="relative max-w-7xl mx-auto w-full z-10">
        {/* Section Title */}
        <div className="mb-12 md:mb-16">
          <span className="font-sans text-[10px] md:text-xs font-bold tracking-[0.25em] text-wood uppercase">
            How It Started
          </span>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* Left Column: Image */}
          <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden shadow-2xl">
            <Image
              src="/images/kids3.jpg"
              alt="Where our journey began"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover hover:scale-105 transition-transform duration-700 ease-in-out"
            />
            {/* Subtle Overlay */}
            <div className="absolute inset-0 bg-charcoal/10 mix-blend-multiply"></div>
          </div>

          {/* Right Column: Narrative */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-charcoal leading-[1.2]">
                A Simple Idea That Ignited a Movement.
              </h2>
              <div className="w-20 h-[3px] bg-wood/80 rounded-full" />
            </div>

            <div className="space-y-6 font-sans text-sm md:text-base lg:text-lg text-charcoal/80 leading-relaxed">
              <p>
                Our journey began not in grand tournament halls, but in local communities where potential was abundant but opportunities were scarce. We saw first-hand how the discipline and strategy of chess could captivate young minds and teach them invaluable life skills.
              </p>
              <p>
                What started with just a handful of chess sets and a few dedicated volunteers quickly grew. As children learned to think ahead on the board, they began to envision brighter futures for themselves. Today, that simple idea has blossomed into a global initiative, transforming thousands of lives one move at a time.
              </p>
            </div>
            
            {/* Timeline / Milestone markers could go here in future */}
            <div className="pt-4 flex items-center gap-8 border-t border-charcoal/10">
              <div>
                <span className="block font-serif text-3xl font-bold text-wood">20+</span>
                <span className="font-sans text-xs uppercase tracking-wider text-charcoal/60">Communities</span>
              </div>
              <div>
                <span className="block font-serif text-3xl font-bold text-wood">10k+</span>
                <span className="font-sans text-xs uppercase tracking-wider text-charcoal/60">Lives Touched</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
