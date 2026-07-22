'use client';

import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/api';
import { Registration, ShopOrder, Tournament } from '@/types';
import { Loader2, Filter, ShieldCheck, ShieldAlert, Award } from 'lucide-react';

export default function AdminRegistrations() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [orders, setOrders] = useState<ShopOrder[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [selectedTournamentId, setSelectedTournamentId] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [activeTab, setActiveTab] = useState<'registrations' | 'orders'>('registrations');

  const loadData = async () => {
    setLoading(true);
    
    // Fetch tournaments for filter dropdown
    const tourneyRes = await apiRequest<Tournament[]>('/tournaments');
    if (tourneyRes.success && tourneyRes.data) {
      setTournaments(tourneyRes.data);
    }

    // Build URL query params for registrations
    let regEndpoint = '/registrations';
    const params = [];
    if (selectedTournamentId) params.push(`tournamentId=${selectedTournamentId}`);
    if (selectedStatus) params.push(`status=${selectedStatus}`);
    if (params.length > 0) regEndpoint += `?${params.join('&')}`;

    const [regRes, orderRes] = await Promise.all([
      apiRequest<Registration[]>(regEndpoint),
      apiRequest<ShopOrder[]>('/shop/orders'),
    ]);

    if (regRes.success && regRes.data) {
      setRegistrations(regRes.data);
    }
    if (orderRes.success && orderRes.data) {
      setOrders(orderRes.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTournamentId, selectedStatus]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            <ShieldCheck className="h-3.5 w-3.5 mr-1" />
            <span>Completed</span>
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center text-xs font-semibold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
            <ShieldAlert className="h-3.5 w-3.5 mr-1" />
            <span>Failed</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
            <span>Pending</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-charcoal">Registrations & Payments</h1>
          <p className="font-sans text-xs text-charcoal/50">
            Monitor player registrations and shop checkout orders paid via M-Pesa.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="bg-stone/20 p-1.5 rounded-lg flex space-x-1 self-start">
          <button
            onClick={() => setActiveTab('registrations')}
            className={`px-4 py-2 text-xs font-sans font-semibold rounded ${
              activeTab === 'registrations' ? 'bg-offwhite text-charcoal shadow-sm' : 'text-charcoal/60 hover:text-charcoal'
            }`}
          >
            Tournament Players
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 text-xs font-sans font-semibold rounded ${
              activeTab === 'orders' ? 'bg-offwhite text-charcoal shadow-sm' : 'text-charcoal/60 hover:text-charcoal'
            }`}
          >
            Shop Orders
          </button>
        </div>
      </div>

      {/* Filters (only for registrations tab) */}
      {activeTab === 'registrations' && (
        <div className="bg-offwhite border border-stone/30 p-5 rounded-lg flex flex-col md:flex-row gap-4 items-center shadow-sm">
          <div className="flex items-center space-x-2 text-charcoal/60 text-xs font-semibold shrink-0">
            <Filter className="h-4 w-4 text-wood" />
            <span>Filter Results:</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            <select
              value={selectedTournamentId}
              onChange={(e) => setSelectedTournamentId(e.target.value)}
              className="bg-offwhite border border-stone/30 p-2.5 rounded text-xs text-charcoal focus:outline-none"
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
              className="bg-offwhite border border-stone/30 p-2.5 rounded text-xs text-charcoal focus:outline-none"
            >
              <option value="">All Payment Statuses</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>
      )}

      {/* Main Table Content */}
      <div className="bg-offwhite border border-stone/30 p-6 rounded-lg shadow-sm overflow-x-auto">
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-wood" />
          </div>
        ) : activeTab === 'registrations' ? (
          registrations.length === 0 ? (
            <div className="text-center py-16 text-charcoal/40 text-sm font-sans">
              No registrations found matching the filters.
            </div>
          ) : (
            <table className="w-full text-left border-collapse font-sans text-xs">
              <thead>
                <tr className="border-b border-stone/30 text-charcoal/60 font-semibold uppercase">
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
              <tbody className="divide-y divide-stone/10">
                {registrations.map((reg) => (
                  <tr key={reg.id} className="text-charcoal/80 hover:bg-stone/5">
                    <td className="py-4 font-semibold">{reg.player_name}</td>
                    <td className="py-4">{reg.tournaments?.name || 'Tournament'}</td>
                    <td className="py-4">{reg.age}</td>
                    <td className="py-4">
                      <span className="inline-flex items-center text-[10px] bg-stone/20 text-charcoal/85 px-2 py-0.5 rounded font-medium">
                        <Award className="h-3 w-3 mr-1 text-wood" />
                        {reg.category}
                      </span>
                    </td>
                    <td className="py-4">{reg.phone_number}</td>
                    <td className="py-4 font-bold text-wood">KES {reg.amount}</td>
                    <td className="py-4">{getStatusBadge(reg.payment_status)}</td>
                    <td className="py-4 font-mono text-[10px]">{reg.mpesa_receipt || '—'}</td>
                    <td className="py-4 text-[10px] text-charcoal/50">
                      {reg.created_at ? new Date(reg.created_at).toLocaleString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        ) : (
          orders.length === 0 ? (
            <div className="text-center py-16 text-charcoal/40 text-sm font-sans">
              No shop orders found.
            </div>
          ) : (
            <table className="w-full text-left border-collapse font-sans text-xs">
              <thead>
                <tr className="border-b border-stone/30 text-charcoal/60 font-semibold uppercase">
                  <th className="pb-3">Customer Name</th>
                  <th className="pb-3">Phone</th>
                  <th className="pb-3">Items Purchased</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">M-Pesa Receipt</th>
                  <th className="pb-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone/10">
                {orders.map((order) => (
                  <tr key={order.id} className="text-charcoal/80 hover:bg-stone/5">
                    <td className="py-4 font-semibold">{order.customer_name}</td>
                    <td className="py-4">{order.phone_number}</td>
                    <td className="py-4 max-w-[200px] truncate">
                      {order.items?.map((item: any) => `${item.name} (x${item.quantity})`).join(', ') || 'Item'}
                    </td>
                    <td className="py-4 font-bold text-wood">KES {order.amount}</td>
                    <td className="py-4">{getStatusBadge(order.payment_status)}</td>
                    <td className="py-4 font-mono text-[10px]">{order.mpesa_receipt || '—'}</td>
                    <td className="py-4 text-[10px] text-charcoal/50">
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
