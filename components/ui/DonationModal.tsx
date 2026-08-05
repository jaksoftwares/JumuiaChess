'use client';

import { useState, useEffect } from 'react';
import { Loader2, ShieldCheck, Heart, ArrowRight, X } from 'lucide-react';
import { apiRequest } from '@/lib/api';

export default function DonationModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  
  // Form State
  const [amount, setAmount] = useState<number>(1000);
  const [customAmount, setCustomAmount] = useState('');
  const [donorName, setDonorName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  
  // Process State
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [donationId, setDonationId] = useState<string | null>(null);
  const [receipt, setReceipt] = useState('');

  const finalAmount = customAmount ? parseFloat(customAmount) || 0 : amount;

  // Polling logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (step === 3 && donationId) {
      interval = setInterval(async () => {
        try {
          const res = await apiRequest<{ status: string; receipt: string }>(`/donations/status/${donationId}`);
          if (res.success && res.data) {
            if (res.data.status === 'completed') {
              setReceipt(res.data.receipt || 'Confirmed');
              setStep(4);
              clearInterval(interval);
            } else if (res.data.status === 'failed') {
              setErrorMsg('M-Pesa transaction failed or was cancelled. Please try again.');
              setStep(2);
              clearInterval(interval);
            }
          }
        } catch (err) {
          console.error('Polling error:', err);
        }
      }, 3000); // poll every 3 seconds
    }
    
    return () => clearInterval(interval);
  }, [step, donationId]);

  const handleInitiate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || finalAmount <= 0) {
      setErrorMsg('Please enter a valid phone number and amount.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await apiRequest<{ donationId: string; checkoutRequestId: string }>('/donations/initiate', {
        method: 'POST',
        body: JSON.stringify({
          donorName,
          email,
          phoneNumber,
          amount: finalAmount,
          message
        })
      });

      if (res.success && res.data?.donationId) {
        setDonationId(res.data.donationId);
        setStep(3); // Move to processing/polling step
      } else {
        setErrorMsg(res.error || 'Failed to initiate STK push.');
      }
    } catch (err: any) {
      setErrorMsg('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-charcoal/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto relative animate-scale-in">
        
        {/* Close Button */}
        {step !== 3 && (
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-stone-100 text-charcoal hover:bg-stone-200 flex items-center justify-center transition-all z-20"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <div className="p-6 md:p-8">
          
          {/* STEP 1: Amount & Details */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <div className="inline-flex p-3 bg-red-50 text-red-500 rounded-full mb-2">
                  <Heart className="w-6 h-6 fill-current" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-charcoal">Make a Donation</h3>
                <p className="text-sm text-stone-500 font-sans">
                  Your support empowers communities through chess.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-charcoal/70 mb-2">Select Amount (KES)</label>
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {[500, 1000, 2500, 5000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => { setAmount(amt); setCustomAmount(''); }}
                        className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                          amount === amt && !customAmount
                            ? 'bg-[#6B4A34] text-white border-[#6B4A34]'
                            : 'bg-stone-50 border-stone-300 text-charcoal hover:bg-stone-100'
                        }`}
                      >
                        {amt.toLocaleString()}
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    placeholder="Or enter custom amount..."
                    className="w-full bg-stone-50 border border-stone-300 p-3 rounded-xl text-sm focus:outline-none focus:border-[#6B4A34]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-charcoal/70 mb-1">Name (Optional)</label>
                    <input
                      type="text"
                      value={donorName}
                      onChange={(e) => setDonorName(e.target.value)}
                      placeholder="Your Full Name"
                      className="w-full bg-stone-50 border border-stone-300 p-2.5 rounded-xl text-sm focus:outline-none focus:border-[#6B4A34]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-charcoal/70 mb-1">Email (For Receipt)</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="donor@example.com"
                      className="w-full bg-stone-50 border border-stone-300 p-2.5 rounded-xl text-sm focus:outline-none focus:border-[#6B4A34]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal/70 mb-1">Leave a Message (Optional)</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Write a short message of support..."
                    rows={2}
                    className="w-full bg-stone-50 border border-stone-300 p-2.5 rounded-xl text-sm focus:outline-none focus:border-[#6B4A34] resize-none"
                  />
                </div>

                <button
                  onClick={() => setStep(2)}
                  disabled={finalAmount <= 0}
                  className="w-full py-3.5 mt-2 bg-charcoal text-white font-sans text-sm font-bold rounded-xl shadow hover:bg-charcoal/90 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <span>Continue to Payment</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Payment Method (M-Pesa) */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <button onClick={() => setStep(1)} className="text-xs text-stone-500 hover:text-charcoal mb-4 flex items-center">
                  ← Back to details
                </button>
                <h3 className="font-serif text-2xl font-bold text-charcoal mb-1">M-Pesa Payment</h3>
                <p className="text-sm text-stone-500 font-sans">
                  You are donating <strong className="text-charcoal">KES {finalAmount.toLocaleString()}</strong>.
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleInitiate} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-charcoal/70 mb-2">Safaricom Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="07XXXXXXXX or 2547XXXXXXXX"
                    className="w-full bg-stone-50 border border-stone-300 p-3 rounded-xl text-lg tracking-wide focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600"
                  />
                  <p className="text-[11px] text-stone-500 mt-2">
                    An STK prompt will be sent to this number. Enter your PIN to complete the donation.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-green-600 text-white font-sans text-sm font-bold rounded-xl shadow-md hover:bg-green-700 transition-all flex items-center justify-center space-x-2 disabled:opacity-70"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Initiating Prompt...</span>
                    </>
                  ) : (
                    <span>Pay KES {finalAmount.toLocaleString()} via M-Pesa</span>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* STEP 3: Processing (Polling) */}
          {step === 3 && (
            <div className="py-8 text-center space-y-6">
              <div className="relative w-20 h-20 mx-auto">
                <div className="absolute inset-0 border-4 border-stone-100 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-green-500 rounded-full border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-green-500 animate-pulse" />
                </div>
              </div>
              
              <div>
                <h3 className="font-serif text-xl font-bold text-charcoal mb-2">Awaiting Payment</h3>
                <p className="text-sm text-stone-500 font-sans max-w-xs mx-auto">
                  Check your phone and enter your M-Pesa PIN to complete the donation of <strong className="text-charcoal">KES {finalAmount.toLocaleString()}</strong>.
                </p>
                <p className="text-xs text-stone-400 mt-4 animate-pulse">
                  Waiting for confirmation...
                </p>
              </div>
            </div>
          )}

          {/* STEP 4: Success */}
          {step === 4 && (
            <div className="py-6 text-center space-y-5">
              <div className="inline-flex p-4 bg-emerald-50 text-emerald-500 rounded-full mb-2">
                <ShieldCheck className="w-10 h-10" />
              </div>
              
              <div>
                <h3 className="font-serif text-2xl font-bold text-charcoal mb-2">Thank You!</h3>
                <p className="text-sm text-stone-600 font-sans max-w-sm mx-auto">
                  Your donation of <strong>KES {finalAmount.toLocaleString()}</strong> has been received successfully. We deeply appreciate your support.
                </p>
              </div>

              {receipt && (
                <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 inline-block mt-4">
                  <span className="text-[10px] font-bold text-stone-500 uppercase block mb-1">M-Pesa Receipt</span>
                  <span className="font-mono text-sm font-bold text-charcoal">{receipt}</span>
                </div>
              )}

              <button
                onClick={onClose}
                className="w-full py-3.5 mt-6 bg-[#6B4A34] text-white font-sans text-sm font-bold rounded-xl hover:bg-[#5A3E2B] transition-colors"
              >
                Close Window
              </button>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}
