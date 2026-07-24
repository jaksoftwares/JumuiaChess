'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { apiRequest } from '@/lib/api';
import { TeamMember } from '@/types';
import { Loader2, ArrowRight } from 'lucide-react';

export default function MeetTheTeam() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMember, setActiveMember] = useState<TeamMember | null>(null);

  useEffect(() => {
    async function loadTeam() {
      try {
        const res = await apiRequest<TeamMember[]>('/team');
        if (res.success && Array.isArray(res.data)) {
          setMembers(res.data);
        } else {
          setMembers([]);
        }
      } catch (err) {
        console.error('[MeetTheTeam Section] Error loading team members:', err);
        setMembers([]);
      } finally {
        setLoading(false);
      }
    }

    loadTeam();
  }, []);

  return (
    <section id="team" className="bg-[#141518] text-white relative overflow-hidden scroll-mt-24 lg:scroll-mt-28 py-20 md:py-28">
      {/* Background Glow */}
      <div className="absolute top-1/3 left-[-100px] w-[350px] h-[350px] bg-[#C8B195]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          {/* Left Column: Title & Description */}
          <div className="lg:col-span-5 space-y-5">
            <span className="font-mono text-xs font-bold tracking-[0.25em] text-[#C8B195] uppercase block">
              OUR TEAM
            </span>

            <h2 className="font-serif text-3xl md:text-4xl font-bold text-white tracking-tight leading-tight">
              The People Behind the Board.
            </h2>

            <p className="font-sans text-xs md:text-sm text-stone-300 leading-relaxed">
              Our team unites certified coaches, community organizers, and mentors empowering young minds across Kenya through the game of chess.
            </p>

            <div className="pt-2">
              <a
                href="#contact"
                className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-[#C8B195] hover:bg-[#B89E82] text-[#141518] font-sans text-xs md:text-sm font-bold tracking-wide shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
              >
                <span>Connect With Team</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Right Column: 3x2 Headshot Matrix */}
          <div className="lg:col-span-7">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-[#C8B195]" />
              </div>
            ) : members.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-[#1C1D21] p-12 text-center text-sm text-stone-300">
                No team members published yet. Add team members in the admin panel to showcase them here.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4.5">
                {members.slice(0, 6).map((member) => (
                  <div
                    key={member.id}
                    onClick={() => setActiveMember(member)}
                    className="relative aspect-square overflow-hidden bg-stone-900 border border-white/10 rounded-2xl group cursor-pointer shadow-md hover:shadow-2xl transition-all duration-300"
                  >
                    <Image
                      src={member.image_url}
                      alt={member.name}
                      fill
                      unoptimized
                      sizes="(max-width: 768px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500 filter grayscale group-hover:grayscale-0"
                    />

                    {/* Gradient Overlay & Member Name/Role */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 text-white">
                      <h4 className="font-serif text-sm md:text-base font-bold text-white leading-tight">
                        {member.name}
                      </h4>
                      <p className="font-mono text-[10px] text-[#C8B195] uppercase tracking-wider mt-1">
                        {member.role}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Member Details Modal */}
      {activeMember && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1C1D21] border border-white/10 rounded-2xl max-w-md w-full p-6 text-white space-y-4 shadow-2xl relative animate-scale-in">
            <button
              onClick={() => setActiveMember(null)}
              className="absolute top-4 right-4 text-stone-400 hover:text-white font-bold text-lg w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10"
            >
              ✕
            </button>

            <div className="relative h-64 rounded-xl overflow-hidden bg-stone-900 border border-white/10">
              <Image
                src={activeMember.image_url}
                alt={activeMember.name}
                fill
                unoptimized
                className="object-cover"
              />
            </div>

            <div className="space-y-1.5">
              <h3 className="font-serif text-xl font-bold text-white">{activeMember.name}</h3>
              <p className="font-mono text-xs text-[#C8B195] uppercase tracking-wider">{activeMember.role}</p>
              <p className="font-sans text-xs text-stone-300 leading-relaxed pt-2">
                {activeMember.bio}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}