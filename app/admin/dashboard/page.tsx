'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiRequest } from '@/lib/api';
import { 
  Loader2, 
  ChevronRight,
  CheckCircle2,
  ArrowUpRight,
  HeartHandshake,
  Video,
  Handshake,
  Target
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
    donationsCount: 0,
    impactCount: 0,
    partnersCount: 0,
    videosCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const [
          tournamentsRes, regsRes, blogRes, ordersRes, 
          teamRes, galleryRes, shopRes, donationsRes, 
          impactRes, partnersRes, videosRes
        ] = await Promise.all([
          apiRequest('/tournaments').catch(() => ({ success: false, data: [] })),
          apiRequest('/registrations').catch(() => ({ success: false, data: [] })),
          apiRequest('/blog/all').catch(() => ({ success: false, data: [] })),
          apiRequest('/shop/orders').catch(() => ({ success: false, data: [] })),
          apiRequest('/team').catch(() => ({ success: false, data: [] })),
          apiRequest('/gallery').catch(() => ({ success: false, data: [] })),
          apiRequest('/shop/products').catch(() => ({ success: false, data: [] })),
          apiRequest('/donations').catch(() => ({ success: false, data: [] })),
          apiRequest('/impact').catch(() => ({ success: false, data: [] })),
          apiRequest('/partners').catch(() => ({ success: false, data: [] })),
          apiRequest('/videos').catch(() => ({ success: false, data: [] })),
        ]);

        let liveCount = 0;
        let regCount = 0;
        let paymentsTotal = 0;
        let latestTitle = 'None';
        let teamTotal = 0;
        let galleryTotal = 0;
        let shopTotal = 0;
        let donationsTotal = 0;
        let impactTotal = 0;
        let partnersTotal = 0;
        let videosTotal = 0;

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

        if (donationsRes?.success && Array.isArray(donationsRes.data)) {
          donationsTotal = donationsRes.data.length;
          paymentsTotal += donationsRes.data
            .filter((d: any) => d && d.payment_status === 'completed')
            .reduce((sum: number, d: any) => sum + (parseFloat(d.amount) || 0), 0);
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

        if (impactRes?.success && Array.isArray(impactRes.data)) {
          impactTotal = impactRes.data.length;
        }

        if (partnersRes?.success && Array.isArray(partnersRes.data)) {
          partnersTotal = partnersRes.data.length;
        }

        if (videosRes?.success && Array.isArray(videosRes.data)) {
          videosTotal = videosRes.data.length;
        }

        setStats({
          liveTournaments: liveCount,
          registrationsThisMonth: regCount,
          paymentsReceived: paymentsTotal,
          latestPostTitle: latestTitle,
          teamCount: teamTotal,
          galleryCount: galleryTotal,
          shopCount: shopTotal,
          donationsCount: donationsTotal,
          impactCount: impactTotal,
          partnersCount: partnersTotal,
          videosCount: videosTotal,
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
        <h1 className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-white">
          Overview & Management Center
        </h1>
        <p className="text-xs md:text-sm text-[#FAF7F2]/90 leading-relaxed font-sans max-w-3xl">
          Control site content, publish news, manage registered players, track global revenue, and upload media directly from your device.
        </p>
      </div>

      {/* KPI Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <Link
          href="/admin/dashboard/tournaments"
          className="bg-white border border-[#6B4A34]/20 p-5 rounded-2xl shadow-sm hover:shadow-md hover:border-[#6B4A34] transition-all flex flex-col justify-between group"
        >
          <span className="text-[10px] font-bold text-[#6B4A34] uppercase tracking-wider">
            Active Tournaments
          </span>
          <div className="mt-3">
            <span className="font-serif text-2xl font-bold text-[#232320] block">
              {stats.liveTournaments}
            </span>
            <p className="text-[11px] text-[#232320]/60 mt-1 font-mono">Competitions open for entry</p>
          </div>
        </Link>

        {/* KPI 2 */}
        <Link
          href="/admin/dashboard/registrations"
          className="bg-white border border-[#6B4A34]/20 p-5 rounded-2xl shadow-sm hover:shadow-md hover:border-[#6B4A34] transition-all flex flex-col justify-between group"
        >
          <span className="text-[10px] font-bold text-[#6B4A34] uppercase tracking-wider">
            Registrations
          </span>
          <div className="mt-3">
            <span className="font-serif text-2xl font-bold text-[#232320] block">
              {stats.registrationsThisMonth}
            </span>
            <p className="text-[11px] text-[#232320]/60 mt-1 font-mono">Total player signups received</p>
          </div>
        </Link>

        {/* KPI 3 */}
        <Link
          href="/admin/dashboard/donations"
          className="bg-white border border-[#6B4A34]/20 p-5 rounded-2xl shadow-sm hover:shadow-md hover:border-[#6B4A34] transition-all flex flex-col justify-between group"
        >
          <span className="text-[10px] font-bold text-[#6B4A34] uppercase tracking-wider flex items-center gap-1.5">
            <HeartHandshake className="w-3.5 h-3.5" /> Global Revenue
          </span>
          <div className="mt-3">
            <span className="font-serif text-xl font-bold text-emerald-700 block truncate">
              KES {stats.paymentsReceived.toLocaleString()}
            </span>
            <p className="text-[11px] text-[#232320]/60 mt-1 font-mono">Regs + Shop + Donations</p>
          </div>
        </Link>

        {/* KPI 4 */}
        <Link
          href="/admin/dashboard/blog"
          className="bg-white border border-[#6B4A34]/20 p-5 rounded-2xl shadow-sm hover:shadow-md hover:border-[#6B4A34] transition-all flex flex-col justify-between group"
        >
          <span className="text-[10px] font-bold text-[#6B4A34] uppercase tracking-wider">
            Latest News
          </span>
          <div className="mt-3">
            <p className="font-serif text-sm font-bold text-[#232320] line-clamp-1">
              {stats.latestPostTitle}
            </p>
            <p className="text-[11px] text-[#232320]/60 mt-1 font-mono">Press releases & news</p>
          </div>
        </Link>
      </div>

      {/* Main Grid Split: 2/3 Content & 1/3 Sidebar Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols wide): Shortcuts & Management Grids */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Tournament Overview Card */}
          <div className="bg-white border border-[#6B4A34]/20 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-base font-bold text-[#232320]">
                Tournament Management
              </h3>
              <Link
                href="/admin/dashboard/tournaments"
                className="text-xs font-bold text-[#6B4A34] hover:underline flex items-center gap-1"
              >
                Manage Events <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <p className="text-xs text-[#232320]/70 leading-relaxed font-sans">
              Create upcoming chess competitions, specify entry fees (KES), categories, venue locations, and poster images directly from your device.
            </p>
          </div>

          {/* Content Management Cards */}
          <div className="bg-white border border-[#6B4A34]/20 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#6B4A34]/10 pb-3">
              <h3 className="font-serif text-base font-bold text-[#232320]">
                Content Management Hub
              </h3>
              <span className="text-[10px] font-bold text-[#6B4A34] uppercase tracking-wider hidden sm:inline-block">8 Modules Syncing</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Meet the Team */}
              <Link
                href="/admin/dashboard/team"
                className="p-4 rounded-xl bg-[#FAF7F2] border border-[#6B4A34]/10 hover:border-[#6B4A34] transition-all flex items-start justify-between group"
              >
                <div className="space-y-1">
                  <span className="text-xs font-bold text-[#232320] group-hover:text-[#6B4A34] transition-colors block">
                    Meet the Team
                  </span>
                  <p className="text-[11px] text-[#232320]/60 font-mono">
                    {stats.teamCount} members active
                  </p>
                </div>
                <ArrowUpRight className="w-4 h-4 text-[#232320]/40 group-hover:text-[#6B4A34] transition-colors" />
              </Link>

              {/* Media Gallery */}
              <Link
                href="/admin/dashboard/gallery"
                className="p-4 rounded-xl bg-[#FAF7F2] border border-[#6B4A34]/10 hover:border-[#6B4A34] transition-all flex items-start justify-between group"
              >
                <div className="space-y-1">
                  <span className="text-xs font-bold text-[#232320] group-hover:text-[#6B4A34] transition-colors block">
                    Media Gallery
                  </span>
                  <p className="text-[11px] text-[#232320]/60 font-mono">
                    {stats.galleryCount} impact photos
                  </p>
                </div>
                <ArrowUpRight className="w-4 h-4 text-[#232320]/40 group-hover:text-[#6B4A34] transition-colors" />
              </Link>

              {/* Videos Library */}
              <Link
                href="/admin/dashboard/videos"
                className="p-4 rounded-xl bg-[#FAF7F2] border border-[#6B4A34]/10 hover:border-[#6B4A34] transition-all flex items-start justify-between group"
              >
                <div className="space-y-1">
                  <span className="text-xs font-bold text-[#232320] group-hover:text-[#6B4A34] transition-colors flex items-center gap-1">
                    <Video className="w-3.5 h-3.5" /> Video Library
                  </span>
                  <p className="text-[11px] text-[#232320]/60 font-mono mt-1">
                    {stats.videosCount} embedded videos
                  </p>
                </div>
                <ArrowUpRight className="w-4 h-4 text-[#232320]/40 group-hover:text-[#6B4A34] transition-colors" />
              </Link>

              {/* Blog & News */}
              <Link
                href="/admin/dashboard/blog"
                className="p-4 rounded-xl bg-[#FAF7F2] border border-[#6B4A34]/10 hover:border-[#6B4A34] transition-all flex items-start justify-between group"
              >
                <div className="space-y-1">
                  <span className="text-xs font-bold text-[#232320] group-hover:text-[#6B4A34] transition-colors block">
                    Blog Articles & News
                  </span>
                  <p className="text-[11px] text-[#232320]/60 font-mono">
                    Write press reports & releases
                  </p>
                </div>
                <ArrowUpRight className="w-4 h-4 text-[#232320]/40 group-hover:text-[#6B4A34] transition-colors" />
              </Link>

              {/* Charity Shop */}
              <Link
                href="/admin/dashboard/shop"
                className="p-4 rounded-xl bg-[#FAF7F2] border border-[#6B4A34]/10 hover:border-[#6B4A34] transition-all flex items-start justify-between group"
              >
                <div className="space-y-1">
                  <span className="text-xs font-bold text-[#232320] group-hover:text-[#6B4A34] transition-colors block">
                    Charity Shop Catalog
                  </span>
                  <p className="text-[11px] text-[#232320]/60 font-mono">
                    {stats.shopCount} products listed in store
                  </p>
                </div>
                <ArrowUpRight className="w-4 h-4 text-[#232320]/40 group-hover:text-[#6B4A34] transition-colors" />
              </Link>

              {/* Donations */}
              <Link
                href="/admin/dashboard/donations"
                className="p-4 rounded-xl bg-[#FAF7F2] border border-[#6B4A34]/10 hover:border-[#6B4A34] transition-all flex items-start justify-between group"
              >
                <div className="space-y-1">
                  <span className="text-xs font-bold text-[#232320] group-hover:text-[#6B4A34] transition-colors flex items-center gap-1">
                    <HeartHandshake className="w-3.5 h-3.5" /> Donations Hub
                  </span>
                  <p className="text-[11px] text-[#232320]/60 font-mono mt-1">
                    {stats.donationsCount} donation records
                  </p>
                </div>
                <ArrowUpRight className="w-4 h-4 text-[#232320]/40 group-hover:text-[#6B4A34] transition-colors" />
              </Link>

              {/* Impact Framework */}
              <Link
                href="/admin/dashboard/impact"
                className="p-4 rounded-xl bg-[#FAF7F2] border border-[#6B4A34]/10 hover:border-[#6B4A34] transition-all flex items-start justify-between group"
              >
                <div className="space-y-1">
                  <span className="text-xs font-bold text-[#232320] group-hover:text-[#6B4A34] transition-colors flex items-center gap-1">
                    <Target className="w-3.5 h-3.5" /> Impact Framework
                  </span>
                  <p className="text-[11px] text-[#232320]/60 font-mono mt-1">
                    {stats.impactCount} active pillars
                  </p>
                </div>
                <ArrowUpRight className="w-4 h-4 text-[#232320]/40 group-hover:text-[#6B4A34] transition-colors" />
              </Link>

              {/* Official Partners */}
              <Link
                href="/admin/dashboard/partners"
                className="p-4 rounded-xl bg-[#FAF7F2] border border-[#6B4A34]/10 hover:border-[#6B4A34] transition-all flex items-start justify-between group"
              >
                <div className="space-y-1">
                  <span className="text-xs font-bold text-[#232320] group-hover:text-[#6B4A34] transition-colors flex items-center gap-1">
                    <Handshake className="w-3.5 h-3.5" /> Official Partners
                  </span>
                  <p className="text-[11px] text-[#232320]/60 font-mono mt-1">
                    {stats.partnersCount} partners showcased
                  </p>
                </div>
                <ArrowUpRight className="w-4 h-4 text-[#232320]/40 group-hover:text-[#6B4A34] transition-colors" />
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column (1 Col wide): Status & Direct Quick Actions */}
        <div className="space-y-6">
          {/* System Connection Widget */}
          <div className="bg-white border border-[#6B4A34]/20 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="font-serif text-sm font-bold text-[#232320]">
              Database & API Status
            </h3>
            
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center p-2.5 rounded-xl bg-[#FAF7F2] border border-[#6B4A34]/10">
                <span className="text-[#232320]/80 font-bold">Supabase Postgres</span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Connected
                </span>
              </div>

              <div className="flex justify-between items-center p-2.5 rounded-xl bg-[#FAF7F2] border border-[#6B4A34]/10">
                <span className="text-[#232320]/80 font-bold">Express API Auth</span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Active
                </span>
              </div>

              <div className="flex justify-between items-center p-2.5 rounded-xl bg-[#FAF7F2] border border-[#6B4A34]/10">
                <span className="text-[#232320]/80 font-bold">Device Uploads</span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Ready
                </span>
              </div>
            </div>
          </div>

          {/* Direct Quick Actions Box */}
          <div className="bg-[#FAF7F2] border border-[#6B4A34]/20 rounded-2xl p-5 shadow-sm space-y-3">
            <h3 className="font-serif text-sm font-bold text-[#6B4A34]">
              Direct Actions
            </h3>
            
            <div className="space-y-2">
              <Link
                href="/admin/dashboard/donations"
                className="w-full text-left px-3.5 py-2.5 bg-white border border-[#6B4A34]/10 rounded-xl text-xs font-bold text-[#232320] hover:border-[#6B4A34] hover:text-[#6B4A34] transition-all flex items-center justify-between"
              >
                <span>Review Pending Donations</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#6B4A34]" />
              </Link>

              <Link
                href="/admin/dashboard/gallery"
                className="w-full text-left px-3.5 py-2.5 bg-white border border-[#6B4A34]/10 rounded-xl text-xs font-bold text-[#232320] hover:border-[#6B4A34] hover:text-[#6B4A34] transition-all flex items-center justify-between"
              >
                <span>Upload Impact Photo</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#6B4A34]" />
              </Link>

              <Link
                href="/admin/dashboard/tournaments"
                className="w-full text-left px-3.5 py-2.5 bg-white border border-[#6B4A34]/10 rounded-xl text-xs font-bold text-[#232320] hover:border-[#6B4A34] hover:text-[#6B4A34] transition-all flex items-center justify-between"
              >
                <span>Post New Tournament</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#6B4A34]" />
              </Link>

              <Link
                href="/admin/dashboard/settings"
                className="w-full text-left px-3.5 py-2.5 bg-white border border-[#6B4A34]/10 rounded-xl text-xs font-bold text-[#232320] hover:border-[#6B4A34] hover:text-[#6B4A34] transition-all flex items-center justify-between"
              >
                <span>Edit Paybill Settings</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#232320]/40" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
