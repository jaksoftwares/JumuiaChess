'use client';

import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/api';
import { BlogPost } from '@/types';
import { Loader2, Plus, BookOpen, Trash, Pencil } from 'lucide-react';

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
  const [apiError, setApiError] = useState<string | null>(null);

  const loadPosts = async () => {
    setLoading(true);
    setApiError(null);
    const res = await apiRequest<BlogPost[]>('/blog/all');
    if (res.success && Array.isArray(res.data)) {
      setPosts(res.data);
    } else {
      setApiError(res.error || 'Unable to load blog posts from the database.');
      setPosts([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    // Generate a simple slug matching title
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
      setMessage({ type: 'success', text: editingId ? 'Blog post updated successfully!' : 'Blog post created successfully!' });
      setEditingId(null);
      setTitle('');
      setSlug('');
      setFeaturedImageUrl('');
      setExcerpt('');
      setBody('');
      setPublished(true);
      loadPosts();
    } else {
      setMessage({ type: 'error', text: res.error || 'Failed to create blog post.' });
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
    <div className="space-y-10">
      {/* Title */}
      <div>
        <h1 className="font-serif text-3xl font-bold text-charcoal">Manage Blog & News</h1>
        <p className="font-sans text-xs text-charcoal/50">
          Publish press releases, news reports, and stories of community impact.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Editor Form */}
        <div className="bg-offwhite border border-stone/30 p-6 rounded-lg shadow-sm space-y-6 h-fit">
          <h2 className="font-serif text-lg font-bold text-wood flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>{editingId ? 'Edit Article' : 'Create Article'}</span>
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
              <label className="block font-sans text-xs font-semibold text-charcoal/70 mb-1">Article Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Tournament Success in Kibera"
                className="w-full bg-offwhite border border-stone/30 p-2.5 rounded text-sm text-charcoal focus:outline-none focus:border-wood"
              />
            </div>

            <div>
              <label className="block font-sans text-xs font-semibold text-charcoal/70 mb-1">Slug URL</label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="tournament-success-in-kibera"
                className="w-full bg-offwhite border border-stone/30 p-2.5 rounded text-sm text-charcoal focus:outline-none focus:border-wood"
              />
            </div>

            <div>
              <label className="block font-sans text-xs font-semibold text-charcoal/70 mb-1">Featured Image URL (Optional)</label>
              <input
                type="url"
                value={featuredImageUrl}
                onChange={(e) => setFeaturedImageUrl(e.target.value)}
                placeholder="https://example.com/blog-img.jpg"
                className="w-full bg-offwhite border border-stone/30 p-2.5 rounded text-sm text-charcoal focus:outline-none focus:border-wood"
              />
            </div>

            <div>
              <label className="block font-sans text-xs font-semibold text-charcoal/70 mb-1">Excerpt Summary</label>
              <textarea
                required
                rows={2}
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="A short one-sentence summary displayed in the news grid..."
                className="w-full bg-offwhite border border-stone/30 p-2.5 rounded text-sm text-charcoal focus:outline-none focus:border-wood resize-none"
              />
            </div>

            {/* Rich Text Editor Form Area */}
            <div>
              <label className="block font-sans text-xs font-semibold text-charcoal/70 mb-1">Article Content (Markdown / Text)</label>
              <textarea
                required
                rows={6}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write the full body content here..."
                className="w-full bg-offwhite border border-stone/30 p-2.5 rounded text-sm text-charcoal focus:outline-none focus:border-wood resize-none font-sans"
              />
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <input
                type="checkbox"
                id="published"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                className="rounded border-stone/30 text-wood focus:ring-wood"
              />
              <label htmlFor="published" className="font-sans text-xs font-semibold text-charcoal/70 cursor-pointer">
                Publish Immediately (Visible to Public)
              </label>
            </div>

            <div className="flex space-x-3 pt-2">
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
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <span>{editingId ? 'Update Post' : 'Publish Post'}</span>}
              </button>
            </div>
          </form>
        </div>

        {/* Post List */}
        <div className="lg:col-span-2 bg-offwhite border border-stone/30 p-6 rounded-lg shadow-sm overflow-x-auto">
          <h2 className="font-serif text-lg font-bold text-charcoal mb-6 flex items-center space-x-2">
            <BookOpen className="h-5 w-5 text-wood" />
            <span>Articles</span>
          </h2>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-wood" />
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12 text-charcoal/40 text-sm font-sans">
              No blog posts found in the database yet. Compose one using the editor form on the left.
            </div>
          ) : (
            <table className="w-full text-left border-collapse font-sans text-xs">
              <thead>
                <tr className="border-b border-stone/30 text-charcoal/60 font-semibold uppercase">
                  <th className="pb-3">Title</th>
                  <th className="pb-3">Slug</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Published Date</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone/10">
                {posts.map((post) => (
                  <tr key={post.id} className="text-charcoal/80 hover:bg-stone/5">
                    <td className="py-4 font-semibold max-w-[200px] truncate">{post.title}</td>
                    <td className="py-4 max-w-[150px] truncate">{post.slug}</td>
                    <td className="py-4">
                      {post.published ? (
                        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Published
                        </span>
                      ) : (
                        <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          Draft
                        </span>
                      )}
                    </td>
                    <td className="py-4 text-charcoal/50">
                      {post.published_at ? new Date(post.published_at).toLocaleDateString() : '—'}
                    </td>
                    <td className="py-4 text-right">
                      <button
                        onClick={() => handleEditClick(post)}
                        className="text-wood hover:text-wood/80 p-1.5 rounded hover:bg-stone/10 transition-colors"
                        title="Edit Post"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="text-red-500 hover:text-red-700 p-1.5 rounded hover:bg-red-50 transition-colors"
                        title="Delete Post"
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
