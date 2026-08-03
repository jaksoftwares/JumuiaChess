'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { apiRequest } from '@/lib/api';
import { Product } from '@/types';
import { Loader2, CreditCard, ChevronLeft, ChevronRight } from 'lucide-react';

const BROWN_SHADES = [
  'bg-[#2A170F]', // Espresso
  'bg-[#3E2317]', // Mahogany
  'bg-[#583520]', // Walnut
  'bg-[#794E31]'  // Chestnut/Caramel
];

const CHESS_PIECE_IMAGES = [
  '/images/king.png',
  '/images/queen.png',
  '/images/knight.png',
  '/images/pawn.png'
];

export default function Shop() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [scrollLeft, setScrollLeft] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await apiRequest<Product[]>('/shop/products');
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          setProducts(res.data.filter((p) => p.in_stock));
        } else {
          setProducts([]);
        }
      } catch (err) {
        console.error('[Shop Section] Error loading store products:', err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    setFormSubmitting(true);
    setStatusMessage(null);

    const body = {
      customerName,
      phoneNumber,
      items: [
        {
          productId: selectedProduct.id,
          name: selectedProduct.name,
          quantity: 1,
          price: selectedProduct.price,
        },
      ],
      amount: selectedProduct.price,
    };

    const res = await apiRequest('/shop/checkout', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    setFormSubmitting(false);

    if (res.success) {
      setStatusMessage({
        type: 'success',
        text: 'STK push triggered! Verify the amount on your phone and input your M-Pesa PIN to complete order checkout.',
      });
      setCustomerName('');
      setPhoneNumber('');
    } else {
      setStatusMessage({
        type: 'error',
        text: res.error || 'Failed to initialize payment checkout. Please check your phone status.',
      });
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const { scrollLeft } = scrollContainerRef.current;
      const cardWidth = 380;
      const step = direction === 'left' ? -cardWidth : cardWidth;
      scrollContainerRef.current.scrollTo({
        left: scrollLeft + step,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section id="shop" className="py-10 md:py-14 px-6 bg-gradient-to-b from-white via-[#FAF7F2] to-[#F6F4EF] relative overflow-hidden scroll-mt-24 lg:scroll-mt-28">
      {/* Top & Bottom Ambient Gradient Blends */}
      <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-white to-transparent pointer-events-none" />
      <div className="absolute top-1/2 left-[-100px] w-[450px] h-[450px] bg-[#C8B195]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-[-100px] w-[400px] h-[400px] bg-amber-900/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Section Header with Carousel Navigation */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <span className="font-sans text-xs font-semibold tracking-widest text-wood uppercase">
              Support Our Work
            </span>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-charcoal">
              The Charity Store
            </h2>
            <p className="font-sans text-xs md:text-sm text-charcoal/70 leading-relaxed">
              Purchase premium boards and apparel. 100% of store profits directly fund our local outreach and board logistics operations.
            </p>
          </div>

          {/* Navigation Arrows */}
          <div className="flex items-center space-x-3 self-start md:self-auto">
            <button
              onClick={() => scroll('left')}
              className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm border border-stone-200/80 flex items-center justify-center text-charcoal hover:bg-wood hover:text-white transition-colors duration-300 shadow-sm"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm border border-stone-200/80 flex items-center justify-center text-charcoal hover:bg-wood hover:text-white transition-colors duration-300 shadow-sm"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-wood" />
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-2xl border border-stone/20 bg-white/70 p-8 text-center text-sm text-charcoal/70">
            No charity store products are available yet. New products will appear here once they are added from the admin panel.
          </div>
        ) : (
          /* Horizontal Snap Carousel */
          <div
            ref={scrollContainerRef}
            onScroll={(e) => setScrollLeft(e.currentTarget.scrollLeft)}
            className="flex overflow-x-auto space-x-6 pb-6 pt-2 px-2 snap-x snap-mandatory no-scrollbar scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {products.map((p, index) => {
              const bgClass = BROWN_SHADES[index % BROWN_SHADES.length];
              const productImage = p.image_url || CHESS_PIECE_IMAGES[index % CHESS_PIECE_IMAGES.length];

              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedProduct(p)}
                  className={`relative min-w-[290px] sm:min-w-[330px] md:min-w-[360px] h-[340px] rounded-[32px] p-7 flex flex-col justify-between overflow-hidden group snap-start shadow-xl shadow-stone-900/10 cursor-pointer hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 ${bgClass}`}
                >
                  {/* Product Image — bottom right */}
                  <div
                    className="absolute right-0 bottom-0 z-10 pointer-events-none"
                    style={{ width: '55%', height: '70%' }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Image
                      src={productImage}
                      alt={p.name}
                      fill
                      unoptimized
                      sizes="240px"
                      className="object-contain group-hover:scale-105 transition-all duration-500 drop-shadow-[0_10px_20px_rgba(0,0,0,0.4)]"
                    />
                  </div>

                  {/* Gradient overlay so text stays readable over images */}
                  <div className="absolute inset-0 z-15 bg-gradient-to-r from-black/70 via-black/40 to-transparent pointer-events-none rounded-[32px]" />

                  {/* Top Metadata Section — always on top */}
                  <div className="relative z-20 space-y-4">
                    <div>
                      <span className="text-[10px] font-bold tracking-[0.2em] text-[#C8B195] uppercase">
                        Store Item
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-serif text-2xl md:text-3xl font-bold text-white leading-tight max-w-[200px] tracking-tight drop-shadow-md">
                        {p.name}
                      </h3>
                      <span className="font-sans text-lg font-bold text-white/90 block drop-shadow-sm">
                        KES {p.price.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center relative z-20">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedProduct(p);
                      }}
                      className="px-8 py-3 bg-white text-charcoal hover:bg-white/20 hover:text-white hover:border-white/20 font-sans text-xs md:text-sm font-bold rounded-full border border-transparent transition-all duration-300 shadow-sm"
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Purchase Checkout Modal */}
        {selectedProduct && (
          <div className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-stone/20 shadow-2xl max-w-md w-full p-8 relative animate-scale-in">
              <button
                onClick={() => {
                  setSelectedProduct(null);
                  setStatusMessage(null);
                }}
                className="absolute top-4 right-4 text-charcoal/60 hover:text-charcoal font-bold text-xl"
              >
                ✕
              </button>

              <div className="space-y-2 mb-6">
                <span className="font-sans text-xs font-semibold text-wood uppercase">Checkout</span>
                <h3 className="font-serif text-2xl font-bold text-charcoal leading-tight">
                  {selectedProduct.name}
                </h3>
                <p className="font-sans text-xs text-charcoal/50">
                  Total Cost: <strong className="text-[#C8B195]">KES {selectedProduct.price}</strong>
                </p>
              </div>

              {statusMessage ? (
                <div className={`p-6 rounded-md mb-6 ${
                  statusMessage.type === 'success' ? 'bg-[#C8B195]/10 border border-[#C8B195]/30 text-charcoal' : 'bg-red-50 border border-red-200 text-red-700'
                }`}>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="font-serif font-bold text-sm">
                      {statusMessage.type === 'success' ? 'Prompt Sent' : 'Checkout Failed'}
                    </span>
                  </div>
                  <p className="font-sans text-xs leading-relaxed">{statusMessage.text}</p>
                  
                  {statusMessage.type === 'success' && (
                    <button
                      onClick={() => setSelectedProduct(null)}
                      className="mt-6 w-full py-2 bg-wood text-white font-sans text-xs font-medium rounded-lg"
                    >
                      Close Window
                    </button>
                  )}
                </div>
              ) : (
                <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                  <div>
                    <label className="block font-sans text-xs font-semibold text-charcoal/70 mb-1">Your Full Name</label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full bg-white border border-stone/20 p-2.5 rounded-lg text-sm text-charcoal focus:outline-none focus:border-wood"
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
                      className="w-full bg-white border border-stone/20 p-2.5 rounded-lg text-sm text-charcoal focus:outline-none focus:border-wood"
                    />
                    <span className="font-sans text-[10px] text-charcoal/50">Enter the number that will receive the M-Pesa STK payment prompt.</span>
                  </div>

                  <button
                    type="submit"
                    disabled={formSubmitting}
                    className="w-full mt-6 py-3.5 bg-[#C8B195] text-charcoal font-sans text-sm font-semibold rounded-lg shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:scale-[1.02] active:translate-y-0 active:scale-[0.98] hover:bg-[#B89E82] transition-all duration-300 flex items-center justify-center space-x-2"
                  >
                    {formSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Sending payment request...</span>
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4" />
                        <span>Initiate STK Checkout</span>
                      </>
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
