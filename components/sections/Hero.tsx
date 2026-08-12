import Link from 'next/link';
import Image from 'next/image';

export default function Hero() {
  return (
    <section
      id="home"
      className="relative min-h-screen lg:h-screen lg:min-h-0 flex items-center bg-offwhite pt-12 lg:pt-16 pb-10 px-6 md:px-12 lg:px-16 xl:px-24 overflow-hidden"
    >
      {/* Hero Background Image & Shadows */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none">
        <Image
          src="/images/hero_background.jpeg"
          alt="Hero Background"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-[0.26] mix-blend-multiply"
        />
        {/* Radial vignette shadow & bottom linear fade shadow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_20%,_rgba(0,0,0,0.12)_100%)] opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-offwhite" />
      </div>

      <div className="relative max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-[480px_1fr] lg:grid-rows-[auto_auto] gap-8 lg:gap-x-16 xl:gap-x-24 lg:gap-y-6 items-center lg:-translate-y-16">

        {/* Child 1: Subtitle & Title */}
        <div className="space-y-4 flex flex-col justify-center items-start text-left z-10 lg:max-w-[480px] w-full lg:col-start-1 lg:col-end-2 lg:row-start-1 lg:row-end-2">
          <span className="font-serif italic text-xs md:text-sm font-medium tracking-wide text-charcoal/70 whitespace-nowrap">
            Powered by The Gift of Chess Africa &bull; Kenyan Chapter
          </span>

          <h1 className="font-serif text-5xl md:text-6xl lg:text-[4.5rem] xl:text-[5.5rem] font-bold tracking-tight text-charcoal leading-[0.98]">
            We Don't <br />
            Just <br />
            Play Chess. <br />
            <span className="italic font-normal">We Build</span> <br />
            Thinkers.
          </h1>
        </div>

        {/* Child 2: Hero Image (Interleaved on mobile, sits in right column on desktop) */}
        <div className="relative w-full h-[400px] sm:h-[520px] lg:h-[700px] xl:h-[800px] flex items-center justify-center lg:col-start-2 lg:col-end-3 lg:row-start-1 lg:row-span-2">
          <div className="relative w-full h-full filter drop-shadow-[0_25px_35px_rgba(0,0,0,0.18)]">
            <Image
              src="/images/hero.png"
              alt="Jumuiya Chess Hero Illustration"
              fill
              priority
              sizes="(max-w-[1280px]) 100vw, 50vw"
              className="object-contain"
            />
          </div>
        </div>

        {/* Child 3: Description Paragraph & CTA Buttons */}
        <div className="space-y-6 flex flex-col justify-center items-start text-left z-10 lg:max-w-[480px] w-full lg:col-start-1 lg:col-end-2 lg:row-start-2 lg:row-end-3">
          <p className="font-sans text-sm md:text-base text-charcoal/70 leading-relaxed">
            Through the power of critical thinking and deliberate strategy, The Gift of Chess Initiative unlocks the potential of young minds across Kenya turning life's complex challenges into tactical opportunities.
          </p>

          <div className="flex flex-row items-center gap-4 pt-2">
            <Link
              href="#contact"
              className="px-7 py-3.5 bg-black text-offwhite font-sans text-xs md:text-sm font-semibold rounded-full shadow-md hover:shadow-xl hover:scale-[1.03] active:scale-[0.98] hover:bg-black/90 transition-all duration-300 text-center"
            >
              Join the Initiative
            </Link>
            <Link
              href="#impact"
              className="px-7 py-3.5 border border-charcoal/30 text-charcoal font-sans text-xs md:text-sm font-semibold rounded-full hover:bg-charcoal hover:text-offwhite hover:border-transparent hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 text-center flex items-center justify-center gap-1.5"
            >
              Our Impact &rarr;
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}




