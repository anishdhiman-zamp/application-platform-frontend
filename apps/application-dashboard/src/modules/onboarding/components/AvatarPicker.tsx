'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Button,
  Input,
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
import { KEYBOARD_KEYS } from '@/constants/shortcuts';

export type AvatarDisplay = { type: 'seed'; svg: string } | { type: 'url'; src: string };

enum AvatarPickerTab {
  ZAMP = 'zamp',
  UPLOAD = 'upload',
}

type Props = {
  avatar: AvatarDisplay;
  onShuffle: () => void;
  onUpload: (file: File, previewUrl: string) => void;
  onReset: () => void;
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

export const AvatarPicker = ({ avatar, onShuffle, onUpload, onReset }: Props) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<AvatarPickerTab>(AvatarPickerTab.ZAMP);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const revokePreview = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

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

  const resetLocalState = useCallback(
    (revokeUrl = true) => {
      if (revokeUrl) revokePreview();
      setPreviewUrl(null);
      setPendingFile(null);
      setFileError(null);
    },
    [revokePreview],
  );

  const closePopover = useCallback(
    (revokeUrl = true) => {
      setOpen(false);
      // Clean up local state after close animation completes
      setTimeout(() => resetLocalState(revokeUrl), 200);
    },
    [resetLocalState],
  );

  const handleSave = () => {
    if (!pendingFile || !previewUrl) return;
    onUpload(pendingFile, previewUrl);
    // Don't revoke — the preview URL is now owned by the parent
    closePopover(false);
  };

  const handleReset = () => {
    onReset();
    resetLocalState();
  };

  // When popover is open, Enter saves (upload tab with file) or just closes
  useEffect(() => {
    if (!open) return;

    const handleEnter = (e: KeyboardEvent) => {
      if (e.key !== KEYBOARD_KEYS.ENTER) return;
      e.preventDefault();
      e.stopImmediatePropagation();

      if (activeTab === AvatarPickerTab.UPLOAD && pendingFile && previewUrl) {
        onUpload(pendingFile, previewUrl);
        closePopover(false);
      } else {
        closePopover();
      }
    };

    window.addEventListener('keydown', handleEnter, { capture: true });

    return () => window.removeEventListener('keydown', handleEnter, { capture: true });
  }, [open, activeTab, pendingFile, previewUrl, onUpload, closePopover]);

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
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as AvatarPickerTab)}>
          <TabsList className='gap-1.5 bg-transparent px-2 pt-3'>
            <TabsTrigger
              value={AvatarPickerTab.ZAMP}
              className='data-[state=active]:bg-GRAY_100 rounded px-2.5 py-1.5 text-xs font-medium'
            >
              Zamp icons
            </TabsTrigger>
            <TabsTrigger
              value={AvatarPickerTab.UPLOAD}
              className='data-[state=active]:bg-GRAY_100 rounded px-2.5 py-1.5 text-xs font-medium'
            >
              Upload
            </TabsTrigger>
          </TabsList>

          <TabsContent value={AvatarPickerTab.ZAMP} className='p-2'>
            <div className='flex items-center justify-center py-2'>
              <AvatarImage avatar={avatar} size={120} />
            </div>
          </TabsContent>

          <TabsContent value={AvatarPickerTab.UPLOAD} className='p-2'>
            {previewUrl ? (
              <div className='flex items-center justify-center py-2'>
                <img src={previewUrl} alt='preview' className='h-[120px] w-[120px] rounded-lg object-cover' />
              </div>
            ) : (
              <Button
                variant='ghost'
                className='border-GRAY_200 hover:border-GRAY_400 hover:bg-GRAY_50 flex h-[136px] w-full flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed'
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className='text-GRAY_500 h-4 w-4' />
                <span className='text-GRAY_600 text-[11px]'>Upload a file</span>
              </Button>
            )}
            {fileError && <p className='text-RED_600 mt-1 text-xs'>{fileError}</p>}
            <Input
              ref={(node) => {
                fileInputRef.current = node;
              }}
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
            onClick={handleReset}
          >
            Reset
          </Button>
          <div className='flex items-center gap-1.5'>
            {activeTab === AvatarPickerTab.ZAMP && (
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
            {activeTab === AvatarPickerTab.UPLOAD && pendingFile && (
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
