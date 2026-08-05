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
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#6B4A34]/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-[-100px] w-[300px] h-[300px] bg-[#C8B195]/10 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative text-center space-y-6">
         
          <h1 className="font-serif text-4xl md:text-6xl font-bold tracking-tight">
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
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
            {products.map((product) => {
              const inCart = items.find(i => i.productId === product.id);
              return (
                <Link href={`/store/${product.id}`} key={product.id} className="group bg-white rounded-[16px] sm:rounded-[20px] border border-[#6B4A34]/10 overflow-hidden hover:border-[#6B4A34]/30 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col cursor-pointer">
                  {/* Edge-to-Edge Image Container */}
                  <div className="relative aspect-[4/5] sm:aspect-[4/3] bg-[#FAF7F2] overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none z-10" />
                    {product.image_url ? (
                      <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#232320]/20">
                        <ShoppingBag className="w-12 h-12" />
                      </div>
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="p-3 sm:p-5 flex-grow flex flex-col justify-between bg-white z-20">
                    <div className="mb-4 sm:mb-6">
                      <h3 className="font-serif text-sm sm:text-xl font-bold text-[#232320] mb-1 sm:mb-2 group-hover:text-[#6B4A34] transition-colors leading-tight line-clamp-1 sm:line-clamp-none">{product.name}</h3>
                      <p className="font-sans text-[10px] sm:text-xs text-[#232320]/50 line-clamp-2 leading-relaxed hidden sm:block">
                        {product.description}
                      </p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-3 sm:pt-4 border-t border-[#6B4A34]/10 gap-2 sm:gap-0">
                      <span className="font-bold text-[#6B4A34] font-sans text-xs sm:text-base">KES {product.price.toLocaleString()}</span>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          addItem({ productId: product.id, name: product.name, price: product.price, imageUrl: product.image_url, quantity: 1 });
                          setAddedItem(product.id);
                          setTimeout(() => setAddedItem(null), 2000);
                        }}
                        className={`w-full sm:w-auto px-2 py-2 sm:px-6 sm:py-2.5 font-sans text-[10px] sm:text-xs font-bold rounded-full transition-all duration-300 shadow-sm text-center ${
                          addedItem === product.id 
                            ? 'bg-emerald-500 text-white'
                            : 'bg-[#FAF7F2] text-[#6B4A34] hover:bg-[#6B4A34] hover:text-white'
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
