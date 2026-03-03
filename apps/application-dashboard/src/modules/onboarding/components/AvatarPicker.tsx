'use client';

import { useEffect, useRef, useState } from 'react';
import { ImageContentType, UploadType } from 'modules/onboarding/onboarding.types';
import { useGetUploadUrlMutation } from '@/apis/onboarding';

type Props = {
  svgContent: string;
  onShuffle: () => void;
  onUpload: (s3Uri: string, previewUrl: string) => void;
  onRemove: () => void;
  uploadType: UploadType;
};

export const AvatarPicker = ({ svgContent, onShuffle, onUpload, onRemove, uploadType }: Props) => {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'zamp' | 'upload'>('zamp');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [getUploadUrl] = useGetUploadUrlMutation();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handler);

    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;
    const url = URL.createObjectURL(file);

    setPreviewUrl(url);
    setPendingFile(file);
    setUploadError(null);
    e.target.value = '';
  };

  const handleSave = async () => {
    if (!pendingFile) return;
    setUploading(true);
    setUploadError(null);

    try {
      const contentType = pendingFile.type === 'image/jpeg' ? ImageContentType.JPEG : ImageContentType.PNG;
      const { upload_url, s3_uri } = await getUploadUrl({
        upload_type: uploadType,
        content_type: contentType,
      }).unwrap();

      await fetch(upload_url, {
        method: 'PUT',
        headers: { 'Content-Type': pendingFile.type },
        body: pendingFile,
      });

      onUpload(s3_uri, previewUrl!);
      setOpen(false);
      setPreviewUrl(null);
      setPendingFile(null);
    } catch {
      setUploadError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    onRemove();
    setPreviewUrl(null);
    setPendingFile(null);
    setOpen(false);
  };

  return (
    <div ref={wrapperRef} className='relative'>
      {/* Avatar display — click to open popover */}
      <div
        className='cursor-pointer [&_img]:h-full [&_img]:w-full [&_img]:rounded-lg [&_img]:object-cover [&_svg]:h-full [&_svg]:w-full'
        style={{ width: 63, height: 63, borderRadius: 8, overflow: 'hidden' }}
        onClick={() => setOpen((v) => !v)}
        dangerouslySetInnerHTML={{ __html: svgContent }}
      />

      {/* Popover */}
      {open && (
        <div
          className='absolute top-[calc(100%+8px)] left-0 z-[100] overflow-hidden rounded-[6px] border border-[#e6e5e5] bg-white'
          style={{ width: 232, boxShadow: '1px 2px 10px rgba(166,166,166,0.1)' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Tabs */}
          <div className='flex gap-1.5 px-2 pt-2'>
            {(['zamp', 'upload'] as const).map((tab) => (
              <button
                key={tab}
                type='button'
                className={`rounded px-2.5 py-1.5 text-xs font-medium transition-all ${
                  activeTab === tab ? 'bg-[#f2f2f2] text-[#171717]' : 'text-[#8f8f8f]'
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === 'zamp' ? 'Zamp icons' : 'Upload'}
              </button>
            ))}
          </div>

          {/* Body */}
          <div className='p-2'>
            {activeTab === 'zamp' && (
              <div className='flex items-center justify-center py-2'>
                <div
                  className='[&_img]:h-full [&_img]:w-full [&_img]:rounded-lg [&_img]:object-cover [&_svg]:h-full [&_svg]:w-full'
                  style={{ width: 120, height: 120, borderRadius: 8, overflow: 'hidden' }}
                  dangerouslySetInnerHTML={{ __html: svgContent }}
                />
              </div>
            )}

            {activeTab === 'upload' && (
              <div className='p-2'>
                {previewUrl ? (
                  <img src={previewUrl} alt='preview' className='max-h-[120px] w-full rounded-md object-cover' />
                ) : (
                  <button
                    type='button'
                    className='flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed border-[#ebebeb] bg-[#fafafa] py-4 transition-all hover:border-[#ccc] hover:bg-[#f5f5f5]'
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <svg
                      className='h-4 w-4 text-[#8f8f8f]'
                      viewBox='0 0 16 16'
                      fill='none'
                      xmlns='http://www.w3.org/2000/svg'
                    >
                      <path
                        d='M12 10v0.8c0 1.12 0 1.68-.218 2.108a2 2 0 0 1-.874.874C10.48 14 9.92 14 8.8 14H7.2c-1.12 0-1.68 0-2.108-.218a2 2 0 0 1-.874-.874C4 12.48 4 11.92 4 10.8V10M10.67 5.33L8 2.67M8 2.67L5.33 5.33M8 2.67V10'
                        stroke='currentColor'
                        strokeWidth='1.14'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                      />
                    </svg>
                    <span className='text-[11px] text-[#666]'>Upload a file</span>
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type='file'
                  accept='image/png,image/jpeg'
                  className='hidden'
                  onChange={handleFileChange}
                />
                {uploadError && <p className='mt-1.5 text-[11px] text-red-500'>{uploadError}</p>}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className='flex items-center justify-between border-t border-[#f0f0f0] p-2'>
            <button
              type='button'
              className='rounded px-2 py-1 text-[11px] text-[#8f8f8f] transition-all hover:bg-[#f5f5f5] hover:text-[#555]'
              onClick={handleRemove}
            >
              Remove
            </button>
            <div className='flex items-center gap-1.5'>
              {activeTab === 'zamp' && (
                <button
                  type='button'
                  className='flex h-6 w-8 items-center justify-center rounded-md bg-[#171717] text-white transition-all hover:bg-[#333]'
                  onClick={onShuffle}
                  title='Shuffle'
                >
                  <svg className='h-3.5 w-3.5' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'>
                    <path
                      d='M11 9.5l2 2m0 0l-2 2m2-2h-3.02c-.328-.003-.65-.087-.938-.244a2.02 2.02 0 0 1-.712-.656l-.18-.225M11 3.5l2 2m0 0l-2 2m2-2l-2.986 0c-.324-.002-.643.074-.93.222a2.02 2.02 0 0 0-.72.628l-2.728 4.3a2.02 2.02 0 0 1-.72.628c-.287.148-.605.224-.93.222H3M3 5.5h.986c.373-.003.739.099 1.057.293.318.195.575.474.743.807'
                      stroke='currentColor'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                  </svg>
                </button>
              )}
              {activeTab === 'upload' && pendingFile && (
                <button
                  type='button'
                  disabled={uploading}
                  className='rounded-md bg-[#171717] px-3.5 py-1.5 text-[11px] text-white transition-all hover:bg-[#333] disabled:opacity-60'
                  onClick={handleSave}
                >
                  {uploading ? 'Saving...' : 'Save'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
