'use client';

import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/api';
import { Product } from '@/types';
import { Loader2, Plus, ShoppingBag, Trash, Edit, AlertCircle } from 'lucide-react';

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
  const [apiError, setApiError] = useState<string | null>(null);

  const loadProducts = async () => {
    setLoading(true);
    setApiError(null);
    const res = await apiRequest<Product[]>('/shop/products');
    if (res.success && Array.isArray(res.data)) {
      setProducts(res.data);
    } else {
      setApiError(res.error || 'Unable to load products from the database.');
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
      // Clear fields
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
    <div className="space-y-10">
      {/* Title */}
      <div>
        <h1 className="font-serif text-3xl font-bold text-charcoal">Charity Shop Catalog</h1>
        <p className="font-sans text-xs text-charcoal/50">
          Manage products available in the public charity store.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Form: Add/Edit Product */}
        <div className="bg-offwhite border border-stone/30 p-6 rounded-lg shadow-sm space-y-6 h-fit">
          <h2 className="font-serif text-lg font-bold text-wood flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>{editingId ? 'Edit Product' : 'Add Product'}</span>
          </h2>

          {message && (
            <div className={`p-3 rounded text-xs ${
              message.type === 'success' ? 'bg-sage/10 text-charcoal border border-sage/30' : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message.text}
            </div>
          )}
          {apiError && (
            <div className="p-3 rounded text-xs bg-red-50 text-red-700 border border-red-200">
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-sans text-xs font-semibold text-charcoal/70 mb-1">Product Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Official T-Shirt"
                className="w-full bg-offwhite border border-stone/30 p-2.5 rounded text-sm text-charcoal focus:outline-none focus:border-wood"
              />
            </div>

            <div>
              <label className="block font-sans text-xs font-semibold text-charcoal/70 mb-1">Price (KES)</label>
              <input
                type="number"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="1500"
                className="w-full bg-offwhite border border-stone/30 p-2.5 rounded text-sm text-charcoal focus:outline-none focus:border-wood"
              />
            </div>

            <div>
              <label className="block font-sans text-xs font-semibold text-charcoal/70 mb-1">Image URL</label>
              <input
                type="url"
                required
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-offwhite border border-stone/30 p-2.5 rounded text-sm text-charcoal focus:outline-none focus:border-wood"
              />
            </div>

            <div>
              <label className="block font-sans text-xs font-semibold text-charcoal/70 mb-1">Description</label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe product details and size options..."
                className="w-full bg-offwhite border border-stone/30 p-2.5 rounded text-sm text-charcoal focus:outline-none focus:border-wood resize-none"
              />
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <input
                type="checkbox"
                id="inStock"
                checked={inStock}
                onChange={(e) => setInStock(e.target.checked)}
                className="rounded border-stone/30 text-wood focus:ring-wood"
              />
              <label htmlFor="inStock" className="font-sans text-xs font-semibold text-charcoal/70 cursor-pointer">
                Product is In Stock (Visible publicly)
              </label>
            </div>

            <div className="flex space-x-3 pt-2">
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
                  className="w-1/2 py-2.5 border border-stone/30 font-sans text-xs font-semibold rounded hover:bg-stone/10 text-charcoal/70 transition-colors"
                >
                  Cancel Edit
                </button>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`${editingId ? 'w-1/2' : 'w-full'} py-2.5 bg-wood text-offwhite font-sans text-xs font-semibold rounded hover:bg-wood/90 transition-colors flex items-center justify-center space-x-2`}
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <span>{editingId ? 'Update' : 'Create'}</span>}
              </button>
            </div>
          </form>
        </div>

        {/* Table: Products list */}
        <div className="lg:col-span-2 bg-offwhite border border-stone/30 p-6 rounded-lg shadow-sm overflow-x-auto">
          <h2 className="font-serif text-lg font-bold text-charcoal mb-6 flex items-center space-x-2">
            <ShoppingBag className="h-5 w-5 text-wood" />
            <span>Store Products</span>
          </h2>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-wood" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 text-charcoal/40 text-sm font-sans">
              No products found in the database yet.
            </div>
          ) : (
            <table className="w-full text-left border-collapse font-sans text-xs">
              <thead>
                <tr className="border-b border-stone/30 text-charcoal/60 font-semibold uppercase">
                  <th className="pb-3">Name</th>
                  <th className="pb-3">Price</th>
                  <th className="pb-3">Stock Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone/10">
                {products.map((p) => (
                  <tr key={p.id} className="text-charcoal/80 hover:bg-stone/5">
                    <td className="py-4 font-semibold">{p.name}</td>
                    <td className="py-4 font-bold text-wood">KES {p.price}</td>
                    <td className="py-4">
                      {p.in_stock ? (
                        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          In Stock
                        </span>
                      ) : (
                        <span className="text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                          Out of Stock
                        </span>
                      )}
                    </td>
                    <td className="py-4 text-right space-x-2">
                      <button
                        onClick={() => handleEditClick(p)}
                        className="text-wood hover:text-wood/80 p-1.5 rounded hover:bg-stone/10 transition-colors"
                        title="Edit Product"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="text-red-500 hover:text-red-700 p-1.5 rounded hover:bg-red-50 transition-colors"
                        title="Delete Product"
                      >
                        <Trash className="h-4 w-4" />
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
