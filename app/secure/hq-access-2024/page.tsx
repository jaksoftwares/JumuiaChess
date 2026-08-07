'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Loader2, Key } from 'lucide-react';
import Image from 'next/image';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Fallback helper using environment variables for bypass
      const envAdminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
      const envAdminPass = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

      if (
        envAdminEmail && envAdminPass &&
        email === envAdminEmail && password === envAdminPass
      ) {
        document.cookie = 'admin-session=true; path=/; max-age=86400';
        router.push('/admin/dashboard');
        return;
      }

      setErrorMsg(error.message || 'Authentication failed. Please verify credentials.');
      setLoading(false);
    } else {
      document.cookie = 'admin-session=true; path=/; max-age=86400';
      router.push('/admin/dashboard');
    }
  };

  return (
    <main className="min-h-screen bg-offwhite flex items-center justify-center p-6 relative">
      {/* Background blobs */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-sage/5 rounded-full filter blur-2xl" />
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-wood/5 rounded-full filter blur-2xl" />

      <div className="bg-offwhite border border-stone/30 rounded-lg shadow-md p-8 max-w-md w-full space-y-8 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-stone/5 border border-stone/20 rounded-full mb-2">
            <Image
              src="/images/chess_logo.png"
              alt="Jumuiya Chess Logo"
              width={40}
              height={40}
              className="h-10 w-10 object-contain"
            />
          </div>
          <h1 className="font-serif text-2xl font-bold text-charcoal">
            Admin Console
          </h1>
          <p className="font-sans text-xs text-charcoal/50">
            Sign in with administrative privileges to manage site content and payments.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block font-sans text-xs font-semibold text-charcoal/70 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@jumuiyachess.org"
              className="w-full bg-offwhite border border-stone/30 p-2.5 rounded text-sm text-charcoal focus:outline-none focus:border-wood"
            />
          </div>

          <div>
            <label className="block font-sans text-xs font-semibold text-charcoal/70 mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-offwhite border border-stone/30 p-2.5 rounded text-sm text-charcoal focus:outline-none focus:border-wood"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 py-3 bg-wood text-offwhite font-sans text-sm font-semibold rounded hover:bg-wood/90 transition-colors flex items-center justify-center space-x-2 shadow-sm"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Logging in...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        {/* UI Hint Removed */}
      </div>
    </main>
  );
}
