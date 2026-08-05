'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Upload, X, CheckCircle2 } from 'lucide-react';

interface MultiImageUploadInputProps {
  images: (File | string)[];
  onChange: (images: (File | string)[]) => void;
  maxImages?: number;
  label?: string;
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

export const MultiImageUploadInput: React.FC<MultiImageUploadInputProps> = ({
  images,
  onChange,
  maxImages = 5,
  label = 'Product Images'
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  useEffect(() => {
    const urls = images.map(img => {
      if (typeof img === 'string') return img;
      return URL.createObjectURL(img);
    });
    setPreviewUrls(urls);
    return () => {
      urls.forEach(url => {
        if (url.startsWith('blob:')) URL.revokeObjectURL(url);
      });
    };
  }, [images]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawFiles = Array.from(e.target.files || []);
    if (!rawFiles.length) return;

    if (images.length + rawFiles.length > maxImages) {
      setError(`You can only upload up to ${maxImages} images total.`);
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const processedFiles = await Promise.all(rawFiles.map(f => compressImageClient(f)));
      onChange([...images, ...processedFiles]);
    } catch (err: any) {
      setError(err.message || 'Error processing files');
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    onChange(newImages);
    setError(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <label className="block text-xs font-semibold text-stone-700">
          {label} (Max {maxImages})
        </label>
        <span className="text-[10px] text-stone-500">{images.length} / {maxImages}</span>
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {images.map((img, idx) => (
            <div key={idx} className="relative rounded-xl border border-stone-200 overflow-hidden bg-stone-50 aspect-square group">
              {previewUrls[idx] && (
                <img
                  src={previewUrls[idx]}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                />
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center">
                <button
                  type="button"
                  onClick={() => handleRemove(idx)}
                  className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg"
                  title="Remove Image"
                >
                  <X className="w-4 h-4" />
                </button>
                {idx === 0 && (
                   <span className="absolute bottom-2 left-2 right-2 text-center text-[10px] font-bold text-white bg-black/50 py-1 rounded">Primary (Thumbnail)</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {images.length < maxImages && (
        <div
          onClick={() => !isProcessing && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
            isProcessing
              ? 'border-[#6B4A34] bg-stone-100'
              : 'border-stone-300 hover:border-[#6B4A34] bg-white hover:bg-stone-50'
          }`}
        >
          {isProcessing ? (
            <div className="flex flex-col items-center justify-center py-2 text-[#6B4A34] space-y-2">
              <Upload className="w-5 h-5 animate-bounce" />
              <span className="text-xs font-medium">Processing images...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-2 space-y-2">
              <div className="p-3 rounded-full bg-[#6B4A34]/10 text-[#6B4A34]">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-charcoal">
                  Click to select multiple photos
                </p>
                <p className="text-[10px] text-stone-400 mt-1">
                  PNG, JPG, WEBP (Select up to {maxImages - images.length} files at once)
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
        multiple
        onChange={handleFileChange}
        className="hidden"
      />

      {error && (
        <p className="text-xs font-bold text-red-600 mt-2 bg-red-50 p-2 rounded border border-red-200">{error}</p>
      )}
    </div>
  );
};
