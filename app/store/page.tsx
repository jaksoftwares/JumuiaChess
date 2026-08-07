'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { apiRequest } from '@/lib/api';
import { Product } from '@/types';
import { Loader2, ShoppingBag, Plus, Sparkles, Heart } from 'lucide-react';
import { useCartStore } from '@/store/cart';

export default function StorePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { items, addItem, getTotalItems } = useCartStore();
  const [addedItem, setAddedItem] = useState<string | null>(null);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    async function loadProducts() {
      try {
        const res = await apiRequest<Product[]>('/shop/products');
        if (res.success && Array.isArray(res.data)) {
          setProducts(res.data.filter((p) => p.in_stock));
        } else {
          setProducts([]);
        }
      } catch (err) {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  return (
    <div className="bg-[#FAF7F2] min-h-screen relative pb-32">
      {/* Floating Cart Indicator */}
      {mounted && getTotalItems() > 0 && (
        <Link href="/store/checkout" className="fixed bottom-8 right-8 z-50 bg-[#6B4A34] text-white px-6 py-4 rounded-full shadow-xl flex items-center space-x-3 hover:bg-[#2A170F] transition-all hover:scale-105 group">
          <div className="relative">
            <ShoppingBag className="w-5 h-5" />
            <span className="absolute -top-2 -right-2 bg-white text-[#6B4A34] text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
              {getTotalItems()}
            </span>
          </div>
          <span className="font-sans text-sm font-bold">Checkout</span>
        </Link>
      )}

      {/* Premium Hero Header */}
      <div className="bg-[#16171A] text-white py-24 px-6 relative overflow-hidden">
        {/* Background Image Banner */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/pieces.jpg"
            alt="Chess Pieces Banner"
            fill
            priority
            unoptimized
            className="object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#16171A] via-[#16171A]/70 to-transparent" />
        </div>

        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#6B4A34]/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-[-100px] w-[300px] h-[300px] bg-[#C8B195]/10 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative z-10 text-center space-y-6">
          <h1 className="font-serif text-4xl md:text-6xl font-bold tracking-tight text-[#C8B195] drop-shadow-md">
            The Charity Store
          </h1>
          <p className="font-sans text-base md:text-lg text-white/70 max-w-2xl mx-auto leading-relaxed font-light">
            Premium boards. Direct impact. Every purchase funds our outreach across Kenya.
          </p>
        </div>
      </div>

      {/* Product Grid */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4 text-[#6B4A34]/60">
            <Loader2 className="w-8 h-8 animate-spin text-[#6B4A34]" />
            <p className="font-sans text-sm font-bold">Loading collection...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[#232320]/60 font-sans text-sm">No products available at the moment. Please check back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => {
              const inCart = items.find(i => i.productId === product.id);
              return (
                <Link
                  href={`/store/${product.id}`}
                  key={product.id}
                  className="relative overflow-hidden h-[420px] rounded-[24px] border border-stone-200/20 shadow-lg group hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 cursor-pointer flex flex-col justify-end"
                >
                  {/* Full-Bleed Background Image */}
                  <div className="absolute inset-0 z-0 overflow-hidden bg-stone-900">
                    {product.image_url ? (
                      <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        unoptimized
                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover group-hover:scale-105 transition-all duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/20">
                        <ShoppingBag className="w-16 h-16" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
                  </div>

                  {/* Glossy Shimmer Wave Effect on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none z-20" />

                  {/* Glassmorphism Bottom Panel */}
                  <div className="relative z-10 bg-charcoal/60 backdrop-blur-md border-t border-white/10 p-6 flex flex-col space-y-3 text-white">
                    <div>
                      <h3 className="font-serif text-lg font-bold text-white leading-tight group-hover:text-[#C8B195] transition-colors line-clamp-1">
                        {product.name}
                      </h3>
                      <p className="font-sans text-xs text-white/80 line-clamp-2 mt-1 leading-relaxed">
                        {product.description || "Premium Jumuia Chess product. Supports our outreach programs."}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-white/10">
                      <div>
                        <span className="text-[10px] text-white/60 uppercase tracking-wider block font-sans">Price</span>
                        <span className="font-serif text-base font-bold text-[#C8B195]">
                          KES {product.price.toLocaleString()}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          addItem({ productId: product.id, name: product.name, price: product.price, imageUrl: product.image_url, quantity: 1 });
                          setAddedItem(product.id);
                          setTimeout(() => setAddedItem(null), 2000);
                        }}
                        className={`px-4 py-2 font-sans text-xs font-bold rounded-xl transition-all duration-300 shadow-md ${
                          addedItem === product.id 
                            ? 'bg-emerald-600 text-white'
                            : 'bg-[#6B4A34] text-white hover:bg-[#523826]'
                        }`}
                      >
                        {addedItem === product.id ? 'Added ✓' : 'Add to Cart'}
                      </button>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
