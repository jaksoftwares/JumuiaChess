'use client';

import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/api';
import { Tournament } from '@/types';
import { Loader2, Plus, Trash2, Edit2, Trophy, Sparkles } from 'lucide-react';
import { ImageUploadInput } from '@/components/admin/ImageUploadInput';

export default function AdminTournaments() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [venue, setVenue] = useState('');
  const [entryFee, setEntryFee] = useState('');
  const [categories, setCategories] = useState('');
  const [description, setDescription] = useState('');
  const [posterUrl, setPosterUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadTournaments = async () => {
    setLoading(true);
    const res = await apiRequest<Tournament[]>('/tournaments');
    if (res.success && Array.isArray(res.data)) {
      setTournaments(res.data);
    } else {
      setTournaments([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadTournaments();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    const catsArray = categories.split(',').map((c) => c.trim()).filter((c) => c.length > 0);

    const body = {
      name,
      event_date: new Date(eventDate).toISOString(),
      venue,
      entry_fee: parseFloat(entryFee),
      categories: catsArray,
      description,
      poster_url: posterUrl || undefined,
      status: 'upcoming',
    };

    let res;
    if (editingId) {
      res = await apiRequest(`/tournaments/${editingId}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      });
    } else {
      res = await apiRequest('/tournaments', {
        method: 'POST',
        body: JSON.stringify(body),
      });
    }

    setIsSubmitting(false);

    if (res.success) {
      setMessage({ type: 'success', text: editingId ? 'Tournament updated successfully!' : 'Tournament added successfully!' });
      setEditingId(null);
      setName('');
      setEventDate('');
      setVenue('');
      setEntryFee('');
      setCategories('');
      setDescription('');
      setPosterUrl('');
      loadTournaments();
    } else {
      setMessage({ type: 'error', text: res.error || 'Failed to save tournament' });
    }
  };

  const handleEditClick = (t: Tournament) => {
    setEditingId(t.id);
    setName(t.name);
    setEventDate(new Date(t.event_date).toISOString().slice(0, 16));
    setVenue(t.venue);
    setEntryFee(t.entry_fee.toString());
    setCategories(t.categories.join(', '));
    setDescription(t.description);
    setPosterUrl(t.poster_url || '');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tournament?')) return;

    const res = await apiRequest(`/tournaments/${id}`, {
      method: 'DELETE',
    });

    if (res.success) {
      loadTournaments();
    } else {
      alert(res.error || 'Failed to delete tournament');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Brown Banner Card */}
      <div className="bg-[#6B4A34] text-white p-6 md:p-8 rounded-2xl shadow-md border border-[#573b29] relative overflow-hidden space-y-2">
        <h1 className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-white">
          Manage Tournaments
        </h1>
        <p className="text-xs md:text-sm text-[#FAF7F2]/90 leading-relaxed font-sans max-w-3xl">
          Create and edit upcoming chess tournaments, set entry fees (KES), categories, venue locations, and poster images.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editor Form Card */}
        <div className="bg-white border border-stone-200 p-6 rounded-2xl shadow-sm space-y-4 h-fit">
          <h2 className="font-serif text-base font-bold text-[#6B4A34] border-b border-stone-100 pb-3">
            {editingId ? 'Edit Tournament' : 'Add New Tournament'}
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
              <label className="block text-xs font-semibold text-stone-700 mb-1">Tournament Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nairobi Youth Chess Cup"
                className="w-full bg-white border border-stone-300 p-2.5 rounded-xl text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-[#6B4A34]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Event Date *</label>
                <input
                  type="datetime-local"
                  required
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full bg-white border border-stone-300 p-2 rounded-xl text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-[#6B4A34]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Entry Fee (KES) *</label>
                <input
                  type="number"
                  required
                  value={entryFee}
                  onChange={(e) => setEntryFee(e.target.value)}
                  placeholder="500"
                  className="w-full bg-white border border-stone-300 p-2.5 rounded-xl text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-[#6B4A34]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Venue Location *</label>
              <input
                type="text"
                required
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="Kibera Community Center"
                className="w-full bg-white border border-stone-300 p-2.5 rounded-xl text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-[#6B4A34]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Categories (Comma separated)</label>
              <input
                type="text"
                value={categories}
                onChange={(e) => setCategories(e.target.value)}
                placeholder="Open, Junior U18, Ladies, PWD"
                className="w-full bg-white border border-stone-300 p-2.5 rounded-xl text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-[#6B4A34]"
              />
            </div>

            <ImageUploadInput
              label="Poster Image (Upload from Device)"
              value={posterUrl}
              onChange={(url) => setPosterUrl(url)}
            />

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Tournament Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Details on tournament format, prizes, and schedule..."
                className="w-full bg-white border border-stone-300 p-2.5 rounded-xl text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-[#6B4A34] resize-none"
              />
            </div>

            <div className="flex space-x-2 pt-2">
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setName('');
                    setEventDate('');
                    setVenue('');
                    setEntryFee('');
                    setCategories('');
                    setDescription('');
                    setPosterUrl('');
                  }}
                  className="w-1/2 py-2.5 border border-stone-300 font-semibold text-xs rounded-xl hover:bg-stone-100 text-stone-600 transition-colors"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`${editingId ? 'w-1/2' : 'w-full'} py-2.5 bg-[#6B4A34] hover:bg-[#573b29] text-white font-bold text-xs rounded-xl shadow-xs hover:shadow-md active:scale-95 transition-all duration-200 flex items-center justify-center space-x-2`}
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <span>{editingId ? 'Update Event' : 'Create Event'}</span>}
              </button>
            </div>
          </form>
        </div>

        {/* Tournaments List Table Card */}
        <div className="lg:col-span-2 bg-white border border-stone-200 p-6 rounded-2xl shadow-sm overflow-x-auto">
          <div className="flex items-center justify-between border-b border-stone-100 pb-4 mb-4">
            <h2 className="font-serif text-base font-bold text-charcoal">
              Active Tournaments ({tournaments.length})
            </h2>
            <span className="text-[11px] font-mono text-stone-400">Synced to Database</span>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-[#6B4A34]" />
            </div>
          ) : tournaments.length === 0 ? (
            <div className="text-center py-16 text-stone-400 text-xs font-sans bg-[#FAF7F2] border border-stone-200 rounded-xl">
              No active tournaments found. Post one using the form on the left.
            </div>
          ) : (
            <table className="w-full text-left border-collapse font-sans text-xs">
              <thead>
                <tr className="border-b border-stone-200 text-stone-500 font-bold uppercase tracking-wider">
                  <th className="pb-3">Name</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Venue</th>
                  <th className="pb-3">Fee</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {tournaments.map((t) => (
                  <tr key={t.id} className="text-charcoal hover:bg-[#FAF7F2]/60 transition-colors">
                    <td className="py-3.5 font-bold max-w-[180px] truncate">{t.name}</td>
                    <td className="py-3.5 text-stone-600">{new Date(t.event_date).toLocaleDateString()}</td>
                    <td className="py-3.5 max-w-[140px] truncate text-stone-600">{t.venue}</td>
                    <td className="py-3.5 font-bold text-[#6B4A34]">KES {t.entry_fee}</td>
                    <td className="py-3.5 text-right space-x-1">
                      <button
                        onClick={() => handleEditClick(t)}
                        className="p-1.5 text-stone-600 hover:text-[#6B4A34] hover:bg-stone-100 rounded-lg transition-colors"
                        title="Edit Tournament"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(t.id)}
                        className="p-1.5 text-stone-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Tournament"
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
