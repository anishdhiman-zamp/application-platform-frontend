'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { captureException } from '@sentry/nextjs';
import { cn } from '@zamp-platform/ui/utils';
import { LoaderCircle } from 'lucide-react';
import Image from 'next/image';
import { PAUSED_OVERLAY } from '@/constants/icons';
import { KEYBOARD_KEYS } from '@/constants/shortcuts';
import FileNotFoundError from '@/modules/pace/components/file-viewer/FileNotFoundError';
import MuteButton from '@/modules/pace/components/file-viewer/viewers/components/MuteButton';
import PlayButton from '@/modules/pace/components/file-viewer/viewers/components/PlayButton';
import ProgressBar from '@/modules/pace/components/file-viewer/viewers/components/ProgressBar';
import { formatTime } from '@/modules/process/process.utils';

interface VideoViewerProps {
  src: string;
  poster?: string;
  className?: string;
  isActive?: boolean;
  fileName?: string;
  onClose?: () => void;
}

const VideoViewer = ({ src, poster, className = '', isActive = true, fileName, onClose }: VideoViewerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [error, setError] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const displayFileName = fileName || decodeURIComponent(src.split('/').pop() || 'video');

  const handleError = useCallback(
    (e: React.SyntheticEvent<HTMLVideoElement>) => {
      setIsLoading(false);
      setError(true);
      const mediaError = e.currentTarget?.error;

      captureException(new Error(mediaError?.message || `Video load failed (code: ${mediaError?.code})`), {
        extra: { src, mediaErrorCode: mediaError?.code },
      });
    },
    [src],
  );

  const handleLoadedMetadata = useCallback(() => {
    const video = videoRef.current;

    if (!video) return;

    setDuration(video.duration ?? 0);
    setIsLoading(false);
    setError(false);
  }, []);

  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => setIsPlaying(false);
  const handleEnded = () => {
    const video = videoRef.current;

    setIsPlaying(false);

    if (video) {
      video.currentTime = 0;
      setCurrentTime(0);
    }
  };
  const handleWaiting = () => setIsBuffering(true);
  const handleCanPlay = () => setIsBuffering(false);
  const handleSeeking = () => setIsBuffering(true);
  const handleSeeked = useCallback(() => {
    const video = videoRef.current;

    if (video && video.readyState >= 3) {
      setIsBuffering(false);
    }
  }, []);

  const togglePlayPause = () => {
    const video = videoRef.current;

    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  };

  const handleSeek = (time: number) => {
    const video = videoRef.current;

    if (!video) return;

    video.currentTime = time;
    setCurrentTime(time);
  };

  const toggleMute = () => {
    const video = videoRef.current;

    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  // Pause video when tab becomes inactive
  useEffect(() => {
    const video = videoRef.current;

    if (!isActive && video && !video.paused) {
      video.pause();
    }
  }, [isActive]);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime ?? 0);
    };

    // Check if already loaded (e.g., from cache)
    if (video.readyState >= 1 && isLoading) {
      handleLoadedMetadata();
    }

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('seeking', handleSeeking);
    video.addEventListener('seeked', handleSeeked);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('seeking', handleSeeking);
      video.removeEventListener('seeked', handleSeeked);
    };
  }, [handleLoadedMetadata, handleSeeked, isLoading]);

  if (error && onClose) {
    return <FileNotFoundError fileName={displayFileName} onClose={onClose} />;
  }

  return (
    <div className={cn('flex h-full w-full flex-col items-center justify-center p-4', className)}>
      <div className='flex h-full w-full flex-col overflow-hidden'>
        <div
          className='relative min-h-0 flex-1 overflow-hidden rounded-t-[10px] bg-black'
          onClick={togglePlayPause}
          tabIndex={0}
          role='button'
          onKeyDown={(e) => {
            if (e.code === KEYBOARD_KEYS.SPACE || e.code === KEYBOARD_KEYS.ENTER) {
              e.preventDefault();
              togglePlayPause();
            }
          }}
        >
          <video
            ref={videoRef}
            src={src}
            poster={poster}
            className={cn(
              'h-full w-full object-contain transition-opacity duration-300 ease-in-out',
              isLoading ? 'opacity-0' : 'opacity-100',
            )}
            preload='metadata'
            playsInline
            onLoadedMetadata={handleLoadedMetadata}
            onError={handleError}
          />

          <div
            className={cn(
              'absolute inset-0 z-10 flex items-center justify-center bg-black transition-opacity duration-300 ease-in-out',
              isLoading ? 'opacity-100' : 'pointer-events-none opacity-0',
            )}
          >
            <LoaderCircle size={48} className='animate-spin text-white' />
          </div>

          {isBuffering && !isLoading && (
            <div className='pointer-events-none absolute inset-0 z-10 flex items-center justify-center'>
              <LoaderCircle size={48} className='animate-spin text-white' />
            </div>
          )}

          {error && !onClose && (
            <div className='absolute inset-0 flex items-center justify-center bg-black/50'>
              <div className='text-center text-white'>
                <p>Error loading video</p>
              </div>
            </div>
          )}

          {!isPlaying && !isLoading && !error && (
            <div className='absolute inset-0 flex items-center justify-center bg-transparent' aria-hidden='true'>
              <Image src={PAUSED_OVERLAY} alt='play' width={58} height={69} priority />
            </div>
          )}
        </div>

        <div className='bg-GRAY_100 border-GRAY_500 flex h-[60px] w-full shrink-0 items-center gap-x-2.5 overflow-hidden rounded-b-[10px] border-x border-b p-4'>
          <PlayButton isPlaying={isPlaying} onClick={togglePlayPause} disabled={isLoading || error} />
          <ProgressBar
            currentTime={currentTime}
            duration={duration}
            onSeek={handleSeek}
            disabled={isLoading || error}
          />
          <span className='f-11-450 text-GRAY_700 ml-2 whitespace-nowrap' aria-label='Time remaining'>
            {formatTime(
              !isPlaying && currentTime >= duration - 0.1 ? 0 : Math.ceil(Math.max(0, duration - currentTime)),
            )}
          </span>
          <MuteButton isMuted={isMuted} onClick={toggleMute} disabled={isLoading || error} />
        </div>
      </div>
    </div>
  );
};

export default VideoViewer;
