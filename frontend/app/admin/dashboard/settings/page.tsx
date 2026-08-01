'use client';

import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/api';
import { SiteSettings } from '@/types';
import { Loader2, Settings as SettingsIcon, Save } from 'lucide-react';

export default function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form State
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [paybill, setPaybill] = useState('');
  const [instagram, setInstagram] = useState('');
  const [facebook, setFacebook] = useState('');
  const [youtube, setYoutube] = useState('');
  const [shopEnabled, setShopEnabled] = useState(true);

  // Our Story CMS State
  const [ourStoryTitle, setOurStoryTitle] = useState('Our Story');
  const [ourStoryHeading, setOurStoryHeading] = useState('Elevating Strategy from the Board to the Community.');
  const [ourStoryParagraph1, setOurStoryParagraph1] = useState("The Gift of Chess is a nonprofit organization dedicated to using chess as a tool for education, personal development, and social transformation. Since our inception, we have worked with schools, children's homes, prisons, and refugee communities across Kenya to nurture talent, build critical thinking, and provide safe, constructive spaces where children and youth can grow and thrive.");
  const [ourStoryParagraph2, setOurStoryParagraph2] = useState("In Kenya, we have also integrated an environmental sustainability component into our work. In partnership with Kijiji Solutions, we recycle plastic waste to produce chess sets, turning waste into meaningful tools that expand access to chess while contributing to climate action.");

  useEffect(() => {
    async function loadSettings() {
      const res = await apiRequest<SiteSettings>('/settings');
      if (res.success && res.data) {
        setEmail(res.data.org_email || '');
        setPhone(res.data.org_phone || '');
        setPaybill(res.data.mpesa_paybill || '');
        setInstagram(res.data.instagram_url || '');
        setFacebook(res.data.facebook_url || '');
        setYoutube(res.data.youtube_url || '');
        setShopEnabled(res.data.shop_enabled ?? true);
        if (res.data.our_story_title) setOurStoryTitle(res.data.our_story_title);
        if (res.data.our_story_heading) setOurStoryHeading(res.data.our_story_heading);
        if (res.data.our_story_paragraph_1) setOurStoryParagraph1(res.data.our_story_paragraph_1);
        if (res.data.our_story_paragraph_2) setOurStoryParagraph2(res.data.our_story_paragraph_2);
      } else {
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
      our_story_title: ourStoryTitle,
      our_story_heading: ourStoryHeading,
      our_story_paragraph_1: ourStoryParagraph1,
      our_story_paragraph_2: ourStoryParagraph2,
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
      <div className="flex flex-col justify-center items-center h-[50vh] space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-[#6B4A34]" />
        <p className="text-xs font-semibold text-stone-500">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Brown Banner Card */}
      <div className="bg-[#6B4A34] text-white p-6 md:p-8 rounded-2xl shadow-md border border-[#573b29] relative overflow-hidden space-y-2">
        <h1 className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-white">
          Site Settings
        </h1>
        <p className="text-xs md:text-sm text-[#FAF7F2]/90 leading-relaxed font-sans max-w-3xl">
          Configure organization contact details, M-Pesa Paybill shortcode, and social media handles.
        </p>
      </div>

      <div className="bg-white border border-stone-200 p-8 rounded-2xl shadow-sm max-w-4xl">
        {message && (
          <div className={`p-4 rounded-xl text-xs font-medium mb-6 ${
            message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section: Organization Details */}
          <div className="space-y-4">
            <h3 className="font-serif font-bold text-charcoal border-b border-stone-100 pb-2 text-xs uppercase tracking-wider text-[#6B4A34]">
              Organization Contact
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Contact Email *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="info@giftofchess.org"
                  className="w-full bg-white border border-stone-300 p-2.5 rounded-xl text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-[#6B4A34]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Contact Phone *</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+254700000000"
                  className="w-full bg-white border border-stone-300 p-2.5 rounded-xl text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-[#6B4A34]"
                />
              </div>
            </div>
          </div>

          {/* Section: M-Pesa Details */}
          <div className="space-y-4 pt-2">
            <h3 className="font-serif font-bold text-charcoal border-b border-stone-100 pb-2 text-xs uppercase tracking-wider text-[#6B4A34]">
              M-Pesa Gateway Config
            </h3>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">M-Pesa Paybill / Till Number *</label>
              <input
                type="text"
                required
                value={paybill}
                onChange={(e) => setPaybill(e.target.value)}
                placeholder="174379"
                className="w-full bg-white border border-stone-300 p-2.5 rounded-xl text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-[#6B4A34]"
              />
            </div>
          </div>

          {/* Section: Social Links */}
          <div className="space-y-4 pt-2">
            <h3 className="font-serif font-bold text-charcoal border-b border-stone-100 pb-2 text-xs uppercase tracking-wider text-[#6B4A34]">
              Social Media Accounts
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Instagram URL</label>
                <input
                  type="url"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="https://instagram.com/giftofchess"
                  className="w-full bg-white border border-stone-300 p-2.5 rounded-xl text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-[#6B4A34]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Facebook URL</label>
                <input
                  type="url"
                  value={facebook}
                  onChange={(e) => setFacebook(e.target.value)}
                  placeholder="https://facebook.com/giftofchess"
                  className="w-full bg-white border border-stone-300 p-2.5 rounded-xl text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-[#6B4A34]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">YouTube URL</label>
                <input
                  type="url"
                  value={youtube}
                  onChange={(e) => setYoutube(e.target.value)}
                  placeholder="https://youtube.com/giftofchess"
                  className="w-full bg-white border border-stone-300 p-2.5 rounded-xl text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-[#6B4A34]"
                />
              </div>
            </div>
          </div>

          {/* Section: Our Story Content CMS Editor */}
          <div className="space-y-4 pt-2">
            <h3 className="font-serif font-bold text-charcoal border-b border-stone-100 pb-2 text-xs uppercase tracking-wider text-[#6B4A34]">
              Our Story Section Content
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Eyebrow Label / Badge Title</label>
                <input
                  type="text"
                  value={ourStoryTitle}
                  onChange={(e) => setOurStoryTitle(e.target.value)}
                  placeholder="Our Story"
                  className="w-full bg-white border border-stone-300 p-2.5 rounded-xl text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-[#6B4A34]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Main Heading</label>
                <input
                  type="text"
                  value={ourStoryHeading}
                  onChange={(e) => setOurStoryHeading(e.target.value)}
                  placeholder="Elevating Strategy from the Board to the Community."
                  className="w-full bg-white border border-stone-300 p-2.5 rounded-xl text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-[#6B4A34]"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Story Paragraph 1</label>
                <textarea
                  rows={3}
                  value={ourStoryParagraph1}
                  onChange={(e) => setOurStoryParagraph1(e.target.value)}
                  placeholder="First narrative paragraph..."
                  className="w-full bg-white border border-stone-300 p-2.5 rounded-xl text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-[#6B4A34]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Story Paragraph 2</label>
                <textarea
                  rows={3}
                  value={ourStoryParagraph2}
                  onChange={(e) => setOurStoryParagraph2(e.target.value)}
                  placeholder="Second narrative paragraph..."
                  className="w-full bg-white border border-stone-300 p-2.5 rounded-xl text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-[#6B4A34]"
                />
              </div>
            </div>
          </div>

          {/* Section: Toggle Shop */}
          <div className="space-y-4 pt-2">
            <h3 className="font-serif font-bold text-charcoal border-b border-stone-100 pb-2 text-xs uppercase tracking-wider text-[#6B4A34]">
              Store Feature Controls
            </h3>
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="shopToggle"
                checked={shopEnabled}
                onChange={(e) => setShopEnabled(e.target.checked)}
                className="rounded border-stone-300 text-[#6B4A34] focus:ring-[#6B4A34]"
              />
              <label htmlFor="shopToggle" className="text-xs font-semibold text-stone-700 cursor-pointer">
                Enable Charity Store for public site visitors
              </label>
            </div>
          </div>

          {/* Action Button */}
          <button
            type="submit"
            disabled={isSaving}
            className="w-full mt-6 py-3 bg-[#6B4A34] hover:bg-[#573b29] text-white font-bold text-xs rounded-xl shadow-xs hover:shadow-md active:scale-95 transition-all duration-200 flex items-center justify-center space-x-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving Configurations...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Save Site Settings</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
