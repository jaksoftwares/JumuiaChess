'use client';

import { useEffect, useState } from 'react';
import { apiRequest } from '@/lib/api';
import { SiteSettings } from '@/types';
import { Mail, Phone, MapPin, Send, Loader2 } from 'lucide-react';

export default function ContactUs() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    async function loadSettings() {
      const res = await apiRequest<SiteSettings>('/settings');
      if (res.success && res.data) {
        setSiteSettings(res.data);
      }
    }
    loadSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    const res = await apiRequest('/contact', {
      method: 'POST',
      body: JSON.stringify({ name, email, message }),
    });

    setLoading(false);

    if (res.success) {
      setStatus({
        type: 'success',
        text: 'Thank you! Your message has been sent successfully. Our team will get back to you shortly.',
      });
      setName('');
      setEmail('');
      setMessage('');
    } else {
      setStatus({
        type: 'error',
        text: res.error || 'Failed to submit contact inquiry. Please try again.',
      });
    }
  };

  return (
    <section id="contact" className="py-24 px-6 bg-stone/20 relative">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Left Side: General Info */}
        <div className="space-y-8">
          <div className="space-y-4">
            <span className="font-sans text-xs font-semibold tracking-widest text-wood uppercase">
              Get in Touch
            </span>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-charcoal">
              Contact Our Team
            </h2>
            <p className="font-sans text-charcoal/70">
              Have questions about board donations, partnership programs, or local tournaments? Fill out the contact form, and we will get back to you.
            </p>
          </div>

          <div className="space-y-6 pt-4">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-sage/10 text-sage rounded-md">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-charcoal">Email Address</h4>
                <p className="font-sans text-sm text-charcoal/70">{siteSettings?.org_email || 'info@giftofchess.org'}</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="p-3 bg-sage/10 text-sage rounded-md">
                <Phone className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-charcoal">Phone Number</h4>
                <p className="font-sans text-sm text-charcoal/70">{siteSettings?.org_phone || '+254 700 000000'}</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="p-3 bg-sage/10 text-sage rounded-md">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-charcoal">Global HQ</h4>
                <p className="font-sans text-sm text-charcoal/70">New York, NY / Nairobi, Kenya</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="bg-offwhite border border-stone/30 p-8 rounded-lg shadow-sm">
          {status && (
            <div className={`p-4 rounded mb-6 text-sm ${
              status.type === 'success' ? 'bg-sage/10 border border-sage/30 text-charcoal' : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              {status.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block font-sans text-xs font-semibold text-charcoal/70 mb-1.5">Your Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name"
                className="w-full bg-offwhite border border-stone/30 p-3 rounded text-sm text-charcoal focus:outline-none focus:border-wood"
              />
            </div>

            <div>
              <label className="block font-sans text-xs font-semibold text-charcoal/70 mb-1.5">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full bg-offwhite border border-stone/30 p-3 rounded text-sm text-charcoal focus:outline-none focus:border-wood"
              />
            </div>

            <div>
              <label className="block font-sans text-xs font-semibold text-charcoal/70 mb-1.5">Message</label>
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Your message details..."
                className="w-full bg-offwhite border border-stone/30 p-3 rounded text-sm text-charcoal focus:outline-none focus:border-wood resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-wood text-offwhite font-sans text-sm font-semibold rounded shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:scale-[1.02] active:translate-y-0 active:scale-[0.98] hover:bg-wood/90 transition-all duration-300 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Submitting Message...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Send Message</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
