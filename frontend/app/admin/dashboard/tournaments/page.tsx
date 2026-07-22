'use client';

import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/api';
import { Tournament } from '@/types';
import { Loader2, Plus, Trash, Pencil } from 'lucide-react';

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
  const [apiError, setApiError] = useState<string | null>(null);

  const loadTournaments = async () => {
    setLoading(true);
    setApiError(null);
    const res = await apiRequest<Tournament[]>('/tournaments');
    if (res.success && Array.isArray(res.data)) {
      setTournaments(res.data);
    } else {
      setApiError(res.error || 'Unable to load tournaments from the database.');
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
      // Reset fields
      setName('');
      setEventDate('');
      setVenue('');
      setEntryFee('');
      setCategories('');
      setDescription('');
      setPosterUrl('');
      loadTournaments();
    } else {
      setMessage({ type: 'error', text: res.error || 'Failed to create tournament' });
    }
  };

  const handleEditClick = (tournament: Tournament) => {
    setEditingId(tournament.id);
    setName(tournament.name);
    setEventDate(new Date(tournament.event_date).toISOString().slice(0, 16));
    setVenue(tournament.venue);
    setEntryFee(tournament.entry_fee.toString());
    setCategories(tournament.categories.join(', '));
    setDescription(tournament.description);
    setPosterUrl(tournament.poster_url || '');
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
    <div className="space-y-10">
      {/* Title */}
      <div>
        <h1 className="font-serif text-3xl font-bold text-charcoal">Manage Tournaments</h1>
        <p className="font-sans text-xs text-charcoal/50">
          Create, update, and delete active tournament postings.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Form: Add Tournament */}
        <div className="bg-offwhite border border-stone/30 p-6 rounded-lg shadow-sm space-y-6 h-fit">
          <h2 className="font-serif text-lg font-bold text-wood flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>{editingId ? 'Edit Tournament' : 'Add Tournament'}</span>
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
              <label className="block font-sans text-xs font-semibold text-charcoal/70 mb-1">Tournament Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nairobi Youth Cup"
                className="w-full bg-offwhite border border-stone/30 p-2.5 rounded text-sm text-charcoal focus:outline-none focus:border-wood"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-sans text-xs font-semibold text-charcoal/70 mb-1">Event Date</label>
                <input
                  type="datetime-local"
                  required
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full bg-offwhite border border-stone/30 p-2.5 rounded text-sm text-charcoal focus:outline-none focus:border-wood"
                />
              </div>
              <div>
                <label className="block font-sans text-xs font-semibold text-charcoal/70 mb-1">Entry Fee (KES)</label>
                <input
                  type="number"
                  required
                  value={entryFee}
                  onChange={(e) => setEntryFee(e.target.value)}
                  placeholder="500"
                  className="w-full bg-offwhite border border-stone/30 p-2.5 rounded text-sm text-charcoal focus:outline-none focus:border-wood"
                />
              </div>
            </div>

            <div>
              <label className="block font-sans text-xs font-semibold text-charcoal/70 mb-1">Venue</label>
              <input
                type="text"
                required
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="Kibera Community Hall"
                className="w-full bg-offwhite border border-stone/30 p-2.5 rounded text-sm text-charcoal focus:outline-none focus:border-wood"
              />
            </div>

            <div>
              <label className="block font-sans text-xs font-semibold text-charcoal/70 mb-1">Categories (comma-separated)</label>
              <input
                type="text"
                required
                value={categories}
                onChange={(e) => setCategories(e.target.value)}
                placeholder="Under 12, Under 18, Open"
                className="w-full bg-offwhite border border-stone/30 p-2.5 rounded text-sm text-charcoal focus:outline-none focus:border-wood"
              />
            </div>

            <div>
              <label className="block font-sans text-xs font-semibold text-charcoal/70 mb-1">Poster Image URL (Optional)</label>
              <input
                type="url"
                value={posterUrl}
                onChange={(e) => setPosterUrl(e.target.value)}
                placeholder="https://example.com/poster.jpg"
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
                placeholder="Details about structure and prizes..."
                className="w-full bg-offwhite border border-stone/30 p-2.5 rounded text-sm text-charcoal focus:outline-none focus:border-wood resize-none"
              />
            </div>

            <div className="flex space-x-3 pt-2">
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
                  className="w-1/2 py-3 border border-stone/30 font-sans text-sm font-semibold rounded hover:bg-stone/10 text-charcoal/70 transition-colors"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`${editingId ? 'w-1/2' : 'w-full'} mt-4 py-3 bg-wood text-offwhite font-sans text-sm font-semibold rounded hover:bg-wood/90 transition-colors flex items-center justify-center space-x-2`}
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <span>{editingId ? 'Update Tournament' : 'Create Tournament'}</span>}
              </button>
            </div>
          </form>
        </div>

        {/* Table: Tournaments list */}
        <div className="lg:col-span-2 bg-offwhite border border-stone/30 p-6 rounded-lg shadow-sm overflow-x-auto">
          <h2 className="font-serif text-lg font-bold text-charcoal mb-6">Current Tournaments</h2>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-wood" />
            </div>
          ) : tournaments.length === 0 ? (
            <div className="text-center py-12 text-charcoal/40 text-sm font-sans">
              No tournaments found in the database yet. Create one using the form on the left.
            </div>
          ) : (
            <table className="w-full text-left border-collapse font-sans text-sm">
              <thead>
                <tr className="border-b border-stone/30 text-charcoal/60 font-semibold text-xs uppercase">
                  <th className="pb-3">Name</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Venue</th>
                  <th className="pb-3">Fee</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone/10">
                {tournaments.map((t) => (
                  <tr key={t.id} className="text-charcoal/80 hover:bg-stone/5">
                    <td className="py-4 font-semibold">{t.name}</td>
                    <td className="py-4">{new Date(t.event_date).toLocaleDateString()}</td>
                    <td className="py-4 max-w-[150px] truncate">{t.venue}</td>
                    <td className="py-4 font-bold text-wood">KES {t.entry_fee}</td>
                    <td className="py-4 text-right">
                      <button
                        onClick={() => handleEditClick(t)}
                        className="text-wood hover:text-wood/80 p-1.5 rounded hover:bg-stone/10 transition-colors"
                        title="Edit Tournament"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(t.id)}
                        className="text-red-500 hover:text-red-700 p-1.5 rounded hover:bg-red-50 transition-colors"
                        title="Delete Tournament"
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
