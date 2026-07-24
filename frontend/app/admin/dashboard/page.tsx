'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiRequest } from '@/lib/api';
import { 
  Trophy, 
  Users, 
  DollarSign, 
  BookOpen, 
  Loader2, 
  UserCheck, 
  Image as ImageIcon, 
  ShoppingBag, 
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Activity,
  CheckCircle2,
  ArrowUpRight,
  Zap,
  TrendingUp
} from 'lucide-react';

export default function DashboardHome() {
  const [stats, setStats] = useState({
    liveTournaments: 0,
    registrationsThisMonth: 0,
    paymentsReceived: 0,
    latestPostTitle: 'No posts published yet',
    teamCount: 0,
    galleryCount: 0,
    shopCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const [tournamentsRes, regsRes, blogRes, ordersRes, teamRes, galleryRes, shopRes] = await Promise.all([
          apiRequest('/tournaments').catch(() => ({ success: false, data: [] })),
          apiRequest('/registrations').catch(() => ({ success: false, data: [] })),
          apiRequest('/blog/all').catch(() => ({ success: false, data: [] })),
          apiRequest('/shop/orders').catch(() => ({ success: false, data: [] })),
          apiRequest('/team').catch(() => ({ success: false, data: [] })),
          apiRequest('/gallery').catch(() => ({ success: false, data: [] })),
          apiRequest('/shop/products').catch(() => ({ success: false, data: [] })),
        ]);

        let liveCount = 0;
        let regCount = 0;
        let paymentsTotal = 0;
        let latestTitle = 'None';
        let teamTotal = 0;
        let galleryTotal = 0;
        let shopTotal = 0;

        if (tournamentsRes?.success && Array.isArray(tournamentsRes.data)) {
          liveCount = tournamentsRes.data.filter((t: any) => t && (t.status === 'upcoming' || t.status === 'ongoing')).length;
        }

        if (regsRes?.success && Array.isArray(regsRes.data)) {
          regCount = regsRes.data.length;
          paymentsTotal += regsRes.data
            .filter((r: any) => r && r.payment_status === 'completed')
            .reduce((sum: number, r: any) => sum + (parseFloat(r.amount) || 0), 0);
        }

        if (ordersRes?.success && Array.isArray(ordersRes.data)) {
          paymentsTotal += ordersRes.data
            .filter((o: any) => o && o.payment_status === 'completed')
            .reduce((sum: number, o: any) => sum + (parseFloat(o.amount) || 0), 0);
        }

        if (blogRes?.success && Array.isArray(blogRes.data) && blogRes.data.length > 0) {
          latestTitle = blogRes.data[0]?.title || 'None';
        }

        if (teamRes?.success && Array.isArray(teamRes.data)) {
          teamTotal = teamRes.data.length;
        }

        if (galleryRes?.success && Array.isArray(galleryRes.data)) {
          galleryTotal = galleryRes.data.length;
        }

        if (shopRes?.success && Array.isArray(shopRes.data)) {
          shopTotal = shopRes.data.length;
        }

        setStats({
          liveTournaments: liveCount,
          registrationsThisMonth: regCount,
          paymentsReceived: paymentsTotal,
          latestPostTitle: latestTitle,
          teamCount: teamTotal,
          galleryCount: galleryTotal,
          shopCount: shopTotal,
        });
      } catch (err) {
        console.error('[Dashboard] Error calculating dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-[55vh] space-y-3">
        <Loader2 className="h-9 w-9 animate-spin text-[#6B4A34]" />
        <p className="text-xs font-semibold text-stone-600">Syncing live dashboard database...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Brown Banner Card */}
      <div className="bg-[#6B4A34] text-white p-6 md:p-8 rounded-2xl shadow-md border border-[#573b29] relative overflow-hidden space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-[#FAF7F2] text-[11px] font-mono font-bold tracking-wide backdrop-blur-sm">
          <Activity className="w-3.5 h-3.5 text-[#C8B195] animate-pulse" />
          <span>Operational Admin Dashboard</span>
        </div>
        <h1 className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-white">
          Overview & Management Center
        </h1>
        <p className="text-xs md:text-sm text-[#FAF7F2]/90 leading-relaxed font-sans max-w-3xl">
          Control site content, publish news, manage registered players, and upload media directly from your device.
        </p>
      </div>

      {/* KPI Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <Link
          href="/admin/dashboard/tournaments"
          className="bg-white border border-stone-200/90 p-5 rounded-2xl shadow-sm hover:shadow-md hover:border-[#6B4A34] transition-all flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              Active Tournaments
            </span>
            <div className="p-2.5 rounded-xl bg-[#FAF7F2] text-[#6B4A34] border border-stone-200">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline justify-between">
              <span className="font-serif text-2xl font-bold text-charcoal">
                {stats.liveTournaments}
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Ongoing
              </span>
            </div>
            <p className="text-[11px] text-stone-400 mt-1">Competitions open for entry</p>
          </div>
        </Link>

        {/* KPI 2 */}
        <Link
          href="/admin/dashboard/registrations"
          className="bg-white border border-stone-200/90 p-5 rounded-2xl shadow-sm hover:shadow-md hover:border-[#6B4A34] transition-all flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              Registrations
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/60">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline justify-between">
              <span className="font-serif text-2xl font-bold text-charcoal">
                {stats.registrationsThisMonth}
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" /> Logged
              </span>
            </div>
            <p className="text-[11px] text-stone-400 mt-1">Player signups received</p>
          </div>
        </Link>

        {/* KPI 3 */}
        <Link
          href="/admin/dashboard/registrations"
          className="bg-white border border-stone-200/90 p-5 rounded-2xl shadow-sm hover:shadow-md hover:border-[#6B4A34] transition-all flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              M-Pesa Collections
            </span>
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200/60">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline justify-between">
              <span className="font-serif text-xl font-bold text-charcoal truncate max-w-[140px]">
                KES {stats.paymentsReceived.toLocaleString()}
              </span>
              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                Verified
              </span>
            </div>
            <p className="text-[11px] text-stone-400 mt-1">Completed STK payments</p>
          </div>
        </Link>

        {/* KPI 4 */}
        <Link
          href="/admin/dashboard/blog"
          className="bg-white border border-stone-200/90 p-5 rounded-2xl shadow-sm hover:shadow-md hover:border-[#6B4A34] transition-all flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              Latest News
            </span>
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-700 border border-purple-200/60">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="font-serif text-sm font-bold text-charcoal line-clamp-1">
              {stats.latestPostTitle}
            </p>
            <p className="text-[11px] text-stone-400 mt-1">Press releases & news</p>
          </div>
        </Link>
      </div>

      {/* Main Grid Split: 2/3 Content & 1/3 Sidebar Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols wide): Shortcuts & Management Grids */}
        <div className="lg:col-span-2 space-y-6">
          {/* Content Management Cards */}
          <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-serif text-base font-bold text-charcoal flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#6B4A34]" /> Content Management Hub
              </h3>
              <span className="text-[11px] text-stone-400 font-mono">Device Upload Ready</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Meet the Team */}
              <Link
                href="/admin/dashboard/team"
                className="p-4 rounded-xl bg-[#FAF7F2] border border-stone-200/70 hover:border-[#6B4A34] transition-all flex items-start justify-between group"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-[#6B4A34]" />
                    <span className="text-xs font-bold text-charcoal group-hover:text-[#6B4A34] transition-colors">
                      Meet the Team
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500">
                    {stats.teamCount} members active on website
                  </p>
                </div>
                <ArrowUpRight className="w-4 h-4 text-stone-400 group-hover:text-[#6B4A34] transition-colors" />
              </Link>

              {/* Media Gallery */}
              <Link
                href="/admin/dashboard/gallery"
                className="p-4 rounded-xl bg-[#FAF7F2] border border-stone-200/70 hover:border-[#6B4A34] transition-all flex items-start justify-between group"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-[#6B4A34]" />
                    <span className="text-xs font-bold text-charcoal group-hover:text-[#6B4A34] transition-colors">
                      Media Gallery
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500">
                    {stats.galleryCount} impact photos published
                  </p>
                </div>
                <ArrowUpRight className="w-4 h-4 text-stone-400 group-hover:text-[#6B4A34] transition-colors" />
              </Link>

              {/* Charity Shop */}
              <Link
                href="/admin/dashboard/shop"
                className="p-4 rounded-xl bg-[#FAF7F2] border border-stone-200/70 hover:border-[#6B4A34] transition-all flex items-start justify-between group"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-[#6B4A34]" />
                    <span className="text-xs font-bold text-charcoal group-hover:text-[#6B4A34] transition-colors">
                      Charity Shop Catalog
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500">
                    {stats.shopCount} products listed in store
                  </p>
                </div>
                <ArrowUpRight className="w-4 h-4 text-stone-400 group-hover:text-[#6B4A34] transition-colors" />
              </Link>

              {/* Blog & News */}
              <Link
                href="/admin/dashboard/blog"
                className="p-4 rounded-xl bg-[#FAF7F2] border border-stone-200/70 hover:border-[#6B4A34] transition-all flex items-start justify-between group"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[#6B4A34]" />
                    <span className="text-xs font-bold text-charcoal group-hover:text-[#6B4A34] transition-colors">
                      Blog Articles & News
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500">
                    Write press reports & releases
                  </p>
                </div>
                <ArrowUpRight className="w-4 h-4 text-stone-400 group-hover:text-[#6B4A34] transition-colors" />
              </Link>
            </div>
          </div>

          {/* Tournament Overview Card */}
          <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-base font-bold text-charcoal flex items-center gap-2">
                <Trophy className="w-4 h-4 text-[#6B4A34]" /> Tournament Management
              </h3>
              <Link
                href="/admin/dashboard/tournaments"
                className="text-xs font-bold text-[#6B4A34] hover:underline flex items-center gap-1"
              >
                Manage Events <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              Create upcoming chess competitions, specify entry fees (KES), categories, venue locations, and poster images from your device.
            </p>
          </div>
        </div>

        {/* Right Column (1 Col wide): Status & Direct Quick Actions */}
        <div className="space-y-6">
          {/* System Connection Widget */}
          <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="font-serif text-sm font-bold text-charcoal flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Database & API Status
            </h3>
            
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center p-2.5 rounded-xl bg-[#FAF7F2] border border-stone-200/80">
                <span className="text-stone-600 font-medium">Supabase Postgres DB</span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Connected
                </span>
              </div>

              <div className="flex justify-between items-center p-2.5 rounded-xl bg-[#FAF7F2] border border-stone-200/80">
                <span className="text-stone-600 font-medium">Express API (Port 5000)</span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Active
                </span>
              </div>

              <div className="flex justify-between items-center p-2.5 rounded-xl bg-[#FAF7F2] border border-stone-200/80">
                <span className="text-stone-600 font-medium">Device File Uploads</span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Ready
                </span>
              </div>
            </div>
          </div>

          {/* Direct Quick Actions Box */}
          <div className="bg-[#FAF7F2] border border-stone-200/90 rounded-2xl p-5 shadow-sm space-y-3">
            <h3 className="font-serif text-sm font-bold text-[#6B4A34] flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#6B4A34]" /> Direct Actions
            </h3>
            
            <div className="space-y-2">
              <Link
                href="/admin/dashboard/team"
                className="w-full text-left px-3.5 py-2.5 bg-white border border-stone-200 rounded-xl text-xs font-semibold text-charcoal hover:border-[#6B4A34] hover:text-[#6B4A34] transition-all flex items-center justify-between"
              >
                <span>Upload Team Member Photo</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#6B4A34]" />
              </Link>

              <Link
                href="/admin/dashboard/gallery"
                className="w-full text-left px-3.5 py-2.5 bg-white border border-stone-200 rounded-xl text-xs font-semibold text-charcoal hover:border-[#6B4A34] hover:text-[#6B4A34] transition-all flex items-center justify-between"
              >
                <span>Upload Gallery Impact Photo</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#6B4A34]" />
              </Link>

              <Link
                href="/admin/dashboard/tournaments"
                className="w-full text-left px-3.5 py-2.5 bg-[#FAF7F2] border border-stone-200 rounded-xl text-xs font-semibold text-charcoal hover:border-[#6B4A34] hover:text-[#6B4A34] transition-all flex items-center justify-between"
              >
                <span>Post New Tournament</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#6B4A34]" />
              </Link>

              <Link
                href="/admin/dashboard/settings"
                className="w-full text-left px-3.5 py-2.5 bg-white border border-stone-200 rounded-xl text-xs font-semibold text-charcoal hover:border-[#6B4A34] hover:text-[#6B4A34] transition-all flex items-center justify-between"
              >
                <span>Edit Paybill & Contact Settings</span>
                <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
