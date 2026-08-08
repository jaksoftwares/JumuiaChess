'use client';

import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/api';
import { Loader2, HeartHandshake, Download, Edit2, Trash2, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { Modal } from '@/components/admin/Modal';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Donation {
  id: string;
  donor_name: string | null;
  email: string | null;
  phone_number: string;
  amount: number;
  donor_message: string | null;
  payment_channel: string;
  payment_status: string;
  checkout_request_id: string | null;
  mpesa_receipt: string | null;
  created_at: string;
}

export default function AdminDonations() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  // Edit Form State
  const [editName, setEditName] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [editReceipt, setEditReceipt] = useState('');
  const [editMessage, setEditMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadDonations = async () => {
    setLoading(true);
    const res = await apiRequest<Donation[]>('/donations');
    if (res.success && Array.isArray(res.data)) {
      setDonations(res.data);
    } else {
      setDonations([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadDonations();
  }, []);

  const handleEditClick = (d: Donation) => {
    setEditingId(d.id);
    setEditName(d.donor_name || '');
    setEditAmount(d.amount.toString());
    setEditStatus(d.payment_status);
    setEditReceipt(d.mpesa_receipt || '');
    setEditMessage(d.donor_message || '');
    setMessage(null);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;

    setIsSubmitting(true);
    setMessage(null);

    const body = {
      donor_name: editName,
      amount: parseFloat(editAmount),
      payment_status: editStatus,
      mpesa_receipt: editReceipt,
      donor_message: editMessage,
    };

    const res = await apiRequest(`/donations/${editingId}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });

    setIsSubmitting(false);
    if (res.success) {
      setMessage({ type: 'success', text: 'Donation updated successfully!' });
      loadDonations();
      setTimeout(() => {
        setEditingId(null);
        setMessage(null);
      }, 1500);
    } else {
      setMessage({ type: 'error', text: res.error || 'Failed to update donation.' });
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setIsSubmitting(true);
    const res = await apiRequest(`/donations/${deletingId}`, { method: 'DELETE' });
    setIsSubmitting(false);

    if (res.success) {
      setDeletingId(null);
      loadDonations();
    } else {
      alert(res.error || 'Failed to delete donation.');
    }
  };

  const filteredDonations = donations.filter(d => 
    d.donor_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.phone_number.includes(searchTerm) ||
    d.mpesa_receipt?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Derived Stats
  const completedDonations = donations.filter(d => d.payment_status === 'completed');
  const totalRevenue = completedDonations.reduce((acc, curr) => acc + Number(curr.amount), 0);
  const totalDonors = new Set(completedDonations.filter(d => d.phone_number || d.email).map(d => d.phone_number || d.email)).size;
  const successRate = donations.length > 0 ? ((completedDonations.length / donations.length) * 100).toFixed(1) : 0;

  // Exports
  const handleExportCSV = () => {
    const csvContent = [
      ['Date', 'Donor Name', 'Phone', 'Amount (KES)', 'Status', 'Channel', 'Receipt', 'Message'],
      ...filteredDonations.map(d => [
        new Date(d.created_at).toLocaleDateString(),
        d.donor_name || 'Anonymous',
        d.phone_number,
        d.amount,
        d.payment_status,
        d.payment_channel,
        d.mpesa_receipt || '',
        `"${d.donor_message?.replace(/"/g, '""') || ''}"`
      ])
    ].map(e => e.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'jumuiya_donations.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredDonations.map(d => ({
      Date: new Date(d.created_at).toLocaleString(),
      'Donor Name': d.donor_name || 'Anonymous',
      'Phone Number': d.phone_number,
      'Email': d.email || '',
      'Amount (KES)': d.amount,
      'Status': d.payment_status,
      'Channel': d.payment_channel,
      'Receipt': d.mpesa_receipt || '',
      'Message': d.donor_message || ''
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Donations");
    XLSX.writeFile(wb, "jumuiya_donations.xlsx");
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text('Jumuiya Chess Donations Report', 14, 15);
    
    const tableColumn = ["Date", "Donor", "Phone", "Amount", "Status", "Receipt"];
    const tableRows = filteredDonations.map(d => [
      new Date(d.created_at).toLocaleDateString(),
      d.donor_name || 'Anonymous',
      d.phone_number,
      `KES ${d.amount}`,
      d.payment_status,
      d.mpesa_receipt || 'N/A'
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });
    
    doc.save('jumuiya_donations.pdf');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Brown Banner Card */}
      <div className="bg-[#6B4A34] text-white p-6 md:p-8 rounded-2xl shadow-md border border-[#573b29] relative overflow-hidden space-y-2">
        <h1 className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-white">
          Donations
        </h1>
        <p className="text-xs md:text-sm text-[#FAF7F2]/90 leading-relaxed font-sans max-w-3xl">
          Manage and track all organizational contributions and donor history.
        </p>
      </div>
        
      {/* Actions Toolbar */}
      <div className="bg-white border border-[#6B4A34]/20 p-5 rounded-2xl space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="text-[10px] font-bold text-[#6B4A34] uppercase tracking-wider hidden sm:block">Export Options</div>
          <div className="w-full sm:w-auto relative group">
            <button className="w-full sm:w-auto px-4 py-2 bg-[#FAF7F2] hover:bg-[#6B4A34] hover:text-white text-[#232320] font-sans text-xs font-bold rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 border border-[#6B4A34]/20 hover:border-[#6B4A34] shadow-sm active:scale-95 group">
              <Download className="w-3.5 h-3.5 text-[#6B4A34] group-hover:text-white transition-colors" />
              <span>Export Data</span>
            </button>
            <div className="absolute right-0 mt-2 w-40 bg-white border border-[#6B4A34]/20 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 overflow-hidden">
              <button onClick={handleExportCSV} className="w-full text-left px-4 py-2.5 text-xs font-bold text-[#232320] hover:bg-[#FAF7F2] transition-colors">Export to CSV</button>
              <button onClick={handleExportExcel} className="w-full text-left px-4 py-2.5 text-xs font-bold text-[#232320] hover:bg-[#FAF7F2] transition-colors border-t border-[#6B4A34]/10">Export to Excel</button>
              <button onClick={handleExportPDF} className="w-full text-left px-4 py-2.5 text-xs font-bold text-[#232320] hover:bg-[#FAF7F2] transition-colors border-t border-[#6B4A34]/10">Export to PDF</button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-[#6B4A34]/20 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold text-[#6B4A34] uppercase tracking-wider">Total Revenue</p>
            <HeartHandshake className="w-5 h-5 text-[#6B4A34]" />
          </div>
          <p className="text-2xl font-serif font-bold text-[#232320] mt-2">KES {totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-white border border-[#6B4A34]/20 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold text-[#6B4A34] uppercase tracking-wider">Unique Donors</p>
            <HeartHandshake className="w-5 h-5 text-[#6B4A34]" />
          </div>
          <p className="text-2xl font-serif font-bold text-[#232320] mt-2">{totalDonors}</p>
        </div>
        <div className="bg-white border border-[#6B4A34]/20 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold text-[#6B4A34] uppercase tracking-wider">Success Rate</p>
            <CheckCircle2 className="w-5 h-5 text-emerald-700" />
          </div>
          <p className="text-2xl font-serif font-bold text-[#232320] mt-2">{successRate}%</p>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white border border-[#6B4A34]/20 p-6 rounded-2xl shadow-sm overflow-x-auto flex flex-col">
        <div className="flex items-center justify-between border-b border-[#6B4A34]/10 pb-4 mb-4">
          <h2 className="font-serif text-base font-bold text-[#232320]">
            Donation Records
          </h2>
          <input
            type="text"
            placeholder="Search name, phone, receipt..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-64 px-4 py-2 bg-[#FAF7F2] border border-[#6B4A34]/20 rounded-xl text-xs focus:outline-none focus:border-[#6B4A34] font-sans font-bold text-[#232320]"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-sans text-xs min-w-[800px]">
            <thead>
              <tr className="border-b border-[#6B4A34]/10 text-[#6B4A34] font-bold uppercase tracking-wider text-[10px]">
                <th className="pb-3">Date</th>
                <th className="pb-3">Donor</th>
                <th className="pb-3">Amount</th>
                <th className="pb-3">Status & Receipt</th>
                <th className="pb-3 w-48">Message</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#6B4A34]/10">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-[#6B4A34]">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                    Loading donations...
                  </td>
                </tr>
              ) : filteredDonations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-[#232320]/50 text-xs font-sans bg-[#FAF7F2] border border-[#6B4A34]/10 rounded-xl mt-4 block w-full">
                    No donations found.
                  </td>
                </tr>
              ) : (
                filteredDonations.map((d) => (
                  <tr key={d.id} className="text-[#232320] hover:bg-[#FAF7F2] transition-colors">
                    <td className="py-3.5 font-mono text-[10px] text-[#232320]/50">
                      {new Date(d.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3.5">
                      <div className="font-bold">{d.donor_name || 'Anonymous'}</div>
                      <div className="text-[10px] text-[#232320]/70 font-mono">{d.phone_number}</div>
                    </td>
                    <td className="py-3.5 font-bold text-[#6B4A34]">KES {d.amount.toLocaleString()}</td>
                    <td className="py-3.5">
                      <div className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase mb-1 border ${
                        d.payment_status === 'completed' ? 'bg-[#FAF7F2] text-[#6B4A34] border-[#6B4A34]/20' :
                        d.payment_status === 'pending' ? 'bg-amber-50 text-amber-900 border-amber-900/20' :
                        'bg-red-50 text-red-900 border-red-900/20'
                      }`}>
                        {d.payment_status === 'completed' && <CheckCircle2 className="w-3 h-3" />}
                        {d.payment_status === 'pending' && <Clock className="w-3 h-3" />}
                        {d.payment_status === 'failed' && <AlertCircle className="w-3 h-3" />}
                        <span>{d.payment_status}</span>
                      </div>
                      <div className="text-[10px] font-mono font-bold text-[#232320]/50 uppercase tracking-wider block">{d.mpesa_receipt || 'NO RECEIPT'}</div>
                    </td>
                    <td className="py-3.5 text-[11px] text-[#232320]/70 italic">
                      {d.donor_message ? `"${d.donor_message}"` : '-'}
                    </td>
                    <td className="py-3.5 text-right space-x-2">
                      <button onClick={() => handleEditClick(d)} className="inline-flex items-center justify-center p-2 bg-[#FAF7F2] text-[#6B4A34] hover:bg-[#6B4A34] hover:text-white rounded-lg transition-colors border border-[#6B4A34]/20 shadow-sm">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDeletingId(d.id)} className="inline-flex items-center justify-center p-2 bg-red-900/10 text-red-900 hover:bg-[#232320] hover:text-white rounded-lg transition-colors border border-red-900/20 shadow-sm">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal isOpen={!!editingId} onClose={() => setEditingId(null)} title="Edit Donation">
        <form onSubmit={handleUpdate} className="space-y-4">
          {message && (
            <div className={`p-3 rounded-lg text-xs font-bold ${message.type === 'success' ? 'bg-[#6B4A34]/10 text-[#6B4A34]' : 'bg-red-900/10 text-red-900'}`}>
              {message.text}
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Donor Name</label>
              <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#6B4A34]/20 rounded-lg text-sm focus:outline-none focus:border-[#6B4A34]" />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Amount</label>
              <input type="number" value={editAmount} onChange={(e) => setEditAmount(e.target.value)} required className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#6B4A34]/20 rounded-lg text-sm focus:outline-none focus:border-[#6B4A34]" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Status</label>
              <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#6B4A34]/20 rounded-lg text-sm focus:outline-none focus:border-[#6B4A34]">
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase mb-1">M-Pesa Receipt</label>
              <input type="text" value={editReceipt} onChange={(e) => setEditReceipt(e.target.value)} className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#6B4A34]/20 rounded-lg text-sm focus:outline-none focus:border-[#6B4A34]" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Donor Message</label>
            <textarea value={editMessage} onChange={(e) => setEditMessage(e.target.value)} rows={2} className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#6B4A34]/20 rounded-lg text-sm resize-none focus:outline-none focus:border-[#6B4A34]"></textarea>
          </div>

          <button type="submit" disabled={isSubmitting} className="w-full py-2.5 bg-[#6B4A34] text-white rounded-lg font-bold text-sm hover:bg-[#5A3E2B] transition-colors flex justify-center items-center">
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
          </button>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={!!deletingId} onClose={() => setDeletingId(null)} title="Delete Donation">
        <div className="space-y-4">
          <p className="text-sm text-stone-600">Are you sure you want to permanently delete this donation record? This action cannot be undone and will affect your total revenue statistics.</p>
          <div className="flex space-x-3">
            <button onClick={() => setDeletingId(null)} className="flex-1 py-2.5 bg-[#FAF7F2] text-charcoal font-bold rounded-lg text-sm hover:bg-white border border-[#6B4A34]/20 transition-colors">
              Cancel
            </button>
            <button onClick={handleDelete} disabled={isSubmitting} className="flex-1 py-2.5 bg-[#232320] text-white font-bold rounded-lg text-sm hover:bg-[#6B4A34] transition-colors flex justify-center items-center">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete Permanently'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
