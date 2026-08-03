'use client';

import React, { useState, useRef } from 'react';
import { Upload, X, Link, Loader2, CheckCircle2 } from 'lucide-react';
import { uploadFile } from '@/lib/api';

interface ImageUploadInputProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  placeholder?: string;
}

function compressImageClient(file: File, maxDim = 1920, quality = 0.85): Promise<File> {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/')) return resolve(file);
    const img = new window.Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width <= maxDim && height <= maxDim && file.size < 500 * 1024) {
        return resolve(file);
      }
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(file);
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (!blob) return resolve(file);
          const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.jpg'), {
            type: 'image/jpeg',
            lastModified: Date.now()
          });
          resolve(compressedFile);
        },
        'image/jpeg',
        quality
      );
    };
    img.onerror = () => resolve(file);
    img.src = url;
  });
}

export const ImageUploadInput: React.FC<ImageUploadInputProps> = ({
  value,
  onChange,
  label = 'Image',
  placeholder = 'https://example.com/image.jpg'
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawFile = e.target.files?.[0];
    if (!rawFile) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const fileToUpload = await compressImageClient(rawFile);
      const res = await uploadFile(fileToUpload);
      if (res.success && res.url) {
        onChange(res.url);
      } else {
        setUploadError(res.error || 'Failed to upload image');
      }
    } catch (err: any) {
      setUploadError(err.message || 'Error uploading file');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleClear = () => {
    onChange('');
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="block text-xs font-semibold text-stone-700">
          {label}
        </label>
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-xs text-[#6B4A34] hover:underline flex items-center gap-1 font-sans"
        >
          {showUrlInput ? (
            <>
              <Upload className="w-3 h-3" /> Upload from device
            </>
          ) : (
            <>
              <Link className="w-3 h-3" /> Enter URL manually
            </>
          )}
        </button>
      </div>

      {showUrlInput ? (
        <div className="flex gap-2">
          <input
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="flex-1 rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-[#6B4A34]"
          />
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="p-2 text-stone-400 hover:text-red-500 rounded-xl border border-stone-300 bg-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      ) : (
        <div>
          {value ? (
            <div className="relative rounded-xl border border-stone-200 p-2.5 bg-stone-50 flex items-center justify-between">
              <div className="flex items-center gap-3 overflow-hidden">
                <img
                  src={value}
                  alt="Preview"
                  className="w-12 h-12 object-cover rounded-lg border border-stone-200 flex-shrink-0"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div className="truncate">
                  <p className="text-xs font-semibold text-charcoal truncate max-w-[180px]">
                    {value.split('/').pop() || 'Image attached'}
                  </p>
                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded font-sans mt-0.5">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Attached
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1 text-xs font-medium text-stone-700 bg-white border border-stone-300 rounded-lg hover:bg-stone-50 transition-colors"
                >
                  Replace
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-1.5 text-stone-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${
                isUploading
                  ? 'border-[#6B4A34] bg-stone-100'
                  : 'border-stone-300 hover:border-[#6B4A34] bg-white hover:bg-stone-50'
              }`}
            >
              {isUploading ? (
                <div className="flex flex-col items-center justify-center py-2 text-[#6B4A34] space-y-1">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-xs font-medium">Uploading image from device...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-1 space-y-1">
                  <div className="p-2 rounded-full bg-[#6B4A34]/10 text-[#6B4A34]">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-charcoal">
                      Click to upload photo from device
                    </p>
                    <p className="text-[10px] text-stone-400 mt-0.5">
                      PNG, JPG, WEBP or GIF (Max 24MB)
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      )}

      {uploadError && (
        <p className="text-xs text-red-600 mt-1">{uploadError}</p>
      )}
    </div>
  );
};
