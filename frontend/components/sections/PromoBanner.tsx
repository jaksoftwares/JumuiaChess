import Link from 'next/link';

export default function PromoBanner() {
  return (
    <section className="relative w-full bg-white py-16 md:py-20 overflow-hidden">
      <div 
        className="relative w-full h-[380px] md:h-[440px] flex items-center justify-center z-10"
        style={{ clipPath: "polygon(0 12%, 100% 0, 100% 88%, 0 100%)" }}
      >
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-fixed bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/images/promobanner.jpg')" }}
        />
        {/* Dark Overlay mask to ensure text contrast */}
        <div className="absolute inset-0 bg-black/55 z-0" />

        {/* Content Container */}
        <div className="relative max-w-7xl mx-auto w-full px-6 md:px-12 lg:px-20 z-10 grid grid-cols-1 lg:grid-cols-2 items-center">
          {/* Left Column left empty to keep the gold king visible */}
          <div className="hidden lg:block" />

          {/* Right Column: Text & CTA */}
          <div className="text-left space-y-4 md:space-y-6 lg:pl-12">
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
              Be Part of Our Story <br />
              And <span className="text-[#C8B195]">Support the Initiative</span>
            </h2>
            <p className="font-sans text-xs md:text-sm text-stone/85 max-w-md leading-relaxed">
              Your support helps us distribute chess boards, run school programs, and provide training and mentorship to young minds in communities across Kenya.
            </p>
            <Link 
              href="#contact"
              className="inline-block px-8 py-3 bg-[#C8B195] text-charcoal font-sans text-xs md:text-sm font-bold shadow-md hover:shadow-xl hover:-translate-y-0.5 hover:scale-[1.03] active:translate-y-0 active:scale-[0.98] hover:bg-[#B89E82] transition-all duration-300"
            >
              Get Involved
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
