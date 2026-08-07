'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useSiteSettings } from '@/components/providers/SettingsProvider';
import { Instagram, Facebook, Youtube } from 'lucide-react';

export default function Footer() {
  const { settings, loading } = useSiteSettings();

  return (
    <footer className="bg-charcoal text-offwhite border-t border-stone/20 py-12 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between space-y-6 md:space-y-0">
        {/* Left Side: Brand Logo and Description */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-2">
          <div className="flex items-center space-x-2 text-stone">
            <Image
              src="/images/chess_logo.png"
              alt="Jumuiya Chess Logo"
              width={24}
              height={24}
              className="h-6 w-6 object-contain"
            />
            <span className="font-serif text-lg font-bold tracking-wider">
              Jumuiya <span className="text-sage">Chess</span>
            </span>
          </div>
          <p className="font-sans text-xs text-stone/70 max-w-md">
            Jumuiya Chess powered by The Gift of Chess Africa, Kenyan Chapter. Using chess as a tool to expand opportunities, enhance cognitive development, and build community worldwide.
          </p>
        </div>

        {/* Right Side: Links & Administration Access */}
        <div className="flex flex-col items-center md:items-end space-y-4">
          <div className="flex space-x-6 text-xs text-stone/80 text-center md:text-right">
            <span className="font-sans">
              © {new Date().getFullYear()} Jumuiya Chess powered by The Gift of Chess Africa, Kenyan Chapter. All rights reserved.
            </span>
          </div>
          
          {!loading && (
            <div className="flex space-x-4">
              {settings.instagram_url && (
                <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer" className="text-stone hover:text-white transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {settings.facebook_url && (
                <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer" className="text-stone hover:text-white transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
              )}
              {settings.youtube_url && (
                <a href={settings.youtube_url} target="_blank" rel="noopener noreferrer" className="text-stone hover:text-white transition-colors">
                  <Youtube className="w-5 h-5" />
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
