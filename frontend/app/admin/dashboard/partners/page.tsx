'use client';

import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/api';
import { Partner } from '@/types';
import { Loader2, Plus, Users, Trash, Globe } from 'lucide-react';

export default function AdminPartners() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [name, setName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const loadPartners = async () => {
    setLoading(true);
    setApiError(null);
    const res = await apiRequest<Partner[]>('/partners');
    if (res.success && Array.isArray(res.data)) {
      setPartners(res.data);
    } else {
      setApiError(res.error || 'Unable to load partners from the database.');
      setPartners([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadPartners();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    const body = {
      name,
      logo_url: logoUrl || 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?auto=format&fit=crop&q=80&w=100',
      website_url: websiteUrl || undefined,
    };

    const res = await apiRequest('/partners', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    setIsSubmitting(false);

    if (res.success) {
      setMessage({ type: 'success', text: 'Partner added successfully!' });
      setName('');
      setLogoUrl('');
      setWebsiteUrl('');
      loadPartners();
    } else {
      setMessage({ type: 'error', text: res.error || 'Failed to add partner' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this partner/sponsor?')) return;

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
    <div className="space-y-10">
      {/* Title */}
      <div>
        <h1 className="font-serif text-3xl font-bold text-charcoal">Manage Partners & Sponsors</h1>
        <p className="font-sans text-xs text-charcoal/50">
          Add or remove organization logos displayed in the sponsors section of the landing page.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Form: Add Partner */}
        <div className="bg-offwhite border border-stone/30 p-6 rounded-lg shadow-sm space-y-6 h-fit">
          <h2 className="font-serif text-lg font-bold text-wood flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>Add Partner</span>
          </h2>

          {message && (
            <div className={`p-3 rounded text-xs ${
              message.type === 'success' ? 'bg-sage/10 text-charcoal border border-sage/30' : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message.text}
            </div>
          )}
          {apiError && (
            <div className="p-3 rounded text-xs bg-red-50 text-red-700 border border-red-200">
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-sans text-xs font-semibold text-charcoal/70 mb-1">Organization Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="FIDE (International Chess Federation)"
                className="w-full bg-offwhite border border-stone/30 p-2.5 rounded text-sm text-charcoal focus:outline-none focus:border-wood"
              />
            </div>

            <div>
              <label className="block font-sans text-xs font-semibold text-charcoal/70 mb-1">Logo Image URL</label>
              <input
                type="url"
                required
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://example.com/logo.png"
                className="w-full bg-offwhite border border-stone/30 p-2.5 rounded text-sm text-charcoal focus:outline-none focus:border-wood"
              />
              <span className="font-sans text-[10px] text-charcoal/40">You can use internal placeholders like /images/king.png or external links.</span>
            </div>

            <div>
              <label className="block font-sans text-xs font-semibold text-charcoal/70 mb-1">Website URL (Optional)</label>
              <input
                type="url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://fide.com"
                className="w-full bg-offwhite border border-stone/30 p-2.5 rounded text-sm text-charcoal focus:outline-none focus:border-wood"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-4 py-3 bg-wood text-offwhite font-sans text-sm font-semibold rounded hover:bg-wood/90 transition-colors flex items-center justify-center space-x-2"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <span>Add Partner</span>}
            </button>
          </form>
        </div>

        {/* Table: Partners list */}
        <div className="lg:col-span-2 bg-offwhite border border-stone/30 p-6 rounded-lg shadow-sm overflow-x-auto">
          <h2 className="font-serif text-lg font-bold text-charcoal mb-6 flex items-center space-x-2">
            <Users className="h-5 w-5 text-wood" />
            <span>Active Partners & Sponsors</span>
          </h2>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-wood" />
            </div>
          ) : partners.length === 0 ? (
            <div className="text-center py-12 text-charcoal/40 text-sm font-sans">
              No partners found in the database yet. Add one using the form on the left.
            </div>
          ) : (
            <table className="w-full text-left border-collapse font-sans text-sm">
              <thead>
                <tr className="border-b border-stone/30 text-charcoal/60 font-semibold text-xs uppercase">
                  <th className="pb-3 w-16">Logo</th>
                  <th className="pb-3">Name</th>
                  <th className="pb-3">Website</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone/10">
                {partners.map((partner) => (
                  <tr key={partner.id} className="text-charcoal/80 hover:bg-stone/5">
                    <td className="py-4">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={partner.logo_url}
                        alt={partner.name}
                        className="h-10 w-10 object-contain bg-stone/20 p-1.5 rounded"
                      />
                    </td>
                    <td className="py-4 font-semibold">{partner.name}</td>
                    <td className="py-4 truncate max-w-[180px]">
                      {partner.website_url ? (
                        <a
                          href={partner.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-wood hover:underline inline-flex items-center space-x-1"
                        >
                          <Globe className="h-3.5 w-3.5 mr-1" />
                          <span>Link</span>
                        </a>
                      ) : (
                        <span className="text-charcoal/40">—</span>
                      )}
                    </td>
                    <td className="py-4 text-right">
                      <button
                        onClick={() => handleDelete(partner.id)}
                        className="text-red-500 hover:text-red-700 p-1.5 rounded hover:bg-red-50 transition-colors"
                        title="Delete Partner"
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
