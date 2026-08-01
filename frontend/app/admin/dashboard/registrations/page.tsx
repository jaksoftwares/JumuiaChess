'use client';

import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/api';
import { Registration, ShopOrder, Tournament } from '@/types';
import { Loader2, Filter, ShieldCheck, ShieldAlert, Award, Users, Sparkles, Printer, Download, Trash2 } from 'lucide-react';

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

  useEffect(() => { loadTournaments(); }, []);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTournamentId, selectedStatus]);

  const handleClearRoster = async () => {
    const currentTourneyName = selectedTournamentId
      ? tournaments.find((t) => t.id === selectedTournamentId)?.name || 'this tournament'
      : 'ALL tournaments';

    if (!confirm(`⚠️ ARE YOU SURE YOU WANT TO CLEAR ALL REGISTRATIONS FOR ${currentTourneyName.toUpperCase()}?\n\nThis action cannot be undone.`)) {
      return;
    }

    setLoading(true);
    try {
      let endpoint = '/registrations/clear';
      if (selectedTournamentId) endpoint += `?tournamentId=${selectedTournamentId}`;
      const res = await apiRequest(endpoint, { method: 'DELETE' });
      if (res.success) {
        alert('Registrations roster cleared successfully!');
        loadData();
      } else {
        alert(res.error || 'Failed to clear roster.');
      }
    } catch (err) {
      console.error('Clear roster error:', err);
    } finally {
      setLoading(false);
    }
  };

  const exportCsv = () => {
    const headers = ['Player Name', 'Tournament', 'Age', 'Category', 'Phone', 'Amount (KES)', 'Status', 'M-Pesa Receipt', 'Date'];
    const rows = registrations.map((r) => [
      `"${r.player_name}"`,
      `"${Array.isArray(r.tournaments) ? r.tournaments[0]?.name : (typeof r.tournaments === 'object' && r.tournaments ? r.tournaments.name : 'Tournament')}"`,
      r.age,
      `"${r.category}"`,
      `"${r.phone_number}"`,
      r.amount,
      r.payment_status,
      `"${r.mpesa_receipt || ''}"`,
      `"${r.created_at ? new Date(r.created_at).toLocaleString() : ''}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `tournament_roster_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
          <span className="inline-flex items-center text-[10px] font-bold text-stone-700 bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
            <span>Pending</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* PRINTABLE PDF ROSTER CONTAINER (Only visible during print/PDF saving) */}
      <div id="printable-roster" className="hidden print:block p-8 bg-white text-black font-sans">
        <div className="border-b-2 border-[#6B4A34] pb-4 mb-6 flex justify-between items-center">
          <div>
            <h1 className="font-serif text-2xl font-bold text-[#6B4A34]">JUMUIYA CHESS INITIATIVE</h1>
            <p className="font-mono text-xs font-bold text-stone-600 uppercase tracking-widest mt-1">
              OFFICIAL PLAYER ROSTER & PAIRING SHEET
            </p>
          </div>
          <div className="text-right text-xs">
            <p className="font-bold text-[#6B4A34]">{selectedTournamentId ? tournaments.find(t => t.id === selectedTournamentId)?.name : 'All Tournaments'}</p>
            <p className="text-stone-500 font-mono text-[10px]">Generated: {new Date().toLocaleString()}</p>
          </div>
        </div>

        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b-2 border-stone-800 text-stone-700 font-bold uppercase">
              <th className="py-2">#</th>
              <th className="py-2">Player Name</th>
              <th className="py-2">Age</th>
              <th className="py-2">Category</th>
              <th className="py-2">Phone</th>
              <th className="py-2">Status</th>
              <th className="py-2">M-Pesa Receipt</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200">
            {registrations.map((reg, index) => (
              <tr key={reg.id}>
                <td className="py-2.5 font-mono">{index + 1}</td>
                <td className="py-2.5 font-bold">{reg.player_name}</td>
                <td className="py-2.5">{reg.age}</td>
                <td className="py-2.5 font-semibold">{reg.category}</td>
                <td className="py-2.5">{reg.phone_number}</td>
                <td className="py-2.5 uppercase font-bold">{reg.payment_status}</td>
                <td className="py-2.5 font-mono text-[10px]">{reg.mpesa_receipt || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Main Admin UI Screen */}
      <div className="space-y-6 print:hidden">
        {/* Brown Banner Card */}
        <div className="bg-[#6B4A34] text-white p-6 md:p-8 rounded-2xl shadow-md border border-[#573b29] relative overflow-hidden space-y-2">
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

        {/* Tournament-Isolated Tabs & Actions Toolbar */}
        {activeTab === 'registrations' && (
          <div className="bg-white border border-stone-200 p-5 rounded-2xl space-y-4 shadow-sm">
            {/* Tournament Selector Pills */}
            <div className="flex flex-wrap gap-2 items-center pb-3 border-b border-stone-100">
              <span className="text-xs font-bold text-stone-500 mr-2">Tournament Lists:</span>
              <button
                onClick={() => setSelectedTournamentId('')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                  selectedTournamentId === ''
                    ? 'bg-[#6B4A34] text-white shadow-xs'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                All Tournaments
              </button>
              {tournaments.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTournamentId(t.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                    selectedTournamentId === t.id
                      ? 'bg-[#6B4A34] text-white shadow-xs'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </div>

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="flex items-center space-x-2">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="bg-white border border-stone-300 p-2 rounded-xl text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-[#6B4A34]"
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                </select>
              </div>

              <div className="flex flex-wrap gap-2 items-center w-full sm:w-auto">
                <button
                  onClick={() => window.print()}
                  className="flex-1 sm:flex-none px-4 py-2 bg-stone-100 hover:bg-[#6B4A34] hover:text-white text-charcoal font-sans text-xs font-bold rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 shadow-xs hover:shadow-md active:scale-95 group"
                >
                  <Printer className="w-3.5 h-3.5 text-[#6B4A34] group-hover:text-white transition-colors" />
                  <span>Print Roster (PDF)</span>
                </button>

                <button
                  onClick={exportCsv}
                  className="flex-1 sm:flex-none px-4 py-2 bg-stone-100 hover:bg-[#6B4A34] hover:text-white text-charcoal font-sans text-xs font-bold rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 shadow-xs hover:shadow-md active:scale-95 group"
                >
                  <Download className="w-3.5 h-3.5 text-[#6B4A34] group-hover:text-white transition-colors" />
                  <span>Export CSV</span>
                </button>

                <button
                  onClick={handleClearRoster}
                  className="flex-1 sm:flex-none px-4 py-2 bg-red-50 hover:bg-red-600 hover:text-white text-red-700 font-sans text-xs font-bold rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 border border-red-200 hover:border-red-600 shadow-xs hover:shadow-md active:scale-95 group"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-600 group-hover:text-white transition-colors" />
                  <span>Clear Roster</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Table Card */}
        <div className="bg-white border border-stone-200 p-6 rounded-2xl shadow-sm overflow-x-auto">
          <div className="flex items-center justify-between border-b border-stone-100 pb-4 mb-4">
            <h2 className="font-serif text-base font-bold text-charcoal">
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
                No registrations logged for this selection yet.
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
    </div>
  );
}
