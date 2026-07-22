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
      const res = await apiRequest<Partner[]>('/partners');
      if (res.success && res.data && res.data.length > 0) {
        // Map backend partners to include chess piece fallback images if logo_url is missing
        const pieceImages = ['/images/king.png', '/images/queen.png', '/images/knight.png', '/images/bishop.png'];
        const mapped = res.data.map((p, idx) => ({
          ...p,
          logo_url: p.logo_url || pieceImages[idx % pieceImages.length]
        }));
        setPartners(mapped);
      } else {
        // Fallback demo partners
        setPartners([
          { id: 'p1', name: 'FIDE (International Chess Federation)', logo_url: '/images/king.png' },
          { id: 'p2', name: 'UNHCR (United Nations Refugee Agency)', logo_url: '/images/queen.png' },
          { id: 'p3', name: 'Chess.com', logo_url: '/images/knight.png' },
          { id: 'p4', name: 'Safaricom Foundation', logo_url: '/images/bishop.png' },
        ]);
      }
      setLoading(false);
    }
    loadPartners();
  }, []);

  return (
    <section id="partners" className="relative w-full bg-white py-16 md:py-20 overflow-hidden">
      <div 
        className="relative w-full min-h-[550px] md:min-h-[600px] flex items-center justify-center z-10 py-20 md:py-28 px-4 md:px-8"
        style={{ clipPath: "polygon(0 12%, 100% 0, 100% 88%, 0 100%)" }}
      >
        {/* Background Image - Stuck/Fixed (Matching CTA style exactly) */}
        <div 
          className="absolute inset-0 bg-fixed bg-cover bg-center bg-no-repeat z-0"
          style={{ backgroundImage: "url('/images/sponsers_backg.jpeg')" }}
        />
        {/* Dark Overlay mask to ensure text contrast and premium depth */}
        <div className="absolute inset-0 bg-black/65 z-0" />

        {/* Content Container - Plain/Transparent (No glass effect here) */}
        <div className="relative z-10 max-w-5xl w-full mx-auto px-6 md:px-12 py-10 md:py-14 flex flex-col items-center justify-center space-y-10 md:space-y-12">
          {/* Header */}
          <div className="text-center space-y-3">
            <span className="font-sans text-xs font-bold tracking-[0.2em] text-[#C8B195] uppercase">
              Sponsors & Coalitions
            </span>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
              Collaborating Organizations
            </h2>
            <div className="w-16 h-1 bg-[#C8B195] mx-auto rounded" />
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#C8B195]" />
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 items-stretch justify-center w-full">
              {partners.map((partner) => (
                <a
                  key={partner.id}
                  href={partner.website_url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/10 backdrop-blur-md border border-white/20 p-6 md:p-8 rounded-3xl text-center flex flex-col items-center justify-center space-y-4 hover:bg-white/20 hover:border-[#C8B195]/40 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] transition-all duration-300 group shadow-lg"
                >
                  {/* Chess piece logo symbol */}
                  <div className="relative w-16 h-16 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                    <Image
                      src={partner.logo_url}
                      alt={partner.name}
                      fill
                      sizes="64px"
                      className="object-contain filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.3)]"
                    />
                  </div>
                  
                  <span className="font-sans text-xs md:text-sm font-semibold tracking-wide text-white/90 group-hover:text-[#C8B195] transition-colors leading-snug">
                    {partner.name}
                  </span>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

