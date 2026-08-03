'use client';

import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Users, Loader2, ArrowUpDown, UserCheck, Sparkles } from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { ImageUploadInput } from '@/components/admin/ImageUploadInput';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  image_url: string;
  sort_order: number;
  created_at?: string;
}

export default function AdminTeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    role: '',
    bio: '',
    image_url: '',
    sort_order: 0,
  });

  const fetchTeam = async () => {
    setLoading(true);
    setError(null);
    const res = await apiRequest<TeamMember[]>('/team');
    if (res.success && res.data) {
      setMembers(res.data);
    } else {
      setError(res.error || 'Failed to fetch team members');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingMember(null);
    setFormData({
      name: '',
      role: '',
      bio: '',
      image_url: '',
      sort_order: members.length + 1,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (member: TeamMember) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      role: member.role,
      bio: member.bio,
      image_url: member.image_url,
      sort_order: member.sort_order ?? 0,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const endpoint = editingMember ? `/team/${editingMember.id}` : '/team';
    const method = editingMember ? 'PUT' : 'POST';

    const res = await apiRequest(endpoint, {
      method,
      body: JSON.stringify(formData),
    });

    if (res.success) {
      setIsModalOpen(false);
      fetchTeam();
    } else {
      setError(res.error || 'Operation failed');
    }
    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this team member?')) return;

    const res = await apiRequest(`/team/${id}`, { method: 'DELETE' });
    if (res.success) {
      fetchTeam();
    } else {
      alert(res.error || 'Failed to delete member');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Brown Banner Card */}
      <div className="bg-[#6B4A34] text-white p-6 md:p-8 rounded-2xl shadow-md border border-[#573b29] relative overflow-hidden space-y-2">
        <h1 className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-white">
          Meet the Team
        </h1>
        <p className="text-xs md:text-sm text-[#FAF7F2]/90 leading-relaxed font-sans max-w-3xl">
          Upload team member photos directly from device and manage executive leadership profiles displayed on the website.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs">
          {error}
        </div>
      )}

      {/* Main Grid & Status Bar */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-stone-600 uppercase tracking-wider">
            Published Team Profiles ({members.length})
          </span>
          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2.5 bg-[#6B4A34] hover:bg-[#573b29] text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-xs hover:shadow-md active:scale-95 transition-all duration-200"
          >
            <Plus className="w-4 h-4" /> Add Team Member
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-stone-500">
            <Loader2 className="w-8 h-8 animate-spin text-[#6B4A34]" />
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-stone-200 p-8 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#6B4A34]/10 text-[#6B4A34] flex items-center justify-center mx-auto">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-charcoal font-serif">No team members added yet</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Click "Add Team Member" to upload photos directly from device and showcase executive members.
            </p>
            <button
              onClick={handleOpenCreateModal}
              className="mt-2 px-4 py-2.5 bg-[#6B4A34] text-white text-xs font-bold rounded-xl inline-flex items-center gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" /> Add First Team Member
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {members.map((member) => (
              <div
                key={member.id}
                className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-md hover:border-[#6B4A34] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-56 bg-stone-100 overflow-hidden">
                    {member.image_url ? (
                      <img
                        src={member.image_url}
                        alt={member.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-stone-400">
                        <Users className="w-12 h-12" />
                      </div>
                    )}
                    <span className="absolute top-3 right-3 bg-charcoal/85 text-white text-[10px] font-mono px-2.5 py-1 rounded-full flex items-center gap-1 backdrop-blur-sm shadow-xs">
                      <ArrowUpDown className="w-3 h-3 text-amber-300" /> Order: {member.sort_order}
                    </span>
                  </div>

                  <div className="p-5 space-y-2">
                    <h3 className="text-lg font-bold text-charcoal font-serif">{member.name}</h3>
                    <span className="inline-block text-[11px] font-bold text-[#6B4A34] bg-[#FAF7F2] border border-stone-200 px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                      {member.role}
                    </span>
                    <p className="text-xs text-stone-600 leading-relaxed line-clamp-3 pt-1">
                      {member.bio}
                    </p>
                  </div>
                </div>

                <div className="p-4 border-t border-stone-100 flex justify-end gap-2 bg-[#FAF7F2]/50">
                  <button
                    onClick={() => handleOpenEditModal(member)}
                    className="px-3 py-1.5 text-xs font-semibold text-stone-700 bg-white border border-stone-200 hover:text-[#6B4A34] hover:border-[#6B4A34] rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(member.id)}
                    className="px-3 py-1.5 text-xs font-semibold text-rose-600 bg-white border border-stone-200 hover:bg-rose-50 hover:border-rose-200 rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-stone-200 space-y-4">
            <h2 className="text-lg font-bold text-charcoal font-serif">
              {editingMember ? 'Edit Team Member' : 'Add New Team Member'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. John Doe"
                  className="w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2 text-xs text-charcoal focus:ring-2 focus:ring-[#6B4A34] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Role / Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder="e.g. Head of Operations"
                  className="w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2 text-xs text-charcoal focus:ring-2 focus:ring-[#6B4A34] focus:outline-none"
                />
              </div>

              <ImageUploadInput
                label="Profile Photo (Upload from Device)"
                value={formData.image_url}
                onChange={(url) => setFormData({ ...formData, image_url: url })}
              />

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Biography *
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Brief background..."
                  className="w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2 text-xs text-charcoal focus:ring-2 focus:ring-[#6B4A34] focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Display Order
                </label>
                <input
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                  className="w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2 text-xs text-charcoal focus:ring-2 focus:ring-[#6B4A34] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-bold text-white bg-[#6B4A34] hover:bg-[#573b29] rounded-xl flex items-center gap-2 disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingMember ? 'Save Changes' : 'Add Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
