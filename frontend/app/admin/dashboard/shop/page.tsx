'use client';

import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/api';
import { Product } from '@/types';
import { Loader2, Plus, ShoppingBag, Trash2, Edit2, Sparkles, CheckCircle2, XCircle } from 'lucide-react';
import { ImageUploadInput } from '@/components/admin/ImageUploadInput';

export default function AdminShop() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [inStock, setInStock] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadProducts = async () => {
    setLoading(true);
    const res = await apiRequest<Product[]>('/shop/products');
    if (res.success && Array.isArray(res.data)) {
      setProducts(res.data);
    } else {
      setProducts([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    const body = {
      name,
      image_url: imageUrl || 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?auto=format&fit=crop&q=80&w=600',
      price: parseFloat(price),
      description,
      in_stock: inStock,
    };

    let res;
    if (editingId) {
      res = await apiRequest(`/shop/products/${editingId}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      });
    } else {
      res = await apiRequest('/shop/products', {
        method: 'POST',
        body: JSON.stringify(body),
      });
    }

    setIsSubmitting(false);

    if (res.success) {
      setMessage({
        type: 'success',
        text: editingId ? 'Product updated successfully!' : 'Product created successfully!',
      });
      setEditingId(null);
      setName('');
      setImageUrl('');
      setPrice('');
      setDescription('');
      setInStock(true);
      loadProducts();
    } else {
      setMessage({ type: 'error', text: res.error || 'Failed to process product' });
    }
  };

  const handleEditClick = (prod: Product) => {
    setEditingId(prod.id);
    setName(prod.name);
    setImageUrl(prod.image_url);
    setPrice(prod.price.toString());
    setDescription(prod.description);
    setInStock(prod.in_stock);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    const res = await apiRequest(`/shop/products/${id}`, {
      method: 'DELETE',
    });

    if (res.success) {
      loadProducts();
    } else {
      alert(res.error || 'Failed to delete product');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Brown Banner Card */}
      <div className="bg-[#6B4A34] text-white p-6 md:p-8 rounded-2xl shadow-md border border-[#573b29] relative overflow-hidden space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-[#FAF7F2] text-[11px] font-mono font-bold tracking-wide backdrop-blur-sm">
          <ShoppingBag className="w-3.5 h-3.5 text-[#C8B195]" />
          <span>Charity Store Catalog</span>
        </div>
        <h1 className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-white">
          Charity Shop
        </h1>
        <p className="text-xs md:text-sm text-[#FAF7F2]/90 leading-relaxed font-sans max-w-3xl">
          Manage merchandise items, pricing, inventory stock status, and product photos.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editor Form Card */}
        <div className="bg-white border border-stone-200 p-6 rounded-2xl shadow-sm space-y-4 h-fit">
          <h2 className="font-serif text-base font-bold text-[#6B4A34] flex items-center gap-2 border-b border-stone-100 pb-3">
            <Plus className="w-4 h-4 text-[#6B4A34]" />
            <span>{editingId ? 'Edit Store Product' : 'Add Store Product'}</span>
          </h2>

          {message && (
            <div className={`p-3.5 rounded-xl text-xs font-medium ${
              message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Product Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Official T-Shirt / Chess Set"
                className="w-full bg-white border border-stone-300 p-2.5 rounded-xl text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-[#6B4A34]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Price (KES) *</label>
              <input
                type="number"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="1500"
                className="w-full bg-white border border-stone-300 p-2.5 rounded-xl text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-[#6B4A34]"
              />
            </div>

            <ImageUploadInput
              label="Product Image (Upload from Device)"
              value={imageUrl}
              onChange={(url) => setImageUrl(url)}
            />

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Description *</label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe product materials, sizing, and details..."
                className="w-full bg-white border border-stone-300 p-2.5 rounded-xl text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-[#6B4A34] resize-none"
              />
            </div>

            <div className="flex items-center space-x-2 pt-1">
              <input
                type="checkbox"
                id="inStock"
                checked={inStock}
                onChange={(e) => setInStock(e.target.checked)}
                className="rounded border-stone-300 text-[#6B4A34] focus:ring-[#6B4A34]"
              />
              <label htmlFor="inStock" className="text-xs font-semibold text-stone-700 cursor-pointer">
                In Stock (Visible publicly)
              </label>
            </div>

            <div className="flex space-x-2 pt-2">
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setName('');
                    setImageUrl('');
                    setPrice('');
                    setDescription('');
                    setInStock(true);
                  }}
                  className="w-1/2 py-2.5 border border-stone-300 font-semibold text-xs rounded-xl hover:bg-stone-100 text-stone-600 transition-colors"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`${editingId ? 'w-1/2' : 'w-full'} py-2.5 bg-[#6B4A34] hover:bg-[#573b29] text-white font-bold text-xs rounded-xl transition-colors shadow-sm flex items-center justify-center space-x-2`}
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <span>{editingId ? 'Update Product' : 'Create Product'}</span>}
              </button>
            </div>
          </form>
        </div>

        {/* Products Table Card */}
        <div className="lg:col-span-2 bg-white border border-stone-200 p-6 rounded-2xl shadow-sm overflow-x-auto">
          <div className="flex items-center justify-between border-b border-stone-100 pb-4 mb-4">
            <h2 className="font-serif text-base font-bold text-charcoal flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#6B4A34]" /> Store Inventory ({products.length})
            </h2>
            <span className="text-[11px] font-mono text-stone-400">Synced to Database</span>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-[#6B4A34]" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16 text-stone-400 text-xs font-sans bg-[#FAF7F2] border border-stone-200 rounded-xl">
              No products found in database yet. Add one using the form on the left.
            </div>
          ) : (
            <table className="w-full text-left border-collapse font-sans text-xs">
              <thead>
                <tr className="border-b border-stone-200 text-stone-500 font-bold uppercase tracking-wider">
                  <th className="pb-3">Product Name</th>
                  <th className="pb-3">Price</th>
                  <th className="pb-3">Stock Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {products.map((p) => (
                  <tr key={p.id} className="text-charcoal hover:bg-[#FAF7F2]/60 transition-colors">
                    <td className="py-3.5 font-bold">{p.name}</td>
                    <td className="py-3.5 font-bold text-[#6B4A34]">KES {p.price}</td>
                    <td className="py-3.5">
                      {p.in_stock ? (
                        <span className="text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> In Stock
                        </span>
                      ) : (
                        <span className="text-red-800 bg-red-50 px-2 py-0.5 rounded border border-red-200 font-bold inline-flex items-center gap-1">
                          <XCircle className="w-3 h-3 text-red-600" /> Out of Stock
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 text-right space-x-1">
                      <button
                        onClick={() => handleEditClick(p)}
                        className="p-1.5 text-stone-600 hover:text-[#6B4A34] hover:bg-stone-100 rounded-lg transition-colors"
                        title="Edit Product"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="p-1.5 text-stone-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Product"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
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
