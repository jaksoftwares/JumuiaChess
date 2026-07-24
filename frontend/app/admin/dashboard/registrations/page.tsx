'use client';

import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/api';
import { Registration, ShopOrder, Tournament } from '@/types';
import { Loader2, Filter, ShieldCheck, ShieldAlert, Award, Users, Sparkles } from 'lucide-react';

export default function AdminRegistrations() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [orders, setOrders] = useState<ShopOrder[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [selectedTournamentId, setSelectedTournamentId] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [activeTab, setActiveTab] = useState<'registrations' | 'orders'>('registrations');

  const loadTournaments = async () => {
    const tourneyRes = await apiRequest<Tournament[]>('/tournaments').catch(() => ({ success: false, data: [] }));
    if (tourneyRes?.success && Array.isArray(tourneyRes.data)) {
      setTournaments(tourneyRes.data);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      let regEndpoint = '/registrations';
      const params = [];
      if (selectedTournamentId) params.push(`tournamentId=${selectedTournamentId}`);
      if (selectedStatus) params.push(`status=${selectedStatus}`);
      if (params.length > 0) regEndpoint += `?${params.join('&')}`;

      const [regRes, orderRes] = await Promise.all([
        apiRequest<Registration[]>(regEndpoint).catch(() => ({ success: false, data: [] })),
        apiRequest<ShopOrder[]>('/shop/orders').catch(() => ({ success: false, data: [] })),
      ]);

      if (regRes?.success && Array.isArray(regRes.data)) {
        setRegistrations(regRes.data);
      } else {
        setRegistrations([]);
      }

      if (orderRes?.success && Array.isArray(orderRes.data)) {
        setOrders(orderRes.data);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error('[Registrations Admin] Load error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Tournaments only need to load once
  useEffect(() => { loadTournaments(); }, []);

  // Table data re-fetches when filters change
  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTournamentId, selectedStatus]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            <ShieldCheck className="h-3 w-3 mr-1 text-emerald-600" />
            <span>Completed</span>
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center text-[10px] font-bold text-red-800 bg-red-50 px-2 py-0.5 rounded border border-red-200">
            <ShieldAlert className="h-3 w-3 mr-1 text-red-600" />
            <span>Failed</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
            <span>Pending</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Brown Banner Card */}
      <div className="bg-[#6B4A34] text-white p-6 md:p-8 rounded-2xl shadow-md border border-[#573b29] relative overflow-hidden space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-[#FAF7F2] text-[11px] font-mono font-bold tracking-wide backdrop-blur-sm">
          <Users className="w-3.5 h-3.5 text-[#C8B195]" />
          <span>Transactions & Signups</span>
        </div>
        <h1 className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-white">
          Registrations & M-Pesa Payments
        </h1>
        <p className="text-xs md:text-sm text-[#FAF7F2]/90 leading-relaxed font-sans max-w-3xl">
          Monitor tournament player registrations and online charity shop transactions in real-time.
        </p>
      </div>

      {/* Tab Bar */}
      <div className="flex items-center justify-between">
        <div className="bg-white border border-stone-200 p-1.5 rounded-xl flex space-x-1 shadow-2xs">
          <button
            onClick={() => setActiveTab('registrations')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'registrations' ? 'bg-[#6B4A34] text-white shadow-xs' : 'text-stone-600 hover:text-[#6B4A34]'
            }`}
          >
            Tournament Players
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'orders' ? 'bg-[#6B4A34] text-white shadow-xs' : 'text-stone-600 hover:text-[#6B4A34]'
            }`}
          >
            Shop Orders
          </button>
        </div>
      </div>

      {/* Filters (only for registrations tab) */}
      {activeTab === 'registrations' && (
        <div className="bg-white border border-stone-200 p-5 rounded-2xl flex flex-col md:flex-row gap-4 items-center shadow-sm">
          <div className="flex items-center space-x-2 text-stone-600 text-xs font-bold shrink-0">
            <Filter className="h-4 w-4 text-[#6B4A34]" />
            <span>Filter Transactions:</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            <select
              value={selectedTournamentId}
              onChange={(e) => setSelectedTournamentId(e.target.value)}
              className="bg-white border border-stone-300 p-2.5 rounded-xl text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-[#6B4A34]"
            >
              <option value="">All Tournaments</option>
              {tournaments.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-white border border-stone-300 p-2.5 rounded-xl text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-[#6B4A34]"
            >
              <option value="">All Payment Statuses</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>
      )}

      {/* Main Table Card */}
      <div className="bg-white border border-stone-200 p-6 rounded-2xl shadow-sm overflow-x-auto">
        <div className="flex items-center justify-between border-b border-stone-100 pb-4 mb-4">
          <h2 className="font-serif text-base font-bold text-charcoal flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#6B4A34]" />
            {activeTab === 'registrations' ? `Tournament Registrations (${registrations.length})` : `Shop Checkout Orders (${orders.length})`}
          </h2>
          <span className="text-[11px] font-mono text-stone-400">Synced to Database</span>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-[#6B4A34]" />
          </div>
        ) : activeTab === 'registrations' ? (
          registrations.length === 0 ? (
            <div className="text-center py-16 text-stone-400 text-xs font-sans bg-[#FAF7F2] border border-stone-200 rounded-xl">
              No registrations logged in the database yet.
            </div>
          ) : (
            <table className="w-full text-left border-collapse font-sans text-xs">
              <thead>
                <tr className="border-b border-stone-200 text-stone-500 font-bold uppercase tracking-wider">
                  <th className="pb-3">Player Name</th>
                  <th className="pb-3">Tournament</th>
                  <th className="pb-3">Age</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Phone</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">M-Pesa Receipt</th>
                  <th className="pb-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {registrations.map((reg) => (
                  <tr key={reg.id} className="text-charcoal hover:bg-[#FAF7F2]/60 transition-colors">
                    <td className="py-3.5 font-bold">{reg.player_name}</td>
                    <td className="py-3.5 text-stone-600">
                      {Array.isArray(reg.tournaments)
                        ? reg.tournaments[0]?.name
                        : (typeof reg.tournaments === 'object' && reg.tournaments !== null ? reg.tournaments.name : 'Tournament')}
                    </td>
                    <td className="py-3.5 text-stone-600">{reg.age}</td>
                    <td className="py-3.5">
                      <span className="inline-flex items-center text-[10px] bg-stone-100 text-charcoal px-2 py-0.5 rounded font-medium border border-stone-200">
                        <Award className="h-3 w-3 mr-1 text-[#6B4A34]" />
                        {reg.category}
                      </span>
                    </td>
                    <td className="py-3.5 text-stone-600">{reg.phone_number}</td>
                    <td className="py-3.5 font-bold text-[#6B4A34]">KES {reg.amount}</td>
                    <td className="py-3.5">{getStatusBadge(reg.payment_status)}</td>
                    <td className="py-3.5 font-mono text-[10px] text-stone-600">{reg.mpesa_receipt || '—'}</td>
                    <td className="py-3.5 text-[10px] text-stone-400">
                      {reg.created_at ? new Date(reg.created_at).toLocaleString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        ) : (
          orders.length === 0 ? (
            <div className="text-center py-16 text-stone-400 text-xs font-sans bg-[#FAF7F2] border border-stone-200 rounded-xl">
              No shop orders logged in the database yet.
            </div>
          ) : (
            <table className="w-full text-left border-collapse font-sans text-xs">
              <thead>
                <tr className="border-b border-stone-200 text-stone-500 font-bold uppercase tracking-wider">
                  <th className="pb-3">Customer Name</th>
                  <th className="pb-3">Phone</th>
                  <th className="pb-3">Items Purchased</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">M-Pesa Receipt</th>
                  <th className="pb-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {orders.map((order) => (
                  <tr key={order.id} className="text-charcoal hover:bg-[#FAF7F2]/60 transition-colors">
                    <td className="py-3.5 font-bold">{order.customer_name}</td>
                    <td className="py-3.5 text-stone-600">{order.phone_number}</td>
                    <td className="py-3.5 max-w-[200px] truncate text-stone-600">
                      {Array.isArray(order.items)
                        ? order.items.map((item: any) => `${item.name || 'Item'} (x${item.quantity || 1})`).join(', ')
                        : 'Item'}
                    </td>
                    <td className="py-3.5 font-bold text-[#6B4A34]">KES {order.amount}</td>
                    <td className="py-3.5">{getStatusBadge(order.payment_status)}</td>
                    <td className="py-3.5 font-mono text-[10px] text-stone-600">{order.mpesa_receipt || '—'}</td>
                    <td className="py-3.5 text-[10px] text-stone-400">
                      {order.created_at ? new Date(order.created_at).toLocaleString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        )}
      </div>
    </div>
  );
}
