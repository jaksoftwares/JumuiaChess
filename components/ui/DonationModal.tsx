'use client';

import { useState, useEffect } from 'react';
import { Loader2, Heart, ArrowRight, X, ShieldCheck, Download } from 'lucide-react';
import { apiRequest } from '@/lib/api';
import Barcode from 'react-barcode';

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

  // Polling logic with timeout
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (step === 3 && donationId) {
      const startTime = Date.now();
      
      interval = setInterval(async () => {
        // Timeout after 2 minutes (120 seconds)
        if (Date.now() - startTime > 120000) {
          setErrorMsg('The transaction timed out. Please try again.');
          setStep(2);
          clearInterval(interval);
          return;
        }

        try {
          const res = await apiRequest<{ status: string; receipt: string }>(`/donations/status/${donationId}`);
          if (res.success && res.data) {
            if (res.data.status === 'completed') {
              setReceipt(res.data.receipt || 'Confirmed');
              setStep(4);
              clearInterval(interval);
            } else if (res.data.status === 'failed') {
              setErrorMsg('The transaction failed or was cancelled. Please try again.');
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

  const formatPhoneNumber = (phone: string) => {
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('0')) {
      cleaned = '254' + cleaned.substring(1);
    } else if (cleaned.length === 9) {
      cleaned = '254' + cleaned;
    }
    return cleaned;
  };

  const handleInitiate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || finalAmount <= 0) {
      setErrorMsg('Please enter a valid phone number and amount.');
      return;
    }

    const formattedPhone = formatPhoneNumber(phoneNumber);

    if (formattedPhone.length !== 12 || !formattedPhone.startsWith('254')) {
      setErrorMsg('Invalid phone number format. Start with 07...');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await apiRequest<{ donationId: string; checkoutRequestId: string }>('/donations/initiate', {
        method: 'POST',
        body: JSON.stringify({ donorName, email, phoneNumber: formattedPhone, amount: finalAmount, message })
      });

      if (res.success && res.data?.donationId) {
        setDonationId(res.data.donationId);
        setStep(3);
      } else {
        setErrorMsg(res.error || 'Failed to initiate prompt.');
      }
    } catch (err: any) {
      setErrorMsg('Network error.');
    } finally {
      setLoading(false);
    }
  };

  const downloadReceipt = async () => {
    try {
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;
      
      const element = document.getElementById('printable-donation-receipt');
      if (!element) return;
      
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Jumuiya_Donation_Receipt_${receipt}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-charcoal/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:hidden">
      <div className="bg-[#FAF7F2] rounded-2xl border border-[#6B4A34]/20 shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto relative animate-scale-in">
        
        {step !== 3 && (
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white border border-[#6B4A34]/20 text-charcoal hover:bg-[#6B4A34] hover:text-white flex items-center justify-center transition-all z-20 shadow-sm"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <div className="p-6 md:p-8">
          
          {/* STEP 1: Amount & Details */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center space-y-1 border-b border-[#6B4A34]/10 pb-5">
                <h3 className="font-serif text-3xl font-bold text-charcoal">Make a Donation</h3>
                <p className="text-xs text-charcoal/70 font-sans">
                  Partner with us to empower communities through chess.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-[#6B4A34] uppercase tracking-wider mb-2">Amount (KES)</label>
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {[500, 1000, 2500, 5000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => { setAmount(amt); setCustomAmount(''); }}
                        className={`py-2 rounded-lg text-xs font-bold transition-all border ${
                          amount === amt && !customAmount
                            ? 'bg-[#6B4A34] text-white border-[#6B4A34]'
                            : 'bg-white text-charcoal border-[#6B4A34]/20 hover:bg-[#6B4A34]/5'
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
                    placeholder="Custom Amount..."
                    className="w-full bg-white border border-[#6B4A34]/20 p-2.5 rounded-lg text-sm focus:outline-none focus:border-[#6B4A34] shadow-sm"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-[#6B4A34] uppercase tracking-wider mb-1">Name (Optional)</label>
                    <input
                      type="text"
                      value={donorName}
                      onChange={(e) => setDonorName(e.target.value)}
                      placeholder="Your Name"
                      className="w-full bg-white border border-[#6B4A34]/20 p-2.5 rounded-lg text-sm focus:outline-none focus:border-[#6B4A34] shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#6B4A34] uppercase tracking-wider mb-1">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="For Receipt"
                      className="w-full bg-white border border-[#6B4A34]/20 p-2.5 rounded-lg text-sm focus:outline-none focus:border-[#6B4A34] shadow-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#6B4A34] uppercase tracking-wider mb-1">Message (Optional)</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Leave a note..."
                    rows={2}
                    className="w-full bg-white border border-[#6B4A34]/20 p-2.5 rounded-lg text-sm focus:outline-none focus:border-[#6B4A34] resize-none shadow-sm"
                  />
                </div>

                <button
                  onClick={() => setStep(2)}
                  disabled={finalAmount <= 0}
                  className="w-full py-3 mt-2 bg-[#232320] text-white font-sans text-sm font-bold rounded-lg shadow-md hover:bg-[#6B4A34] transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Payment Method */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="border-b border-[#6B4A34]/10 pb-4">
                <button onClick={() => setStep(1)} className="text-[10px] font-bold uppercase tracking-wider text-[#6B4A34] hover:text-charcoal mb-3 flex items-center">
                  ← Back
                </button>
                <h3 className="font-serif text-2xl font-bold text-charcoal mb-1">M-Pesa Payment</h3>
                <p className="text-sm text-charcoal/70 font-sans">
                  Total: <strong className="text-charcoal">KES {finalAmount.toLocaleString()}</strong>
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-900/10 border border-red-900/20 text-red-900 text-xs rounded-lg font-bold">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleInitiate} className="space-y-5">
                <div>
                  <label className="block text-[10px] font-bold text-[#6B4A34] uppercase tracking-wider mb-2">M-Pesa Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="07XXXXXXXX"
                    className="w-full bg-white border border-[#6B4A34]/20 p-3 rounded-lg text-lg tracking-wide focus:outline-none focus:border-[#6B4A34] shadow-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-[#6B4A34] text-white font-sans text-sm font-bold rounded-lg shadow-md hover:bg-[#2A170F] transition-all flex items-center justify-center space-x-2 disabled:opacity-70"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <span>Pay KES {finalAmount.toLocaleString()}</span>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* STEP 3: Processing (GREEN LOADER) */}
          {step === 3 && (
            <div className="py-10 text-center space-y-6">
              <div className="relative w-16 h-16 mx-auto">
                <div className="absolute inset-0 border-4 border-emerald-100 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-emerald-500 rounded-full border-t-transparent animate-spin"></div>
              </div>
              
              <div>
                <h3 className="font-serif text-xl font-bold text-charcoal mb-2">Processing Payment</h3>
                <p className="text-sm text-charcoal/70 font-sans max-w-xs mx-auto">
                  Please check your phone for the M-Pesa prompt and enter your PIN to complete the transaction.
                </p>
              </div>
            </div>
          )}

          {/* STEP 4: Success */}
          {step === 4 && (
            <div className="py-8 text-center space-y-5">
              <div className="inline-flex p-4 bg-emerald-50 text-emerald-600 rounded-full mb-2">
                <ShieldCheck className="w-8 h-8" />
              </div>
              
              <div>
                <h3 className="font-serif text-2xl font-bold text-charcoal mb-2">Payment Successful!</h3>
                <p className="text-sm text-charcoal/80 font-sans max-w-sm mx-auto">
                  Your contribution empowers our mission. Thank you for partnering with us.
                </p>
              </div>

              {receipt && (
                <div className="bg-white border border-[#6B4A34]/20 rounded-lg p-3 inline-block mt-4 shadow-sm">
                  <span className="text-[10px] font-bold text-[#6B4A34] uppercase block mb-1">Receipt</span>
                  <span className="font-mono text-sm font-bold text-charcoal">{receipt}</span>
                </div>
              )}

              <div className="space-y-3 pt-4">
                <button
                  onClick={downloadReceipt}
                  className="w-full py-3 bg-[#FAF7F2] text-[#232320] border border-[#6B4A34]/20 font-sans text-sm font-bold rounded-lg hover:bg-white transition-colors flex items-center justify-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PDF Receipt</span>
                </button>
                <button
                  onClick={onClose}
                  className="w-full py-3 bg-[#232320] text-white font-sans text-sm font-bold rounded-lg hover:bg-[#6B4A34] transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          )}
          
        </div>
        </div>
      </div>

      {/* Printable Receipt (Rendered off-screen for PDF generation) */}
      {step === 4 && receipt && (
        <div className="absolute top-[-9999px] left-[-9999px] w-[800px]">
          <div id="printable-donation-receipt" className="p-10 bg-white text-black relative overflow-hidden">
          {/* PAID Watermark */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none -rotate-45">
            <span className="text-[150px] font-bold tracking-widest uppercase">PAID</span>
          </div>

          <div className="max-w-4xl mx-auto relative z-10">
            {/* Header: Logo & Receipt Meta */}
            <div className="flex justify-between items-start border-b-[3px] border-[#6B4A34] pb-8 mb-10">
              <div className="flex items-center space-x-6">
                <img src="/images/chess_logo.png" alt="Jumuiya Chess Logo" className="w-24 h-24 object-contain" />
                <div>
                  <h1 className="text-4xl font-serif font-black text-[#232320] tracking-tight uppercase mb-1">Jumuiya Chess</h1>
                  <p className="text-sm font-sans text-gray-500 tracking-widest uppercase font-semibold">Official Donation Receipt</p>
                </div>
              </div>
              <div className="text-right">
                <div className="bg-[#FAF7F2] p-4 rounded-lg border border-[#6B4A34]/20 inline-block">
                  <p className="font-sans text-[10px] uppercase tracking-widest text-gray-500 mb-1">Receipt Number</p>
                  <p className="font-mono text-xl font-bold text-[#6B4A34]">{receipt}</p>
                </div>
                <p className="text-sm font-sans text-gray-600 mt-3 font-semibold">Date: {new Date().toLocaleDateString()}</p>
              </div>
            </div>

            {/* Information Grid */}
            <div className="grid grid-cols-2 gap-12 mb-12">
              {/* Donor */}
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                <h3 className="font-sans text-xs font-bold text-[#6B4A34] uppercase tracking-widest mb-4 border-b border-gray-200 pb-2">Billed To</h3>
                <p className="font-serif text-xl font-bold text-gray-900 mb-1">{donorName || 'Anonymous Supporter'}</p>
                {email && <p className="font-sans text-sm text-gray-600">{email}</p>}
                {phoneNumber && <p className="font-sans text-sm text-gray-600">{phoneNumber}</p>}
              </div>
              
              {/* Org Details */}
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                <h3 className="font-sans text-xs font-bold text-[#6B4A34] uppercase tracking-widest mb-4 border-b border-gray-200 pb-2">Organization</h3>
                <p className="font-serif text-lg font-bold text-gray-900 mb-1">Jumuiya Chess Initiative</p>
                <p className="font-sans text-sm text-gray-600">Nairobi, Kenya</p>
                <p className="font-sans text-sm text-gray-600">info@jumuiyachess.org</p>
                <p className="font-sans text-sm text-gray-600">+254 (0) 700 000000</p>
              </div>
            </div>

            {/* Itemized Table */}
            <div className="rounded-xl overflow-hidden border border-gray-200 mb-10">
              <table className="w-full text-left font-sans border-collapse">
                <thead>
                  <tr className="bg-[#232320] text-white">
                    <th className="py-4 px-6 text-xs font-bold uppercase tracking-widest">Description</th>
                    <th className="py-4 px-6 text-xs font-bold uppercase tracking-widest text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  <tr>
                    <td className="py-6 px-6 border-b border-gray-100">
                      <p className="font-bold text-gray-900 text-lg">General Donation</p>
                      <p className="text-sm text-gray-500 mt-1">Processed via M-Pesa STK Push</p>
                    </td>
                    <td className="py-6 px-6 border-b border-gray-100 text-right">
                      <p className="font-mono text-lg font-semibold text-gray-900">KES {finalAmount.toLocaleString()}</p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Total & Verification Section */}
            <div className="flex justify-between items-end mb-16">
              {/* Barcode Verification */}
              <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-sm">
                <p className="font-sans text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 text-center">Scan to Verify</p>
                <div className="scale-90 origin-top">
                  <Barcode value={receipt} height={40} width={1.5} fontSize={14} background="#ffffff" lineColor="#232320" renderer="img" />
                </div>
              </div>

              {/* Total Box */}
              <div className="text-right bg-stone-50 p-8 rounded-2xl border-2 border-[#6B4A34] min-w-[300px]">
                <p className="font-sans text-xs text-gray-500 uppercase tracking-widest font-bold mb-2">Total Contribution</p>
                <p className="font-serif text-4xl font-black text-[#232320]">KES {finalAmount.toLocaleString()}</p>
              </div>
            </div>

            {/* Footer / Signature */}
            <div className="border-t border-gray-200 pt-8 mt-12 grid grid-cols-2 gap-8 items-end">
              <div>
                <p className="font-serif italic text-gray-500 mb-1">Authorized by</p>
                <div className="w-48 h-12 border-b-2 border-gray-800 mb-2 flex items-end">
                  <span className="font-signature text-3xl text-gray-800 opacity-80">Jumuiya Team</span>
                </div>
                <p className="font-sans text-xs text-gray-500 font-semibold uppercase tracking-widest">Official Signature</p>
              </div>
              
              <div className="text-right font-sans text-xs text-gray-400">
                <p className="mb-1 font-semibold text-gray-500">Jumuiya Chess Initiative</p>
                <p>Your generous support empowers our mission.</p>
                <p>Thank you for partnering with us.</p>
              </div>
            </div>
          </div>
        </div>
        </div>
      )}
    </>
  );
}
