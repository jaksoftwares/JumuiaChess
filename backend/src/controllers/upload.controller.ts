import { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import { supabase } from '../config/supabase';

// Helper to ensure upload dir exists
export const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

export const uploadImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const file = req.file;

    // Automatically optimize/compress image using sharp
    try {
      const tempPath = file.path + '.opt';
      let pipeline = sharp(file.path).rotate();
      const metadata = await pipeline.metadata();

      if (metadata.width && metadata.height && (metadata.width > 1920 || metadata.height > 1920)) {
        pipeline = pipeline.resize(1920, 1920, {
          fit: 'inside',
          withoutEnlargement: true
        });
      }

      if (file.mimetype === 'image/png') {
        pipeline = pipeline.png({ quality: 80, compressionLevel: 8 });
      } else {
        pipeline = pipeline.jpeg({ quality: 80, progressive: true });
      }

      await pipeline.toFile(tempPath);
      fs.renameSync(tempPath, file.path);
    } catch (sharpErr) {
      console.warn('[Upload] Image compression warning (proceeding with original):', sharpErr);
    }

    const protocol = req.protocol;
    const host = req.get('host');
    const localUrl = `${protocol}://${host}/uploads/${file.filename}`;

    let publicUrl = localUrl;

    // Optional upload to Supabase storage bucket if configured
    try {
      const bucketName = 'images';
      const fileBuffer = fs.readFileSync(file.path);
      const storagePath = `uploads/${Date.now()}_${path.basename(file.originalname)}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(storagePath, fileBuffer, {
          contentType: file.mimetype,
          upsert: true
        });

      if (!uploadError && uploadData) {
        const { data: publicUrlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(storagePath);
        
        if (publicUrlData?.publicUrl) {
          publicUrl = publicUrlData.publicUrl;
        }
      }
    } catch (supabaseErr) {
      // Fallback silently to local static URL if Supabase bucket isn't set up yet
      console.warn('[Upload] Supabase Storage upload skipped, using local upload URL:', supabaseErr);
    }

    return res.status(200).json({
      success: true,
      url: publicUrl,
      localUrl: localUrl,
      filename: file.filename
    });
  } catch (err) {
    next(err);
  }
};
