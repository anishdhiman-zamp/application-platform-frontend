'use client';

import { useState } from 'react';
import { Button, Input, Label, ListCard } from '@zamp-platform/ui';
import { uploadBlob } from '@zamp-platform/utils';
import { FileIcon, Loader2, Upload } from 'lucide-react';
import { toast } from '@/components/common/toast/Toast';
import ToggleSwitch from '@/components/common/toggleSwitch';

interface FileWithMetadata {
  file: File;
  name: string;
  folder: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  url?: string;
  path?: string;
  error?: string;
}

export default function AssetUploader() {
  const [files, setFiles] = useState<FileWithMetadata[]>([]);
  const [defaultFolder, setDefaultFolder] = useState('icons');
  const [isUploading, setIsUploading] = useState(false);
  const [allowOverwrite, setAllowOverwrite] = useState(false);
  let fileInputElement: HTMLInputElement | null = null;

  const handleReset = () => {
    setFiles([]);
    setDefaultFolder('icons');
    setAllowOverwrite(false);
    if (fileInputElement?.value) {
      fileInputElement.value = '';
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e?.target?.files || []);

    if (selectedFiles.length > 0) {
      const newFiles = selectedFiles.map((file) => ({
        file,
        name: file.name.trim(),
        folder: defaultFolder,
        status: 'pending' as const,
      }));

      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    const updatedFiles = [...files];

    for (let i = 0; i < files.length; i++) {
      const fileData = files[i];

      if (fileData.status === 'success') continue;

      try {
        updatedFiles[i] = { ...fileData, status: 'uploading' };
        setFiles(updatedFiles);

        const path = `${fileData.folder}/${fileData.name}`;

        const blob = await uploadBlob({ file: fileData.file, path, allowOverwrite });

        updatedFiles[i] = {
          ...fileData,
          status: 'success',
          url: blob?.url,
          path: blob?.pathname,
        };
        setFiles(updatedFiles);
        toast.success(`Uploaded ${fileData.name} successfully`);
      } catch (error) {
        updatedFiles[i] = {
          ...fileData,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
        };
        setFiles(updatedFiles);
        toast.error(`Upload failed for ${fileData.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    setIsUploading(false);
  };

  const updateFileMetadata = (index: number, updates: Partial<FileWithMetadata>) => {
    setFiles((prev) => prev.map((file, i) => (i === index ? { ...file, ...updates } : file)));
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className='mx-auto h-full w-full max-w-2xl overflow-y-auto p-6 [&::-webkit-scrollbar]:hidden'>
      <ListCard header={<h1 className='text-2xl font-bold'>Upload Assets</h1>}>
        <div className='space-y-6'>
          <div className='space-y-2'>
            <Label htmlFor='file'>Files</Label>
            <div className='flex items-center gap-x-4'>
              <Input
                id='file'
                type='file'
                onChange={handleFileChange}
                className='h-full cursor-pointer'
                accept='image/*,application/pdf'
                multiple
                ref={(el) => {
                  fileInputElement = el;
                }}
              />
            </div>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='folder'>Default Folder</Label>
            <Input
              id='folder'
              type='text'
              placeholder='e.g. icons'
              value={defaultFolder}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDefaultFolder(e.target.value)}
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='folder'>Allow Overwrite</Label>
            <ToggleSwitch
              id='allow-overwrite'
              toggleClassName='relative w-10 h-5 rounded-full border-none'
              sliderClassName='absolute top-0.5 rounded-full w-4 h-4 transition-all duration-200'
              checked={allowOverwrite}
              onChange={(state: boolean) => setAllowOverwrite(state)}
            />
          </div>

          {files.length > 0 && (
            <div className='space-y-4'>
              <Label>Selected Files</Label>
              {files.map((fileData, index) => (
                <div key={index} className='space-y-3 rounded-lg border p-4'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                      <FileIcon className='h-4 w-4' />
                      <span className='text-sm'>{fileData.name}</span>
                    </div>
                    <Button variant='ghost' size='small' onClick={() => removeFile(index)} disabled={isUploading}>
                      Remove
                    </Button>
                  </div>

                  <div className='grid grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                      <Label htmlFor={`folder-${index}`}>Folder</Label>
                      <Input
                        id={`folder-${index}`}
                        type='text'
                        value={fileData.folder}
                        onChange={(e) => updateFileMetadata(index, { folder: e.target.value })}
                        disabled={isUploading}
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label htmlFor={`name-${index}`}>Filename</Label>
                      <Input
                        id={`name-${index}`}
                        type='text'
                        value={fileData.name}
                        onChange={(e) => updateFileMetadata(index, { name: e.target.value })}
                        disabled={isUploading}
                      />
                    </div>
                  </div>

                  {fileData.status === 'success' && (
                    <div className='mt-2 rounded-lg border border-green-200 bg-green-50 p-3'>
                      <p className='text-sm font-medium text-green-800'>✅ Upload Successful</p>
                      <a
                        href={fileData.url}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='mt-1 block text-sm text-green-600 hover:underline'
                      >
                        {fileData.url}
                      </a>
                      <p className='mt-1 text-sm'>
                        <span className='font-medium text-gray-600'>Path:</span>{' '}
                        <code className='text-GRAY_900 rounded bg-gray-100 px-2 py-1 font-mono text-sm'>
                          {fileData.path}
                        </code>
                      </p>
                    </div>
                  )}

                  {fileData.status === 'error' && (
                    <div className='mt-2 rounded-lg border border-red-200 bg-red-50 p-3'>
                      <p className='text-sm font-medium text-red-800'>❌ Upload Failed</p>
                      <p className='mt-1 text-sm text-red-600'>{fileData.error}</p>
                    </div>
                  )}

                  {fileData.status === 'uploading' && (
                    <div className='mt-2 flex items-center gap-2 text-sm text-blue-600'>
                      <Loader2 className='h-4 w-4 animate-spin' />
                      Uploading...
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <Button
            onClick={handleUpload}
            disabled={files.length === 0 || isUploading || files.every((f) => f.status === 'success')}
            className='w-full'
          >
            {isUploading ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Uploading...
              </>
            ) : (
              <>
                <Upload className='mr-2 h-4 w-4' />
                Upload All
              </>
            )}
          </Button>

          <Button onClick={handleReset} variant='outline' className='w-full' disabled={isUploading}>
            Reset
          </Button>
        </div>
      </ListCard>
    </div>
  );
}
