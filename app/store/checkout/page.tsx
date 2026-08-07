'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cart';
import { apiRequest } from '@/lib/api';
import { Minus, Plus, Trash2, ArrowLeft, Loader2, ShieldCheck, ShoppingBag, Download } from 'lucide-react';
import Link from 'next/link';
import Barcode from 'react-barcode';
import { useSiteSettings } from '@/components/providers/SettingsProvider';

export default function CheckoutPage() {
  const { settings, loading: settingsLoading } = useSiteSettings();
  const router = useRouter();
  const { items, updateQuantity, removeItem, getTotalPrice, clearCart } = useCartStore();
  const [mounted, setMounted] = useState(false);

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');

  // Process State
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [checkoutRequestId, setCheckoutRequestId] = useState<string | null>(null);
  const [finalOrderDetails, setFinalOrderDetails] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Polling logic with timeout
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (step === 2 && checkoutRequestId) {
      const startTime = Date.now();
      
      interval = setInterval(async () => {
        if (Date.now() - startTime > 120000) {
          setErrorMsg('The transaction timed out. Please try again.');
          setStep(1);
          clearInterval(interval);
          return;
        }

        try {
          const res = await apiRequest<{ status: string }>(`/shop/orders/status/${checkoutRequestId}`);
          if (res.success && res.data) {
            if (res.data.status === 'completed') {
              setFinalOrderDetails({
                customerName,
                address,
                city,
                amount: getTotalPrice(),
                items: [...items],
                receipt: checkoutRequestId,
                date: new Date().toLocaleDateString()
              });
              setStep(3);
              clearCart();
              clearInterval(interval);
            } else if (res.data.status === 'failed') {
              setErrorMsg('The transaction failed or was cancelled. Please try again.');
              setStep(1);
              clearInterval(interval);
            }
          }
        } catch (err) {
          // ignore polling errors
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [step, checkoutRequestId, clearCart]);

  const formatPhoneNumber = (phone: string) => {
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('0')) {
      cleaned = '254' + cleaned.substring(1);
    } else if (cleaned.length === 9) {
      cleaned = '254' + cleaned;
    }
    return cleaned;
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    
    const formattedPhone = formatPhoneNumber(phoneNumber);

    if (formattedPhone.length !== 12 || !formattedPhone.startsWith('254')) {
      setErrorMsg('Invalid phone number format. Use 07... or 07...');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await apiRequest<{ checkoutRequestId: string }>('/shop/checkout', {
        method: 'POST',
        body: JSON.stringify({
          customerName,
          email,
          phoneNumber: formattedPhone,
          shippingAddress: address,
          city,
          amount: getTotalPrice(),
          items: items.map(i => ({ productId: i.productId, name: i.name, quantity: i.quantity, price: i.price }))
        })
      });

      if (res.success && res.data?.checkoutRequestId) {
        setCheckoutRequestId(res.data.checkoutRequestId);
        setStep(2);
      } else {
        setErrorMsg(res.error || 'Failed to initiate M-Pesa prompt.');
      }
    } catch (err) {
      setErrorMsg('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const downloadReceipt = async () => {
    try {
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;
      
      const element = document.getElementById('printable-receipt');
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
      pdf.save(`Jumuiya_Store_Receipt_${finalOrderDetails.receipt}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  if (!mounted || settingsLoading) return null;

  if (!settings.shop_enabled) {
    return (
      <div className="min-h-[60vh] bg-[#FAF7F2] flex flex-col items-center justify-center p-6 text-center space-y-6">
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm text-amber-900/30">
          <ShieldCheck className="w-10 h-10" />
        </div>
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#232320] mb-2">Store is currently closed</h2>
          <p className="font-sans text-sm text-[#232320]/60">We are not accepting orders at this time.</p>
        </div>
        <Link href="/" className="bg-[#232320] text-white px-6 py-3 rounded-lg font-bold text-sm hover:bg-[#6B4A34] transition-colors">
          Return to Home
        </Link>
      </div>
    );
  }

  if (items.length === 0 && step === 1) {
    return (
      <div className="min-h-[60vh] bg-[#FAF7F2] flex flex-col items-center justify-center p-6 text-center space-y-6">
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm text-[#6B4A34]/30">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#232320] mb-2">Your cart is empty</h2>
          <p className="font-sans text-sm text-[#232320]/60">Looks like you haven't added anything yet.</p>
        </div>
        <Link href="/store" className="bg-[#6B4A34] text-white px-6 py-3 rounded-lg font-bold text-sm hover:bg-[#2A170F] transition-colors">
          Browse Store
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="bg-[#FAF7F2] min-h-screen py-10 px-4 md:px-8 print:hidden">
      <div className="max-w-6xl mx-auto">
        <Link href="/store" className="inline-flex items-center text-xs font-bold text-[#6B4A34] uppercase tracking-widest hover:text-[#232320] mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Store
        </Link>

        {(step === 1 || step === 2) && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative">
            
            {/* Full Screen Loading Overlay */}
            {(loading || step === 2) && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
                <div className="bg-white rounded-3xl p-10 max-w-md w-full shadow-2xl text-center transform transition-all border border-[#6B4A34]/20 flex flex-col items-center">
                  <div className="relative w-24 h-24 mx-auto mb-6">
                    <div className="absolute inset-0 border-4 border-[#C8B195]/30 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-[#6B4A34] rounded-full border-t-transparent animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ShieldCheck className="w-8 h-8 text-[#6B4A34] opacity-80" />
                    </div>
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-[#232320] mb-3">
                    {step === 2 ? 'Processing Payment' : 'Secure Checkout'}
                  </h3>
                  <p className="font-sans text-[#232320]/70 text-sm leading-relaxed">
                    {step === 2 
                      ? `Please check your phone and enter your M-Pesa PIN to complete your order of KES ${getTotalPrice().toLocaleString()}.`
                      : 'Connecting to secure payment gateway...'}
                  </p>
                </div>
              </div>
            )}

            {/* Cart Items */}
            <div className="lg:col-span-7 space-y-6">
              <h1 className="font-serif text-3xl font-bold text-[#232320]">Order Summary</h1>
              <div className="bg-white rounded-2xl border border-[#6B4A34]/10 overflow-hidden shadow-sm">
                <ul className="divide-y divide-[#6B4A34]/10">
                  {items.map((item) => (
                    <li key={item.productId} className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="font-serif text-lg font-bold text-[#232320]">{item.name}</h3>
                        <p className="font-sans text-sm text-[#6B4A34] font-bold">KES {item.price.toLocaleString()}</p>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6">
                        <div className="flex items-center border border-[#6B4A34]/20 rounded-lg overflow-hidden bg-[#FAF7F2]">
                          <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="p-2 hover:bg-[#6B4A34]/10 text-[#232320] transition-colors">
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center font-sans text-xs font-bold">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="p-2 hover:bg-[#6B4A34]/10 text-[#232320] transition-colors">
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <button onClick={() => removeItem(item.productId)} className="text-red-900/40 hover:text-red-900 transition-colors p-2">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="bg-[#FAF7F2] p-6 border-t border-[#6B4A34]/10 flex justify-between items-center">
                  <span className="font-sans text-sm font-bold text-[#232320]/60 uppercase tracking-wider">Subtotal</span>
                  <span className="font-serif text-2xl font-bold text-[#232320]">KES {getTotalPrice().toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Checkout Form */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-2xl border border-[#6B4A34]/10 shadow-sm p-6 sm:p-8">
                <h2 className="font-serif text-2xl font-bold text-[#232320] mb-6">Shipping & Payment</h2>
                
                {errorMsg && (
                  <div className="mb-6 p-4 bg-red-900/10 border border-red-900/20 text-red-900 text-xs rounded-lg font-bold">
                    {errorMsg}
                  </div>
                )}

                <form onSubmit={handleCheckout} className="space-y-5">
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-bold text-[#6B4A34] uppercase tracking-wider border-b border-[#6B4A34]/10 pb-2">Contact Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-[#232320]/70 uppercase mb-1">Full Name *</label>
                        <input type="text" required value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full bg-[#FAF7F2] border border-[#6B4A34]/20 p-2.5 rounded-lg text-sm focus:outline-none focus:border-[#6B4A34]" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-[#232320]/70 uppercase mb-1">Email *</label>
                        <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-[#FAF7F2] border border-[#6B4A34]/20 p-2.5 rounded-lg text-sm focus:outline-none focus:border-[#6B4A34]" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-2">
                    <h3 className="text-[10px] font-bold text-[#6B4A34] uppercase tracking-wider border-b border-[#6B4A34]/10 pb-2">Delivery Address</h3>
                    <div>
                      <label className="block text-[10px] font-bold text-[#232320]/70 uppercase mb-1">Street Address / Building *</label>
                      <input type="text" required value={address} onChange={e => setAddress(e.target.value)} className="w-full bg-[#FAF7F2] border border-[#6B4A34]/20 p-2.5 rounded-lg text-sm focus:outline-none focus:border-[#6B4A34]" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#232320]/70 uppercase mb-1">City / Town *</label>
                      <input type="text" required value={city} onChange={e => setCity(e.target.value)} className="w-full bg-[#FAF7F2] border border-[#6B4A34]/20 p-2.5 rounded-lg text-sm focus:outline-none focus:border-[#6B4A34]" />
                    </div>
                  </div>

                  <div className="space-y-4 pt-2">
                    <h3 className="text-[10px] font-bold text-[#6B4A34] uppercase tracking-wider border-b border-[#6B4A34]/10 pb-2">M-Pesa Payment</h3>
                    <div>
                      <label className="block text-[10px] font-bold text-[#232320]/70 uppercase mb-1">Safaricom Number *</label>
                      <input type="tel" required value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} placeholder="07XXXXXXXX" className="w-full bg-[#FAF7F2] border border-[#6B4A34]/20 p-3 rounded-lg text-lg tracking-wide focus:outline-none focus:border-[#6B4A34]" />
                    </div>
                  </div>

                  <button type="submit" disabled={loading} className="w-full py-4 mt-4 bg-[#232320] text-white font-sans text-sm font-bold rounded-lg shadow-md hover:bg-[#6B4A34] transition-all flex items-center justify-center space-x-2 disabled:opacity-70">
                    <span>Pay KES {getTotalPrice().toLocaleString()}</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Polling State is now handled by the overlay above */}

        {/* Success State */}
        {step === 3 && (
          <div className="bg-white rounded-2xl border border-[#6B4A34]/10 shadow-sm p-12 text-center max-w-lg mx-auto mt-10">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldCheck className="w-10 h-10 text-emerald-600" />
            </div>
            <h3 className="font-serif text-3xl font-bold text-[#232320] mb-3">Order Confirmed!</h3>
            <p className="font-sans text-sm text-[#232320]/70 mb-8">
              Thank you for supporting Jumuiya Chess. Your order has been placed successfully. A receipt and shipping details have been sent to your email.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button onClick={downloadReceipt} className="w-full sm:w-auto py-3 px-6 bg-[#FAF7F2] text-[#232320] border border-[#6B4A34]/20 font-sans text-sm font-bold rounded-lg hover:bg-white transition-colors flex items-center justify-center space-x-2">
                <Download className="w-4 h-4" />
                <span>Download Receipt</span>
              </button>
              <Link href="/store" className="w-full sm:w-auto py-3 px-8 bg-[#232320] text-white font-sans text-sm font-bold rounded-lg hover:bg-[#6B4A34] transition-colors text-center">
                Continue Shopping
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
      
      {/* Printable Receipt (Rendered off-screen for PDF generation) */}
      {step === 3 && finalOrderDetails && (
        <div className="absolute top-[-9999px] left-[-9999px] w-[800px]">
          <div id="printable-receipt" className="p-10 bg-white text-black relative overflow-hidden">
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
                  <p className="text-sm font-sans text-gray-500 tracking-widest uppercase font-semibold">Official Store Receipt</p>
                </div>
              </div>
              <div className="text-right">
                <div className="bg-[#FAF7F2] p-4 rounded-lg border border-[#6B4A34]/20 inline-block">
                  <p className="font-sans text-[10px] uppercase tracking-widest text-gray-500 mb-1">Receipt Number</p>
                  <p className="font-mono text-xl font-bold text-[#6B4A34]">{finalOrderDetails.receipt}</p>
                </div>
                <p className="text-sm font-sans text-gray-600 mt-3 font-semibold">Date: {finalOrderDetails.date}</p>
              </div>
            </div>

            {/* Information Grid */}
            <div className="grid grid-cols-2 gap-12 mb-12">
              {/* Billed To */}
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                <h3 className="font-sans text-xs font-bold text-[#6B4A34] uppercase tracking-widest mb-4 border-b border-gray-200 pb-2">Billed To</h3>
                <p className="font-serif text-xl font-bold text-gray-900 mb-1">{finalOrderDetails.customerName}</p>
              </div>
              
              {/* Shipped To */}
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                <h3 className="font-sans text-xs font-bold text-[#6B4A34] uppercase tracking-widest mb-4 border-b border-gray-200 pb-2">Shipped To</h3>
                <p className="font-serif text-lg font-bold text-gray-900 mb-1">{finalOrderDetails.customerName}</p>
                <p className="font-sans text-sm text-gray-600">{finalOrderDetails.address}</p>
                <p className="font-sans text-sm text-gray-600">{finalOrderDetails.city}</p>
              </div>
            </div>

            {/* Itemized Table */}
            <div className="rounded-xl overflow-hidden border border-gray-200 mb-10">
              <table className="w-full text-left font-sans border-collapse">
                <thead>
                  <tr className="bg-[#232320] text-white">
                    <th className="py-4 px-6 text-xs font-bold uppercase tracking-widest">Item Description</th>
                    <th className="py-4 px-6 text-xs font-bold uppercase tracking-widest text-center">Qty</th>
                    <th className="py-4 px-6 text-xs font-bold uppercase tracking-widest text-right">Price</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {finalOrderDetails.items.map((item: any, idx: number) => (
                    <tr key={idx} className="border-b border-gray-100 last:border-b-0">
                      <td className="py-6 px-6">
                        <p className="font-bold text-gray-900 text-lg">{item.name}</p>
                      </td>
                      <td className="py-6 px-6 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 font-mono text-sm font-bold text-gray-800">
                          {item.quantity}
                        </span>
                      </td>
                      <td className="py-6 px-6 text-right">
                        <p className="font-mono text-lg font-semibold text-gray-900">KES {item.price.toLocaleString()}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total & Verification Section */}
            <div className="flex justify-between items-end mb-16">
              {/* Barcode Verification */}
              <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-sm">
                <p className="font-sans text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 text-center">Scan to Verify</p>
                <div className="scale-90 origin-top">
                  <Barcode value={finalOrderDetails.receipt} height={40} width={1.5} fontSize={14} background="#ffffff" lineColor="#232320" renderer="img" />
                </div>
              </div>

              {/* Total Box */}
              <div className="text-right bg-stone-50 p-8 rounded-2xl border-2 border-[#6B4A34] min-w-[300px]">
                <p className="font-sans text-xs text-gray-500 uppercase tracking-widest font-bold mb-2">Total Paid (M-Pesa)</p>
                <p className="font-serif text-4xl font-black text-[#232320]">KES {finalOrderDetails.amount.toLocaleString()}</p>
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
                <p>For questions about your order, please contact {settings.org_email}</p>
                <p>Thank you for shopping with us.</p>
              </div>
            </div>
          </div>
        </div>
        </div>
      )}
    </>
  );
}
