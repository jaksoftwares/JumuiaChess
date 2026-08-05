'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiRequest } from '@/lib/api';
import { Product } from '@/types';
import { Loader2, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { useCartStore } from '@/store/cart';

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
  const [scrollLeft, setScrollLeft] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const { addItem } = useCartStore();
  const [addedItem, setAddedItem] = useState<string | null>(null);
  const router = useRouter();

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

  const handleBuyNow = (e: React.MouseEvent, p: Product) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Only add if not already in cart to prevent double-adding on quick clicks
    const existing = useCartStore.getState().items.find(i => i.productId === p.id);
    if (!existing) {
      addItem({ productId: p.id, name: p.name, price: p.price, quantity: 1, imageUrl: p.image_url });
    }
    
    router.push('/store/checkout');
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
        {/* Section Header with CTA */}
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

          <div className="flex flex-col sm:flex-row items-center gap-4 self-start md:self-auto">
            {/* CTA Button */}
            <Link 
              href="/store"
              className="group inline-flex items-center px-6 py-3 bg-[#6B4A34] text-white font-sans text-sm font-bold rounded-full hover:bg-[#2A170F] transition-all duration-300 shadow-md hover:shadow-lg whitespace-nowrap"
            >
              Shop Full Collection
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>

            {/* Navigation Arrows */}
            <div className="flex items-center space-x-3 hidden sm:flex">
              <button
                onClick={() => scroll('left')}
                className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm border border-stone-200/80 flex items-center justify-center text-charcoal hover:bg-[#6B4A34] hover:text-white transition-colors duration-300 shadow-sm"
                aria-label="Scroll left"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => scroll('right')}
                className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm border border-stone-200/80 flex items-center justify-center text-charcoal hover:bg-[#6B4A34] hover:text-white transition-colors duration-300 shadow-sm"
                aria-label="Scroll right"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-[#6B4A34]" />
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-2xl border border-[#6B4A34]/10 bg-white/70 p-8 text-center text-sm text-charcoal/70">
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
              const isAdded = addedItem === p.id;

              return (
                <div
                  onClick={() => router.push(`/store/${p.id}`)}
                  key={p.id}
                  className="relative min-w-[220px] sm:min-w-[300px] bg-white rounded-[24px] sm:rounded-[32px] border border-[#6B4A34]/10 flex flex-col overflow-hidden group snap-start shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                >
                  {/* Product Image — Top */}
                  <div className="relative aspect-[4/3] bg-[#FAF7F2] overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent pointer-events-none z-10" />
                    <Image
                      src={productImage}
                      alt={p.name}
                      fill
                      unoptimized
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  {/* Content — Bottom */}
                  <div className="p-4 sm:p-6 md:p-8 flex-grow flex flex-col justify-between bg-white z-20">
                    <div className="space-y-1 sm:space-y-2 mb-4 sm:mb-6">
                      <h3 className="font-serif text-base sm:text-xl md:text-2xl font-bold text-[#232320] leading-tight group-hover:text-[#6B4A34] transition-colors line-clamp-1">
                        {p.name}
                      </h3>
                      <p className="font-sans text-[10px] sm:text-xs text-[#232320]/60 line-clamp-2 leading-relaxed">
                        {p.description || "Premium Jumuia Chess product. Supports our outreach programs."}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-[#6B4A34]/10">
                      <span className="font-sans text-lg font-bold text-[#6B4A34]">
                        KES {p.price.toLocaleString()}
                      </span>
                      <button
                        onClick={(e) => handleBuyNow(e, p)}
                        className="px-6 py-2.5 bg-[#FAF7F2] text-[#6B4A34] hover:bg-[#6B4A34] hover:text-white font-sans text-xs font-bold rounded-full transition-all duration-300 shadow-sm"
                      >
                        Buy Now
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
