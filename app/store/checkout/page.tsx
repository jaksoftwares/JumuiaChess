'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cart';
import { apiRequest } from '@/lib/api';
import { Minus, Plus, Trash2, ArrowLeft, Loader2, ShieldCheck, ShoppingBag, Download } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutPage() {
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

  const downloadReceipt = () => {
    import('jspdf').then((jsPDF) => {
      const doc = new jsPDF.default();
      doc.setFontSize(22);
      doc.setTextColor('#6B4A34');
      doc.text('Jumuiya Chess Store', 20, 20);
      
      doc.setFontSize(14);
      doc.setTextColor('#232320');
      doc.text('Official Order Receipt', 20, 30);
      
      doc.setFontSize(12);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 45);
      doc.text(`Customer Name: ${customerName}`, 20, 55);
      doc.text(`Amount: KES ${getTotalPrice().toLocaleString()}`, 20, 65);
      doc.text(`Order Ref: ${checkoutRequestId}`, 20, 75);
      
      doc.setFontSize(14);
      doc.setTextColor('#6B4A34');
      doc.text('Thank you for supporting Jumuiya Chess!', 20, 100);
      
      doc.save(`Jumuiya_Order_Receipt_${checkoutRequestId}.pdf`);
    });
  };

  if (!mounted) return null;

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
    <div className="bg-[#FAF7F2] min-h-screen py-10 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <Link href="/store" className="inline-flex items-center text-xs font-bold text-[#6B4A34] uppercase tracking-widest hover:text-[#232320] mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Store
        </Link>

        {step === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
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
                    {loading ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /><span>Processing...</span></>
                    ) : (
                      <span>Pay KES {getTotalPrice().toLocaleString()}</span>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Polling State (GREEN LOADER) */}
        {step === 2 && (
          <div className="bg-white rounded-2xl border border-[#6B4A34]/10 shadow-sm p-12 text-center max-w-lg mx-auto mt-10">
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 border-4 border-emerald-100 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-emerald-500 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <h3 className="font-serif text-2xl font-bold text-[#232320] mb-2">Processing Payment</h3>
            <p className="font-sans text-sm text-[#232320]/70">
              Please check your phone and enter your M-Pesa PIN to complete your order of KES {getTotalPrice().toLocaleString()}.
            </p>
          </div>
        )}

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
  );
}
