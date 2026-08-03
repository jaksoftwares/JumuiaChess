'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { apiRequest } from '@/lib/api';
import { SiteSettings } from '@/types';
import { Mail, Phone, MapPin, Send, Loader2, Instagram, Facebook, Twitter, Youtube } from 'lucide-react';

export default function ContactUs() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await apiRequest<SiteSettings>('/settings');
        if (res.success && res.data) {
          setSiteSettings(res.data);
        }
      } catch (err) {
        console.error('[ContactUs] Failed to load settings:', err);
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
      setTimeout(() => {
        setStatus(null);
      }, 5000);
    } else {
      setStatus({
        type: 'error',
        text: res.error || 'Failed to submit contact inquiry. Please try again.',
      });
    }
  };

  return (
    <section id="contact" className="py-10 md:py-14 px-6 bg-gradient-to-b from-white via-[#FAF7F2] to-[#F6F4EF] relative scroll-mt-24 lg:scroll-mt-28 overflow-hidden">
      {/* Top & Bottom Ambient Gradient Blends */}
      <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-white to-transparent pointer-events-none" />
      <div className="absolute top-1/2 left-[-100px] w-[450px] h-[450px] bg-[#C8B195]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-[-100px] w-[400px] h-[400px] bg-amber-900/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto">
        {/* UNIFIED CHESS-THEMED CONTACT CARD */}
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl shadow-stone-900/25 bg-[#16171A] p-6 sm:p-10 md:p-12 text-white border border-[#C8B195]/15">
          {/* Brand Background Radial Lighting & Chess Watermark Elements */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(circle,_rgba(200,177,149,0.15),_transparent_65%)] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[radial-gradient(circle,_rgba(107,74,52,0.25),_transparent_65%)] pointer-events-none" />

          {/* Subtle Background Chess King Silhouette Watermark */}
          <div className="absolute right-[-40px] bottom-[-40px] w-80 h-80 opacity-5 pointer-events-none">
            <Image
              src="/images/king.png"
              alt="Chess King Silhouette"
              fill
              unoptimized
              className="object-contain filter grayscale"
            />
          </div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column (4 cols): Title & Contact Details */}
            <div className="lg:col-span-4 space-y-6">
              <span className="font-mono text-xs font-bold tracking-widest text-[#C8B195] uppercase">
                JUMUIYA CHESS COMMUNITY
              </span>

              <div className="space-y-3">
                <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight">
                  Make Your <br />
                  <span className="bg-gradient-to-r from-[#F0E6D8] via-[#C8B195] to-[#A88B6B] bg-clip-text text-transparent">
                    Next Move
                  </span>
                </h2>
                <p className="font-sans text-xs sm:text-sm text-stone-300 leading-relaxed">
                  Have questions about board donations, school partnership programs, or local tournaments? Send us a message and our team will get back to you.
                </p>
              </div>

              {/* Direct Info Badges */}
              <div className="space-y-4 pt-2 border-t border-white/10 text-xs text-stone-300 font-sans">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-white/5 border border-[#C8B195]/20 flex items-center justify-center text-[#C8B195] shadow-sm">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 font-mono uppercase block">Email Address</span>
                    <span className="font-semibold text-white">info@giftofchess.org</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-white/5 border border-[#C8B195]/20 flex items-center justify-center text-[#C8B195] shadow-sm">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 font-mono uppercase block">Phone Number</span>
                    <span className="font-semibold text-white">0722274720</span>
                  </div>
                </div>

                {/* Social Media Handles with Hover Color Reveal */}
                <div className="pt-3 border-t border-white/10 space-y-2">
                  <span className="text-[10px] text-stone-400 font-mono uppercase block">Follow Our Social Handles</span>
                  <div className="flex items-center space-x-3">
                    {/* Instagram */}
                    <a
                      href={siteSettings?.instagram_url || "https://instagram.com/giftofchess"}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Instagram"
                      className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-stone-300 transition-all duration-300 hover:scale-110 hover:bg-gradient-to-tr hover:from-amber-500 hover:via-rose-500 hover:to-purple-600 hover:text-white hover:border-transparent hover:shadow-lg"
                    >
                      <Instagram className="w-4 h-4" />
                    </a>

                    {/* Facebook */}
                    <a
                      href={siteSettings?.facebook_url || "https://facebook.com/giftofchess"}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Facebook"
                      className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-stone-300 transition-all duration-300 hover:scale-110 hover:bg-[#1877F2] hover:text-white hover:border-transparent hover:shadow-lg"
                    >
                      <Facebook className="w-4 h-4" />
                    </a>

                    {/* X (formerly Twitter) */}
                    <a
                      href="https://x.com/giftofchess"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="X (formerly Twitter)"
                      className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-stone-300 transition-all duration-300 hover:scale-110 hover:bg-white hover:text-black hover:border-transparent hover:shadow-lg"
                    >
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                    </a>

                    {/* YouTube */}
                    <a
                      href={siteSettings?.youtube_url || "https://youtube.com/giftofchess"}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="YouTube"
                      className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-stone-300 transition-all duration-300 hover:scale-110 hover:bg-[#FF0000] hover:text-white hover:border-transparent hover:shadow-lg"
                    >
                      <Youtube className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Center Column (3 cols): 3D Chess Knight Artwork with Ambient Glow */}
            <div className="lg:col-span-3 flex justify-center py-2 lg:py-0 relative">
              <div className="absolute inset-0 bg-[#C8B195]/15 rounded-full blur-2xl pointer-events-none" />
              <div className="relative w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 drop-shadow-[0_20px_40px_rgba(200,177,149,0.25)] transform hover:scale-105 transition-transform duration-500">
                <Image
                  src="/images/knight.png"
                  alt="Chess Knight"
                  fill
                  unoptimized
                  className="object-contain"
                />
              </div>
            </div>

            {/* Right Column (5 cols): Embedded Form Inside Card */}
            <div className="lg:col-span-5 bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-md space-y-4 shadow-xl">
              <h3 className="font-serif text-lg font-bold text-white">Send Direct Message</h3>

              {status && (
                <div className={`p-3.5 rounded-xl text-xs font-medium animate-fade-in ${status.type === 'success' ? 'bg-emerald-950/70 border border-emerald-500/40 text-emerald-200' : 'bg-red-950/70 border border-red-500/40 text-red-200'
                  }`}>
                  {status.text}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-mono text-stone-300 uppercase tracking-wider mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full bg-black/50 border border-white/15 p-3 rounded-xl text-xs text-white placeholder-stone-500 focus:outline-none focus:border-[#C8B195] focus:ring-1 focus:ring-[#C8B195]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-stone-300 uppercase tracking-wider mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jane@example.com"
                    className="w-full bg-black/50 border border-white/15 p-3 rounded-xl text-xs text-white placeholder-stone-500 focus:outline-none focus:border-[#C8B195] focus:ring-1 focus:ring-[#C8B195]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-stone-300 uppercase tracking-wider mb-1">Message *</label>
                  <textarea
                    required
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Ask about partnerships, tournaments, or board distributions..."
                    className="w-full bg-black/50 border border-white/15 p-3 rounded-xl text-xs text-white placeholder-stone-500 focus:outline-none focus:border-[#C8B195] focus:ring-1 focus:ring-[#C8B195] resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-[#C8B195] via-[#BA9E80] to-[#A88B6B] hover:brightness-110 text-charcoal font-sans text-xs font-bold rounded-xl shadow-xl shadow-amber-900/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Sending Message...</span>
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
        </div>
      </div>
    </section>
  );
}
