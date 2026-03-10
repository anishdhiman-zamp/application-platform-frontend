'use client';

import { useRef, useState } from 'react';
import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@zamp-platform/ui';
import { Shuffle, Upload } from 'lucide-react';
import { ERROR_MESSAGES, VALIDATION } from 'modules/onboarding/onboarding.constants';

export type AvatarDisplay = { type: 'seed'; svg: string } | { type: 'url'; src: string };

type Props = {
  avatar: AvatarDisplay;
  onShuffle: () => void;
  onUpload: (file: File, previewUrl: string) => void;
  onRemove: () => void;
};

export const AvatarImage = ({ avatar, size }: { avatar: AvatarDisplay; size: number }) => {
  const style = { width: size, height: size, borderRadius: 8, overflow: 'hidden' } as const;

  if (avatar.type === 'url') {
    return (
      <div style={style}>
        <img src={avatar.src} alt='avatar' className='h-full w-full rounded-lg object-cover' />
      </div>
    );
  }

  return (
    <div className='[&_svg]:h-full [&_svg]:w-full' style={style} dangerouslySetInnerHTML={{ __html: avatar.svg }} />
  );
};

export const AvatarPicker = ({ avatar, onShuffle, onUpload, onRemove }: Props) => {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('zamp');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const revokePreview = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (file.size > VALIDATION.AVATAR_MAX_SIZE_BYTES) {
      setFileError(ERROR_MESSAGES.FILE_TOO_LARGE);
      e.target.value = '';

      return;
    }

    setFileError(null);
    revokePreview();
    const url = URL.createObjectURL(file);

    setPreviewUrl(url);
    setPendingFile(file);
    e.target.value = '';
  };

  const handleSave = () => {
    if (!pendingFile || !previewUrl) return;
    onUpload(pendingFile, previewUrl);
    setOpen(false);
    // Don't revoke here — the preview URL is now owned by the parent
    setPreviewUrl(null);
    setPendingFile(null);
    setFileError(null);
  };

  const handleRemove = () => {
    onRemove();
    revokePreview();
    setPreviewUrl(null);
    setPendingFile(null);
    setFileError(null);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className='cursor-pointer'>
          <AvatarImage avatar={avatar} size={63} />
        </div>
      </PopoverTrigger>

      <PopoverContent
        className='w-[232px] overflow-hidden p-0'
        align='start'
        sideOffset={8}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className='gap-1.5 bg-transparent px-2 pt-2'>
            <TabsTrigger
              value='zamp'
              className='data-[state=active]:bg-GRAY_100 rounded px-2.5 py-1.5 text-xs font-medium'
            >
              Zamp icons
            </TabsTrigger>
            <TabsTrigger
              value='upload'
              className='data-[state=active]:bg-GRAY_100 rounded px-2.5 py-1.5 text-xs font-medium'
            >
              Upload
            </TabsTrigger>
          </TabsList>

          <TabsContent value='zamp' className='p-2'>
            <div className='flex items-center justify-center py-2'>
              <AvatarImage avatar={avatar} size={120} />
            </div>
          </TabsContent>

          <TabsContent value='upload' className='p-4'>
            {previewUrl ? (
              <img src={previewUrl} alt='preview' className='max-h-[120px] w-full rounded-md object-cover' />
            ) : (
              <Button
                variant='ghost'
                className='bg-BG_GRAY_2 border-GRAY_200 hover:border-GRAY_500 hover:bg-GRAY_100 flex w-full flex-col items-center justify-center gap-2 rounded-md border border-dashed py-4'
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className='text-GRAY_700 h-4 w-4' />
                <span className='text-GRAY_900 text-[11px]'>Upload a file</span>
              </Button>
            )}
            {fileError && <p className='text-RED_600 mt-2 text-xs'>{fileError}</p>}
            <input
              ref={fileInputRef}
              type='file'
              accept='image/png,image/jpeg'
              className='hidden'
              onChange={handleFileChange}
            />
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className='border-GRAY_200 flex items-center justify-between border-t p-2'>
          <Button
            variant='ghost'
            size='xsmall'
            className='text-GRAY_700 hover:text-GRAY_900 text-[11px]'
            onClick={handleRemove}
          >
            Remove
          </Button>
          <div className='flex items-center gap-1.5'>
            {activeTab === 'zamp' && (
              <Button
                variant='default'
                size='xsmall'
                className='flex h-6 w-8 items-center justify-center'
                onClick={onShuffle}
                title='Shuffle'
              >
                <Shuffle className='h-3.5 w-3.5' />
              </Button>
            )}
            {activeTab === 'upload' && pendingFile && (
              <Button variant='default' size='xsmall' onClick={handleSave}>
                Save
              </Button>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
