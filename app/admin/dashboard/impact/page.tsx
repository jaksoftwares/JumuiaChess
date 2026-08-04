'use client';

import { useState, useEffect } from 'react';
import { apiRequest, uploadFile } from '@/lib/api';
import { ImpactProgram } from '@/types';
import { Loader2, Plus, Edit2, Trash2, Search, ArrowUp, ArrowDown } from 'lucide-react';
import { Modal } from '@/components/admin/Modal';
import { ImageUploadInput } from '@/components/admin/ImageUploadInput';

export default function AdminImpact() {
  const [programs, setPrograms] = useState<ImpactProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingProgram, setEditingProgram] = useState<ImpactProgram | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState<string | File | null>(null);
  const [sortOrder, setSortOrder] = useState('0');

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    setLoading(true);
    const res = await apiRequest<ImpactProgram[]>('/impact');
    if (res.success && res.data) {
      setPrograms(res.data);
    }
    setLoading(false);
  };

  const filteredPrograms = programs.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openAddModal = () => {
    setEditingProgram(null);
    setTitle('');
    setDescription('');
    setImageUrl(null);
    setSortOrder(String(programs.length + 1));
    setIsModalOpen(true);
  };

  const openEditModal = (program: ImpactProgram) => {
    setEditingProgram(program);
    setTitle(program.title);
    setDescription(program.description);
    setImageUrl(program.image_url);
    setSortOrder(program.sort_order.toString());
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl) {
      alert("Please provide an image icon.");
      return;
    }

    setIsSubmitting(true);

    let finalImageUrl = typeof imageUrl === 'string' ? imageUrl : '';
    
    // Upload if it's a new file
    if (imageUrl instanceof File) {
      const uploadRes = await uploadFile(imageUrl);
      if (!uploadRes.success || !uploadRes.url) {
        alert(uploadRes.error || 'Failed to upload image');
        setIsSubmitting(false);
        return;
      }
      finalImageUrl = uploadRes.url;
    }

    const body = {
      title,
      description,
      image_url: finalImageUrl,
      sort_order: parseInt(sortOrder) || 0,
    };

    let res;
    if (editingProgram) {
      res = await apiRequest(`/impact/${editingProgram.id}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      });
    } else {
      res = await apiRequest('/impact', {
        method: 'POST',
        body: JSON.stringify(body),
      });
    }

    setIsSubmitting(false);

    if (res.success) {
      setIsModalOpen(false);
      fetchPrograms();
    } else {
      alert(res.error || 'Failed to save impact program');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this program?')) return;
    
    const res = await apiRequest(`/impact/${id}`, { method: 'DELETE' });
    if (res.success) {
      fetchPrograms();
    } else {
      alert(res.error || 'Failed to delete');
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === programs.length - 1) return;

    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    const currentProg = programs[index];
    const swapProg = programs[swapIndex];

    // Swap their sort orders
    const newCurrentOrder = swapProg.sort_order;
    const newSwapOrder = currentProg.sort_order;

    // Optimistic update
    const newPrograms = [...programs];
    newPrograms[index] = { ...currentProg, sort_order: newCurrentOrder };
    newPrograms[swapIndex] = { ...swapProg, sort_order: newSwapOrder };
    
    // Re-sort
    newPrograms.sort((a, b) => a.sort_order - b.sort_order);
    setPrograms(newPrograms);

    // Persist to DB
    await Promise.all([
      apiRequest(`/impact/${currentProg.id}`, { method: 'PUT', body: JSON.stringify({ sort_order: newCurrentOrder }) }),
      apiRequest(`/impact/${swapProg.id}`, { method: 'PUT', body: JSON.stringify({ sort_order: newSwapOrder }) })
    ]);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-charcoal">Impact Framework</h1>
          <p className="text-sm text-stone-500">Manage the core pillars on the homepage</p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-[#6B4A34] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#573b29] transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Program
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-4">
        <div className="relative max-w-md mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            placeholder="Search programs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-stone-200 text-sm focus:outline-none focus:border-[#6B4A34]"
          />
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#6B4A34]" />
          </div>
        ) : filteredPrograms.length === 0 ? (
          <div className="text-center py-12 text-stone-500 text-sm">
            No impact programs found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-stone-50 text-stone-600 font-semibold border-b border-stone-200">
                <tr>
                  <th className="px-4 py-3 rounded-tl-xl w-16">Reorder</th>
                  <th className="px-4 py-3">Icon</th>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3 hidden md:table-cell">Description</th>
                  <th className="px-4 py-3 rounded-tr-xl text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredPrograms.map((program, index) => (
                  <tr key={program.id} className="hover:bg-stone-50/50">
                    <td className="px-4 py-3">
                      <div className="flex flex-col items-center gap-1 text-stone-400">
                        <button 
                          onClick={() => handleMove(index, 'up')}
                          disabled={index === 0 || searchTerm !== ''}
                          className="hover:text-charcoal disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleMove(index, 'down')}
                          disabled={index === programs.length - 1 || searchTerm !== ''}
                          className="hover:text-charcoal disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center p-2">
                        <img src={program.image_url} alt={program.title} className="w-full h-full object-contain" />
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-charcoal">{program.title}</td>
                    <td className="px-4 py-3 hidden md:table-cell text-stone-500 max-w-xs truncate">
                      {program.description}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(program)}
                          className="p-2 text-stone-400 hover:text-blue-600 transition"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(program.id)}
                          className="p-2 text-stone-400 hover:text-red-600 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProgram ? 'Edit Impact Program' : 'Add Impact Program'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-stone-300 p-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6B4A34]"
              placeholder="e.g., Public Schools Development"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Description *</label>
            <textarea
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full border border-stone-300 p-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6B4A34]"
              placeholder="Describe the impact pillar..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Program Icon (Image) *</label>
            <ImageUploadInput
              value={imageUrl}
              onChange={(val) => setImageUrl(val)}
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-sm font-semibold text-stone-600 hover:bg-stone-100 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-[#6B4A34] text-white text-sm font-semibold rounded-lg hover:bg-[#573b29] transition flex items-center gap-2"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {editingProgram ? 'Save Changes' : 'Create Program'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
