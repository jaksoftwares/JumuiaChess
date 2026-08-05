'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Menu, X, ArrowRight, Sparkles, ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import { useCartStore } from '@/store/cart';

const NAV_LINKS = [
  { name: 'Our Story', href: '#our-story' },
  { name: 'Meet the Team', href: '#team' },
  { name: 'Impact', href: '#impact' },
  { name: 'Gallery', href: '#gallery' },
  { name: 'Tournaments', href: '#tournaments' },
  { name: 'Shop', href: '#shop' },
  { name: 'Blogs & News', href: '#news' },
  { name: 'Partners', href: '#partners' },
  { name: 'Contact Us', href: '#contact' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === '/';
  const { getTotalItems } = useCartStore();

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleSections = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visibleSections[0]?.target.id) {
          setActiveSection(visibleSections[0].target.id);
        }
      },
      {
        root: null,
        threshold: [0.2, 0.35, 0.5, 0.65],
        rootMargin: '-20% 0px -55% 0px',
      }
    );

    const sectionIds = ['home', 'our-story', 'team', 'impact', 'gallery', 'tournaments', 'shop', 'news', 'partners', 'contact'];

    sectionIds.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, []);

  const handleLinkClick = (href: string) => {
    setActiveSection(href.replace('#', ''));
    setIsOpen(false);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled ? 'bg-offwhite/90 backdrop-blur-md shadow-md py-3' : 'bg-transparent py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <Link href="#home" className="flex items-center space-x-2 text-wood hover:opacity-90 transition-opacity">
            <Image
              src="/images/chess_logo.png"
              alt="Jumuiya Chess Logo"
              width={40}
              height={40}
              className="h-10 w-10 object-contain"
            />
            <span className="font-serif text-xl font-bold tracking-tight text-charcoal">
              Jumuiya <span className="text-wood">Chess</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-2.5">
            {NAV_LINKS.map((link) => {
              const isActive = isHome && activeSection === link.href.slice(1);
              const finalHref = isHome ? link.href : `/${link.href}`;
              return (
                <a
                  key={link.name}
                  href={finalHref}
                  aria-current={isActive ? 'page' : undefined}
                  className={`relative px-3.5 py-1.5 rounded-xl font-sans text-xs font-semibold transition-all duration-300 ${
                    isActive
                      ? 'bg-[#6B4A34] text-white shadow-sm font-bold scale-[1.02]'
                      : 'text-charcoal/80 hover:text-[#6B4A34] hover:bg-[#6B4A34]/10 hover:scale-105 active:scale-95'
                  }`}
                  onClick={() => handleLinkClick(link.href)}
                >
                  {link.name}
                </a>
              );
            })}
          </nav>

          <div className="flex items-center space-x-4 lg:space-x-0">
            {/* Cart Icon (Visible on both Mobile and Desktop) */}
            <Link 
              href="/store" 
              className={`relative p-2 transition-colors lg:ml-6 ${scrolled ? 'text-charcoal hover:text-[#6B4A34]' : 'text-charcoal hover:text-[#6B4A34]'}`}
            >
              <ShoppingBag className="w-5 h-5" />
              {mounted && getTotalItems() > 0 && (
                <span className="absolute top-0 right-0 translate-x-1/4 -translate-y-1/4 bg-[#6B4A34] text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow-sm">
                  {getTotalItems()}
                </span>
              )}
            </Link>

            {/* Mobile Hamburger Toggle Button (Styled High-Visibility Pill) */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2.5 rounded-full bg-[#6B4A34] text-white shadow-lg hover:bg-[#573b29] transition-all flex items-center justify-center border border-white/20 active:scale-95"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-5 w-5 text-white" /> : <Menu className="h-5 w-5 text-white" />}
            </button>
          </div>
        </div>
      </header>

      {/* Full Mobile Navigation Menu Overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-[#16171A]/95 backdrop-blur-xl flex flex-col justify-between p-6 text-white animate-fade-in overflow-y-auto">
          {/* Mobile Menu Header */}
          <div className="flex items-center justify-between pb-6 border-b border-white/10">
            <div className="flex items-center space-x-2">
              <Image
                src="/images/chess_logo.png"
                alt="Jumuiya Chess Logo"
                width={36}
                height={36}
                className="h-9 w-9 object-contain"
              />
              <span className="font-serif text-lg font-bold tracking-tight text-white">
                Jumuiya <span className="text-[#C8B195]">Chess</span>
              </span>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors border border-white/15"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Nav Links */}
          <div className="py-8 flex flex-col space-y-4 my-auto">
            {NAV_LINKS.map((link) => {
              const isActive = isHome && activeSection === link.href.slice(1);
              const finalHref = isHome ? link.href : `/${link.href}`;
              return (
                <a
                  key={link.name}
                  href={finalHref}
                  onClick={() => handleLinkClick(finalHref)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex items-center justify-between p-3.5 rounded-2xl font-serif text-xl font-bold transition-all ${
                    isActive
                      ? 'bg-[#C8B195] text-[#16171A] shadow-lg pl-5'
                      : 'text-stone-200 hover:text-[#C8B195] hover:bg-white/5'
                  }`}
                >
                  <span>{link.name}</span>
                  {isActive && <Sparkles className="w-5 h-5 text-[#16171A]" />}
                </a>
              );
            })}
          </div>

          {/* Footer Call to Action in Mobile Menu */}
          <div className="pt-6 border-t border-white/10 space-y-3">
            <a
              href="#contact"
              onClick={() => setIsOpen(false)}
              className="w-full py-3.5 rounded-xl bg-[#6B4A34] text-white font-sans text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg hover:bg-[#573b29] transition-all"
            >
              <span>Get In Touch</span>
              <ArrowRight className="w-4 h-4" />
            </a>
            <p className="text-[10px] text-center text-stone-400 font-mono">
              Jumuiya Chess &bull; Powered by The Gift of Chess Africa
            </p>
          </div>
        </div>
      )}
    </>
  );
}
