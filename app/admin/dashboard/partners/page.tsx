'use client';

import { useState, useEffect } from 'react';
import { apiRequest, uploadFile } from '@/lib/api';
import { Partner } from '@/types';
import { Loader2, Plus, Trash2, Globe, Sparkles, Handshake } from 'lucide-react';
import { ImageUploadInput } from '@/components/admin/ImageUploadInput';
import { Modal } from '@/components/admin/Modal';

export default function AdminPartners() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [logoUrl, setLogoUrl] = useState<File | string | null>(null);
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadPartners = async () => {
    setLoading(true);
    const res = await apiRequest<Partner[]>('/partners');
    if (res.success && Array.isArray(res.data)) {
      setPartners(res.data);
    } else {
      setPartners([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadPartners();
  }, []);

  const handleOpenCreateModal = () => {
    setName('');
    setLogoUrl(null);
    setWebsiteUrl('');
    setMessage(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    let finalLogoUrl = typeof logoUrl === 'string' ? logoUrl : '';
    if (logoUrl instanceof File) {
      const uploadRes = await uploadFile(logoUrl);
      if (!uploadRes.success || !uploadRes.url) {
        setMessage({ type: 'error', text: uploadRes.error || 'Failed to upload image' });
        setIsSubmitting(false);
        return;
      }
      finalLogoUrl = uploadRes.url;
    }

    const body = {
      name,
      logo_url: finalLogoUrl || 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?auto=format&fit=crop&q=80&w=100',
      website_url: websiteUrl || undefined,
    };

    const res = await apiRequest('/partners', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    setIsSubmitting(false);

    if (res.success) {
      setIsModalOpen(false);
      loadPartners();
    } else {
      setMessage({ type: 'error', text: res.error || 'Failed to add partner' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this partner?')) return;

    const res = await apiRequest(`/partners/${id}`, {
      method: 'DELETE',
    });

    if (res.success) {
      loadPartners();
    } else {
      alert(res.error || 'Failed to delete partner');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Brown Banner Card */}
      <div className="bg-[#6B4A34] text-white p-6 md:p-8 rounded-2xl shadow-md border border-[#573b29] relative overflow-hidden space-y-2">
        <h1 className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-white">
          Partners & Sponsors
        </h1>
        <p className="text-xs md:text-sm text-[#FAF7F2]/90 leading-relaxed font-sans max-w-3xl">
          Upload organization logos directly from your device to display in the sponsor showcase on the landing page.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-stone-600 uppercase tracking-wider">
            Active Partners ({partners.length})
          </span>
          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2.5 bg-[#6B4A34] hover:bg-[#573b29] text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-xs hover:shadow-md active:scale-95 transition-all duration-200"
          >
            <Plus className="w-4 h-4" /> Add Partner
          </button>
        </div>

        {/* Partners Table Card */}
        <div className="bg-white border border-stone-200 p-6 rounded-2xl shadow-sm overflow-x-auto w-full">
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-[#6B4A34]" />
            </div>
          ) : partners.length === 0 ? (
            <div className="text-center py-16 text-stone-400 text-xs font-sans bg-[#FAF7F2] border border-stone-200 rounded-xl flex flex-col items-center justify-center space-y-3">
              <Handshake className="w-8 h-8 text-stone-300" />
              <p>No active partners found.</p>
              <button
                onClick={handleOpenCreateModal}
                className="mt-2 px-4 py-2 bg-[#6B4A34] text-white text-xs font-bold rounded-xl inline-flex items-center gap-2 shadow-sm"
              >
                <Plus className="w-4 h-4" /> Add First Partner
              </button>
            </div>
          ) : (
            <table className="w-full text-left border-collapse font-sans text-xs">
              <thead>
                <tr className="border-b border-stone-200 text-stone-500 font-bold uppercase tracking-wider">
                  <th className="pb-3 w-16">Logo</th>
                  <th className="pb-3">Name</th>
                  <th className="pb-3">Website</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {partners.map((partner) => (
                  <tr key={partner.id} className="text-charcoal hover:bg-[#FAF7F2]/60 transition-colors">
                    <td className="py-3">
                      <img
                        src={partner.logo_url}
                        alt={partner.name}
                        className="h-10 w-10 object-contain bg-stone-100 p-1.5 rounded-lg border border-stone-200"
                      />
                    </td>
                    <td className="py-3 font-bold">{partner.name}</td>
                    <td className="py-3 truncate max-w-[180px]">
                      {partner.website_url ? (
                        <a
                          href={partner.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#6B4A34] hover:underline font-semibold inline-flex items-center gap-1"
                        >
                          <Globe className="h-3.5 w-3.5" />
                          <span>Link</span>
                        </a>
                      ) : (
                        <span className="text-stone-400">—</span>
                      )}
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => handleDelete(partner.id)}
                        className="p-1.5 text-stone-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Partner"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Add Partner / Sponsor"
      >
        {message && (
          <div className={`p-3.5 rounded-xl text-xs font-medium ${
            message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Organization Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="FIDE (International Chess Federation)"
              className="w-full bg-white border border-stone-300 p-2.5 rounded-xl text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-[#6B4A34]"
            />
          </div>

          <ImageUploadInput
            label="Partner Logo (Upload from Device)"
            value={logoUrl}
            onChange={(url) => setLogoUrl(url)}
          />

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Website URL (Optional)</label>
            <input
              type="url"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="https://fide.com"
              className="w-full bg-white border border-stone-300 p-2.5 rounded-xl text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-[#6B4A34]"
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
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <span>Add Partner</span>}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
