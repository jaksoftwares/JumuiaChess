'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { apiRequest } from '@/lib/api';
import { Calendar, MapPin, Loader2, ArrowRight } from 'lucide-react';

const TOURNAMENT_CONFIGS = [
  { image: '/images/kids.jpg', isDark: false },
  { image: '/images/kids2.jpg', isDark: true },
  { image: '/images/kids3.jpg', isDark: false }
];

export default function Tournaments() {
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTournaments() {
      try {
        const res = await apiRequest<any[]>('/tournaments');
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          const sorted = [...res.data].sort((a, b) => {
            const dateA = new Date(a.event_date).getTime();
            const dateB = new Date(b.event_date).getTime();
            if (isNaN(dateA)) return 1;
            if (isNaN(dateB)) return -1;
            return dateA - dateB;
          });
          setTournaments(sorted);
        } else {
          setTournaments([]);
        }
      } catch (err) {
        console.error('[Tournaments Section] Error loading tournaments:', err);
        setTournaments([]);
      } finally {
        setLoading(false);
      }
    }
    loadTournaments();
  }, []);

  return (
    <section id="tournaments" className="py-24 px-6 bg-white relative scroll-mt-24 lg:scroll-mt-28">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <span className="font-sans text-xs font-semibold tracking-widest text-[#6B4A34] uppercase">
              Compete & Grow
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-charcoal leading-tight">
              Upcoming Tournaments
            </h2>
            <p className="font-sans text-xs md:text-sm text-charcoal/70 leading-relaxed">
              Participate in our chess tournaments. Every entry fee directly supports board donations and chess-in-school curriculums.
            </p>
          </div>

          <div className="flex items-center gap-4 self-start md:self-auto">
            <Link 
              href="/tournaments"
              className="group inline-flex items-center text-[#6B4A34] font-sans text-sm font-bold hover:text-[#2A170F] transition-colors duration-300 whitespace-nowrap hover:underline underline-offset-4"
            >
              See All
              <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#6B4A34]" />
          </div>
        ) : tournaments.length === 0 ? (
          <div className="rounded-2xl border border-[#232320]/20 bg-[#FAF7F2] p-8 text-center text-sm text-[#232320]/70">
            No tournaments are currently published.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {tournaments.slice(0, 3).map((t, index) => {
              const config = TOURNAMENT_CONFIGS[index % TOURNAMENT_CONFIGS.length];
              const posterImage = t.poster_url || config.image;
              
              const capacity = t.max_participants || 100;
              const registered = t.registrations_count || 0;
              const isFull = registered >= capacity;
              const capacityPercentage = Math.min((registered / capacity) * 100, 100);

              return (
                <div key={t.id} className="relative overflow-hidden h-[450px] rounded-[24px] border border-stone-200 shadow-lg group flex flex-col justify-end bg-[#232320]">
                  <div className="absolute inset-0 z-0">
                    <Image
                      src={posterImage}
                      alt={t.name}
                      fill
                      unoptimized
                      sizes="(max-w-7xl) 100vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-80"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#232320] via-[#232320]/50 to-transparent" />
                  </div>

                  <div className="relative z-10 p-6 flex flex-col space-y-4">
                    <div>
                      <h3 className="font-serif text-xl md:text-2xl font-bold text-white leading-tight mb-2 line-clamp-2">
                        {t.name}
                      </h3>
                      
                      <div className="flex items-center space-x-4 text-xs text-white/80 font-sans">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3.5 h-3.5 text-[#C8B195]" />
                          <span>{new Date(t.event_date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-3.5 h-3.5 text-[#C8B195]" />
                          <span className="truncate max-w-[120px]">{t.venue}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-white/20">
                      <div>
                        <span className="text-[10px] text-white/60 uppercase tracking-wider block font-sans font-bold">Entry Fee</span>
                        <span className="font-serif text-lg font-bold text-[#C8B195]">
                          KES {t.entry_fee.toLocaleString()}
                        </span>
                      </div>
                      
                      <Link 
                        href={`/tournaments/${t.slug || t.id}`}
                        className={`px-5 py-2.5 flex items-center space-x-2 font-sans text-xs font-bold rounded-xl transition-all shadow-md ${isFull ? 'bg-stone-500 text-white cursor-not-allowed opacity-80' : 'bg-[#C8B195] hover:bg-white text-[#232320]'}`}
                        onClick={(e) => isFull && e.preventDefault()}
                      >
                        <span>{isFull ? 'Sold Out' : 'Details & Register'}</span>
                        {!isFull && <ArrowRight className="w-4 h-4" />}
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
