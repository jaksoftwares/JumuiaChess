'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { apiRequest } from '@/lib/api';
import { Partner } from '@/types';
import { Loader2 } from 'lucide-react';

export default function Partners() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPartners() {
      try {
        const res = await apiRequest<Partner[]>('/partners');
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          const pieceImages = ['/images/king.png', '/images/queen.png', '/images/knight.png', '/images/bishop.png'];
          const mapped = res.data.map((p, idx) => ({
            ...p,
            logo_url: p.logo_url || pieceImages[idx % pieceImages.length]
          }));
          setPartners(mapped);
        } else {
          setPartners([]);
        }
      } catch (err) {
        console.error('[Partners Section] Error loading partners:', err);
        setPartners([]);
      } finally {
        setLoading(false);
      }
    }
    loadPartners();
  }, []);

  return (
    <section id="partners" className="relative w-full bg-gradient-to-b from-white via-[#FAF7F2] to-white py-6 md:py-10 overflow-hidden scroll-mt-24 lg:scroll-mt-28">
      {/* Top & Bottom Ambient Gradient Blends */}
      <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white to-transparent pointer-events-none z-20" />
      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white to-transparent pointer-events-none z-20" />

      <div 
        className="relative w-full h-[380px] md:h-[440px] flex items-center justify-center z-10 py-6 md:py-10 px-4 md:px-8"
        style={{ clipPath: "polygon(0 12%, 100% 0, 100% 88%, 0 100%)" }}
      >
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-fixed bg-cover bg-center bg-no-repeat z-0"
          style={{ backgroundImage: "url('/images/sponsers_backg.jpeg')" }}
        />
        {/* Dark Overlay mask */}
        <div className="absolute inset-0 bg-black/65 z-0" />

        {/* Content Container */}
        <div className="relative z-10 max-w-5xl w-full mx-auto px-6 md:px-12 flex flex-col items-center justify-center space-y-4 md:space-y-6">
          {/* Header */}
          <div className="text-center space-y-1.5">
            <span className="font-sans text-[10px] md:text-xs font-bold tracking-[0.2em] text-[#C8B195] uppercase">
              Sponsors & Coalitions
            </span>
            <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl font-bold text-white tracking-tight leading-tight">
              Collaborating Organizations
            </h2>
            <div className="w-12 h-0.5 bg-[#C8B195] mx-auto rounded" />
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-[#C8B195]" />
            </div>
          ) : partners.length === 0 ? (
            <div className="rounded-2xl bg-black/40 backdrop-blur-md p-6 text-center text-xs text-white/80">
              No partner organizations published yet. Add partners from the admin dashboard to feature them here.
            </div>
          ) : (
            <div className="w-full overflow-hidden relative py-2">
              {/* Subtle edge fade overlays for smooth scroll transition */}
              <div className="absolute left-0 top-0 bottom-0 w-10 md:w-20 bg-gradient-to-r from-black/80 to-transparent z-10 pointer-events-none" />
              <div className="absolute right-0 top-0 bottom-0 w-10 md:w-20 bg-gradient-to-l from-black/80 to-transparent z-10 pointer-events-none" />

              <div className="animate-marquee flex items-center gap-5 md:gap-6">
                {[...partners, ...partners, ...partners, ...partners].map((partner, idx) => (
                  <a
                    key={`${partner.id}-${idx}`}
                    href={partner.website_url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-[200px] md:w-[240px] shrink-0 border border-white/20 hover:border-[#C8B195]/80 bg-black/40 backdrop-blur-md rounded-2xl p-5 text-center flex flex-col items-center justify-center gap-3 hover:-translate-y-1.5 hover:bg-black/60 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] transition-all duration-300 group"
                  >
                    {/* Partner logo */}
                    <div className="relative w-16 h-16 md:w-20 md:h-20 group-hover:scale-110 transition-transform duration-300">
                      <Image
                        src={partner.logo_url}
                        alt={partner.name}
                        fill
                        unoptimized
                        sizes="80px"
                        className="object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.4)]"
                      />
                    </div>

                    <span className="font-sans text-xs md:text-sm font-semibold tracking-wide text-white/90 group-hover:text-[#C8B195] transition-colors leading-snug truncate max-w-[180px]">
                      {partner.name}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
