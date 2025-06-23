'use server';

import { put } from '@vercel/blob';

type UploadBlobProps = {
  file: File | Blob;
  path: string;
  allowOverwrite?: boolean;
};

export async function uploadBlob({ file, path, allowOverwrite = false }: UploadBlobProps) {
  try {
    const blob = await put(path, file, {
      access: 'public',
      allowOverwrite,
    });

    return blob;
  } catch (error) {
    console.error('Error uploading blob', error);
    throw error;
  }
}
