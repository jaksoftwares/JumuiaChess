'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { apiRequest } from '@/lib/api';
import { Product } from '@/types';
import { Loader2, ArrowLeft, ShoppingBag, Plus, Minus } from 'lucide-react';
import { useCartStore } from '@/store/cart';

export default function ProductDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { items, addItem, getTotalItems } = useCartStore();
  const [addedItem, setAddedItem] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeImage, setActiveImage] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    async function loadProduct() {
      try {
        const [res, allRes] = await Promise.all([
          apiRequest<Product>(`/shop/products/${id}`),
          apiRequest<Product[]>('/shop/products')
        ]);
        
        if (res.success && res.data) {
          setProduct(res.data);
          setActiveImage(res.data.image_url);
          if (allRes.success && Array.isArray(allRes.data)) {
            setRelatedProducts(allRes.data.filter(p => p.id !== id && p.in_stock).slice(0, 4));
          }
        } else {
          router.push('/store');
        }
      } catch (err) {
        console.error(err);
        router.push('/store');
      } finally {
        setLoading(false);
      }
    }
    if (id) loadProduct();
  }, [id, router]);

  const handleAddToCart = () => {
    if (!product) return;
    
    addItem({ productId: product.id, name: product.name, price: product.price, imageUrl: product.image_url, quantity: quantity });
    
    setAddedItem(true);
    setTimeout(() => setAddedItem(false), 2000);
  };

  const handleBuyNow = () => {
    if (!product) return;
    
    const existing = items.find(i => i.productId === product.id);
    if (!existing) {
      addItem({ productId: product.id, name: product.name, price: product.price, imageUrl: product.image_url, quantity: quantity });
    }
    router.push('/store/checkout');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-[#6B4A34]" />
        <p className="font-sans text-sm font-bold text-[#6B4A34]/60">Loading product...</p>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="bg-[#FAF7F2] min-h-screen pb-32">
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

      <div className="max-w-7xl mx-auto px-6 py-8">
        <Link href="/store" className="inline-flex items-center space-x-2 text-[#6B4A34] hover:text-[#2A170F] transition-colors font-sans text-sm font-bold mb-8">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Store</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Left: Product Image */}
          <div className="space-y-4">
            <div className="relative aspect-square bg-white rounded-[32px] overflow-hidden border border-[#6B4A34]/10 shadow-sm">
              <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent pointer-events-none z-10" />
              {activeImage ? (
                  <Image
                    src={activeImage}
                    alt={product.name}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                  />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#232320]/20">
                  <ShoppingBag className="w-20 h-20" />
                </div>
              )}
            </div>

            {/* Thumbnails Gallery */}
            {product.images && product.images.length > 0 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
                <button 
                  onClick={() => setActiveImage(product.image_url)}
                  className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${activeImage === product.image_url ? 'border-[#6B4A34] shadow-md' : 'border-transparent opacity-70 hover:opacity-100 hover:border-[#6B4A34]/30'}`}
                >
                  <Image src={product.image_url} alt="Primary Thumbnail" fill sizes="80px" className="object-cover" />
                </button>
                {product.images.map((img, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${activeImage === img ? 'border-[#6B4A34] shadow-md' : 'border-transparent opacity-70 hover:opacity-100 hover:border-[#6B4A34]/30'}`}
                  >
                    <Image src={img} alt={`Thumbnail ${idx + 1}`} fill sizes="80px" className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Details */}
          <div className="flex flex-col py-4 lg:sticky lg:top-32 lg:self-start">
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-[#232320] leading-tight mb-4">
              {product.name}
            </h1>
            
            <p className="font-sans text-2xl font-bold text-[#6B4A34] mb-8">
              KES {product.price.toLocaleString()}
            </p>

            <div className="prose prose-stone prose-sm max-w-none text-[#232320]/70 leading-relaxed mb-12">
              <p>{product.description}</p>
            </div>

            <div className="space-y-6 mt-auto">
              {/* Quantity Selector */}
              <div className="flex items-center space-x-4">
                <span className="font-sans text-sm font-bold text-[#232320]/70 uppercase tracking-widest">Quantity</span>
                <div className="flex items-center border border-[#6B4A34]/20 rounded-full bg-white">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 text-[#232320]/60 hover:text-[#6B4A34] transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-sans font-bold w-8 text-center text-[#232320]">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-3 text-[#232320]/60 hover:text-[#6B4A34] transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={handleAddToCart}
                  className={`w-full py-4 rounded-full font-sans text-sm font-bold transition-all duration-300 shadow-sm border ${
                    addedItem 
                      ? 'bg-emerald-500 text-white border-emerald-500'
                      : 'bg-white text-[#6B4A34] border-[#6B4A34]/20 hover:border-[#6B4A34] hover:bg-[#FAF7F2]'
                  }`}
                >
                  {addedItem ? 'Added to Cart ✓' : 'Add to Cart'}
                </button>
                
                <button
                  onClick={handleBuyNow}
                  className="w-full py-4 bg-[#6B4A34] text-white hover:bg-[#2A170F] rounded-full font-sans text-sm font-bold transition-all duration-300 shadow-xl shadow-[#6B4A34]/20"
                >
                  Buy Now
                </button>
              </div>
              
              {!product.in_stock && (
                <p className="text-red-500 font-sans text-sm font-bold text-center pt-2">Currently Out of Stock</p>
              )}
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-32 pt-16 border-t border-[#6B4A34]/10">
            <h2 className="font-serif text-3xl font-bold text-[#232320] mb-10 text-center">You May Also Like</h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              {relatedProducts.map((p) => (
                <Link href={`/store/${p.id}`} key={p.id} className="group bg-white rounded-[16px] sm:rounded-[20px] border border-[#6B4A34]/10 overflow-hidden hover:border-[#6B4A34]/30 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col cursor-pointer">
                  <div className="relative aspect-square bg-[#FAF7F2] overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none z-10" />
                    {p.image_url ? (
                      <Image
                        src={p.image_url}
                        alt={p.name}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#232320]/20">
                        <ShoppingBag className="w-12 h-12" />
                      </div>
                    )}
                  </div>
                  <div className="p-3 sm:p-5 flex-grow flex flex-col justify-between bg-white z-20">
                    <div className="mb-4">
                      <h3 className="font-serif text-sm sm:text-lg font-bold text-[#232320] mb-1 group-hover:text-[#6B4A34] transition-colors leading-tight line-clamp-1 sm:line-clamp-none">{p.name}</h3>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-3 sm:pt-4 border-t border-[#6B4A34]/10 gap-1 sm:gap-0">
                      <span className="font-bold text-[#6B4A34] font-sans text-[10px] sm:text-sm">KES {p.price.toLocaleString()}</span>
                      <span className="text-[#232320]/50 font-sans text-[8px] sm:text-[10px] uppercase tracking-wider font-bold group-hover:text-[#6B4A34] transition-colors">View</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
