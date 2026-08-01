'use client';

import { useState } from 'react';
import { apiRequest } from '@/lib/api';
import { Loader2, Copy, Check, ShieldCheck, CreditCard, Building2, Smartphone } from 'lucide-react';

export default function PromoBanner() {
  const [modalOpen, setModalOpen] = useState(false);
  const [activeChannel, setActiveChannel] = useState<'stk' | 'till' | 'bank'>('stk');

  // STK Form State
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedAmount, setSelectedAmount] = useState<number>(1000);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stkStatus, setStkStatus] = useState<{ type: 'pending' | 'success' | 'error'; message: string } | null>(null);

  // Copy Feedback State
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const finalAmount = customAmount ? parseFloat(customAmount) || 0 : selectedAmount;

  const handleStkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || finalAmount <= 0) return;

    setIsSubmitting(true);
    setStkStatus({
      type: 'pending',
      message: 'Dispatching M-Pesa STK push prompt to your phone. Please enter your M-Pesa PIN.',
    });

    try {
      const res = await apiRequest('/mpesa/register', {
        method: 'POST',
        body: JSON.stringify({
          tournamentId: 'donation-general',
          surname: donorName || 'Donor',
          otherNames: '',
          email: donorEmail || 'donor@example.com',
          gender: 'Other',
          country: 'Kenya',
          dob: '2000-01-01',
          age: 25,
          school: 'General Donation',
          category: 'Charity Contribution',
          fideId: '00',
          phoneNumber,
          accompanyingPerson: '',
          consentGiven: true,
          amount: finalAmount,
        }),
      });

      setIsSubmitting(false);

      if (res.success) {
        setStkStatus({
          type: 'success',
          message: 'STK push sent! Check your mobile phone to complete your donation.',
        });
      } else {
        setStkStatus({
          type: 'error',
          message: res.error || 'Failed to dispatch M-Pesa prompt. Please try again or use direct Paybill.',
        });
      }
    } catch (err) {
      setIsSubmitting(false);
      setStkStatus({
        type: 'error',
        message: 'Network error. Please check your phone number and try again.',
      });
    }
  };

  return (
    <section className="relative w-full bg-white py-16 md:py-20 overflow-hidden">
      <div
        className="relative w-full h-[380px] md:h-[440px] flex items-center justify-center z-10"
        style={{ clipPath: 'polygon(0 12%, 100% 0, 100% 88%, 0 100%)' }}
      >
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-fixed bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/images/promobanner.jpg')" }}
        />
        {/* Dark Overlay mask */}
        <div className="absolute inset-0 bg-black/55 z-0" />

        {/* Content Container */}
        <div className="relative max-w-7xl mx-auto w-full px-6 md:px-12 lg:px-20 z-10 grid grid-cols-1 lg:grid-cols-2 items-center">
          {/* Left Column left empty for visual spacing */}
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
            <button
              onClick={() => {
                setModalOpen(true);
                setStkStatus(null);
              }}
              className="inline-block px-8 py-3 bg.C8B195 text-charcoal font-sans text-xs md:text-sm font-bold shadow-md hover:shadow-xl hover:-translate-y-0.5 hover:scale-[1.03] active:translate-y-0 active:scale-[0.98] bg-[#C8B195] hover:bg-[#B89E82] transition-all duration-300 rounded-xl"
            >
              Donate Now
            </button>
          </div>
        </div>
      </div>

      {/* EXECUTIVE MULTI-CHANNEL DONATION MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 bg-charcoal/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 relative animate-scale-in">
            {/* Close Button */}
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-stone-100 text-charcoal hover:bg-[#6B4A34] hover:text-white font-bold flex items-center justify-center text-xs transition-all z-20"
            >
              ✕
            </button>

            {/* Modal Header */}
            <div className="mb-6 border-b border-stone-100 pb-4">
              <span className="font-mono text-[10px] font-bold text-[#6B4A34] uppercase tracking-wider block mb-1">
                Jumuiya Chess Initiative
              </span>
              <h3 className="font-serif text-2xl font-bold text-charcoal">
                Support Our Mission
              </h3>
              <p className="text-xs text-stone-500 font-sans mt-1">
                Select your preferred donation method below to contribute securely.
              </p>
            </div>

            {/* Payment Channel Tabs */}
            <div className="grid grid-cols-3 gap-2 p-1.5 bg-stone-100 rounded-xl mb-6">
              <button
                onClick={() => setActiveChannel('stk')}
                className={`py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
                  activeChannel === 'stk'
                    ? 'bg-[#6B4A34] text-white shadow-xs'
                    : 'text-stone-600 hover:text-[#6B4A34]'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>M-Pesa Prompt</span>
              </button>

              <button
                onClick={() => setActiveChannel('till')}
                className={`py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
                  activeChannel === 'till'
                    ? 'bg-[#6B4A34] text-white shadow-xs'
                    : 'text-stone-600 hover:text-[#6B4A34]'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Buy Goods Till</span>
              </button>

              <button
                onClick={() => setActiveChannel('bank')}
                className={`py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
                  activeChannel === 'bank'
                    ? 'bg-[#6B4A34] text-white shadow-xs'
                    : 'text-stone-600 hover:text-[#6B4A34]'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Bank Transfer</span>
              </button>
            </div>

            {/* CHANNEL 1: INSTANT M-PESA STK PUSH */}
            {activeChannel === 'stk' && (
              <form onSubmit={handleStkSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-charcoal/70 mb-1.5">Select Donation Amount (KES)</label>
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {[500, 1000, 2500, 5000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => {
                          setSelectedAmount(amt);
                          setCustomAmount('');
                        }}
                        className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                          selectedAmount === amt && !customAmount
                            ? 'bg-[#6B4A34] text-white border-[#6B4A34]'
                            : 'bg-stone-50 border-stone-300 text-charcoal hover:bg-stone-100'
                        }`}
                      >
                        KES {amt.toLocaleString()}
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    placeholder="Or enter custom amount in KES..."
                    className="w-full bg-stone-50 border border-stone-300 p-2.5 rounded-xl text-xs text-charcoal focus:outline-none focus:border-[#6B4A34]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-charcoal/70 mb-1">Donor Name (Optional)</label>
                    <input
                      type="text"
                      value={donorName}
                      onChange={(e) => setDonorName(e.target.value)}
                      placeholder="Your Full Name"
                      className="w-full bg-stone-50 border border-stone-300 p-2.5 rounded-xl text-xs text-charcoal focus:outline-none focus:border-[#6B4A34]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-charcoal/70 mb-1">Email Address (Optional)</label>
                    <input
                      type="email"
                      value={donorEmail}
                      onChange={(e) => setDonorEmail(e.target.value)}
                      placeholder="donor@example.com"
                      className="w-full bg-stone-50 border border-stone-300 p-2.5 rounded-xl text-xs text-charcoal focus:outline-none focus:border-[#6B4A34]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal/70 mb-1">M-Pesa Mobile Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="07XXXXXXXX"
                    className="w-full bg-stone-50 border border-stone-300 p-2.5 rounded-xl text-xs text-charcoal focus:outline-none focus:border-[#6B4A34]"
                  />
                  <span className="text-[10px] text-stone-500 font-sans block mt-1">
                    Enter the M-Pesa registered line to receive the payment PIN prompt.
                  </span>
                </div>

                {stkStatus && (
                  <div
                    className={`p-3.5 rounded-xl text-xs ${
                      stkStatus.type === 'pending'
                        ? 'bg-amber-50 text-amber-900 border border-amber-200'
                        : stkStatus.type === 'success'
                        ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                        : 'bg-red-50 text-red-900 border border-red-200'
                    }`}
                  >
                    <div className="flex items-center space-x-2 font-bold mb-0.5">
                      {stkStatus.type === 'pending' && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      {stkStatus.type === 'success' && <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />}
                      <span>{stkStatus.type.toUpperCase()}</span>
                    </div>
                    <p>{stkStatus.message}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting || finalAmount <= 0}
                  className="w-full py-3.5 bg-[#6B4A34] text-white font-sans text-xs font-bold rounded-xl shadow-md hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Sending M-Pesa Prompt...</span>
                    </>
                  ) : (
                    <span>Donate KES {finalAmount.toLocaleString()} via M-Pesa</span>
                  )}
                </button>
              </form>
            )}

            {/* CHANNEL 2: BUY GOODS TILL DIRECT PAYMENT */}
            {activeChannel === 'till' && (
              <div className="space-y-4">
                <div className="bg-[#FAF7F2] border border-[#C8B195]/60 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-[#C8B195]/30 pb-3">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-stone-500 uppercase block">BUY GOODS / TILL NUMBER</span>
                      <span className="font-serif text-2xl font-bold text-[#6B4A34]">4160809</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy('4160809', 'till')}
                      className="px-3 py-1.5 bg-[#6B4A34] text-white text-xs font-bold rounded-lg flex items-center space-x-1 hover:brightness-110 transition-all"
                    >
                      {copiedField === 'till' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedField === 'till' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono font-bold text-stone-500 uppercase block">STORE / ACCOUNT NAME</span>
                    <span className="font-sans text-xs font-bold text-charcoal">The Gift of Chess Africa Ltd</span>
                  </div>
                </div>

                <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-600 space-y-1 font-sans">
                  <span className="font-bold text-charcoal block">M-Pesa Instructions:</span>
                  <p>1. Open Safaricom M-Pesa Menu on your phone.</p>
                  <p>2. Select Lipa Na M-Pesa → Buy Goods and Services.</p>
                  <p>3. Enter Till Number <strong className="text-charcoal font-semibold">4160809</strong>.</p>
                  <p>4. Enter your donation amount and M-Pesa PIN to complete.</p>
                </div>
              </div>
            )}

            {/* CHANNEL 3: DIRECT BANK TRANSFER */}
            {activeChannel === 'bank' && (
              <div className="space-y-4">
                <div className="bg-[#FAF7F2] border border-[#C8B195]/60 rounded-2xl p-5 space-y-3.5 text-xs">
                  <div className="flex items-center justify-between border-b border-[#C8B195]/30 pb-2.5">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-stone-500 uppercase block">BANK NAME</span>
                      <span className="font-bold text-charcoal text-sm">NCBA Bank Kenya</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-b border-[#C8B195]/30 pb-2.5">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-stone-500 uppercase block">ACCOUNT NAME</span>
                      <span className="font-bold text-charcoal text-sm">The Gift of Chess Africa Ltd</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-b border-[#C8B195]/30 pb-2.5">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-stone-500 uppercase block">ACCOUNT NUMBER</span>
                      <span className="font-serif text-lg font-bold text-[#6B4A34]">100 248 9102</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy('1002489102', 'acc')}
                      className="px-3 py-1.5 bg-[#6B4A34] text-white text-xs font-bold rounded-lg flex items-center space-x-1 hover:brightness-110 transition-all"
                    >
                      {copiedField === 'acc' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedField === 'acc' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 text-stone-700">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-stone-500 uppercase block">BRANCH</span>
                      <span className="font-semibold">Westlands Branch</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-bold text-stone-500 uppercase block">SWIFT CODE</span>
                      <span className="font-mono font-bold">NCBAKENX</span>
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-stone-500 font-sans text-center leading-relaxed">
                  For international wire transfers or official tax-deductible receipt inquiries, please email us at <strong className="text-charcoal font-semibold">info@giftofchess.org</strong>.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
