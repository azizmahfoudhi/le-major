'use server';

import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const FOLDER = 'le-major/medias';

export interface CloudinaryMedia {
  publicId: string;
  name: string;
  url: string;
  createdAt: string | null;
}

export async function uploadMedia(formData: FormData): Promise<{ success: boolean; error?: string; media?: CloudinaryMedia }> {
  const file = formData.get('file') as File | null;
  if (!file) return { success: false, error: 'No file provided' };

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');
    const mimeType = file.type || 'application/octet-stream';
    const dataUri = 'data:' + mimeType + ';base64,' + base64;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any = await cloudinary.uploader.upload(dataUri, {
      folder: FOLDER,
      resource_type: 'auto',
      use_filename: false,
      unique_filename: true,
    });

    return {
      success: true,
      media: {
        publicId: result.public_id,
        name: result.original_filename || result.public_id.split('/').pop() || 'media',
        url: result.secure_url,
        createdAt: result.created_at,
      },
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Upload failed';
    console.error('[Cloudinary Upload Error]', msg);
    return { success: false, error: msg };
  }
}

export async function listMedia(): Promise<CloudinaryMedia[]> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any = await cloudinary.api.resources({
      type: 'upload',
      prefix: FOLDER,
      max_results: 200,
      resource_type: 'image',
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (result.resources || []).map((r: any) => ({
      publicId: r.public_id,
      name: r.public_id.split('/').pop() || r.public_id,
      url: r.secure_url,
      createdAt: r.created_at,
    }));
  } catch (err) {
    console.error('[Cloudinary List Error]', err);
    return [];
  }
}

export async function deleteMedia(publicId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await cloudinary.uploader.destroy(publicId);
    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Delete failed';
    console.error('[Cloudinary Delete Error]', msg);
    return { success: false, error: msg };
  }
}
