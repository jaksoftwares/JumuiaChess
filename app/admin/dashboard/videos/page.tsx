'use client';

import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/api';
import { Video } from '@/types';
import { Loader2, Plus, Trash2, Edit2, PlayCircle, Youtube, CheckCircle2 } from 'lucide-react';
import { Modal } from '@/components/admin/Modal';

export default function AdminVideos() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [description, setDescription] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadVideos = async () => {
    setLoading(true);
    const res = await apiRequest<Video[]>('/videos');
    if (res.success && Array.isArray(res.data)) {
      setVideos(res.data);
    } else {
      setVideos([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadVideos();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingId(null);
    setTitle('');
    setYoutubeUrl('');
    setDescription('');
    setIsFeatured(false);
    setMessage(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (video: Video) => {
    setEditingId(video.id);
    setTitle(video.title);
    setYoutubeUrl(video.youtube_url);
    setDescription(video.description);
    setIsFeatured(video.is_featured);
    setMessage(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    const body = {
      title,
      youtube_url: youtubeUrl,
      description,
      is_featured: isFeatured,
    };

    let res;
    if (editingId) {
      res = await apiRequest(`/videos/${editingId}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      });
    } else {
      res = await apiRequest('/videos', {
        method: 'POST',
        body: JSON.stringify(body),
      });
    }

    setIsSubmitting(false);

    if (res.success) {
      setIsModalOpen(false);
      loadVideos();
    } else {
      setMessage({ type: 'error', text: res.error || 'Failed to save video' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this video?')) return;

    const res = await apiRequest(`/videos/${id}`, {
      method: 'DELETE',
    });

    if (res.success) {
      loadVideos();
    } else {
      alert(res.error || 'Failed to delete video');
    }
  };

  const getYouTubeId = (url: string) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&]{11})/);
    return match ? match[1] : '';
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Brown Banner Card */}
      <div className="bg-[#6B4A34] text-white p-6 md:p-8 rounded-2xl shadow-md border border-[#573b29] relative overflow-hidden space-y-2">
        <h1 className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-white">
          Videos & Live Streams
        </h1>
        <p className="text-xs md:text-sm text-[#FAF7F2]/90 leading-relaxed font-sans max-w-3xl">
          Manage YouTube videos and live streams featured on the website.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-stone-600 uppercase tracking-wider">
            Video Gallery ({videos.length})
          </span>
          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2.5 bg-[#6B4A34] hover:bg-[#573b29] text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-xs hover:shadow-md active:scale-95 transition-all duration-200"
          >
            <Plus className="w-4 h-4" /> Add New Video
          </button>
        </div>

        {/* Videos Table Card */}
        <div className="bg-white border border-stone-200 p-6 rounded-2xl shadow-sm overflow-x-auto w-full">
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-[#6B4A34]" />
            </div>
          ) : videos.length === 0 ? (
            <div className="text-center py-16 text-stone-400 text-xs font-sans bg-[#FAF7F2] border border-stone-200 rounded-xl flex flex-col items-center justify-center space-y-3">
              <Youtube className="w-8 h-8 text-stone-300" />
              <p>No videos found in database.</p>
              <button
                onClick={handleOpenCreateModal}
                className="mt-2 px-4 py-2 bg-[#6B4A34] text-white text-xs font-bold rounded-xl inline-flex items-center gap-2 shadow-sm"
              >
                <Plus className="w-4 h-4" /> Add First Video
              </button>
            </div>
          ) : (
            <table className="w-full text-left border-collapse font-sans text-xs">
              <thead>
                <tr className="border-b border-stone-200 text-stone-500 font-bold uppercase tracking-wider">
                  <th className="pb-3">Thumbnail</th>
                  <th className="pb-3">Title</th>
                  <th className="pb-3">Featured</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {videos.map((video) => {
                  const yId = getYouTubeId(video.youtube_url);
                  return (
                    <tr key={video.id} className="text-charcoal hover:bg-[#FAF7F2]/60 transition-colors">
                      <td className="py-3.5">
                        <div className="relative w-20 h-12 bg-stone-200 rounded overflow-hidden">
                          {yId ? (
                            <img 
                              src={`https://img.youtube.com/vi/${yId}/mqdefault.jpg`} 
                              alt="thumbnail" 
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <div className="w-full h-full bg-stone-300"></div>
                          )}
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                            <PlayCircle className="w-5 h-5 text-white opacity-80" />
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 font-bold max-w-[220px] truncate">{video.title}</td>
                    <td className="py-3.5">
                      {video.is_featured ? (
                        <span className="text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Featured Highlight
                        </span>
                      ) : (
                        <span className="text-stone-500 bg-stone-100 px-2 py-0.5 rounded border border-stone-200 font-bold">
                          Standard
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 text-right space-x-1">
                      <button
                         onClick={() => handleEditClick(video)}
                         className="p-1.5 text-stone-600 hover:text-[#6B4A34] hover:bg-stone-100 rounded-lg transition-colors"
                         title="Edit Video"
                      >
                         <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                         onClick={() => handleDelete(video.id)}
                         className="p-1.5 text-stone-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                         title="Delete Video"
                      >
                         <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingId ? 'Edit Video' : 'Add New Video'}
      >
        {message && (
          <div className={`p-3.5 rounded-xl text-xs font-medium ${
            message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Video Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Empowering Youth Through Chess"
              className="w-full bg-white border border-stone-300 p-2.5 rounded-xl text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-[#6B4A34]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">YouTube Video URL *</label>
            <input
              type="url"
              required
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full bg-white border border-stone-300 p-2.5 rounded-xl text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-[#6B4A34]"
            />
            <p className="text-[10px] text-stone-500 mt-1">
              Provide the full URL of the YouTube video.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Description *</label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the video..."
              className="w-full bg-white border border-stone-300 p-2.5 rounded-xl text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-[#6B4A34] resize-none"
            />
          </div>

          <div className="flex items-center space-x-2 pt-1">
            <input
              type="checkbox"
              id="isFeatured"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="rounded border-stone-300 text-[#6B4A34] focus:ring-[#6B4A34]"
            />
            <label htmlFor="isFeatured" className="text-xs font-semibold text-stone-700 cursor-pointer">
              Set as Main Featured Highlight (Will replace current featured video)
            </label>
          </div>

          <div className="flex space-x-2 pt-2 border-t border-stone-200">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="w-1/2 py-2.5 mt-2 border border-stone-300 font-semibold text-xs rounded-xl hover:bg-stone-100 text-stone-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-1/2 mt-2 py-2.5 bg-[#6B4A34] hover:bg-[#573b29] text-white font-bold text-xs rounded-xl shadow-xs hover:shadow-md active:scale-95 transition-all duration-200 flex items-center justify-center space-x-2`}
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <span>{editingId ? 'Update Video' : 'Add Video'}</span>}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
