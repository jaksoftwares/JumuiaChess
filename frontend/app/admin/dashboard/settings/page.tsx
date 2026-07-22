'use client';

import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/api';
import { SiteSettings } from '@/types';
import { Loader2, Settings as SettingsIcon, Save } from 'lucide-react';

export default function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  // Form State
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [paybill, setPaybill] = useState('');
  const [instagram, setInstagram] = useState('');
  const [facebook, setFacebook] = useState('');
  const [youtube, setYoutube] = useState('');
  const [shopEnabled, setShopEnabled] = useState(true);

  useEffect(() => {
    async function loadSettings() {
      setApiError(null);
      const res = await apiRequest<SiteSettings>('/settings');
      if (res.success && res.data) {
        setEmail(res.data.org_email || '');
        setPhone(res.data.org_phone || '');
        setPaybill(res.data.mpesa_paybill || '');
        setInstagram(res.data.instagram_url || '');
        setFacebook(res.data.facebook_url || '');
        setYoutube(res.data.youtube_url || '');
        setShopEnabled(res.data.shop_enabled ?? true);
      } else {
        setApiError(res.error || 'Unable to load site settings from the database.');
        setEmail('info@giftofchess.org');
        setPhone('+254700000000');
        setPaybill('174379');
        setInstagram('https://instagram.com/giftofchess');
        setFacebook('https://facebook.com/giftofchess');
        setYoutube('https://youtube.com/giftofchess');
        setShopEnabled(true);
      }
      setLoading(false);
    }
    loadSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    const body = {
      org_email: email,
      org_phone: phone,
      mpesa_paybill: paybill,
      instagram_url: instagram || undefined,
      facebook_url: facebook || undefined,
      youtube_url: youtube || undefined,
      shop_enabled: shopEnabled,
    };

    const res = await apiRequest('/settings', {
      method: 'PUT',
      body: JSON.stringify(body),
    });

    setIsSaving(false);

    if (res.success) {
      setMessage({ type: 'success', text: 'Site settings updated successfully!' });
    } else {
      setMessage({ type: 'error', text: res.error || 'Failed to update settings.' });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-wood" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Title */}
      <div>
        <h1 className="font-serif text-3xl font-bold text-charcoal">Site Settings</h1>
        <p className="font-sans text-xs text-charcoal/50">
          Configure organization information, payments, and social linkages.
        </p>
      </div>

      <div className="bg-offwhite border border-stone/30 p-8 rounded-lg shadow-sm">
        {message && (
          <div className={`p-4 rounded text-xs mb-6 ${
            message.type === 'success' ? 'bg-sage/10 text-charcoal border border-sage/30' : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}
        {apiError && (
          <div className="p-4 rounded text-xs mb-6 bg-red-50 text-red-700 border border-red-200">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section: Organization Details */}
          <div className="space-y-4">
            <h3 className="font-serif font-bold text-charcoal border-b border-stone/20 pb-2 text-sm uppercase tracking-wider text-wood">
              Organization Contact
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-sans text-xs font-semibold text-charcoal/70 mb-1">Contact Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="info@giftofchess.org"
                  className="w-full bg-offwhite border border-stone/30 p-2.5 rounded text-sm text-charcoal focus:outline-none focus:border-wood"
                />
              </div>
              <div>
                <label className="block font-sans text-xs font-semibold text-charcoal/70 mb-1">Contact Phone</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+254700000000"
                  className="w-full bg-offwhite border border-stone/30 p-2.5 rounded text-sm text-charcoal focus:outline-none focus:border-wood"
                />
              </div>
            </div>
          </div>

          {/* Section: M-Pesa Details */}
          <div className="space-y-4 pt-2">
            <h3 className="font-serif font-bold text-charcoal border-b border-stone/20 pb-2 text-sm uppercase tracking-wider text-wood">
              M-Pesa Gateway Config
            </h3>
            <div>
              <label className="block font-sans text-xs font-semibold text-charcoal/70 mb-1">M-Pesa Shortcode (Paybill/Till)</label>
              <input
                type="text"
                required
                value={paybill}
                onChange={(e) => setPaybill(e.target.value)}
                placeholder="174379"
                className="w-full bg-offwhite border border-stone/30 p-2.5 rounded text-sm text-charcoal focus:outline-none focus:border-wood"
              />
            </div>
          </div>

          {/* Section: Social Links */}
          <div className="space-y-4 pt-2">
            <h3 className="font-serif font-bold text-charcoal border-b border-stone/20 pb-2 text-sm uppercase tracking-wider text-wood">
              Social Media Accounts
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block font-sans text-xs font-semibold text-charcoal/70 mb-1">Instagram URL</label>
                <input
                  type="url"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="https://instagram.com/giftofchess"
                  className="w-full bg-offwhite border border-stone/30 p-2.5 rounded text-sm text-charcoal focus:outline-none focus:border-wood"
                />
              </div>
              <div>
                <label className="block font-sans text-xs font-semibold text-charcoal/70 mb-1">Facebook URL</label>
                <input
                  type="url"
                  value={facebook}
                  onChange={(e) => setFacebook(e.target.value)}
                  placeholder="https://facebook.com/giftofchess"
                  className="w-full bg-offwhite border border-stone/30 p-2.5 rounded text-sm text-charcoal focus:outline-none focus:border-wood"
                />
              </div>
              <div>
                <label className="block font-sans text-xs font-semibold text-charcoal/70 mb-1">YouTube URL</label>
                <input
                  type="url"
                  value={youtube}
                  onChange={(e) => setYoutube(e.target.value)}
                  placeholder="https://youtube.com/giftofchess"
                  className="w-full bg-offwhite border border-stone/30 p-2.5 rounded text-sm text-charcoal focus:outline-none focus:border-wood"
                />
              </div>
            </div>
          </div>

          {/* Section: Toggle Shop */}
          <div className="space-y-4 pt-2">
            <h3 className="font-serif font-bold text-charcoal border-b border-stone/20 pb-2 text-sm uppercase tracking-wider text-wood">
              Store Feature Controls
            </h3>
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="shopToggle"
                checked={shopEnabled}
                onChange={(e) => setShopEnabled(e.target.checked)}
                className="rounded border-stone/30 text-wood focus:ring-wood"
              />
              <label htmlFor="shopToggle" className="font-sans text-xs font-semibold text-charcoal/70 cursor-pointer">
                Enable Charity Store for public site visitors
              </label>
            </div>
          </div>

          {/* Action Button */}
          <button
            type="submit"
            disabled={isSaving}
            className="w-full mt-6 py-3 bg-wood text-offwhite font-sans text-sm font-semibold rounded hover:bg-wood/90 transition-colors flex items-center justify-center space-x-2 shadow-sm"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving Configurations...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
