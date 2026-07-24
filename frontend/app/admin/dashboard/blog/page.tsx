'use client';

import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/api';
import { BlogPost } from '@/types';
import { Loader2, Plus, BookOpen, Trash2, Edit2, Sparkles, CheckCircle2 } from 'lucide-react';
import { ImageUploadInput } from '@/components/admin/ImageUploadInput';

export default function AdminBlog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [featuredImageUrl, setFeaturedImageUrl] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [body, setBody] = useState('');
  const [published, setPublished] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadPosts = async () => {
    setLoading(true);
    const res = await apiRequest<BlogPost[]>('/blog/all');
    if (res.success && Array.isArray(res.data)) {
      setPosts(res.data);
    } else {
      setPosts([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    setSlug(
      val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    const bodyData = {
      title,
      slug,
      featured_image_url: featuredImageUrl || undefined,
      excerpt,
      body,
      published,
    };

    let res;
    if (editingId) {
      res = await apiRequest(`/blog/${editingId}`, {
        method: 'PUT',
        body: JSON.stringify(bodyData),
      });
    } else {
      res = await apiRequest('/blog', {
        method: 'POST',
        body: JSON.stringify(bodyData),
      });
    }

    setIsSubmitting(false);

    if (res.success) {
      setMessage({ type: 'success', text: editingId ? 'Blog post updated successfully!' : 'Blog post published successfully!' });
      setEditingId(null);
      setTitle('');
      setSlug('');
      setFeaturedImageUrl('');
      setExcerpt('');
      setBody('');
      setPublished(true);
      loadPosts();
    } else {
      setMessage({ type: 'error', text: res.error || 'Failed to publish blog post.' });
    }
  };

  const handleEditClick = (post: BlogPost) => {
    setEditingId(post.id);
    setTitle(post.title);
    setSlug(post.slug);
    setFeaturedImageUrl(post.featured_image_url || '');
    setExcerpt(post.excerpt);
    setBody(post.body);
    setPublished(post.published);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return;

    const res = await apiRequest(`/blog/${id}`, {
      method: 'DELETE',
    });

    if (res.success) {
      loadPosts();
    } else {
      alert(res.error || 'Failed to delete blog post');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Brown Banner Card */}
      <div className="bg-[#6B4A34] text-white p-6 md:p-8 rounded-2xl shadow-md border border-[#573b29] relative overflow-hidden space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-[#FAF7F2] text-[11px] font-mono font-bold tracking-wide backdrop-blur-sm">
          <BookOpen className="w-3.5 h-3.5 text-[#C8B195]" />
          <span>News & Press Releases</span>
        </div>
        <h1 className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-white">
          Blog & Articles
        </h1>
        <p className="text-xs md:text-sm text-[#FAF7F2]/90 leading-relaxed font-sans max-w-3xl">
          Publish press releases, news reports, and community impact stories with device image uploads.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editor Form Card */}
        <div className="bg-white border border-stone-200 p-6 rounded-2xl shadow-sm space-y-4 h-fit">
          <h2 className="font-serif text-base font-bold text-[#6B4A34] flex items-center gap-2 border-b border-stone-100 pb-3">
            <Plus className="w-4 h-4 text-[#6B4A34]" />
            <span>{editingId ? 'Edit Article' : 'Compose New Article'}</span>
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
              <label className="block text-xs font-semibold text-stone-700 mb-1">Article Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Tournament Success in Kibera"
                className="w-full bg-white border border-stone-300 p-2.5 rounded-xl text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-[#6B4A34]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Slug URL *</label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="tournament-success-in-kibera"
                className="w-full bg-white border border-stone-300 p-2.5 rounded-xl text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-[#6B4A34]"
              />
            </div>

            <ImageUploadInput
              label="Featured Image (Upload from Device)"
              value={featuredImageUrl}
              onChange={(url) => setFeaturedImageUrl(url)}
            />

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Excerpt Summary *</label>
              <textarea
                required
                rows={2}
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="A short summary sentence displayed on the home page news grid..."
                className="w-full bg-white border border-stone-300 p-2.5 rounded-xl text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-[#6B4A34] resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Article Content (Text / Markdown) *</label>
              <textarea
                required
                rows={6}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write full article body text here..."
                className="w-full bg-white border border-stone-300 p-2.5 rounded-xl text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-[#6B4A34] font-sans resize-none"
              />
            </div>

            <div className="flex items-center space-x-2 pt-1">
              <input
                type="checkbox"
                id="published"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                className="rounded border-stone-300 text-[#6B4A34] focus:ring-[#6B4A34]"
              />
              <label htmlFor="published" className="text-xs font-semibold text-stone-700 cursor-pointer">
                Publish Immediately (Visible to Public)
              </label>
            </div>

            <div className="flex space-x-2 pt-2">
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setTitle('');
                    setSlug('');
                    setFeaturedImageUrl('');
                    setExcerpt('');
                    setBody('');
                    setPublished(true);
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
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <span>{editingId ? 'Update Post' : 'Publish Post'}</span>}
              </button>
            </div>
          </form>
        </div>

        {/* Blog Table Card */}
        <div className="lg:col-span-2 bg-white border border-stone-200 p-6 rounded-2xl shadow-sm overflow-x-auto">
          <div className="flex items-center justify-between border-b border-stone-100 pb-4 mb-4">
            <h2 className="font-serif text-base font-bold text-charcoal flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#6B4A34]" /> Articles & News Reports ({posts.length})
            </h2>
            <span className="text-[11px] font-mono text-stone-400">Synced to Database</span>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-[#6B4A34]" />
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-16 text-stone-400 text-xs font-sans bg-[#FAF7F2] border border-stone-200 rounded-xl">
              No blog posts found in database. Compose one using the left editor panel.
            </div>
          ) : (
            <table className="w-full text-left border-collapse font-sans text-xs">
              <thead>
                <tr className="border-b border-stone-200 text-stone-500 font-bold uppercase tracking-wider">
                  <th className="pb-3">Title</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {posts.map((post) => (
                  <tr key={post.id} className="text-charcoal hover:bg-[#FAF7F2]/60 transition-colors">
                    <td className="py-3.5 font-bold max-w-[220px] truncate">{post.title}</td>
                    <td className="py-3.5">
                      {post.published ? (
                        <span className="text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Published
                        </span>
                      ) : (
                        <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-bold">
                          Draft
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 text-stone-500">
                      {post.published_at ? new Date(post.published_at).toLocaleDateString() : '—'}
                    </td>
                    <td className="py-3.5 text-right space-x-1">
                      <button
                        onClick={() => handleEditClick(post)}
                        className="p-1.5 text-stone-600 hover:text-[#6B4A34] hover:bg-stone-100 rounded-lg transition-colors"
                        title="Edit Article"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="p-1.5 text-stone-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Article"
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
