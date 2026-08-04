'use client';

import { useState, useEffect } from 'react';
import { apiRequest, uploadFile } from '@/lib/api';
import { GalleryImage } from '@/types';
import { Loader2, Plus, Trash2, Tag, Image as ImageIcon, Sparkles } from 'lucide-react';
import { ImageUploadInput } from '@/components/admin/ImageUploadInput';
import { Modal } from '@/components/admin/Modal';

export default function AdminGallery() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [caption, setCaption] = useState('');
  const [imageUrl, setImageUrl] = useState<File | string | null>(null);
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

  const handleOpenCreateModal = () => {
    setCaption('');
    setImageUrl(null);
    setMessage(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl) {
      setMessage({ type: 'error', text: 'Please select or upload an image.' });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    let finalImageUrl = typeof imageUrl === 'string' ? imageUrl : '';
    if (imageUrl instanceof File) {
      const uploadRes = await uploadFile(imageUrl);
      if (!uploadRes.success || !uploadRes.url) {
        setMessage({ type: 'error', text: uploadRes.error || 'Failed to upload image' });
        setIsSubmitting(false);
        return;
      }
      finalImageUrl = uploadRes.url;
    }

    const res = await apiRequest('/gallery', {
      method: 'POST',
      body: JSON.stringify({
        image_url: finalImageUrl,
        caption,
      }),
    });

    setIsSubmitting(false);

    if (res.success) {
      setIsModalOpen(false);
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
        <h1 className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-white">
          Media Gallery
        </h1>
        <p className="text-xs md:text-sm text-[#FAF7F2]/90 leading-relaxed font-sans max-w-3xl">
          Upload images directly from your device and organize community photos by program category.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-stone-600 uppercase tracking-wider">
            Uploaded Gallery Photos ({images.length})
          </span>
          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2.5 bg-[#6B4A34] hover:bg-[#573b29] text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-xs hover:shadow-md active:scale-95 transition-all duration-200"
          >
            <Plus className="w-4 h-4" /> Upload New Photo
          </button>
        </div>

        {/* Gallery Image Grid */}
        <div className="w-full space-y-4">
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-[#6B4A34]" />
            </div>
          ) : images.length === 0 ? (
            <div className="text-center py-16 text-stone-400 text-xs font-sans bg-white border border-stone-200 rounded-2xl flex flex-col items-center justify-center space-y-3">
              <ImageIcon className="w-8 h-8 text-stone-300" />
              <p>No gallery images found.</p>
              <button
                onClick={handleOpenCreateModal}
                className="mt-2 px-4 py-2 bg-[#6B4A34] text-white text-xs font-bold rounded-xl inline-flex items-center gap-2 shadow-sm"
              >
                <Plus className="w-4 h-4" /> Upload First Photo
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-5">
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

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Upload New Photo"
      >
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

          <div className="flex space-x-2 pt-2 border-t border-stone-200">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="w-1/2 py-2.5 mt-2 border border-stone-300 font-semibold text-xs rounded-xl hover:bg-stone-100 text-stone-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-1/2 mt-2 py-2.5 bg-[#6B4A34] hover:bg-[#573b29] text-white font-bold text-xs rounded-xl shadow-xs hover:shadow-md active:scale-95 transition-all duration-200 flex items-center justify-center space-x-2`}
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <span>Publish Image</span>}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
