'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { apiRequest } from '@/lib/api';
import { BlogPost } from '@/types';
import { Calendar, Loader2, ArrowRight, ArrowLeft, ExternalLink, X } from 'lucide-react';

interface VideoItem {
  id: string;
  title: string;
  youtubeId: string;
  description: string;
}

const FEATURED_VIDEOS: VideoItem[] = [
  {
    id: 'video-1',
    title: 'Empowering Youth Through Chess',
    youtubeId: 'dHQGNQwtgyA',
    description: 'Watch how Jumuiya Chess brings board games, structured learning, and mentorship to schools and neurodiverse programs across Kenya.',
  },
  {
    id: 'video-2',
    title: 'The Gift of Chess Mission',
    youtubeId: '9yAMCRHL0og',
    description: 'Explore the global journey of distributing 1 million chess sets to unlock opportunity, strategic thinking, and hope worldwide.',
  },
];

const DEFAULT_SOURCE_URLS: Record<string, string> = {
  'celebrating-minds-of-all-kinds-infinite-chess-kenya': 'https://infinitechess.fide.com/2026/04/22/celebrating-minds-of-all-kinds-infinite-chess-project-in-kenya/',
  'nathans-triumph-quiet-observer-to-chess-champion': 'https://www.instagram.com/p/DXbgsdCjdl7/',
  'kakuma-boards-distribution': 'https://infinitechess.fide.com/',
};

