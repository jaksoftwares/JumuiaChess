'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { apiRequest } from '@/lib/api';
import { GalleryImage } from '@/types';
import { Loader2, ChevronLeft, ChevronRight, X, Tag } from 'lucide-react';

export default function Gallery() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadGallery() {
      try {
        const res = await apiRequest<GalleryImage[]>('/gallery');
        if (res.success && Array.isArray(res.data)) {
          setImages(res.data);
        } else {
          setImages([]);
        }
      } catch (err) {
        console.error('[Gallery Section] Error fetching gallery images:', err);
        setImages([]);
      } finally {
        setLoading(false);
      }
    }

    loadGallery();
  }, []);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeImageIndex === null) return;
    setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : (prev as number) - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeImageIndex === null) return;
    setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : (prev as number) + 1));
  };

  const scrollContainer = (direction: 'up' | 'down') => {
    if (scrollRef.current) {
      const { scrollTop } = scrollRef.current;
      const step = direction === 'up' ? -260 : 260;
      scrollRef.current.scrollTo({
        top: scrollTop + step,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section id="gallery" className="py-24 md:py-32 px-6 bg-[#141518] text-white relative overflow-hidden scroll-mt-24 lg:scroll-mt-28 border-t border-white/5">
      {/* Background Radial Glow */}
      <div className="absolute top-1/3 right-[-100px] w-[400px] h-[400px] bg-[#C8B195]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-[-100px] w-[350px] h-[350px] bg-amber-900/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto space-y-10">
        {/* Top Header Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 text-[#C8B195] text-xs font-bold font-mono uppercase tracking-wider">
              <span>PHOTO GALLERY</span>
            </div>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-white leading-tight">
              Capturing Every Moment of Growth & Strategy.
            </h2>
            <p className="font-sans text-stone-300 text-xs md:text-sm leading-relaxed max-w-xl">
              Explore moments from our training workshops, distribution drives, and community competitions across Kenya.
            </p>
          </div>

          {/* Container Scroll Controls */}
          {images.length > 8 && (
            <div className="lg:col-span-4 flex justify-start lg:justify-end gap-2 pt-1">
              <button
                onClick={() => scrollContainer('up')}
                className="p-2.5 px-4 rounded-xl bg-white/5 border border-white/10 text-stone-300 hover:text-[#C8B195] hover:border-[#C8B195]/50 transition-colors text-xs font-bold flex items-center gap-1.5"
                title="Scroll Up"
              >
                <ChevronLeft className="w-4 h-4 rotate-90" />
                <span>Prev Rows</span>
              </button>
              <button
                onClick={() => scrollContainer('down')}
                className="p-2.5 px-4 rounded-xl bg-white/5 border border-white/10 text-stone-300 hover:text-[#C8B195] hover:border-[#C8B195]/50 transition-colors text-xs font-bold flex items-center gap-1.5"
                title="Scroll Down"
              >
                <ChevronRight className="w-4 h-4 rotate-90" />
                <span>Next Rows</span>
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-[#C8B195]" />
          </div>
        ) : images.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-[#1C1D21] p-12 text-center text-sm text-stone-300">
            No gallery images published yet. Upload photos from the admin dashboard to showcase them here.
          </div>
        ) : (
          /* TIGHT BORDERLESS PHOTO GRID DIRECTLY ON SECTION CANVAS */
          <div
            ref={scrollRef}
            className="max-h-[520px] sm:max-h-[560px] md:max-h-[600px] overflow-y-auto pr-1 sm:pr-2 scroll-smooth"
            style={{ scrollbarWidth: 'thin', scrollbarColor: '#C8B195 #141518' }}
          >
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5 md:gap-3">
              {images.map((img, index) => (
                <div
                  key={img.id || index}
                  onClick={() => setActiveImageIndex(index)}
                  className="group relative h-52 sm:h-60 md:h-64 rounded-xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all duration-300 bg-stone-900"
                >
                  {/* Photo Image */}
                  <Image
                    src={img.image_url}
                    alt={img.caption || 'Gallery image'}
                    fill
                    loading={index < 8 ? 'eager' : 'lazy'}
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300 will-change-transform"
                  />

                  {/* Glossy Shimmer Wave Effect on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none z-20" />

                  {/* Dark Vignette Overlay & Caption on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3.5 text-white z-10">

                    <h4 className="font-serif text-xs md:text-sm font-bold leading-tight mt-1 line-clamp-2 text-white">
                      {img.caption}
                    </h4>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox Preview Modal */}
      {activeImageIndex !== null && images[activeImageIndex] && (
        <div
          onClick={() => setActiveImageIndex(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 md:p-8 animate-fade-in"
        >
          {/* Close Button */}
          <button
            onClick={() => setActiveImageIndex(null)}
            className="absolute top-6 right-6 text-white/80 hover:text-white p-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-50"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Previous Arrow */}
          <button
            onClick={handlePrev}
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-50"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
          </button>

          {/* Next Arrow */}
          <button
            onClick={handleNext}
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-50"
            aria-label="Next image"
          >
            <ChevronRight className="w-6 h-6 md:w-8 md:h-8" />
          </button>

          {/* Main Modal Image & Caption Content */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-4xl w-full bg-[#1C1D21] border border-white/15 rounded-3xl overflow-hidden shadow-2xl space-y-0 relative z-40"
          >
            <div className="relative w-full h-[60vh] sm:h-[70vh] bg-black">
              <Image
                src={images[activeImageIndex].image_url}
                alt={images[activeImageIndex].caption || 'Gallery image'}
                fill
                sizes="(max-width: 1280px) 100vw, 1200px"
                className="object-contain"
              />
            </div>

            <div className="p-6 md:p-8 bg-[#141518] text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-t border-white/10">
              <div className="space-y-1">

                <h3 className="font-serif text-xl md:text-2xl font-bold text-white">
                  {images[activeImageIndex].caption}
                </h3>
              </div>

              <span className="text-xs font-mono text-stone-400 shrink-0">
                Photo {activeImageIndex + 1} of {images.length}
              </span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}