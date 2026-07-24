'use client';

import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/api';
import { GalleryImage } from '@/types';
import { Loader2, Upload, Trash2, Tag, Image as ImageIcon, Sparkles } from 'lucide-react';
import { ImageUploadInput } from '@/components/admin/ImageUploadInput';

const CATEGORIES = [
  'Public Schools',
  'Informal Settlements',
  'Juvenile Rehabilitation',
  'Refugees (Kakuma)',
  'Autism Programs',
  'Children\'s Homes',
];

export default function AdminGallery() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [caption, setCaption] = useState('');
  const [category, setCategory] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadImages = async () => {
    setLoading(true);
    const res = await apiRequest<GalleryImage[]>('/gallery');
    if (res.success && res.data) {
      setImages(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadImages();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category) {
      setMessage({ type: 'error', text: 'Please select a category tag.' });
      return;
    }

    if (!imageUrl) {
      setMessage({ type: 'error', text: 'Please select or upload an image.' });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    const res = await apiRequest('/gallery', {
      method: 'POST',
      body: JSON.stringify({
        image_url: imageUrl,
        caption,
        category,
      }),
    });

    setIsSubmitting(false);

    if (res.success) {
      setMessage({ type: 'success', text: 'Image added to gallery!' });
      setCaption('');
      setCategory('');
      setImageUrl('');
      loadImages();
    } else {
      setMessage({ type: 'error', text: res.error || 'Failed to upload gallery image.' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this gallery image?')) return;

    const res = await apiRequest(`/gallery/${id}`, {
      method: 'DELETE',
    });

    if (res.success) {
      loadImages();
    } else {
      alert(res.error || 'Failed to delete gallery image');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Brown Banner Card */}
      <div className="bg-[#6B4A34] text-white p-6 md:p-8 rounded-2xl shadow-md border border-[#573b29] relative overflow-hidden space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-[#FAF7F2] text-[11px] font-mono font-bold tracking-wide backdrop-blur-sm">
          <ImageIcon className="w-3.5 h-3.5 text-[#C8B195]" />
          <span>Media Gallery Studio</span>
        </div>
        <h1 className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-white">
          Media Gallery
        </h1>
        <p className="text-xs md:text-sm text-[#FAF7F2]/90 leading-relaxed font-sans max-w-3xl">
          Upload images directly from your device and organize community photos by program category.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Form */}
        <div className="bg-white border border-stone-200 p-6 rounded-2xl shadow-sm space-y-4 h-fit">
          <h2 className="font-serif text-base font-bold text-[#6B4A34] flex items-center space-x-2 border-b border-stone-100 pb-3">
            <Upload className="h-4 w-4" />
            <span>Upload New Photo</span>
          </h2>

          {message && (
            <div className={`p-3.5 rounded-xl text-xs ${
              message.type === 'success' 
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <ImageUploadInput
              label="Gallery Image (Upload from Device)"
              value={imageUrl}
              onChange={(url) => setImageUrl(url)}
            />

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Category Tag *</label>
              <select
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-white border border-stone-300 p-2.5 rounded-xl text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-[#6B4A34]"
              >
                <option value="">Select Category Tag</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Caption *</label>
              <textarea
                required
                rows={3}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Short caption describing the photo..."
                className="w-full bg-white border border-stone-300 p-2.5 rounded-xl text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-[#6B4A34] resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-4 py-3 bg-[#6B4A34] hover:bg-[#573b29] text-white font-bold text-xs rounded-xl transition-colors shadow-sm flex items-center justify-center space-x-2"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <span>Publish Image</span>}
            </button>
          </form>
        </div>

        {/* Gallery Image Grid */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="font-serif text-base font-bold text-charcoal flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#6B4A34]" /> Uploaded Gallery Photos ({images.length})
            </h2>
            <span className="text-[11px] font-mono text-stone-400">Synced to Database</span>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-[#6B4A34]" />
            </div>
          ) : images.length === 0 ? (
            <div className="text-center py-16 text-stone-400 text-xs font-sans bg-white border border-stone-200 rounded-2xl">
              No gallery images found. Upload a photo using the left panel.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {images.map((img) => (
                <div
                  key={img.id}
                  className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div className="relative h-48 bg-stone-100 overflow-hidden">
                    <img
                      src={img.image_url}
                      alt={img.caption}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-2.5 left-2.5 font-sans text-[10px] font-semibold text-white bg-charcoal/80 px-2.5 py-0.5 rounded-full flex items-center backdrop-blur-sm">
                      <Tag className="h-3 w-3 mr-1 text-[#C8B195]" />
                      {img.category}
                    </span>
                  </div>

                  <div className="p-4 flex items-center justify-between border-t border-stone-100">
                    <p className="font-sans text-xs text-stone-700 truncate max-w-[80%]">{img.caption}</p>
                    <button
                      onClick={() => handleDelete(img.id)}
                      className="text-stone-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                      title="Delete Image"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
