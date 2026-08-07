'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { apiRequest } from '@/lib/api';
import { Calendar, MapPin, Loader2, ArrowLeft, ArrowRight, ShieldCheck, Users, Clock } from 'lucide-react';
import { use } from 'react';

export default function TournamentDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [tournament, setTournament] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTournament() {
      try {
        const res = await apiRequest<any>(`/tournaments/${id}`);
        if (res.success && res.data) {
          setTournament(res.data);
        }
      } catch (error) {
        console.error('Error fetching tournament:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchTournament();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#6B4A34]" />
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex flex-col items-center justify-center space-y-4">
        <h1 className="text-2xl font-serif font-bold text-[#232320]">Tournament Not Found</h1>
        <Link href="/" className="text-sm font-bold text-[#6B4A34] hover:underline">Return Home</Link>
      </div>
    );
  }

  const capacity = tournament.max_participants || 100;
  const registered = tournament.registrations_count || 0;
  const isFull = registered >= capacity;
  const capacityPercentage = Math.min((registered / capacity) * 100, 100);
  const posterImage = tournament.poster_url || '/images/kids.jpg';

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      {/* Hero Section */}
      <div className="relative h-[50vh] md:h-[60vh] w-full bg-[#232320] flex items-end">
        <div className="absolute inset-0 z-0">
          <Image
            src={posterImage}
            alt={tournament.name}
            fill
            unoptimized
            className="object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#232320] via-[#232320]/60 to-transparent" />
        </div>
        
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pb-12">
          <Link href="/#tournaments" className="inline-flex items-center space-x-2 text-white/70 hover:text-white font-bold font-sans text-sm mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Tournaments</span>
          </Link>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-3xl">
              <span className="font-mono text-xs font-bold text-[#C8B195] uppercase tracking-widest mb-3 block">
                Official Grand Prix Event
              </span>
              <h1 className="font-serif text-4xl md:text-6xl font-bold text-white leading-tight">
                {tournament.name}
              </h1>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl min-w-[280px]">
              <div className="text-[10px] text-white/60 uppercase tracking-wider block font-sans font-bold mb-1">Entry Fee</div>
              <div className="font-serif text-3xl font-bold text-[#C8B195] mb-4">
                KES {tournament.entry_fee.toLocaleString()}
              </div>
              <Link 
                href={isFull ? '#' : `/tournaments/${id}/register`}
                className={`w-full py-3.5 flex items-center justify-center space-x-2 font-sans text-sm font-bold rounded-xl transition-all shadow-md ${isFull ? 'bg-stone-500 text-white cursor-not-allowed opacity-80' : 'bg-[#C8B195] hover:bg-white text-[#232320]'}`}
                onClick={(e) => isFull && e.preventDefault()}
              >
                <span>{isFull ? 'Sold Out' : 'Register Now'}</span>
                {!isFull && <ArrowRight className="w-4 h-4" />}
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Main Details */}
        <div className="md:col-span-2 space-y-12">
          <div className="prose prose-stone max-w-none">
            <h2 className="font-serif text-3xl font-bold text-[#232320] mb-6">About This Event</h2>
            <p className="font-sans text-lg text-[#232320]/80 whitespace-pre-wrap leading-relaxed">
              {tournament.description}
            </p>
          </div>

          <div className="space-y-6">
            <h3 className="font-serif text-2xl font-bold text-[#232320]">Categories Available</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {tournament.categories?.map((cat: string, i: number) => (
                <div key={i} className="bg-white border border-[#6B4A34]/10 p-4 rounded-xl flex items-center space-x-3 shadow-sm">
                  <div className="w-2 h-2 rounded-full bg-[#6B4A34]" />
                  <span className="font-sans font-semibold text-sm text-[#232320]">{cat}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          {/* Capacity Card */}
          <div className="bg-white border border-[#6B4A34]/20 p-6 rounded-2xl shadow-sm">
            <h3 className="flex items-center space-x-2 font-sans font-bold text-[#6B4A34] uppercase tracking-wider text-xs mb-4">
              <Users className="w-4 h-4" />
              <span>Capacity Status</span>
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-bold text-[#232320]">
                <span>{isFull ? 'Fully Booked' : 'Spots Taken'}</span>
                <span>{registered} / {capacity}</span>
              </div>
              <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${isFull ? 'bg-red-500' : 'bg-[#6B4A34]'}`} 
                  style={{ width: `${capacityPercentage}%` }}
                />
              </div>
              {!isFull && (
                <p className="text-xs text-stone-500 font-sans mt-2">
                  Only {capacity - registered} spots remaining!
                </p>
              )}
            </div>
          </div>

          {/* Logistics Card */}
          <div className="bg-white border border-[#6B4A34]/20 p-6 rounded-2xl shadow-sm space-y-6">
            <div>
              <h3 className="flex items-center space-x-2 font-sans font-bold text-[#6B4A34] uppercase tracking-wider text-xs mb-2">
                <Calendar className="w-4 h-4" />
                <span>Date & Time</span>
              </h3>
              <p className="font-semibold text-[#232320] text-sm">
                {new Date(tournament.event_date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            
            {tournament.registration_deadline && (
              <div>
                <h3 className="flex items-center space-x-2 font-sans font-bold text-[#6B4A34] uppercase tracking-wider text-xs mb-2">
                  <Clock className="w-4 h-4" />
                  <span>Registration Deadline</span>
                </h3>
                <p className="font-semibold text-[#232320] text-sm">
                  {new Date(tournament.registration_deadline).toLocaleDateString()}
                </p>
              </div>
            )}

            <div>
              <h3 className="flex items-center space-x-2 font-sans font-bold text-[#6B4A34] uppercase tracking-wider text-xs mb-2">
                <MapPin className="w-4 h-4" />
                <span>Venue</span>
              </h3>
              <p className="font-semibold text-[#232320] text-sm">{tournament.venue}</p>
            </div>
          </div>

          {/* Rules Teaser */}
          <div className="bg-[#FAF7F2] border border-[#C8B195] p-6 rounded-2xl shadow-sm">
            <h3 className="flex items-center space-x-2 font-sans font-bold text-[#6B4A34] uppercase tracking-wider text-xs mb-3">
              <ShieldCheck className="w-4 h-4" />
              <span>Event Policy</span>
            </h3>
            <p className="text-xs text-stone-600 mb-4 leading-relaxed">
              This tournament adheres to strict FIDE and Chess Kenya regulations. Fair play is strictly monitored.
            </p>
            <Link href="/tournaments/rules" className="text-xs font-bold text-[#6B4A34] hover:underline flex items-center space-x-1">
              <span>Read Full Rules</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
