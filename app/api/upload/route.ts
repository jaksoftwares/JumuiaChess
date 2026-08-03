import { NextResponse, NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import sharp from 'sharp';

// POST /api/upload
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    let buffer: Buffer = Buffer.from(arrayBuffer as any);

    // Optimize image using sharp if possible
    try {
      let pipeline = sharp(buffer).rotate();
      const metadata = await pipeline.metadata();

      if (metadata.width && metadata.height && (metadata.width > 1920 || metadata.height > 1920)) {
        pipeline = pipeline.resize(1920, 1920, {
          fit: 'inside',
          withoutEnlargement: true
        });
      }

      if (file.type === 'image/png') {
        pipeline = pipeline.png({ quality: 80, compressionLevel: 8 });
      } else {
        pipeline = pipeline.jpeg({ quality: 80, progressive: true });
      }

      buffer = await pipeline.toBuffer();
    } catch (sharpErr) {
      console.warn('[Upload] Image compression failed, proceeding with original buffer:', sharpErr);
    }

    const bucketName = 'images';
    const timestamp = Date.now();
    const storagePath = `uploads/${timestamp}_${file.name.replace(/\s+/g, '_')}`;

    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from(bucketName)
      .upload(storagePath, buffer, {
        contentType: file.type || 'image/jpeg',
        upsert: true
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data: publicUrlData } = supabaseAdmin.storage
      .from(bucketName)
      .getPublicUrl(storagePath);

    if (!publicUrlData?.publicUrl) {
      throw new Error('Failed to retrieve public URL from Supabase');
    }

    return NextResponse.json({
      success: true,
      url: publicUrlData.publicUrl,
      filename: file.name
    });

  } catch (err: any) {
    console.error('Upload Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