export default function BlogNews() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [readingPost, setReadingPost] = useState<BlogPost | null>(null);

  useEffect(() => {
    async function loadPosts() {
      try {
        const res = await apiRequest<BlogPost[]>('/blog');
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          setPosts(res.data);
        } else {
          setPosts([]);
        }
      } catch (err) {
        console.error('[BlogNews Section] Error loading posts:', err);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    }
    loadPosts();
  }, []);

  const getSourceUrl = (post: BlogPost): string => {
    if (post.source_url) return post.source_url;
    if (DEFAULT_SOURCE_URLS[post.slug]) return DEFAULT_SOURCE_URLS[post.slug];
    if (post.title.toLowerCase().includes('nathan')) return 'https://www.instagram.com/p/DXbgsdCjdl7/';
    return 'https://infinitechess.fide.com/2026/04/22/celebrating-minds-of-all-kinds-infinite-chess-project-in-kenya/';
  };

  return (
    <section id="news" className="py-10 md:py-14 px-6 bg-gradient-to-b from-[#F6F4EF] via-[#FAF7F2] to-white text-charcoal relative overflow-hidden scroll-mt-24 lg:scroll-mt-28">
      {/* Ambient Gradient Overlays */}
      <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-[#F6F4EF] to-transparent pointer-events-none" />
      <div className="absolute top-1/3 left-[-120px] w-[500px] h-[500px] bg-[#C8B195]/12 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-[-100px] w-[450px] h-[450px] bg-amber-900/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto space-y-8 sm:space-y-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <span className="font-sans text-xs font-semibold tracking-widest text-[#6B4A34] uppercase">
            STAY UPDATED
          </span>
          <h2 className="font-serif text-3xl md:text-5xl font-bold text-[#2A2421] leading-tight">
            Blogs & News
          </h2>
          <p className="font-sans text-stone-600 text-xs md:text-sm leading-relaxed max-w-2xl mx-auto">
            Discover impact stories from our autism mentorship programs, refugee distribution drives, and community competitions.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-[#6B4A34]" />
          </div>
        ) : (
          /* Split Layout: Left Videos Feed / Right Articles List */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left Column: Rectangular Videos Stack (No Background or Border) */}
            <div className="lg:col-span-6 space-y-6">
              <div className="border-b border-stone-200/80 pb-2">
                <h3 className="font-sans text-xs font-bold tracking-widest text-[#6B4A34] uppercase">
                  Featured Videos
                </h3>
              </div>

              <div className="space-y-6">
                {FEATURED_VIDEOS.map((video) => (
                  <div
                    key={video.id}
                    className="bg-transparent border-0 p-0 space-y-2.5"
                  >
                    {/* Clean Rectangular Iframe Video Container */}
                    <div className="relative aspect-video w-full rounded-2xl overflow-hidden shadow-md bg-stone-900">
                      <iframe
                        src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=0&rel=0&modestbranding=1`}
                        title={video.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="absolute inset-0 w-full h-full border-0 rounded-2xl"
                      />
                    </div>

                    {/* Short Info Underneath */}
                    <div className="space-y-1 pt-0.5">
                      <h4 className="font-serif text-lg font-bold text-[#2A2421] leading-snug">
                        {video.title}
                      </h4>
                      <p className="font-sans text-xs text-stone-600 leading-relaxed">
                        {video.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Articles Vertical List View */}
            <div className="lg:col-span-6 space-y-6">
              <div className="border-b border-stone-200/80 pb-2 flex items-center justify-between">
                <h3 className="font-sans text-xs font-bold tracking-widest text-[#6B4A34] uppercase">
                  Latest Articles & Reports
                </h3>
                <span className="text-xs font-sans text-stone-400">
                  {posts.length} Posts
                </span>
              </div>

              {posts.length === 0 ? (
                <div className="rounded-2xl bg-white p-8 text-center text-sm text-stone-500 shadow-md">
                  No published articles are available yet. Check back soon for new field reports.
                </div>
              ) : (
                <div className="space-y-4">
                  {posts.map((post) => (
                    <div
                      key={post.id}
                      onClick={() => setReadingPost(post)}
                      className="group bg-white rounded-2xl p-4 sm:p-5 shadow-md shadow-stone-900/5 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 cursor-pointer flex flex-col sm:flex-row gap-4 items-start"
                    >
                      {/* Image Thumbnail */}
                      <div className="relative w-full sm:w-36 h-36 sm:h-28 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0">
                        <Image
                          src={post.featured_image_url || '/images/kids.jpg'}
                          alt={post.title}
                          fill
                          sizes="(max-width: 640px) 100vw, 160px"
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>

                      {/* Content Details */}
                      <div className="flex-1 space-y-2 flex flex-col justify-between h-full">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 text-[11px] text-stone-400 font-sans">
                            <Calendar className="w-3.5 h-3.5 text-[#6B4A34]" />
                            <span>
                              {post.published_at
                                ? new Date(post.published_at).toLocaleDateString(undefined, {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                  })
                                : 'Recent'}
                            </span>
                          </div>

                          <h4 className="font-serif text-base sm:text-lg font-bold text-[#2A2421] leading-snug group-hover:text-[#6B4A34] transition-colors duration-300 line-clamp-2">
                            {post.title}
                          </h4>

                          <p className="font-sans text-xs text-stone-600 line-clamp-2 leading-relaxed">
                            {post.excerpt}
                          </p>
                        </div>

                        <div className="inline-flex items-center gap-1 text-xs font-bold text-[#6B4A34] group-hover:text-[#4A3222] transition-colors pt-1">
                          <span>Read Article</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-300" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* FLOATING MAGAZINE ARTICLE READER MODAL */}
      {readingPost && (
        <div
          onClick={() => setReadingPost(null)}
          className="fixed inset-0 z-50 bg-stone-950/75 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-2xl w-full bg-[#FAF8F5] rounded-3xl overflow-hidden shadow-2xl max-h-[88vh] flex flex-col relative z-50 animate-scale-in border border-stone-200/60"
          >
            {/* Scrollable Magazine Editorial Body */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1">
              {/* Magazine Editorial Title & Date Header */}
              <div className="space-y-2 border-b border-stone-200/80 pb-4">
                <span className="font-serif italic text-xs text-[#6B4A34] font-medium tracking-wide">
                  Field Report • {readingPost.published_at
                    ? new Date(readingPost.published_at).toLocaleDateString(undefined, {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : 'Recent'}
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2A2421] leading-snug tracking-tight">
                  {readingPost.title}
                </h2>
              </div>

              {/* Cover Photo */}
              {readingPost.featured_image_url && (
                <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-stone-200 shadow-md">
                  <Image
                    src={readingPost.featured_image_url}
                    alt={readingPost.title}
                    fill
                    priority
                    sizes="(max-width: 800px) 100vw, 700px"
                    className="object-cover"
                  />
                </div>
              )}

              {/* Editorial Lead Excerpt */}
              <blockquote className="font-serif italic text-sm sm:text-base text-stone-800 border-l-2 border-[#6B4A34] pl-4 py-1 leading-relaxed bg-white/60 p-4 rounded-r-xl">
                {readingPost.excerpt}
              </blockquote>

              {/* Article Content */}
              <div className="font-sans text-stone-700 text-sm sm:text-base leading-relaxed whitespace-pre-wrap space-y-4 pt-1">
                {readingPost.body}
              </div>
            </div>

            {/* Bottom Action Bar: ONLY TWO BUTTONS (Back & Visit Site) */}
            <div className="p-4 sm:p-5 bg-white border-t border-stone-200/80 flex items-center justify-between gap-4 shrink-0">
              {/* Button 1: Go Back */}
              <button
                onClick={() => setReadingPost(null)}
                className="px-5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-[#2A2421] text-xs font-bold font-sans transition-colors flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              {/* Button 2: Visit Site */}
              <a
                href={getSourceUrl(readingPost)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-xl bg-[#6B4A34] hover:bg-[#523826] text-white text-xs font-bold font-sans transition-colors shadow-sm flex items-center gap-1.5"
              >
                <span>Visit Site</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
