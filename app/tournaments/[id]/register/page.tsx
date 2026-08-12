'use client';

import { useState, useEffect } from 'react';
import { use } from 'react';
import Link from 'next/link';
import { apiRequest } from '@/lib/api';
import { Loader2, ArrowLeft, User, Trophy, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function RegisterTournamentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  
  const [tournament, setTournament] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
  const [consentGiven, setConsentGiven] = useState(false);

  const [formSubmitting, setFormSubmitting] = useState(false);
  const [checkoutRequestId, setCheckoutRequestId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'pending' | 'success' | 'error';
    text: string;
    receipt?: string;
    resultDesc?: string;
    ticketId?: string;
  } | null>(null);

  useEffect(() => {
    async function fetchTournament() {
      try {
        const res = await apiRequest<any>(`/tournaments/${id}`);
        if (res.success && res.data) {
          setTournament(res.data);
          const nameLower = (res.data.name || '').toLowerCase();
          const slugLower = (res.data.slug || '').toLowerCase();
          if (nameLower.includes('mashariki') || slugLower.includes('mashariki')) {
            window.location.href = 'https://forms.gle/pTNQTupnMBVUSENH7';
          }
        }
      } catch (error) {
        console.error('Error fetching tournament:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchTournament();
  }, [id]);

  const checkPaymentStatus = async (reqId: string) => {
    try {
      const res = await apiRequest(`/mpesa/status/${reqId}?_t=${Date.now()}`, { cache: 'no-store' }) as {
        success: boolean;
        paymentStatus?: 'pending' | 'completed' | 'failed';
        mpesaReceipt?: string;
        resultDesc?: string;
        registration?: any;
      };

      if (res && res.success) {
        if (res.paymentStatus === 'completed') {
          setStatusMessage({
            type: 'success',
            text: 'Payment received! Redirecting to your ticket... A copy has also been sent to your email.',
            receipt: res.mpesaReceipt || 'M-PESA CONFIRMED',
            ticketId: res.registration?.ticket_number || res.registration?.id
          });
          
          setTimeout(() => {
             const tId = res.registration?.ticket_number || res.registration?.id || reqId.slice(-6);
             router.push(`/tickets/${tId}`);
          }, 3000);
        } else if (res.paymentStatus === 'failed') {
          setStatusMessage({
            type: 'error',
            text: `Transaction Failed / Cancelled: "${res.resultDesc || 'Request cancelled by user or invalid PIN'}"`
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
              text: 'M-Pesa prompt timed out. Please check your network and try again.',
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
    if (!tournament) return;

    setFormSubmitting(true);
    setStatusMessage(null);

    const body = {
      tournamentId: tournament.id,
      surname,
      otherNames,
      email,
      gender,
      country,
      dob,
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
    }) as { success: boolean; checkoutRequestId?: string; error?: string; ticketNumber?: string; registrationId?: string };

    setFormSubmitting(false);

    if (res.success) {
      if (isPwdDap) {
        setStatusMessage({
          type: 'success',
          text: 'Registration successful! Redirecting to your ticket...',
          receipt: 'FREE-ENTRY',
        });
        setTimeout(() => {
           router.push(`/tickets/${res.ticketNumber || res.registrationId}`);
        }, 2000);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#6B4A34]" />
      </div>
    );
  }

  if (!tournament) return null;

  const isPwdDap = category.toLowerCase().includes('pwd') || category.toLowerCase().includes('dap');
  const currentFee = isPwdDap ? 0 : tournament.entry_fee;
  
  const capacity = tournament.max_participants || 100;
  const registered = tournament.registrations_count || 0;
  const isFull = registered >= capacity;

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-6 px-4 flex flex-col justify-center items-center">
      <div className="max-w-2xl w-full space-y-3">
        <Link href={`/tournaments/${id}`} className="inline-flex items-center space-x-1.5 text-[#6B4A34] hover:underline font-bold font-sans text-xs">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Event Details</span>
        </Link>
        
        <div className="bg-white p-5 md:p-6 rounded-2xl shadow-lg border border-[#6B4A34]/10">
          
          <div className="mb-4 border-b border-stone-100 pb-3 flex justify-between items-center">
            <div>
              <h1 className="font-serif text-2xl font-bold text-[#232320]">Event Registration</h1>
              <h2 className="font-sans text-xs font-bold text-[#6B4A34]">{tournament.name}</h2>
            </div>
            <div className="text-right">
              <span className="font-sans text-[10px] text-stone-500 uppercase tracking-widest block">Entry Fee</span>
              <span className="font-serif text-xl font-bold text-[#6B4A34]">
                {isPwdDap ? 'FREE' : `KES ${currentFee.toLocaleString()}`}
              </span>
            </div>
          </div>

          {isFull ? (
             <div className="p-6 text-center bg-red-50 border border-red-200 rounded-xl text-red-900">
                <h3 className="text-lg font-bold mb-1">Registration Closed</h3>
                <p className="text-xs">Sorry, this tournament has reached its maximum capacity of {capacity} players.</p>
             </div>
          ) : (
            <>
              {/* Overlay for Pending/Submitting/Success/Error */}
              {(formSubmitting || statusMessage) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
                  <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl text-center transform transition-all border border-[#6B4A34]/20 flex flex-col items-center">
                    
                    {(!statusMessage || statusMessage.type === 'pending') && (
                      <>
                        <div className="relative w-20 h-20 mx-auto mb-4">
                          <div className="absolute inset-0 border-4 border-[#C8B195]/30 rounded-full"></div>
                          <div className="absolute inset-0 border-4 border-[#6B4A34] rounded-full border-t-transparent animate-spin"></div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <ShieldCheck className="w-7 h-7 text-[#6B4A34] opacity-80" />
                          </div>
                        </div>
                        <h3 className="font-serif text-xl font-bold text-[#232320] mb-2">
                          {statusMessage?.type === 'pending' ? 'Awaiting M-Pesa' : 'Processing...'}
                        </h3>
                        <p className="font-sans text-[#232320]/70 text-xs leading-relaxed">
                          {statusMessage?.text || 'Securely transmitting your details...'}
                        </p>
                      </>
                    )}

                    {statusMessage?.type === 'success' && (
                      <>
                        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                          <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                        </div>
                        <h3 className="font-serif text-xl font-bold text-[#232320] mb-2">Registration Complete!</h3>
                        <p className="font-sans text-[#232320]/70 text-xs leading-relaxed mb-4">
                          {statusMessage.text}
                        </p>
                        <div className="flex items-center justify-center space-x-2 text-emerald-600 font-bold">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-xs">Redirecting...</span>
                        </div>
                      </>
                    )}

                    {statusMessage?.type === 'error' && (
                      <>
                        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                          <ShieldCheck className="w-10 h-10 text-red-600" />
                        </div>
                        <h3 className="font-serif text-xl font-bold text-[#232320] mb-2">Payment Failed</h3>
                        <p className="font-sans text-[#232320]/70 text-xs leading-relaxed mb-6">
                          {statusMessage.text}
                        </p>
                        <button
                          type="button"
                          onClick={() => setStatusMessage(null)}
                          className="w-full py-3 bg-[#232320] hover:bg-red-900 text-white font-sans text-xs font-bold rounded-xl transition-colors shadow-md"
                        >
                          Try Again
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}

              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                
                {/* SECTION 1: Player Details */}
                <div className="space-y-2.5">
                  <div className="flex items-center space-x-2 border-b border-stone-100 pb-1.5">
                    <div className="p-1 bg-[#FAF7F2] rounded"><User className="w-4 h-4 text-[#6B4A34]" /></div>
                    <h4 className="font-serif font-bold text-sm text-[#232320]">1. Player Details</h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-sans text-[10px] font-semibold text-stone-500 mb-1 uppercase">Surname *</label>
                      <input type="text" required value={surname} onChange={(e) => setSurname(e.target.value)} placeholder="e.g. Kimani" className="w-full bg-[#FAF7F2] border border-stone-200 py-1.5 px-3 rounded-lg text-xs text-[#232320] focus:outline-none focus:border-[#6B4A34]" />
                    </div>
                    <div>
                      <label className="block font-sans text-[10px] font-semibold text-stone-500 mb-1 uppercase">Other Names *</label>
                      <input type="text" required value={otherNames} onChange={(e) => setOtherNames(e.target.value)} placeholder="e.g. John Mwangi" className="w-full bg-[#FAF7F2] border border-stone-200 py-1.5 px-3 rounded-lg text-xs text-[#232320] focus:outline-none focus:border-[#6B4A34]" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-sans text-[10px] font-semibold text-stone-500 mb-1 uppercase">Category *</label>
                      <select required value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-[#FAF7F2] border border-stone-200 py-1.5 px-3 rounded-lg text-xs text-[#232320] focus:outline-none focus:border-[#6B4A34]">
                        <option value="">Select Category</option>
                        {tournament.categories?.map((cat: string) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block font-sans text-[10px] font-semibold text-stone-500 mb-1 uppercase">Gender *</label>
                      <select required value={gender} onChange={(e) => setGender(e.target.value)} className="w-full bg-[#FAF7F2] border border-stone-200 py-1.5 px-3 rounded-lg text-xs text-[#232320] focus:outline-none focus:border-[#6B4A34]">
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-sans text-[10px] font-semibold text-stone-500 mb-1 uppercase">Country *</label>
                      <input type="text" required value={country} onChange={(e) => setCountry(e.target.value)} className="w-full bg-[#FAF7F2] border border-stone-200 py-1.5 px-3 rounded-lg text-xs text-[#232320] focus:outline-none focus:border-[#6B4A34]" />
                    </div>
                    <div>
                      <label className="block font-sans text-[10px] font-semibold text-stone-500 mb-1 uppercase">Date of Birth</label>
                      <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className="w-full bg-[#FAF7F2] border border-stone-200 py-1.5 px-3 rounded-lg text-xs text-[#232320] focus:outline-none focus:border-[#6B4A34]" />
                    </div>
                    <div>
                      <label className="block font-sans text-[10px] font-semibold text-stone-500 mb-1 uppercase">FIDE ID</label>
                      <input type="text" value={fideId} onChange={(e) => setFideId(e.target.value)} placeholder="00" className="w-full bg-[#FAF7F2] border border-stone-200 py-1.5 px-3 rounded-lg text-xs text-[#232320] focus:outline-none focus:border-[#6B4A34]" />
                    </div>
                  </div>
                </div>

                {/* SECTION 2: Contact & Details */}
                <div className="space-y-2.5 pt-1">
                  <div className="flex items-center space-x-2 border-b border-stone-100 pb-1.5">
                    <div className="p-1 bg-[#FAF7F2] rounded"><Trophy className="w-4 h-4 text-[#6B4A34]" /></div>
                    <h4 className="font-serif font-bold text-sm text-[#232320]">2. Contact & Details</h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-sans text-[10px] font-semibold text-stone-500 mb-1 uppercase">Club / School</label>
                      <input type="text" value={school} onChange={(e) => setSchool(e.target.value)} placeholder="Optional" className="w-full bg-[#FAF7F2] border border-stone-200 py-1.5 px-3 rounded-lg text-xs text-[#232320] focus:outline-none focus:border-[#6B4A34]" />
                    </div>
                    <div>
                      <label className="block font-sans text-[10px] font-semibold text-stone-500 mb-1 uppercase">Email Address *</label>
                      <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="For ticket delivery" className="w-full bg-[#FAF7F2] border border-stone-200 py-1.5 px-3 rounded-lg text-xs text-[#232320] focus:outline-none focus:border-[#6B4A34]" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-sans text-[10px] font-semibold text-stone-500 mb-1 uppercase">M-Pesa Number *</label>
                      <input type="tel" required value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="07XXXXXXXX" className="w-full bg-[#FAF7F2] border border-stone-200 py-1.5 px-3 rounded-lg text-xs text-[#232320] focus:outline-none focus:border-[#6B4A34]" />
                    </div>
                    <div>
                      <label className="block font-sans text-[10px] font-semibold text-stone-500 mb-1 uppercase">Accompanying Person</label>
                      <input type="text" value={accompanyingPerson} onChange={(e) => setAccompanyingPerson(e.target.value)} placeholder="Parent/Coach Name" className="w-full bg-[#FAF7F2] border border-stone-200 py-1.5 px-3 rounded-lg text-xs text-[#232320] focus:outline-none focus:border-[#6B4A34]" />
                    </div>
                  </div>
                </div>

                {/* SECTION 3: Agreement */}
                <div className="pt-1">
                  <div className="flex items-start space-x-2.5 bg-[#FAF7F2] p-2.5 rounded-lg border border-[#6B4A34]/20">
                    <input
                      type="checkbox"
                      id="consent"
                      required
                      checked={consentGiven}
                      onChange={(e) => setConsentGiven(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded text-[#6B4A34] focus:ring-[#6B4A34] cursor-pointer"
                    />
                    <label htmlFor="consent" className="text-[11px] text-stone-700 leading-tight cursor-pointer">
                      I confirm the details provided are accurate and agree to the <Link href="/tournaments/rules" target="_blank" className="font-bold text-[#6B4A34] hover:underline">Tournament Rules</Link> and <Link href="/terms" target="_blank" className="font-bold text-[#6B4A34] hover:underline">Terms of Service</Link>.
                    </label>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={formSubmitting}
                    className="w-full py-3 bg-[#232320] text-white font-sans text-xs md:text-sm font-bold rounded-xl shadow-md hover:bg-[#6B4A34] active:scale-[0.99] transition-all duration-300 flex items-center justify-center space-x-2"
                  >
                    <span>{isPwdDap ? 'Complete Free Registration' : `Pay KES ${currentFee.toLocaleString()} via M-Pesa`}</span>
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
