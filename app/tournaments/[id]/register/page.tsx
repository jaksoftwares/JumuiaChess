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
            text: 'Payment received! Redirecting to your ticket...',
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
    <div className="min-h-screen bg-[#FAF7F2] py-16 px-4 md:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <Link href={`/tournaments/${id}`} className="inline-flex items-center space-x-2 text-[#6B4A34] hover:underline font-bold font-sans text-sm">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Event Details</span>
        </Link>
        
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-[#6B4A34]/10">
          
          <div className="mb-8 border-b border-stone-100 pb-6 space-y-2">
            <div className="flex justify-between items-start">
              <h1 className="font-serif text-3xl font-bold text-[#232320]">Event Registration</h1>
              <div className="text-right">
                <span className="font-sans text-xs text-stone-500 uppercase tracking-widest block mb-1">Entry Fee</span>
                <span className="font-serif text-2xl font-bold text-[#6B4A34]">
                  {isPwdDap ? 'FREE' : `KES ${currentFee.toLocaleString()}`}
                </span>
              </div>
            </div>
            <h2 className="font-sans font-bold text-[#6B4A34]">{tournament.name}</h2>
          </div>

          {isFull ? (
             <div className="p-8 text-center bg-red-50 border border-red-200 rounded-2xl text-red-900">
                <h3 className="text-xl font-bold mb-2">Registration Closed</h3>
                <p>Sorry, this tournament has reached its maximum capacity of {capacity} players.</p>
             </div>
          ) : statusMessage ? (
            <div className={`p-8 rounded-2xl mb-6 shadow-sm border ${
              statusMessage.type === 'pending'
                ? 'bg-[#FAF7F2] border-[#C8B195] text-[#232320]'
                : statusMessage.type === 'success' 
                ? 'bg-[#FAF7F2] border-[#6B4A34] text-[#232320]'
                : 'bg-red-50 border-red-200 text-red-900'
            }`}>
              <div className="flex items-center space-x-3 mb-4">
                {statusMessage.type === 'pending' ? (
                  <Loader2 className="w-6 h-6 animate-spin text-[#6B4A34]" />
                ) : statusMessage.type === 'success' ? (
                  <CheckCircle2 className="w-6 h-6 text-[#6B4A34]" />
                ) : (
                  <ShieldCheck className="w-6 h-6 text-red-600" />
                )}
                <h4 className="font-serif font-bold text-lg text-[#6B4A34]">
                  {statusMessage.type === 'pending' ? 'Processing Payment...' : statusMessage.type === 'success' ? 'Registration Complete!' : 'Payment Error'}
                </h4>
              </div>
              <p className="text-sm leading-relaxed opacity-90 mb-4">{statusMessage.text}</p>
              
              {statusMessage.type === 'pending' && checkoutRequestId && (
                <button
                  type="button"
                  onClick={() => checkPaymentStatus(checkoutRequestId)}
                  className="py-3 px-6 bg-[#6B4A34] hover:bg-[#232320] text-white font-sans text-xs font-bold rounded-xl transition-all shadow-sm"
                >
                  Verify Payment Status
                </button>
              )}

              {statusMessage.type === 'error' && (
                <button
                  type="button"
                  onClick={() => setStatusMessage(null)}
                  className="py-3 px-6 bg-[#232320] hover:bg-red-900 text-white font-sans text-xs font-bold rounded-xl transition-all shadow-sm"
                >
                  Try Again
                </button>
              )}
            </div>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-8">
              
              {/* SECTION 1 */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3 border-b border-stone-100 pb-3">
                  <div className="p-2 bg-[#FAF7F2] rounded-lg"><User className="w-5 h-5 text-[#6B4A34]" /></div>
                  <h4 className="font-serif font-bold text-lg text-[#232320]">1. Player Details</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block font-sans text-xs font-semibold text-stone-500 mb-1.5 uppercase">Surname *</label>
                    <input type="text" required value={surname} onChange={(e) => setSurname(e.target.value)} placeholder="e.g. Kimani" className="w-full bg-[#FAF7F2] border border-stone-200 p-3 rounded-xl text-sm text-[#232320] focus:outline-none focus:border-[#6B4A34]" />
                  </div>
                  <div>
                    <label className="block font-sans text-xs font-semibold text-stone-500 mb-1.5 uppercase">Other Names *</label>
                    <input type="text" required value={otherNames} onChange={(e) => setOtherNames(e.target.value)} placeholder="e.g. John Mwangi" className="w-full bg-[#FAF7F2] border border-stone-200 p-3 rounded-xl text-sm text-[#232320] focus:outline-none focus:border-[#6B4A34]" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <label className="block font-sans text-xs font-semibold text-stone-500 mb-1.5 uppercase">Gender *</label>
                    <select required value={gender} onChange={(e) => setGender(e.target.value)} className="w-full bg-[#FAF7F2] border border-stone-200 p-3 rounded-xl text-sm text-[#232320] focus:outline-none focus:border-[#6B4A34]">
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-sans text-xs font-semibold text-stone-500 mb-1.5 uppercase">Country *</label>
                    <input type="text" required value={country} onChange={(e) => setCountry(e.target.value)} className="w-full bg-[#FAF7F2] border border-stone-200 p-3 rounded-xl text-sm text-[#232320] focus:outline-none focus:border-[#6B4A34]" />
                  </div>
                  <div>
                    <label className="block font-sans text-xs font-semibold text-stone-500 mb-1.5 uppercase">Date of Birth</label>
                    <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className="w-full bg-[#FAF7F2] border border-stone-200 p-3 rounded-xl text-sm text-[#232320] focus:outline-none focus:border-[#6B4A34]" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block font-sans text-xs font-semibold text-stone-500 mb-1.5 uppercase">Category *</label>
                    <select required value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-[#FAF7F2] border border-stone-200 p-3 rounded-xl text-sm text-[#232320] focus:outline-none focus:border-[#6B4A34]">
                      <option value="">Select Category</option>
                      {tournament.categories?.map((cat: string) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-sans text-xs font-semibold text-stone-500 mb-1.5 uppercase">FIDE ID</label>
                    <input type="text" value={fideId} onChange={(e) => setFideId(e.target.value)} placeholder="00" className="w-full bg-[#FAF7F2] border border-stone-200 p-3 rounded-xl text-sm text-[#232320] focus:outline-none focus:border-[#6B4A34]" />
                  </div>
                </div>
              </div>

              {/* SECTION 2 */}
              <div className="space-y-4 pt-4">
                <div className="flex items-center space-x-3 border-b border-stone-100 pb-3">
                  <div className="p-2 bg-[#FAF7F2] rounded-lg"><Trophy className="w-5 h-5 text-[#6B4A34]" /></div>
                  <h4 className="font-serif font-bold text-lg text-[#232320]">2. Contact & Club</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block font-sans text-xs font-semibold text-stone-500 mb-1.5 uppercase">Club / School</label>
                    <input type="text" value={school} onChange={(e) => setSchool(e.target.value)} placeholder="Optional" className="w-full bg-[#FAF7F2] border border-stone-200 p-3 rounded-xl text-sm text-[#232320] focus:outline-none focus:border-[#6B4A34]" />
                  </div>
                  <div>
                    <label className="block font-sans text-xs font-semibold text-stone-500 mb-1.5 uppercase">Email Address *</label>
                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="For ticket delivery" className="w-full bg-[#FAF7F2] border border-stone-200 p-3 rounded-xl text-sm text-[#232320] focus:outline-none focus:border-[#6B4A34]" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block font-sans text-xs font-semibold text-stone-500 mb-1.5 uppercase">M-Pesa Number *</label>
                    <input type="tel" required value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="07XXXXXXXX" className="w-full bg-[#FAF7F2] border border-stone-200 p-3 rounded-xl text-sm text-[#232320] focus:outline-none focus:border-[#6B4A34]" />
                    <p className="text-[10px] text-stone-500 mt-1 font-bold">This number will receive the payment prompt.</p>
                  </div>
                  <div>
                    <label className="block font-sans text-xs font-semibold text-stone-500 mb-1.5 uppercase">Accompanying Person</label>
                    <input type="text" value={accompanyingPerson} onChange={(e) => setAccompanyingPerson(e.target.value)} placeholder="Parent or Coach Name" className="w-full bg-[#FAF7F2] border border-stone-200 p-3 rounded-xl text-sm text-[#232320] focus:outline-none focus:border-[#6B4A34]" />
                  </div>
                </div>
              </div>

              {/* SECTION 3 */}
              <div className="space-y-4 pt-4">
                <div className="flex items-center space-x-3 border-b border-stone-100 pb-3">
                  <div className="p-2 bg-[#FAF7F2] rounded-lg"><ShieldCheck className="w-5 h-5 text-[#6B4A34]" /></div>
                  <h4 className="font-serif font-bold text-lg text-[#232320]">3. Agreement</h4>
                </div>
                
                <div className="flex items-start space-x-3 bg-[#FAF7F2] p-4 rounded-xl border border-[#6B4A34]/20">
                  <input
                    type="checkbox"
                    id="consent"
                    required
                    checked={consentGiven}
                    onChange={(e) => setConsentGiven(e.target.checked)}
                    className="mt-1 w-5 h-5 rounded text-[#6B4A34] focus:ring-[#6B4A34] cursor-pointer"
                  />
                  <label htmlFor="consent" className="text-xs text-stone-700 leading-relaxed cursor-pointer">
                    I confirm that the details provided are accurate. I have read and agreed to the <Link href="/tournaments/rules" target="_blank" className="font-bold text-[#6B4A34] hover:underline">Tournament Rules</Link> and <Link href="/terms" target="_blank" className="font-bold text-[#6B4A34] hover:underline">Terms of Service</Link>, including the media release policy.
                  </label>
                </div>
              </div>

              <div className="pt-6">
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="w-full py-4 bg-[#232320] text-white font-sans text-sm font-bold rounded-xl shadow-xl hover:bg-[#6B4A34] active:scale-[0.99] transition-all duration-300 flex items-center justify-center space-x-3"
                >
                  {formSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin text-white" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <span>{isPwdDap ? 'Complete Free Registration' : `Pay KES ${currentFee.toLocaleString()} via M-Pesa`}</span>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
