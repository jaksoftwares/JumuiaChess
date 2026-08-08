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
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Brown Banner Card */}
      <div className="bg-[#6B4A34] text-white p-6 md:p-8 rounded-2xl shadow-md border border-[#573b29] relative overflow-hidden space-y-2">
        <h1 className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-white">
          Impact Framework
        </h1>
        <p className="text-xs md:text-sm text-[#FAF7F2]/90 leading-relaxed font-sans max-w-3xl">
          Manage the core organizational pillars showcased on the public homepage.
        </p>
      </div>

      {/* Actions Toolbar */}
      <div className="bg-white border border-[#6B4A34]/20 p-5 rounded-2xl space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="w-full sm:w-auto relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B4A34]/50" />
            <input
              type="text"
              placeholder="Search programs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 pl-9 pr-4 py-2 bg-[#FAF7F2] border border-[#6B4A34]/20 rounded-xl text-xs focus:outline-none focus:border-[#6B4A34] font-sans font-bold text-[#232320]"
            />
          </div>
          <button
            onClick={openAddModal}
            className="w-full sm:w-auto px-4 py-2 bg-[#FAF7F2] hover:bg-[#6B4A34] hover:text-white text-[#232320] font-sans text-xs font-bold rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 border border-[#6B4A34]/20 hover:border-[#6B4A34] shadow-sm active:scale-95 group"
          >
            <Plus className="w-3.5 h-3.5 text-[#6B4A34] group-hover:text-white transition-colors" />
            <span>Add Program</span>
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white border border-[#6B4A34]/20 p-6 rounded-2xl shadow-sm overflow-x-auto flex flex-col">
        <div className="flex items-center justify-between border-b border-[#6B4A34]/10 pb-4 mb-4">
          <h2 className="font-serif text-base font-bold text-[#232320]">
            Impact Programs
          </h2>
        </div>

        {loading ? (
          <div className="py-16 text-center text-[#6B4A34]">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
            Loading programs...
          </div>
        ) : filteredPrograms.length === 0 ? (
          <div className="py-16 text-center text-[#232320]/50 text-xs font-sans bg-[#FAF7F2] border border-[#6B4A34]/10 rounded-xl block w-full">
            No impact programs found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-sans text-xs min-w-[600px]">
              <thead>
                <tr className="border-b border-[#6B4A34]/10 text-[#6B4A34] font-bold uppercase tracking-wider text-[10px]">
                  <th className="pb-3 w-16">Sort</th>
                  <th className="pb-3">Icon</th>
                  <th className="pb-3">Title</th>
                  <th className="pb-3 hidden md:table-cell">Description</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#6B4A34]/10">
                {filteredPrograms.map((program, index) => (
                  <tr key={program.id} className="text-[#232320] hover:bg-[#FAF7F2] transition-colors">
                    <td className="py-3.5">
                      <div className="flex flex-col items-center gap-1 text-[#232320]/30">
                        <button 
                          onClick={() => handleMove(index, 'up')}
                          disabled={index === 0 || searchTerm !== ''}
                          className="hover:text-[#6B4A34] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleMove(index, 'down')}
                          disabled={index === programs.length - 1 || searchTerm !== ''}
                          className="hover:text-[#6B4A34] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                    <td className="py-3.5">
                      <div className="w-10 h-10 bg-[#FAF7F2] border border-[#6B4A34]/20 rounded-full flex items-center justify-center p-2 shadow-sm">
                        <img src={program.image_url} alt={program.title} className="w-full h-full object-contain" />
                      </div>
                    </td>
                    <td className="py-3.5 font-bold text-[#232320] text-sm">{program.title}</td>
                    <td className="py-3.5 hidden md:table-cell text-[#232320]/70 max-w-xs pr-4 text-xs">
                      <div className="line-clamp-2">{program.description}</div>
                    </td>
                    <td className="py-3.5 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(program)}
                        className="inline-flex items-center justify-center p-2 bg-[#FAF7F2] text-[#6B4A34] hover:bg-[#6B4A34] hover:text-white rounded-lg transition-colors border border-[#6B4A34]/20 shadow-sm"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(program.id)}
                        className="inline-flex items-center justify-center p-2 bg-red-900/10 text-red-900 hover:bg-[#232320] hover:text-white rounded-lg transition-colors border border-red-900/20 shadow-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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
