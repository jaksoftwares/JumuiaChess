'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import Image from 'next/image';

const NAV_LINKS = [
  { name: 'Our Story', href: '#our-story' },
  { name: 'Impact', href: '#impact' },
  { name: 'Tournaments', href: '#tournaments' },
  { name: 'Shop', href: '#shop' },
  { name: 'Blogs & News', href: '#news' },
  { name: 'Partners', href: '#partners' },
  { name: 'Contact Us', href: '#contact' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-offwhite/90 backdrop-blur-md shadow-md py-3' : 'bg-transparent py-4'
        }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="#home" className="flex items-center space-x-2 text-wood hover:opacity-90 transition-opacity">
          <Image
            src="/images/chess_logo.png"
            alt="Jumuiya Chess Logo"
            width={45}
            height={45}
            className="h-45 w-45 object-contain"
          />
          <span className="font-serif text-xl font-bold tracking-tight text-charcoal">
            Jumuiya <span className="text-wood">Chess</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="font-sans text-sm font-medium text-charcoal/80 hover:text-wood transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden p-2 text-charcoal hover:text-wood focus:outline-none"
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Hamburger Overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 top-[72px] bg-offwhite/95 backdrop-blur-md z-40 flex flex-col justify-center items-center space-y-8 animate-fade-in">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={handleLinkClick}
              className="font-serif text-2xl font-semibold text-charcoal hover:text-wood transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
