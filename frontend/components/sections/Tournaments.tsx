'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { apiRequest } from '@/lib/api';
import { Tournament } from '@/types';
import { Calendar, MapPin, Award, Loader2 } from 'lucide-react';

const TOURNAMENT_CONFIGS = [
  { image: '/images/kids.jpg', isDark: false },
  { image: '/images/kids2.jpg', isDark: true },
  { image: '/images/kids3.jpg', isDark: false }
];

export default function Tournaments() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);

  // Form State
  const [playerName, setPlayerName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState('');
  const [school, setSchool] = useState('');
  const [category, setCategory] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    async function loadTournaments() {
      try {
        const res = await apiRequest<Tournament[]>('/tournaments');
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          setTournaments(res.data);
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

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTournament) return;

    setFormSubmitting(true);
    setStatusMessage(null);

    const body = {
      tournamentId: selectedTournament.id,
      playerName,
      email,
      age,
      school,
      category,
      phoneNumber,
      amount: selectedTournament.entry_fee,
    };

    const res = await apiRequest('/mpesa/register', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    setFormSubmitting(false);

    if (res.success) {
      setStatusMessage({
        type: 'success',
        text: 'STK Push sent! Please enter your M-Pesa PIN on your phone to complete registration.',
      });
      setPlayerName('');
      setEmail('');
      setAge('');
      setSchool('');
      setCategory('');
      setPhoneNumber('');
    } else {
      setStatusMessage({
        type: 'error',
        text: res.error || 'Failed to initiate M-Pesa transaction. Please try again.',
      });
    }
  };

  return (
    <section id="tournaments" className="py-24 px-6 bg-white relative scroll-mt-24 lg:scroll-mt-28">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <span className="font-sans text-xs font-semibold tracking-widest text-wood uppercase">
            Compete & Grow
          </span>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-charcoal">
            Upcoming Tournaments
          </h2>
          <p className="font-sans text-charcoal/70">
            Participate in our chess tournaments. Every entry fee directly supports board donations and chess-in-school curriculums.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-wood" />
          </div>
        ) : tournaments.length === 0 ? (
          <div className="rounded-2xl border border-stone/20 bg-stone/5 p-8 text-center text-sm text-charcoal/70">
            No tournaments are currently published. Admin-managed tournaments will appear here automatically.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {tournaments.map((t, index) => {
              const config = TOURNAMENT_CONFIGS[index % TOURNAMENT_CONFIGS.length];
              const posterImage = t.poster_url || config.image;

              return (
                <div
                  key={t.id}
                  className="relative overflow-hidden h-[450px] rounded-[24px] border border-stone/20 shadow-lg group hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 cursor-pointer"
                  onClick={() => setSelectedTournament(t)}
                >
                  {/* Full-Bleed Background Image */}
                  <div className="absolute inset-0 z-0 overflow-hidden">
                    <Image
                      src={posterImage}
                      alt={t.name}
                      fill
                      unoptimized
                      sizes="(max-w-7xl) 100vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-all duration-700"
                    />
                    {/* Gradient bottom overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-charcoal/30 to-transparent" />
                  </div>

                  {/* Translucent Glassy Bottom Overlay Panel */}
                  <div className="absolute bottom-0 left-0 right-0 bg-charcoal/60 backdrop-blur-md border-t border-white/10 p-6 flex flex-col space-y-3 z-10 text-white">
                    <div>
                      <h3 className="font-serif text-lg md:text-xl font-bold text-white leading-tight">
                        {t.name}
                      </h3>
                      
                      {/* Compact Meta Info Row */}
                      <div className="flex items-center space-x-3 mt-1.5 text-[10px] text-white/70 font-semibold uppercase tracking-wider">
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1 text-[#C8B195]" />
                          <span>{new Date(t.event_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1 text-[#C8B195]" />
                          <span className="line-clamp-1">{t.venue.split(',')[0]}</span>
                        </div>
                      </div>
                    </div>

                    <p className="font-sans text-[11px] leading-relaxed text-white/80 line-clamp-2">
                      {t.description}
                    </p>

                    {/* Bottom action and price */}
                    <div className="flex items-center justify-between pt-2.5 border-t border-white/10">
                      <div className="flex flex-col">
                        <span className="text-[8px] uppercase tracking-wider text-white/40 font-bold">Entry Fee</span>
                        <span className="text-sm font-bold text-[#C8B195] font-serif">KES {t.entry_fee.toLocaleString()}</span>
                      </div>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTournament(t);
                        }}
                        className="px-5 py-2 bg-white text-charcoal hover:bg-[#C8B195] hover:text-white font-sans text-xs font-bold rounded-full transition-all duration-300 shadow-sm hover:scale-[1.03]"
                      >
                        Register
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Registration Modal */}
        {selectedTournament && (
          <div className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-offwhite rounded-lg border border-stone/30 shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-8 relative animate-scale-in">
              <button
                onClick={() => {
                  setSelectedTournament(null);
                  setStatusMessage(null);
                }}
                className="absolute top-4 right-4 text-charcoal/60 hover:text-charcoal font-bold text-xl"
              >
                ✕
              </button>

              <div className="space-y-2 mb-6">
                <span className="font-sans text-xs font-semibold text-sage uppercase">Register for</span>
                <h3 className="font-serif text-2xl font-bold text-charcoal leading-tight">
                  {selectedTournament.name}
                </h3>
                <p className="font-sans text-xs text-charcoal/50">
                  Entry Fee: <strong className="text-wood">KES {selectedTournament.entry_fee}</strong> (Paid via M-Pesa STK Push)
                </p>
              </div>

              {statusMessage ? (
                <div className={`p-6 rounded-md mb-6 ${
                  statusMessage.type === 'success' ? 'bg-sage/10 border border-sage/30 text-charcoal' : 'bg-red-50 border border-red-200 text-red-700'
                }`}>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="font-serif font-bold text-sm">
                      {statusMessage.type === 'success' ? 'Request Initiated' : 'Transaction Failed'}
                    </span>
                  </div>
                  <p className="font-sans text-xs leading-relaxed">{statusMessage.text}</p>
                  
                  {statusMessage.type === 'success' && (
                    <button
                      onClick={() => setSelectedTournament(null)}
                      className="mt-6 w-full py-2 bg-sage text-offwhite font-sans text-xs font-medium rounded hover:bg-sage/90"
                    >
                      Close Window
                    </button>
                  )}
                </div>
              ) : (
                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-sans text-xs font-semibold text-charcoal/70 mb-1">Player Name</label>
                      <input
                        type="text"
                        required
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full bg-offwhite border border-stone/30 p-2.5 rounded text-sm text-charcoal focus:outline-none focus:border-wood"
                      />
                    </div>
                    <div>
                      <label className="block font-sans text-xs font-semibold text-charcoal/70 mb-1">Email Address</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="john@example.com"
                        className="w-full bg-offwhite border border-stone/30 p-2.5 rounded text-sm text-charcoal focus:outline-none focus:border-wood"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-sans text-xs font-semibold text-charcoal/70 mb-1">Age</label>
                      <input
                        type="number"
                        required
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        placeholder="15"
                        className="w-full bg-offwhite border border-stone/30 p-2.5 rounded text-sm text-charcoal focus:outline-none focus:border-wood"
                      />
                    </div>
                    <div>
                      <label className="block font-sans text-xs font-semibold text-charcoal/70 mb-1">Category</label>
                      <select
                        required
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full bg-offwhite border border-stone/30 p-2.5 rounded text-sm text-charcoal focus:outline-none focus:border-wood"
                      >
                        <option value="">Select Category</option>
                        {Array.isArray(selectedTournament.categories) && selectedTournament.categories.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-sans text-xs font-semibold text-charcoal/70 mb-1">School (Optional)</label>
                    <input
                      type="text"
                      value={school}
                      onChange={(e) => setSchool(e.target.value)}
                      placeholder="Greenhills High School"
                      className="w-full bg-offwhite border border-stone/30 p-2.5 rounded text-sm text-charcoal focus:outline-none focus:border-wood"
                    />
                  </div>

                  <div>
                    <label className="block font-sans text-xs font-semibold text-charcoal/70 mb-1">M-Pesa Mobile Number</label>
                    <input
                      type="tel"
                      required
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="07XXXXXXXX"
                      className="w-full bg-offwhite border border-stone/30 p-2.5 rounded text-sm text-charcoal focus:outline-none focus:border-wood"
                    />
                    <span className="font-sans text-[10px] text-charcoal/50">Enter the number that will receive the M-Pesa payment prompt.</span>
                  </div>

                  <button
                    type="submit"
                    disabled={formSubmitting}
                    className="w-full mt-6 py-3.5 bg-wood text-offwhite font-sans text-sm font-semibold rounded shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:scale-[1.02] active:translate-y-0 active:scale-[0.98] hover:bg-wood/90 transition-all duration-300 flex items-center justify-center space-x-2"
                  >
                    {formSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Sending M-Pesa STK Prompt...</span>
                      </>
                    ) : (
                      <span>Pay & Complete Registration</span>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
