'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import {
  LayoutDashboard,
  Trophy,
  Users,
  Image as ImageIcon,
  BookOpen,
  ShoppingBag,
  Settings as SettingsIcon,
  LogOut,
  Menu,
  X,
  Handshake
} from 'lucide-react';
import Image from 'next/image';

const MENU_ITEMS = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Tournaments', href: '/admin/dashboard/tournaments', icon: Trophy },
  { name: 'Registrations & Payments', href: '/admin/dashboard/registrations', icon: Users },
  { name: 'Partners', href: '/admin/dashboard/partners', icon: Handshake },
  { name: 'Gallery', href: '/admin/dashboard/gallery', icon: ImageIcon },
  { name: 'Blog', href: '/admin/dashboard/blog', icon: BookOpen },
  { name: 'Shop', href: '/admin/dashboard/shop', icon: ShoppingBag },
  { name: 'Settings', href: '/admin/dashboard/settings', icon: SettingsIcon },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    // Delete dev cookie session
    document.cookie = 'admin-session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
    router.push('/admin/login');
  };

  return (
    <div className="min-h-screen bg-stone/10 flex flex-col md:flex-row">
      {/* Mobile Top bar */}
      <div className="md:hidden bg-charcoal text-offwhite flex justify-between items-center px-6 py-4 shadow-md">
        <div className="flex items-center space-x-2">
          <Image
            src="/images/chess_logo.png"
            alt="Jumuiya Chess Logo"
            width={20}
            height={20}
            className="h-5 w-5 object-contain"
          />
          <span className="font-serif font-bold text-sm tracking-wide">Jumuiya Chess Admin</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-stone hover:text-offwhite focus:outline-none"
        >
          {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar navigation */}
      <aside
        className={`${
          sidebarOpen ? 'block' : 'hidden'
        } md:block bg-charcoal text-offwhite w-full md:w-64 shrink-0 border-r border-stone/20 flex flex-col justify-between p-6 transition-all duration-300 z-30`}
      >
        <div className="space-y-8">
          {/* Logo */}
          <div className="hidden md:flex items-center space-x-2 text-stone border-b border-stone/10 pb-4">
            <Image
              src="/images/chess_logo.png"
              alt="Jumuiya Chess Logo"
              width={24}
              height={24}
              className="h-6 w-6 object-contain"
            />
            <span className="font-serif text-lg font-bold tracking-tight">
              Jumuiya <span className="text-sage">Admin</span>
            </span>
          </div>

          {/* Navigation Menu */}
          <nav className="flex flex-col space-y-1">
            {MENU_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded text-sm font-sans font-medium transition-colors ${
                    isActive
                      ? 'bg-wood text-offwhite'
                      : 'text-stone/75 hover:bg-stone/10 hover:text-offwhite'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sign Out Button */}
        <button
          onClick={handleSignOut}
          className="mt-8 flex items-center space-x-3 px-4 py-3 rounded text-sm font-sans font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors w-full border-t border-stone/10 pt-4"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span>Sign Out</span>
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow p-6 md:p-10 max-w-7xl mx-auto w-full overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
