'use client';

import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/api';
import { ShopOrder } from '@/types';
import { Loader2, ShieldCheck, ShieldAlert, Package, Trash2, Edit2, Truck, CheckCircle2 } from 'lucide-react';
import { Modal } from '@/components/admin/Modal';

export default function AdminShopOrders() {
  const [orders, setOrders] = useState<ShopOrder[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [editingOrder, setEditingOrder] = useState<ShopOrder | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Edit Form
  const [editDeliveryStatus, setEditDeliveryStatus] = useState('');
  const [editDeliveryNotes, setEditDeliveryNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const orderRes = await apiRequest<ShopOrder[]>('/shop/orders').catch(() => ({ success: false, data: [] }));
      if (orderRes?.success && Array.isArray(orderRes.data)) {
        setOrders(orderRes.data);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error('[Shop Orders Admin] Load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEditClick = (order: ShopOrder) => {
    setEditingOrder(order);
    setEditDeliveryStatus(order.delivery_status || 'pending');
    setEditDeliveryNotes(order.delivery_notes || '');
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;

    setIsSubmitting(true);
    try {
      const res = await apiRequest(`/shop/orders/${editingOrder.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          delivery_status: editDeliveryStatus,
          delivery_notes: editDeliveryNotes,
        })
      });

      if (res.success) {
        setEditingOrder(null);
        loadData();
      } else {
        alert(res.error || 'Failed to update order');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;

    setIsSubmitting(true);
    try {
      const res = await apiRequest(`/shop/orders/${deletingId}`, {
        method: 'DELETE'
      });
      if (res.success) {
        setDeletingId(null);
        loadData();
      } else {
        alert(res.error || 'Failed to delete order');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case 'completed': return <span className="inline-flex items-center text-[10px] font-bold text-[#6B4A34] bg-[#6B4A34]/10 px-2 py-0.5 rounded border border-[#6B4A34]/20"><ShieldCheck className="h-3 w-3 mr-1" />Completed</span>;
      case 'failed': return <span className="inline-flex items-center text-[10px] font-bold text-red-900 bg-red-900/10 px-2 py-0.5 rounded border border-red-900/20"><ShieldAlert className="h-3 w-3 mr-1" />Failed</span>;
      default: return <span className="inline-flex items-center text-[10px] font-bold text-amber-900 bg-amber-900/10 px-2 py-0.5 rounded border border-amber-900/20">Pending</span>;
    }
  };

  const getDeliveryBadge = (status: string) => {
    switch (status) {
      case 'delivered': return <span className="inline-flex items-center text-[10px] font-bold text-[#6B4A34] bg-[#6B4A34]/10 px-2 py-0.5 rounded border border-[#6B4A34]/20"><CheckCircle2 className="h-3 w-3 mr-1" />Delivered</span>;
      case 'shipped': return <span className="inline-flex items-center text-[10px] font-bold text-blue-900 bg-blue-900/10 px-2 py-0.5 rounded border border-blue-900/20"><Truck className="h-3 w-3 mr-1" />Shipped</span>;
      case 'processing': return <span className="inline-flex items-center text-[10px] font-bold text-amber-900 bg-amber-900/10 px-2 py-0.5 rounded border border-amber-900/20"><Package className="h-3 w-3 mr-1" />Processing</span>;
      default: return <span className="inline-flex items-center text-[10px] font-bold text-stone-600 bg-stone-100 px-2 py-0.5 rounded border border-stone-200">Pending</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Brown Banner Card */}
      <div className="bg-[#6B4A34] text-white p-6 md:p-8 rounded-2xl shadow-md border border-[#573b29] relative overflow-hidden space-y-2">
        <h1 className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-white">
          Shop Orders & Fulfillment
        </h1>
        <p className="text-xs md:text-sm text-[#FAF7F2]/90 leading-relaxed font-sans max-w-3xl">
          Track customer purchases, update delivery status, and view M-Pesa receipts.
        </p>
      </div>

      <div className="bg-white border border-[#6B4A34]/20 p-6 rounded-2xl shadow-sm overflow-x-auto">
        <div className="flex items-center justify-between border-b border-[#6B4A34]/10 pb-4 mb-4">
          <h2 className="font-serif text-base font-bold text-[#232320]">
            Customer Orders ({orders.length})
          </h2>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-[#6B4A34]" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 text-[#232320]/50 text-xs font-sans bg-[#FAF7F2] border border-[#6B4A34]/10 rounded-xl">
            No shop orders found.
          </div>
        ) : (
          <table className="w-full text-left border-collapse font-sans text-xs">
            <thead>
              <tr className="border-b border-[#6B4A34]/10 text-[#6B4A34] font-bold uppercase tracking-wider text-[10px]">
                <th className="pb-3">Customer Info</th>
                <th className="pb-3">Items</th>
                <th className="pb-3">Logistics</th>
                <th className="pb-3">Payment</th>
                <th className="pb-3">Receipt</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#6B4A34]/10">
              {orders.map((order) => (
                <tr key={order.id} className="text-[#232320] hover:bg-[#FAF7F2] transition-colors">
                  <td className="py-4">
                    <p className="font-bold">{order.customer_name}</p>
                    <p className="text-[#232320]/70 text-[10px]">{order.phone_number}</p>
                    <p className="text-[#232320]/70 text-[10px]">{order.email}</p>
                  </td>
                  <td className="py-4 text-[#232320]/70 max-w-[200px]">
                    <div className="flex flex-col gap-1">
                      {Array.isArray(order.items) && order.items.map((item: any, i: number) => (
                        <span key={i} className="truncate" title={item.name}>{item.quantity}x {item.name}</span>
                      ))}
                      <span className="font-bold text-[#6B4A34] mt-1">Total: KES {order.amount.toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="py-4">
                    <p className="text-[#232320]/70 truncate max-w-[150px]" title={`${order.shipping_address}, ${order.city}`}>{order.shipping_address}, {order.city}</p>
                    <div className="mt-1">{getDeliveryBadge(order.delivery_status || 'pending')}</div>
                  </td>
                  <td className="py-4">{getPaymentBadge(order.payment_status)}</td>
                  <td className="py-4 font-mono text-[10px] text-[#232320]/70">{order.mpesa_receipt || '—'}</td>
                  <td className="py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button onClick={() => handleEditClick(order)} className="p-2 bg-[#FAF7F2] hover:bg-[#6B4A34]/10 text-[#6B4A34] rounded-lg transition-colors border border-[#6B4A34]/20">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDeletingId(order.id)} className="p-2 bg-[#FAF7F2] hover:bg-red-900/10 text-red-900 rounded-lg transition-colors border border-[#6B4A34]/10">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit Logistics Modal */}
      <Modal isOpen={!!editingOrder} onClose={() => setEditingOrder(null)} title="Update Order Logistics">
        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="bg-[#FAF7F2] border border-[#6B4A34]/20 p-3 rounded-lg text-xs space-y-1 mb-4">
            <p><span className="font-bold text-[#6B4A34] uppercase text-[10px]">Customer:</span> {editingOrder?.customer_name}</p>
            <p><span className="font-bold text-[#6B4A34] uppercase text-[10px]">Address:</span> {editingOrder?.shipping_address}, {editingOrder?.city}</p>
          </div>
          
          <div>
            <label className="block text-[10px] font-bold text-[#6B4A34] uppercase tracking-wider mb-1">Delivery Status</label>
            <select value={editDeliveryStatus} onChange={(e) => setEditDeliveryStatus(e.target.value)} className="w-full bg-[#FAF7F2] border border-[#6B4A34]/20 p-2.5 rounded-lg text-sm focus:outline-none focus:border-[#6B4A34]">
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-[#6B4A34] uppercase tracking-wider mb-1">Delivery Notes (Optional)</label>
            <textarea value={editDeliveryNotes} onChange={(e) => setEditDeliveryNotes(e.target.value)} placeholder="Tracking code, courier details..." rows={3} className="w-full bg-[#FAF7F2] border border-[#6B4A34]/20 p-2.5 rounded-lg text-sm resize-none focus:outline-none focus:border-[#6B4A34]"></textarea>
          </div>

          <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-[#232320] text-white rounded-lg font-bold text-sm hover:bg-[#6B4A34] transition-colors flex justify-center items-center mt-2">
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Updates'}
          </button>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={!!deletingId} onClose={() => setDeletingId(null)} title="Delete Order">
        <div className="space-y-4">
          <p className="text-sm text-[#232320]/70">Are you sure you want to delete this order? This action cannot be undone.</p>
          <div className="flex space-x-3">
            <button onClick={() => setDeletingId(null)} className="flex-1 py-2.5 bg-[#FAF7F2] text-[#232320] font-bold rounded-lg text-sm hover:bg-white border border-[#6B4A34]/20 transition-colors">
              Cancel
            </button>
            <button onClick={handleDelete} disabled={isSubmitting} className="flex-1 py-2.5 bg-[#232320] text-white font-bold rounded-lg text-sm hover:bg-[#6B4A34] transition-colors flex justify-center items-center">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete Order'}
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
