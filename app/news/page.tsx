'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { apiRequest } from '@/lib/api';
import { BlogPost, Video } from '@/types';
import { Calendar, Loader2, ArrowRight, ArrowLeft, ExternalLink, BookOpen, PlayCircle, Youtube } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const DEFAULT_SOURCE_URLS: Record<string, string> = {
  'celebrating-minds-of-all-kinds-infinite-chess-kenya': 'https://infinitechess.fide.com/2026/04/22/celebrating-minds-of-all-kinds-infinite-chess-project-in-kenya/',
  'nathans-triumph-quiet-observer-to-chess-champion': 'https://www.instagram.com/p/DXbgsdCjdl7/',
  'kakuma-boards-distribution': 'https://infinitechess.fide.com/',
};

export default function NewsPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [readingPost, setReadingPost] = useState<BlogPost | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [blogRes, videoRes] = await Promise.all([
          apiRequest<BlogPost[]>('/blog'),
          apiRequest<Video[]>('/videos')
        ]);
        
        if (blogRes.success && Array.isArray(blogRes.data)) {
          setPosts(blogRes.data);
        } else {
          setPosts([]);
        }

        if (videoRes.success && Array.isArray(videoRes.data)) {
          setVideos(videoRes.data);
        } else {
          setVideos([]);
        }
      } catch (err) {
        console.error('Error loading data:', err);
        setPosts([]);
        setVideos([]);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const getYouTubeId = (url: string) => {
    if (!url) return '';
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&]{11})/);
    return match ? match[1] : '';
  };

  const getSourceUrl = (post: BlogPost): string => {
    if (post.source_url) return post.source_url;
    if (DEFAULT_SOURCE_URLS[post.slug]) return DEFAULT_SOURCE_URLS[post.slug];
    if (post.title.toLowerCase().includes('nathan')) return 'https://www.instagram.com/p/DXbgsdCjdl7/';
    return 'https://infinitechess.fide.com/2026/04/22/celebrating-minds-of-all-kinds-infinite-chess-project-in-kenya/';
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#FAF7F2] text-charcoal pt-28 pb-20 px-6 relative overflow-hidden">
        {/* Ambient Gradient Overlays */}
        <div className="absolute top-[-120px] left-[-120px] w-[500px] h-[500px] bg-[#C8B195]/12 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-100px] right-[-100px] w-[450px] h-[450px] bg-amber-900/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto space-y-12">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto space-y-4 pt-4">
            <h1 className="font-serif text-4xl md:text-6xl font-bold text-[#2A2421] leading-tight">
              News & Media
            </h1>
          
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-24">
              <Loader2 className="h-10 w-10 animate-spin text-[#6B4A34]" />
            </div>
          ) : posts.length === 0 ? (
            <div className="rounded-2xl bg-white p-12 text-center text-sm md:text-base text-stone-500 shadow-md max-w-2xl mx-auto border border-stone-200/60">
              No published articles are available yet. Check back soon for new field reports.
            </div>
          ) : (
            <div id="articles" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 scroll-mt-36">
              {posts.map((post) => (
                <div
                  key={post.id}
                  onClick={() => setReadingPost(post)}
                  className="group bg-white rounded-2xl overflow-hidden shadow-md shadow-stone-900/5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col border border-stone-100"
                >
                  {/* Image Thumbnail */}
                  <div className="relative w-full aspect-video bg-stone-100 overflow-hidden">
                    <Image
                      src={post.featured_image_url || '/images/kids.jpg'}
                      alt={post.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>

                  {/* Content Details */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-[11px] text-stone-400 font-sans tracking-wide">
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

                      <h2 className="font-serif text-xl font-bold text-[#2A2421] leading-snug group-hover:text-[#6B4A34] transition-colors duration-300 line-clamp-2">
                        {post.title}
                      </h2>

                      <p className="font-sans text-sm text-stone-600 line-clamp-3 leading-relaxed">
                        {post.excerpt}
                      </p>
                    </div>

                    <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6B4A34] group-hover:text-[#4A3222] transition-colors pt-2 border-t border-stone-100">
                      <span>Read Full Article</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Videos Section */}
          <div id="videos" className="pt-16 pb-8 border-t border-stone-200/50 scroll-mt-36">
            <div className="flex items-center gap-3 mb-8">
              <Youtube className="w-6 h-6 text-[#6B4A34]" />
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#2A2421]">Video Gallery & Live Streams</h2>
            </div>
            
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-[#6B4A34]" />
              </div>
            ) : videos.length === 0 ? (
              <div className="rounded-2xl bg-white p-12 text-center text-sm md:text-base text-stone-500 shadow-md max-w-2xl mx-auto border border-stone-200/60">
                No videos available yet. Check back soon!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {videos.map((video) => (
                  <div key={video.id} className="space-y-3 group">
                    <div className="relative aspect-video w-full rounded-2xl overflow-hidden shadow-md bg-stone-900 border border-stone-200/60">
                      <iframe
                        src={`https://www.youtube.com/embed/${getYouTubeId(video.youtube_url)}?autoplay=0&rel=0&modestbranding=1`}
                        title={video.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="absolute inset-0 w-full h-full border-0 rounded-2xl"
                      />
                    </div>
                    <div className="space-y-1">
                      {video.is_featured && (
                        <span className="font-mono text-[9px] font-bold text-[#6B4A34] uppercase tracking-wider block">
                          FEATURED
                        </span>
                      )}
                      <h4 className="font-serif text-lg font-bold text-[#2A2421] leading-snug group-hover:text-[#6B4A34] transition-colors">
                        {video.title}
                      </h4>
                      <p className="font-sans text-xs text-stone-600 leading-relaxed line-clamp-2">
                        {video.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* FLOATING MAGAZINE ARTICLE READER MODAL */}
        {readingPost && (
          <div
            onClick={() => setReadingPost(null)}
            className="fixed inset-0 z-[100] bg-stone-950/75 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fade-in"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="max-w-3xl w-full bg-[#FAF8F5] rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col relative z-50 animate-scale-in border border-stone-200/60"
            >
              {/* Scrollable Magazine Editorial Body */}
              <div className="p-6 sm:p-10 overflow-y-auto space-y-6 sm:space-y-8 flex-1">
                {/* Magazine Editorial Title & Date Header */}
                <div className="space-y-3 border-b border-stone-200/80 pb-6 text-center">
                  <span className="font-serif italic text-sm text-[#6B4A34] font-medium tracking-wide block">
                    Field Report • {readingPost.published_at
                      ? new Date(readingPost.published_at).toLocaleDateString(undefined, {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : 'Recent'}
                  </span>
                  <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#2A2421] leading-tight tracking-tight max-w-2xl mx-auto">
                    {readingPost.title}
                  </h2>
                </div>

                {/* Cover Photo */}
                {readingPost.featured_image_url && (
                  <div className="relative aspect-[21/9] w-full rounded-2xl overflow-hidden bg-stone-200 shadow-lg">
                    <Image
                      src={readingPost.featured_image_url}
                      alt={readingPost.title}
                      fill
                      priority
                      sizes="(max-width: 1000px) 100vw, 900px"
                      className="object-cover"
                    />
                  </div>
                )}

                {/* Editorial Lead Excerpt */}
                <blockquote className="font-serif italic text-base sm:text-lg text-stone-800 border-l-4 border-[#6B4A34] pl-5 py-2 leading-relaxed bg-white/70 p-5 rounded-r-2xl shadow-sm">
                  {readingPost.excerpt}
                </blockquote>

                {/* Article Content */}
                <div className="font-sans text-stone-700 text-base sm:text-lg leading-relaxed whitespace-pre-wrap space-y-5 pt-2">
                  {readingPost.body}
                </div>
              </div>

              {/* Bottom Action Bar */}
              <div className="p-5 sm:p-6 bg-white border-t border-stone-200/80 flex items-center justify-between gap-4 shrink-0">
                <button
                  onClick={() => setReadingPost(null)}
                  className="px-6 py-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-[#2A2421] text-sm font-bold font-sans transition-colors flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Articles</span>
                </button>

                <a
                  href={getSourceUrl(readingPost)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 rounded-xl bg-[#6B4A34] hover:bg-[#523826] text-white text-sm font-bold font-sans transition-colors shadow-sm flex items-center gap-2"
                >
                  <span>Visit Original Site</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
