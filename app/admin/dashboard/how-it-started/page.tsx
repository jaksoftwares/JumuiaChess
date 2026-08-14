'use client';

import { useState, useEffect } from 'react';
import { apiRequest, uploadFile } from '@/lib/api';
import { Loader2, Save, Plus, Trash2 } from 'lucide-react';
import { ImageUploadInput } from '@/components/admin/ImageUploadInput';

interface Stat {
  value: string;
  label: string;
}

export default function AdminHowItStarted() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [title, setTitle] = useState('How It Started');
  const [heading, setHeading] = useState('');
  const [imageUrl, setImageUrl] = useState<string | File | null>(null);
  const [paragraphs, setParagraphs] = useState<string[]>([]);
  const [stats, setStats] = useState<Stat[]>([]);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    setLoading(true);
    const res = await fetch('/api/how-it-started');
    if (res.ok) {
      const data = await res.json();
      setTitle(data.title || 'How It Started');
      setHeading(data.heading || '');
      setImageUrl(data.image_url || '');
      setParagraphs(data.paragraphs || []);
      setStats(data.stats || []);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    let finalImageUrl = typeof imageUrl === 'string' ? imageUrl : '';
    
    // Upload if it's a new file
    if (imageUrl instanceof File) {
      const uploadRes = await uploadFile(imageUrl);
      if (!uploadRes.success || !uploadRes.url) {
        alert(uploadRes.error || 'Failed to upload image');
        setSaving(false);
        return;
      }
      finalImageUrl = uploadRes.url;
    }

    const body = {
      title,
      heading,
      image_url: finalImageUrl,
      paragraphs,
      stats,
    };

    const res = await fetch('/api/how-it-started', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    setSaving(false);

    if (res.ok) {
      alert('Content saved successfully');
    } else {
      alert('Failed to save content');
    }
  };

  const addParagraph = () => setParagraphs([...paragraphs, '']);
  const updateParagraph = (index: number, val: string) => {
    const newP = [...paragraphs];
    newP[index] = val;
    setParagraphs(newP);
  };
  const removeParagraph = (index: number) => {
    setParagraphs(paragraphs.filter((_, i) => i !== index));
  };

  const addStat = () => setStats([...stats, { value: '', label: '' }]);
  const updateStat = (index: number, field: 'value' | 'label', val: string) => {
    const newS = [...stats];
    newS[index][field] = val;
    setStats(newS);
  };
  const removeStat = (index: number) => {
    setStats(stats.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 text-[#6B4A34]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-[#6B4A34] text-white p-6 md:p-8 rounded-2xl shadow-md border border-[#573b29] relative overflow-hidden space-y-2">
        <h1 className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-white">
          How It Started Content
        </h1>
        <p className="text-sm text-[#FAF7F2]/90 leading-relaxed font-sans max-w-3xl">
          Update the story, image, and key stats for the "How It Started" section on the homepage.
        </p>
      </div>

      <div className="bg-white border border-[#6B4A34]/20 p-6 rounded-2xl shadow-sm space-y-8">
        
        {/* Basic Info */}
        <div className="space-y-4">
          <h2 className="text-lg font-serif font-bold text-[#232320] border-b pb-2">Basic Info</h2>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Small Title (Uppercase label)</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-stone-300 p-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6B4A34]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Main Heading</label>
              <input
                type="text"
                value={heading}
                onChange={(e) => setHeading(e.target.value)}
                className="w-full border border-stone-300 p-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6B4A34]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Image (Side image)</label>
              <ImageUploadInput
                value={imageUrl}
                onChange={(val) => setImageUrl(val)}
              />
            </div>
          </div>
        </div>

        {/* Paragraphs */}
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b pb-2">
            <h2 className="text-lg font-serif font-bold text-[#232320]">Story Paragraphs</h2>
            <button onClick={addParagraph} className="text-xs flex items-center gap-1 bg-[#FAF7F2] text-[#6B4A34] px-3 py-1.5 rounded-lg border border-[#6B4A34]/20 hover:bg-[#6B4A34] hover:text-white transition">
              <Plus className="w-3.5 h-3.5" /> Add Paragraph
            </button>
          </div>
          <div className="space-y-3">
            {paragraphs.map((p, index) => (
              <div key={index} className="flex gap-3 items-start">
                <textarea
                  value={p}
                  onChange={(e) => updateParagraph(index, e.target.value)}
                  rows={4}
                  className="w-full border border-stone-300 p-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6B4A34]"
                  placeholder={`Paragraph ${index + 1}`}
                />
                <button onClick={() => removeParagraph(index)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg shrink-0 mt-1">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b pb-2">
            <h2 className="text-lg font-serif font-bold text-[#232320]">Key Stats</h2>
            <button onClick={addStat} className="text-xs flex items-center gap-1 bg-[#FAF7F2] text-[#6B4A34] px-3 py-1.5 rounded-lg border border-[#6B4A34]/20 hover:bg-[#6B4A34] hover:text-white transition">
              <Plus className="w-3.5 h-3.5" /> Add Stat
            </button>
          </div>
          <div className="space-y-3">
            {stats.map((stat, index) => (
              <div key={index} className="flex gap-3 items-center">
                <input
                  type="text"
                  value={stat.value}
                  onChange={(e) => updateStat(index, 'value', e.target.value)}
                  placeholder="e.g. 20+"
                  className="w-1/3 border border-stone-300 p-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6B4A34]"
                />
                <input
                  type="text"
                  value={stat.label}
                  onChange={(e) => updateStat(index, 'label', e.target.value)}
                  placeholder="e.g. Communities"
                  className="w-full border border-stone-300 p-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6B4A34]"
                />
                <button onClick={() => removeStat(index)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg shrink-0">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-6 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 bg-[#6B4A34] text-white font-semibold rounded-lg hover:bg-[#573b29] transition flex items-center gap-2 disabled:opacity-70"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
