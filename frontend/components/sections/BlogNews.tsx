'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { apiRequest } from '@/lib/api';
import { BlogPost } from '@/types';
import { Calendar, Loader2, ArrowRight } from 'lucide-react';

export default function BlogNews() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [readingPost, setReadingPost] = useState<BlogPost | null>(null);

  useEffect(() => {
    async function loadPosts() {
      const res = await apiRequest<BlogPost[]>('/blog');
      if (res.success && res.data) {
        setPosts(res.data);
      } else {
        setPosts([]);
      }
      setLoading(false);
    }
    loadPosts();
  }, []);

  return (
    <section id="news" className="py-24 px-6 bg-stone/10">
      <div className="max-w-6xl mx-auto space-y-16">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <span className="font-sans text-xs font-semibold tracking-widest text-wood uppercase">
            Stay Updated
          </span>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-charcoal">
            Blogs & News
          </h2>
          <p className="font-sans text-charcoal/70">
            Read updates, stories of impact, and reports about our distributions and tournaments across the world.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-wood" />
          </div>
        ) : posts.length === 0 ? (
          <div className="rounded-2xl border border-stone/20 bg-white/70 p-8 text-center text-sm text-charcoal/70">
            No published articles are available yet. New posts from the admin panel will appear here automatically.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: YouTube Video Showcase Player (5 cols on lg) */}
            <div className="lg:col-span-5 bg-white border border-[#C8B195]/40 rounded-3xl p-6 shadow-sm space-y-4">
              <span className="font-sans text-[10px] font-bold uppercase tracking-wider text-wood">
                Featured Video
              </span>
              <h3 className="font-serif text-xl font-bold text-charcoal leading-tight">
                Empowering Youth Through Chess
              </h3>
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden shadow-inner border border-stone/10 bg-black">
                <iframe
                  src="https://www.youtube.com/embed/8KkHw5-u0m4"
                  title="Jumuiya Chess Documentary"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full border-0"
                />
              </div>
              <p className="font-sans text-xs text-charcoal/70 leading-relaxed">
                Watch how Jumuiya Chess brings board games, learning material, and structured training sessions to schools and refugee camps across Kenya.
              </p>
            </div>

            {/* Right Column: Blogs / Articles vertical list (7 cols on lg) */}
            <div className="lg:col-span-7 space-y-6 max-h-[500px] overflow-y-auto pr-2 no-scrollbar">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="flex flex-col sm:flex-row bg-white border border-[#C8B195]/30 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group cursor-pointer"
                  onClick={() => setReadingPost(post)}
                >
                  {/* Cover Image */}
                  <div className="relative w-full sm:w-40 h-40 sm:h-auto min-h-[140px] overflow-hidden flex-shrink-0 bg-stone/5">
                    <Image
                      src={post.featured_image_url || '/images/kids.jpg'}
                      alt={post.title}
                      fill
                      sizes="(max-w-md) 100vw, 160px"
                      className="object-cover group-hover:scale-105 transition-all duration-500"
                    />
                  </div>
                  {/* Content details */}
                  <div className="p-6 flex flex-col justify-between flex-grow">
                    <div className="space-y-2">
                      <div className="flex items-center text-[10px] text-charcoal/50 font-bold uppercase tracking-wider">
                        <Calendar className="h-3 w-3 mr-1.5 text-wood" />
                        <span>{post.published_at ? new Date(post.published_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Draft'}</span>
                      </div>
                      <h4 className="font-serif text-lg font-bold text-charcoal leading-snug group-hover:text-wood transition-colors duration-300">
                        {post.title}
                      </h4>
                      <p className="font-sans text-xs text-charcoal/65 line-clamp-2 leading-relaxed">
                        {post.excerpt}
                      </p>
                    </div>
                    <div className="flex items-center text-xs font-bold text-wood group-hover:text-wood/80 mt-4">
                      <span>Read Article</span>
                      <ArrowRight className="h-3 w-3 ml-1.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Read Full Post Modal */}
        {readingPost && (
          <div className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-offwhite rounded-lg border border-stone/30 shadow-xl max-w-2xl w-full p-8 max-h-[85vh] overflow-y-auto relative animate-scale-in">
              <button
                onClick={() => setReadingPost(null)}
                className="absolute top-4 right-4 text-charcoal/60 hover:text-charcoal font-bold text-xl"
              >
                ✕
              </button>

              <div className="space-y-4 mb-6">
                <div className="flex items-center text-xs text-charcoal/50">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>{readingPost.published_at ? new Date(readingPost.published_at).toLocaleDateString() : 'Draft'}</span>
                </div>
                <h3 className="font-serif text-3xl font-bold text-charcoal leading-tight">
                  {readingPost.title}
                </h3>
              </div>

              {readingPost.featured_image_url && (
                <div className="relative w-full h-64 rounded-xl overflow-hidden mb-6 border border-stone/10 bg-stone/5">
                  <Image
                    src={readingPost.featured_image_url}
                    alt={readingPost.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              <div className="prose prose-stone max-w-none text-sm text-charcoal/80 leading-relaxed space-y-4 border-t border-stone/20 pt-6">
                <p className="font-sans font-semibold text-charcoal">{readingPost.excerpt}</p>
                <p className="font-sans whitespace-pre-wrap">{readingPost.body}</p>
              </div>

              <button
                onClick={() => setReadingPost(null)}
                className="mt-8 px-6 py-2.5 bg-wood text-offwhite font-sans text-xs font-semibold rounded hover:bg-wood/90"
              >
                Close Article
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
