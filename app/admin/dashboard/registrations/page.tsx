'use client';

import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/api';
import { Registration, Tournament } from '@/types';
import { Loader2, ShieldCheck, ShieldAlert, Award, Printer, Download, Trash2 } from 'lucide-react';

export default function AdminRegistrations() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [selectedTournamentId, setSelectedTournamentId] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

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

      const regRes = await apiRequest<Registration[]>(regEndpoint).catch(() => ({ success: false, data: [] }));

      if (regRes?.success && Array.isArray(regRes.data)) {
        setRegistrations(regRes.data);
      } else {
        setRegistrations([]);
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

  const toggleCheckIn = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'checked-in' ? 'registered' : 'checked-in';
    try {
      const res = await apiRequest(`/admin/registrations/${id}/checkin`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.success) {
        setRegistrations(registrations.map(r => r.id === id ? { ...r, attendance_status: newStatus as any } : r));
      } else {
        alert(res.error || 'Failed to update attendance status.');
      }
    } catch (err) {
      alert('Network error.');
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
          <span className="inline-flex items-center text-[10px] font-bold text-[#6B4A34] bg-[#6B4A34]/10 px-2 py-0.5 rounded border border-[#6B4A34]/20">
            <ShieldCheck className="h-3 w-3 mr-1 text-[#6B4A34]" />
            <span>Completed</span>
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center text-[10px] font-bold text-red-900 bg-red-900/10 px-2 py-0.5 rounded border border-red-900/20">
            <ShieldAlert className="h-3 w-3 mr-1 text-red-900" />
            <span>Failed</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center text-[10px] font-bold text-amber-900 bg-amber-900/10 px-2 py-0.5 rounded border border-amber-900/20">
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
              <th className="py-2">Age/Gender</th>
              <th className="py-2">Category</th>
              <th className="py-2">FIDE ID / Country</th>
              <th className="py-2">Ticket #</th>
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
                <td className="py-2.5">{reg.age} / {reg.gender || 'N/A'}</td>
                <td className="py-2.5 font-semibold">{reg.category}</td>
                <td className="py-2.5">{reg.fide_id || '00'} / {reg.country || 'Kenya'}</td>
                <td className="py-2.5 font-mono text-[10px]">{reg.ticket_number || '—'}</td>
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
            Event Registrations
          </h1>
          <p className="text-xs md:text-sm text-[#FAF7F2]/90 leading-relaxed font-sans max-w-3xl">
            Monitor tournament player registrations and payments in real-time.
          </p>
        </div>

        {/* Tournament-Isolated Tabs & Actions Toolbar */}
        <div className="bg-white border border-[#6B4A34]/20 p-5 rounded-2xl space-y-4 shadow-sm">
          {/* Tournament Selector Pills */}
          <div className="flex flex-wrap gap-2 items-center pb-3 border-b border-[#6B4A34]/10">
            <span className="text-[10px] font-bold text-[#6B4A34] uppercase tracking-wider mr-2">Filter by Event:</span>
            <button
              onClick={() => setSelectedTournamentId('')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                selectedTournamentId === ''
                  ? 'bg-[#6B4A34] text-white shadow-xs'
                  : 'bg-[#FAF7F2] text-[#232320] border border-[#6B4A34]/20 hover:bg-[#6B4A34]/10'
              }`}
            >
              All Events
            </button>
            {tournaments.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTournamentId(t.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                  selectedTournamentId === t.id
                    ? 'bg-[#6B4A34] text-white shadow-xs'
                    : 'bg-[#FAF7F2] text-[#232320] border border-[#6B4A34]/20 hover:bg-[#6B4A34]/10'
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
                className="bg-[#FAF7F2] border border-[#6B4A34]/20 p-2 rounded-xl text-xs text-[#232320] font-bold focus:outline-none focus:ring-1 focus:ring-[#6B4A34]"
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
                className="flex-1 sm:flex-none px-4 py-2 bg-[#FAF7F2] hover:bg-[#6B4A34] hover:text-white text-[#232320] font-sans text-xs font-bold rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 border border-[#6B4A34]/20 hover:border-[#6B4A34] shadow-sm active:scale-95 group"
              >
                <Printer className="w-3.5 h-3.5 text-[#6B4A34] group-hover:text-white transition-colors" />
                <span>Print Roster (PDF)</span>
              </button>

              <button
                onClick={exportCsv}
                className="flex-1 sm:flex-none px-4 py-2 bg-[#FAF7F2] hover:bg-[#6B4A34] hover:text-white text-[#232320] font-sans text-xs font-bold rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 border border-[#6B4A34]/20 hover:border-[#6B4A34] shadow-sm active:scale-95 group"
              >
                <Download className="w-3.5 h-3.5 text-[#6B4A34] group-hover:text-white transition-colors" />
                <span>Export CSV</span>
              </button>

              <button
                onClick={handleClearRoster}
                className="flex-1 sm:flex-none px-4 py-2 bg-red-900/10 hover:bg-[#232320] hover:text-white text-red-900 font-sans text-xs font-bold rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 border border-red-900/20 hover:border-[#232320] shadow-sm active:scale-95 group"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-900 group-hover:text-white transition-colors" />
                <span>Clear Roster</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Table Card */}
        <div className="bg-white border border-[#6B4A34]/20 p-6 rounded-2xl shadow-sm overflow-x-auto">
          <div className="flex items-center justify-between border-b border-[#6B4A34]/10 pb-4 mb-4">
            <h2 className="font-serif text-base font-bold text-[#232320]">
              Event Roster ({registrations.length})
            </h2>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-[#6B4A34]" />
            </div>
          ) : registrations.length === 0 ? (
            <div className="text-center py-16 text-[#232320]/50 text-xs font-sans bg-[#FAF7F2] border border-[#6B4A34]/10 rounded-xl">
              No registrations found.
            </div>
          ) : (
            <table className="w-full text-left border-collapse font-sans text-xs">
              <thead>
                <tr className="border-b border-[#6B4A34]/10 text-[#6B4A34] font-bold uppercase tracking-wider text-[10px]">
                  <th className="pb-3">Player Name</th>
                  <th className="pb-3">Tournament</th>
                  <th className="pb-3">Age/Gender</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">FIDE / Country</th>
                  <th className="pb-3">Ticket</th>
                  <th className="pb-3">Phone</th>
                  <th className="pb-3">Payment</th>
                  <th className="pb-3 text-center">Attendance</th>
                  <th className="pb-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#6B4A34]/10">
                {registrations.map((reg) => (
                  <tr key={reg.id} className="text-[#232320] hover:bg-[#FAF7F2] transition-colors">
                    <td className="py-3.5 font-bold">{reg.player_name}</td>
                    <td className="py-3.5 text-[#232320]/70">
                      {Array.isArray(reg.tournaments)
                        ? reg.tournaments[0]?.name
                        : (typeof reg.tournaments === 'object' && reg.tournaments !== null ? reg.tournaments.name : 'Tournament')}
                    </td>
                    <td className="py-3.5">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-[#232320]/70">Age: {reg.age}</span>
                        <span className="text-[10px] text-[#232320]/70">{reg.gender || '—'}</span>
                      </div>
                    </td>
                    <td className="py-3.5">
                      <span className="inline-flex w-fit items-center text-[10px] bg-[#FAF7F2] text-[#6B4A34] px-2 py-0.5 rounded font-bold border border-[#6B4A34]/20">
                        <Award className="h-3 w-3 mr-1 text-[#6B4A34]" />
                        {reg.category}
                      </span>
                    </td>
                    <td className="py-3.5">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-mono font-bold">{reg.fide_id || '00'}</span>
                        <span className="text-[10px] text-[#232320]/70">{reg.country || 'Kenya'}</span>
                      </div>
                    </td>
                    <td className="py-3.5">
                      <span className="font-mono text-xs font-bold text-[#6B4A34] bg-[#FAF7F2] px-2 py-1 rounded border border-[#6B4A34]/20">
                        {reg.ticket_number || '—'}
                      </span>
                    </td>
                    <td className="py-3.5 text-[#232320]/70">{reg.phone_number}</td>
                    <td className="py-3.5">
                      <div className="flex flex-col gap-1">
                        <span className="font-bold text-[#6B4A34]">KES {reg.amount}</span>
                        {getStatusBadge(reg.payment_status)}
                        <span className="font-mono text-[10px] text-[#232320]/70 truncate max-w-[100px]">{reg.mpesa_receipt || '—'}</span>
                      </div>
                    </td>
                    <td className="py-3.5 text-center">
                      <button 
                        onClick={() => toggleCheckIn(reg.id, reg.attendance_status || 'registered')}
                        className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-colors ${
                          reg.attendance_status === 'checked-in'
                            ? 'bg-green-100 text-green-800 border border-green-300'
                            : 'bg-gray-100 text-gray-600 border border-gray-300 hover:bg-[#6B4A34] hover:text-white'
                        }`}
                      >
                        {reg.attendance_status === 'checked-in' ? 'Checked In ✓' : 'Check In'}
                      </button>
                    </td>
                    <td className="py-3.5 text-[10px] text-[#232320]/50">
                      {reg.created_at ? new Date(reg.created_at).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
