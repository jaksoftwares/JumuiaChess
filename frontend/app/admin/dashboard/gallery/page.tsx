'use client';

import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/api';
import { GalleryImage } from '@/types';
import { Loader2, Upload, Trash, Tag } from 'lucide-react';

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

    setIsSubmitting(true);
    setMessage(null);

    // Fallback default image if none provided
    const url = imageUrl || 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?auto=format&fit=crop&q=80&w=600';

    const res = await apiRequest('/gallery', {
      method: 'POST',
      body: JSON.stringify({
        image_url: url,
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
    <div className="space-y-10">
      {/* Title */}
      <div>
        <h1 className="font-serif text-3xl font-bold text-charcoal">Media Gallery</h1>
        <p className="font-sans text-xs text-charcoal/50">
          Upload and tag images showing our global impact.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Drag Drop & Upload Form */}
        <div className="bg-offwhite border border-stone/30 p-6 rounded-lg shadow-sm space-y-6 h-fit">
          <h2 className="font-serif text-lg font-bold text-wood flex items-center space-x-2">
            <Upload className="h-5 w-5" />
            <span>Upload Image</span>
          </h2>

          {message && (
            <div className={`p-3 rounded text-xs ${
              message.type === 'success' ? 'bg-sage/10 text-charcoal border border-sage/30' : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Drag & Drop Area (Visual / Interactive Mock) */}
            <div
              className="border-2 border-dashed border-stone/40 hover:border-wood/50 rounded-lg p-8 text-center bg-stone/5 cursor-pointer transition-colors"
              onClick={() => setImageUrl('https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&q=80&w=600')}
            >
              <Upload className="h-8 w-8 mx-auto text-stone mb-2" />
              <p className="font-sans text-xs text-charcoal/70 font-semibold">Drag & Drop files here</p>
              <p className="font-sans text-[10px] text-charcoal/40 mt-1">or click to auto-generate mock image</p>
            </div>

            {imageUrl && (
              <div className="space-y-1">
                <span className="font-sans text-[10px] text-sage font-bold uppercase">Image Loaded:</span>
                <p className="font-sans text-[10px] text-charcoal/50 truncate">{imageUrl}</p>
              </div>
            )}

            <div>
              <label className="block font-sans text-xs font-semibold text-charcoal/70 mb-1">Image URL (Override)</label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/chess.jpg"
                className="w-full bg-offwhite border border-stone/30 p-2.5 rounded text-sm text-charcoal focus:outline-none focus:border-wood"
              />
            </div>

            <div>
              <label className="block font-sans text-xs font-semibold text-charcoal/70 mb-1">Category Tag</label>
              <select
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-offwhite border border-stone/30 p-2.5 rounded text-sm text-charcoal focus:outline-none focus:border-wood"
              >
                <option value="">Select Category Tag</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-sans text-xs font-semibold text-charcoal/70 mb-1">Caption</label>
              <textarea
                required
                rows={2}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Short caption describing the moment..."
                className="w-full bg-offwhite border border-stone/30 p-2.5 rounded text-sm text-charcoal focus:outline-none focus:border-wood resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-4 py-3 bg-wood text-offwhite font-sans text-sm font-semibold rounded hover:bg-wood/90 transition-colors flex items-center justify-center space-x-2"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <span>Publish Image</span>}
            </button>
          </form>
        </div>

        {/* Gallery Image Grid */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="font-serif text-lg font-bold text-charcoal">Uploaded Images</h2>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-wood" />
            </div>
          ) : images.length === 0 ? (
            <div className="text-center py-12 text-charcoal/40 text-sm font-sans bg-offwhite border border-stone/30 rounded-lg">
              No gallery images found. Publish one to show it here.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {images.map((img) => (
                <div
                  key={img.id}
                  className="bg-offwhite border border-stone/30 rounded-lg overflow-hidden flex flex-col justify-between shadow-sm relative group"
                >
                  <div className="relative h-48 bg-stone/20 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.image_url}
                      alt={img.caption}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-3 left-3 font-sans text-[10px] font-semibold text-offwhite bg-charcoal/70 px-2 py-0.5 rounded flex items-center">
                      <Tag className="h-3 w-3 mr-1 text-sage" />
                      {img.category}
                    </span>
                  </div>

                  <div className="p-4 flex items-center justify-between">
                    <p className="font-sans text-xs text-charcoal/80 truncate max-w-[80%]">{img.caption}</p>
                    <button
                      onClick={() => handleDelete(img.id)}
                      className="text-red-500 hover:text-red-700 p-1.5 rounded hover:bg-red-50 transition-colors"
                      title="Delete Image"
                    >
                      <Trash className="h-4 w-4" />
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
