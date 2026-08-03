'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { apiRequest } from '@/lib/api';
import { Tournament } from '@/types';
import { Calendar, MapPin, Award, Loader2, CheckCircle2, User, Trophy, ShieldCheck, FileText } from 'lucide-react';

const TOURNAMENT_CONFIGS = [
  { image: '/images/kids.jpg', isDark: false },
  { image: '/images/kids2.jpg', isDark: true },
  { image: '/images/kids3.jpg', isDark: false }
];

const GRAND_PRIX_CATEGORIES = [
  'Open Section (FIDE Rated)',
  'Ladies / Women Section',
  'Junior Under 18 (U18)',
  'Junior Under 16 (U16)',
  'Junior Under 14 (U14)',
  'Junior Under 12 (U12)',
  'Junior Under 10 (U10)',
  'Junior Under 8 (U8)',
  'PWD / DAP Section (FREE Entrance)',
];

export default function Tournaments() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);

  // Form State
  const [surname, setSurname] = useState('');
  const [otherNames, setOtherNames] = useState('');
  const [gender, setGender] = useState('');
  const [country, setCountry] = useState('Kenya');
  const [dob, setDob] = useState('');
  const [school, setSchool] = useState('');
  const [category, setCategory] = useState('');
  const [fideId, setFideId] = useState('00');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [accompanyingPerson, setAccompanyingPerson] = useState('');
  const [consentGiven, setConsentGiven] = useState(true);

  const [formSubmitting, setFormSubmitting] = useState(false);
  const [checkoutRequestId, setCheckoutRequestId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'pending' | 'success' | 'error';
    text: string;
    receipt?: string;
    resultDesc?: string;
  } | null>(null);
  const [confirmedRegistration, setConfirmedRegistration] = useState<any>(null);

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

  const calculateAge = (dobString: string): number => {
    if (!dobString) return 0;
    const birthDate = new Date(dobString);
    const today = new Date();
    let calculatedAge = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      calculatedAge--;
    }
    return calculatedAge >= 0 ? calculatedAge : 0;
  };

  const isPwdDap = category.toLowerCase().includes('pwd') || category.toLowerCase().includes('dap');
  const currentFee = selectedTournament ? (isPwdDap ? 0 : selectedTournament.entry_fee) : 0;

  const resetForm = () => {
    setSurname('');
    setOtherNames('');
    setGender('');
    setCountry('Kenya');
    setSchool('');
    setDob('');
    setCategory('');
    setFideId('00');
    setEmail('');
    setPhoneNumber('');
    setAccompanyingPerson('');
  };

  const checkPaymentStatus = async (reqId: string) => {
    try {
      const res = await apiRequest(`/mpesa/status/${reqId}?_t=${Date.now()}`, { cache: 'no-store' }) as {
        success: boolean;
        paymentStatus?: 'pending' | 'completed' | 'failed';
        mpesaReceipt?: string;
        resultDesc?: string;
        registration?: any;
        error?: string;
      };

      if (res && res.success) {
        if (res.paymentStatus === 'completed') {
          setConfirmedRegistration(res.registration || {
            playerName: `${surname} ${otherNames}`.trim(),
            category,
            fideId: fideId || '00',
            tournamentName: selectedTournament?.name || 'Tournament',
            amount: currentFee,
            id: reqId.slice(-6)
          });
          setStatusMessage({
            type: 'success',
            text: 'M-Pesa payment received and verified! Your tournament pass is ready.',
            receipt: res.mpesaReceipt || 'M-PESA CONFIRMED',
          });
          resetForm();
        } else if (res.paymentStatus === 'failed') {
          setStatusMessage({
            type: 'error',
            text: `Transaction Failed / Cancelled on M-Pesa: "${res.resultDesc || 'Request cancelled by user or invalid PIN'}"`,
            resultDesc: res.resultDesc || 'Payment cancelled',
          });
        }
      }
    } catch (err) {
      console.error('[Polling Error]:', err);
    }
  };

  useEffect(() => {
    if (!checkoutRequestId || statusMessage?.type !== 'pending') return;

    let pollCount = 0;
    const maxPolls = 72; // 3 mins max

    const intervalId = setInterval(async () => {
      pollCount++;
      await checkPaymentStatus(checkoutRequestId);

      if (pollCount >= maxPolls) {
        clearInterval(intervalId);
        setStatusMessage((prev) => {
          if (prev?.type === 'pending') {
            return {
              type: 'error',
              text: 'M-Pesa prompt timed out. If you entered your PIN, click "Re-check Payment Status" below to verify your ticket.',
            };
          }
          return prev;
        });
      }
    }, 2500);

    return () => clearInterval(intervalId);
  }, [checkoutRequestId, statusMessage?.type]);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTournament) return;

    setFormSubmitting(true);
    setStatusMessage(null);

    const calculatedAge = calculateAge(dob);

    const body = {
      tournamentId: selectedTournament.id,
      surname,
      otherNames,
      playerName: `${surname} ${otherNames}`.trim(),
      email,
      gender,
      country,
      dob,
      age: calculatedAge,
      school,
      category,
      fideId: fideId || '00',
      phoneNumber,
      accompanyingPerson,
      consentGiven,
      amount: currentFee,
    };

    const res = await apiRequest('/mpesa/register', {
      method: 'POST',
      body: JSON.stringify(body),
    }) as { success: boolean; checkoutRequestId?: string; error?: string; message?: string };

    setFormSubmitting(false);

    if (res.success) {
      resetForm();

      if (isPwdDap) {
        setConfirmedRegistration({
          playerName: `${surname} ${otherNames}`.trim() || 'Player',
          category: category || 'PWD / DAP Section',
          fideId: fideId || '00',
          tournamentName: selectedTournament.name,
          amount: 0,
          id: 'FREE-PWD'
        });
        setStatusMessage({
          type: 'success',
          text: 'Registration completed successfully! Free Entrance granted for PWD/DAP.',
          receipt: 'FREE-ENTRY-PWD',
        });
      } else {
        setCheckoutRequestId(res.checkoutRequestId || null);
        setStatusMessage({
          type: 'pending',
          text: 'STK Push prompt sent to your phone! Please enter your M-Pesa PIN on your phone to complete payment.',
        });
      }
    } else {
      setStatusMessage({
        type: 'error',
        text: res.error || 'Failed to initiate M-Pesa transaction. Please check your details and try again.',
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
                  onClick={() => {
                    setSelectedTournament(t);
                    setStatusMessage(null);
                    setCheckoutRequestId(null);
                  }}
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
                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-charcoal/30 to-transparent" />
                  </div>

                  {/* Bottom Panel */}
                  <div className="absolute bottom-0 left-0 right-0 bg-charcoal/60 backdrop-blur-md border-t border-white/10 p-6 flex flex-col space-y-3 z-10 text-white">
                    <div>
                      <h3 className="font-serif text-lg md:text-xl font-bold text-white leading-tight">
                        {t.name}
                      </h3>
                      
                      <div className="flex items-center space-x-4 mt-2 text-xs text-white/80 font-sans">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3.5 h-3.5 text-[#C8B195]" />
                          <span>{t.event_date}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-3.5 h-3.5 text-[#C8B195]" />
                          <span className="truncate max-w-[120px]">{t.venue}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-white/10">
                      <div>
                        <span className="text-[10px] text-white/60 uppercase tracking-wider block font-sans">Entry Fee</span>
                        <span className="font-serif text-base font-bold text-[#C8B195]">
                          KES {t.entry_fee.toLocaleString()}
                        </span>
                      </div>
                      <button className="px-4 py-2 bg-wood text-white font-sans text-xs font-bold rounded-xl hover:bg-wood/90 transition-all shadow-md">
                        Register Now
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Executive Tournament Registration Modal */}
        {selectedTournament && (
          <div className="fixed inset-0 bg-charcoal/70 backdrop-blur-md z-50 flex items-center justify-center p-4 printable-ticket-modal-backdrop">
            <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto p-6 md:p-8 relative animate-scale-in">
              
              {/* Clean Absolute Top-Right Close Button */}
              <button
                onClick={() => {
                  setSelectedTournament(null);
                  setStatusMessage(null);
                  setCheckoutRequestId(null);
                  setConfirmedRegistration(null);
                }}
                className="absolute top-5 right-5 w-9 h-9 rounded-full bg-stone-100 text-charcoal hover:bg-[#6B4A34] hover:text-white font-bold flex items-center justify-center text-sm transition-all z-20 print-hide shadow-sm"
              >
                ✕
              </button>

              {/* Modal Header Banner (Hidden when ticket pass is displayed) */}
              {statusMessage?.type !== 'success' && (
                <div className="mb-6 border-b border-stone-100 pb-4 pr-12 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold text-[#6B4A34] uppercase tracking-wider">
                      Grand Prix Tournament Registration
                    </span>
                    <span className="font-sans text-xs font-semibold text-charcoal/70">
                      Entry Fee: <strong className="font-serif text-sm font-bold text-[#6B4A34]">{isPwdDap ? 'FREE (KES 0)' : `KES ${currentFee.toLocaleString()}`}</strong>
                    </span>
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-charcoal leading-tight">
                    {selectedTournament.name}
                  </h3>
                </div>
              )}

              {statusMessage ? (
                <div className="space-y-4">
                  {statusMessage.type === 'success' ? (
                    /* EXECUTIVE DIGITAL TOURNAMENT PLAYER PASS BADGE */
                    <div id="printable-ticket" className="bg-[#FAF7F2] border-2 border-[#C8B195] rounded-3xl p-6 md:p-8 space-y-6 shadow-xl relative overflow-hidden">
                      {/* Watermark Crest Header */}
                      <div className="flex items-center justify-between border-b-2 border-[#6B4A34]/20 pb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-[#6B4A34] text-[#C8B195] flex items-center justify-center font-serif text-xl shadow-inner">
                            ♔
                          </div>
                          <div>
                            <span className="font-serif font-bold text-base text-[#6B4A34] block leading-none">
                              JUMUIYA CHESS INITIATIVE
                            </span>
                            <span className="font-mono text-[9px] font-bold text-stone-500 uppercase tracking-widest block mt-1">
                              OFFICIAL GRAND PRIX PLAYER PASS
                            </span>
                          </div>
                        </div>
                        <span className="px-3.5 py-1.5 bg-emerald-700 text-white font-mono text-[10px] font-bold rounded-full uppercase tracking-wider shadow-sm flex items-center space-x-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200" />
                          <span>CONFIRMED</span>
                        </span>
                      </div>

                      {/* Tournament Name */}
                      <div className="space-y-1">
                        <span className="text-[10px] text-stone-400 font-mono uppercase block font-bold">Tournament</span>
                        <h4 className="font-serif text-2xl font-bold text-[#6B4A34]">
                          {confirmedRegistration?.tournamentName || selectedTournament.name}
                        </h4>
                      </div>

                      {/* Executive Details Grid */}
                      <div className="grid grid-cols-2 gap-4 bg-white p-5 rounded-2xl border border-[#C8B195]/40 shadow-sm text-xs">
                        <div>
                          <span className="text-[10px] text-stone-400 font-mono uppercase block font-bold">Player Name</span>
                          <span className="font-bold text-charcoal text-sm block truncate">
                            {confirmedRegistration?.playerName || `${surname} ${otherNames}`.trim() || 'Player'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-stone-400 font-mono uppercase block font-bold">Category</span>
                          <span className="font-bold text-[#6B4A34] text-sm block truncate">
                            {confirmedRegistration?.category || category || 'Category'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-stone-400 font-mono uppercase block font-bold">FIDE ID</span>
                          <span className="font-mono font-bold text-stone-800 text-sm">
                            {confirmedRegistration?.fideId || fideId || '00'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-stone-400 font-mono uppercase block font-bold">Country</span>
                          <span className="font-semibold text-stone-800 text-sm">
                            {confirmedRegistration?.country || country || 'Kenya'}
                          </span>
                        </div>
                      </div>

                      {/* Payment Verification Receipt Banner */}
                      <div className="bg-[#6B4A34] text-white p-4 rounded-2xl flex items-center justify-between font-mono text-xs shadow-md">
                        <div>
                          <span className="text-[9px] text-[#C8B195] uppercase block font-bold">M-PESA RECEIPT CODE</span>
                          <span className="font-bold tracking-wider text-sm">{statusMessage.receipt || 'CONFIRMED'}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] text-[#C8B195] uppercase block font-bold">ENTRY FEE PAID</span>
                          <span className="font-serif text-base font-bold text-[#C8B195]">
                            {isPwdDap ? 'FREE' : `KES ${confirmedRegistration?.amount || currentFee}`}
                          </span>
                        </div>
                      </div>

                      <p className="text-[11px] text-stone-500 font-sans text-center leading-relaxed">
                        Please present this ticket pass (digital or printed) at the tournament registration desk on event day.
                      </p>

                      {/* Print & Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-3 pt-2 print-hide">
                        <button
                          type="button"
                          onClick={() => window.print()}
                          className="flex-1 py-3.5 bg-stone-200 hover:bg-stone-300 text-charcoal font-sans text-xs font-bold rounded-xl transition-all flex items-center justify-center space-x-2"
                        >
                          <span>🖨️ Print / Save Pass</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedTournament(null);
                            setStatusMessage(null);
                            setCheckoutRequestId(null);
                            setConfirmedRegistration(null);
                          }}
                          className="flex-1 py-3.5 bg-[#6B4A34] hover:brightness-110 text-white font-sans text-xs font-bold rounded-xl shadow-lg transition-all"
                        >
                          Done & Close Window
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* PENDING OR ERROR STATE CARD */
                    <div className={`p-6 rounded-2xl mb-6 shadow-sm border ${
                      statusMessage.type === 'pending'
                        ? 'bg-amber-50/90 border-amber-300 text-amber-950'
                        : 'bg-red-50/90 border-red-300 text-red-950'
                    }`}>
                      <div className="flex items-center space-x-2.5 mb-2">
                        {statusMessage.type === 'pending' ? (
                          <Loader2 className="w-5 h-5 animate-spin text-amber-700" />
                        ) : (
                          <span className="text-xl">⚠️</span>
                        )}
                        <h4 className="font-bold text-sm">
                          {statusMessage.type === 'pending' ? 'M-Pesa STK Prompt Dispatched' : 'Payment Error'}
                        </h4>
                      </div>
                      <p className="text-xs leading-relaxed opacity-90">{statusMessage.text}</p>
                      
                      {statusMessage.type === 'pending' && checkoutRequestId && (
                        <div className="mt-4 pt-3 border-t border-amber-200 flex flex-col sm:flex-row gap-2">
                          <button
                            type="button"
                            onClick={() => checkPaymentStatus(checkoutRequestId)}
                            className="w-full py-2.5 bg-amber-700 hover:bg-amber-800 text-white font-sans text-xs font-bold rounded-xl transition-all shadow-sm"
                          >
                            🔄 Re-check Payment Status Now
                          </button>
                        </div>
                      )}

                      {statusMessage.type === 'error' && (
                        <button
                          type="button"
                          onClick={() => setStatusMessage(null)}
                          className="mt-4 px-4 py-2.5 bg-red-800 hover:bg-red-900 text-white font-sans text-xs font-bold rounded-xl transition-all shadow-sm"
                        >
                          Try Registration Again
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                /* STRUCTURED 3-SECTION REGISTRATION FORM */
                <form onSubmit={handleRegisterSubmit} className="space-y-6">
                  
                  {/* SECTION 1: PLAYER PROFILE & CATEGORY */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 border-b border-stone-100 pb-2">
                      <User className="w-4 h-4 text-[#6B4A34]" />
                      <h4 className="font-serif font-bold text-sm text-charcoal uppercase tracking-wider">
                        1. Player Profile & Category
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-sans text-xs font-semibold text-charcoal/70 mb-1">Surname *</label>
                        <input
                          type="text"
                          required
                          value={surname}
                          onChange={(e) => setSurname(e.target.value)}
                          placeholder="Kimani"
                          className="w-full bg-stone-50 border border-stone-300 p-2.5 rounded-xl text-xs text-charcoal focus:outline-none focus:border-[#6B4A34]"
                        />
                      </div>
                      <div>
                        <label className="block font-sans text-xs font-semibold text-charcoal/70 mb-1">Other Names *</label>
                        <input
                          type="text"
                          required
                          value={otherNames}
                          onChange={(e) => setOtherNames(e.target.value)}
                          placeholder="John Mwangi"
                          className="w-full bg-stone-50 border border-stone-300 p-2.5 rounded-xl text-xs text-charcoal focus:outline-none focus:border-[#6B4A34]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block font-sans text-xs font-semibold text-charcoal/70 mb-1">Gender *</label>
                        <select
                          required
                          value={gender}
                          onChange={(e) => setGender(e.target.value)}
                          className="w-full bg-stone-50 border border-stone-300 p-2.5 rounded-xl text-xs text-charcoal focus:outline-none focus:border-[#6B4A34]"
                        >
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-sans text-xs font-semibold text-charcoal/70 mb-1">Country *</label>
                        <input
                          type="text"
                          required
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          placeholder="Kenya"
                          className="w-full bg-stone-50 border border-stone-300 p-2.5 rounded-xl text-xs text-charcoal focus:outline-none focus:border-[#6B4A34]"
                        />
                      </div>
                      <div>
                        <label className="block font-sans text-xs font-semibold text-charcoal/70 mb-1">Date of Birth *</label>
                        <input
                          type="date"
                          required
                          value={dob}
                          onChange={(e) => setDob(e.target.value)}
                          className="w-full bg-stone-50 border border-stone-300 p-2.5 rounded-xl text-xs text-charcoal focus:outline-none focus:border-[#6B4A34]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-sans text-xs font-semibold text-charcoal/70 mb-1">Tournament Category *</label>
                        <select
                          required
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full bg-stone-50 border border-stone-300 p-2.5 rounded-xl text-xs text-charcoal focus:outline-none focus:border-[#6B4A34]"
                        >
                          <option value="">Select Category</option>
                          {GRAND_PRIX_CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block font-sans text-xs font-semibold text-charcoal/70 mb-1">FIDE ID (If any)</label>
                        <input
                          type="text"
                          value={fideId}
                          onChange={(e) => setFideId(e.target.value)}
                          placeholder="00"
                          className="w-full bg-stone-50 border border-stone-300 p-2.5 rounded-xl text-xs text-charcoal focus:outline-none focus:border-[#6B4A34]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* SECTION 2: CLUB REPRESENTATION & CONTACT */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center space-x-2 border-b border-stone-100 pb-2">
                      <Trophy className="w-4 h-4 text-[#6B4A34]" />
                      <h4 className="font-serif font-bold text-sm text-charcoal uppercase tracking-wider">
                        2. Club Representation & Contact
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-sans text-xs font-semibold text-charcoal/70 mb-1">Chess Club / School / Institution</label>
                        <input
                          type="text"
                          value={school}
                          onChange={(e) => setSchool(e.target.value)}
                          placeholder="Kibera Knights / Mwiki Primary"
                          className="w-full bg-stone-50 border border-stone-300 p-2.5 rounded-xl text-xs text-charcoal focus:outline-none focus:border-[#6B4A34]"
                        />
                      </div>
                      <div>
                        <label className="block font-sans text-xs font-semibold text-charcoal/70 mb-1">Email Address *</label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="player@example.com"
                          className="w-full bg-stone-50 border border-stone-300 p-2.5 rounded-xl text-xs text-charcoal focus:outline-none focus:border-[#6B4A34]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-sans text-xs font-semibold text-charcoal/70 mb-1">M-Pesa Mobile Number *</label>
                        <input
                          type="tel"
                          required
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="07XXXXXXXX"
                          className="w-full bg-stone-50 border border-stone-300 p-2.5 rounded-xl text-xs text-charcoal focus:outline-none focus:border-[#6B4A34]"
                        />
                        <span className="font-sans text-[10px] text-stone-500">Number that receives the M-Pesa STK prompt.</span>
                      </div>
                      <div>
                        <label className="block font-sans text-xs font-semibold text-charcoal/70 mb-1">Accompanying Person (Optional)</label>
                        <input
                          type="text"
                          value={accompanyingPerson}
                          onChange={(e) => setAccompanyingPerson(e.target.value)}
                          placeholder="Parent / Coach Name"
                          className="w-full bg-stone-50 border border-stone-300 p-2.5 rounded-xl text-xs text-charcoal focus:outline-none focus:border-[#6B4A34]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* SECTION 3: TERMS & EVENT REGULATIONS */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center space-x-2 border-b border-stone-100 pb-2">
                      <FileText className="w-4 h-4 text-[#6B4A34]" />
                      <h4 className="font-serif font-bold text-sm text-charcoal uppercase tracking-wider">
                        3. Terms of Service & Event Regulations
                      </h4>
                    </div>

                    <div className="bg-[#FAF7F2] border border-[#C8B195]/50 rounded-2xl p-4 space-y-3 text-xs text-stone-700">
                      <div className="flex items-center justify-between border-b border-[#C8B195]/30 pb-2">
                        <span className="font-serif font-bold text-[#6B4A34] text-xs uppercase tracking-wider">
                          📜 Official Tournament Policy
                        </span>
                        <span className="text-[10px] font-mono text-stone-500 font-bold">
                          FIDE & Grand Prix Regulations
                        </span>
                      </div>
                      
                      <div className="space-y-2 text-[11px] leading-relaxed max-h-28 overflow-y-auto pr-1 font-sans text-stone-600">
                        <p>
                          <strong className="text-charcoal font-semibold">1. FIDE & Chess Kenya Rules:</strong> By registering, players agree to adhere strictly to official tournament rules, pairing criteria, and sportsmanship regulations governed by FIDE and Chess Kenya.
                        </p>
                        <p>
                          <strong className="text-charcoal font-semibold">2. Media & Photography Consent:</strong> Participants (and parents/guardians for minors) grant Jumuiya Chess Initiative rights to photograph and record video during the tournament for website, media, and promotional publications.
                        </p>
                        <p>
                          <strong className="text-charcoal font-semibold">3. Code of Conduct & Fair Play:</strong> Electronic devices must be powered off in the playing hall. Unsportsmanlike conduct or cheating results in immediate disqualification without fee refund.
                        </p>
                        <p>
                          <strong className="text-charcoal font-semibold">4. Entry Fee & Refunds:</strong> Entry fees are processed securely via M-Pesa. Registration fees are non-refundable once pairings are published, unless the tournament is cancelled by organizers.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-2.5 pt-1">
                      <input
                        type="checkbox"
                        id="consent"
                        required
                        checked={consentGiven}
                        onChange={(e) => setConsentGiven(e.target.checked)}
                        className="mt-0.5 rounded text-[#6B4A34] focus:ring-[#6B4A34]"
                      />
                      <label htmlFor="consent" className="text-[11px] text-stone-700 leading-tight font-medium">
                        I have read, understood, and accept the Terms of Service, Event Regulations, and Media Release policy.
                      </label>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={formSubmitting}
                    className="w-full mt-4 py-3.5 bg-[#6B4A34] text-white font-sans text-xs font-bold rounded-xl shadow-md hover:brightness-110 active:scale-[0.99] transition-all duration-300 flex items-center justify-center space-x-2"
                  >
                    {formSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin text-white" />
                        <span>Sending M-Pesa STK Push Prompt...</span>
                      </>
                    ) : (
                      <span>{isPwdDap ? 'Register Now (Free Entry)' : `Pay KES ${currentFee.toLocaleString()} & Complete Registration`}</span>
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
