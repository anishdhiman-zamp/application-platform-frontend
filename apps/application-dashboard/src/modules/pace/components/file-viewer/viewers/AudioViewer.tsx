'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { captureException } from '@sentry/nextjs';
import { cn } from '@zamp-platform/ui/utils';
import { LoaderCircle, Music } from 'lucide-react';
import FileNotFoundError from '@/modules/pace/components/file-viewer/FileNotFoundError';
import MuteButton from '@/modules/pace/components/file-viewer/viewers/components/MuteButton';
import PlayButton from '@/modules/pace/components/file-viewer/viewers/components/PlayButton';
import ProgressBar from '@/modules/pace/components/file-viewer/viewers/components/ProgressBar';
import { formatTime } from '@/modules/process/process.utils';

interface AudioViewerProps {
  src: string;
  fileName?: string;
  className?: string;
  isActive?: boolean;
  onClose?: () => void;
}

const AudioViewer = ({ src, fileName, className = '', isActive = true, onClose }: AudioViewerProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const displayFileName = fileName || decodeURIComponent(src.split('/').pop() || 'audio');

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [error, setError] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const handleError = useCallback(
    (e: Event) => {
      setIsLoading(false);
      setError(true);
      captureException(e, {
        extra: { src },
      });
    },
    [src],
  );

  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => setIsPlaying(false);
  const handleEnded = () => {
    const audio = audioRef.current;

    setIsPlaying(false);

    if (audio) {
      audio.currentTime = 0;
      setCurrentTime(0);
    }
  };
  const handleWaiting = () => setIsBuffering(true);
  const handleCanPlay = () => setIsBuffering(false);
  const handleSeeking = () => setIsBuffering(true);
  const handleSeeked = useCallback(() => {
    const audio = audioRef.current;

    if (audio && audio.readyState >= 3) {
      setIsBuffering(false);
    }
  }, []);

  const togglePlayPause = () => {
    const audio = audioRef.current;

    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
  };

  const handleSeek = (time: number) => {
    const audio = audioRef.current;

    if (!audio) return;

    audio.currentTime = time;
    setCurrentTime(time);
  };

  const toggleMute = () => {
    const audio = audioRef.current;

    if (!audio) return;

    audio.muted = !audio.muted;
    setIsMuted(audio.muted);
  };

  // Pause audio when tab becomes inactive
  useEffect(() => {
    const audio = audioRef.current;

    if (!isActive && audio && !audio.paused) {
      audio.pause();
    }
  }, [isActive]);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration ?? 0);
      setIsLoading(false);
      setError(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime ?? 0);
    };

    if (audio.readyState >= 1) {
      handleLoadedMetadata();
    }

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('seeking', handleSeeking);
    audio.addEventListener('seeked', handleSeeked);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('seeking', handleSeeking);
      audio.removeEventListener('seeked', handleSeeked);
    };
  }, [handleError, handleSeeked, src]);

  if (error && onClose) {
    return <FileNotFoundError fileName={displayFileName} onClose={onClose} />;
  }

  return (
    <div className={cn('flex h-full w-full flex-col items-center justify-center p-4', className)}>
      <audio ref={audioRef} src={src} preload='metadata' />

      <div className='flex w-full max-w-md flex-col'>
        <div className='border-GRAY_400 bg-BG_GRAY_2 relative flex aspect-square w-full flex-col items-center justify-center gap-4 overflow-hidden rounded-t-[10px] border-x border-t'>
          <div
            className={cn(
              'bg-BG_GRAY_2 absolute inset-0 z-10 flex items-center justify-center rounded-t-[10px] transition-opacity duration-300 ease-in-out',
              isLoading ? 'opacity-100' : 'pointer-events-none opacity-0',
            )}
          >
            <LoaderCircle size={48} className='text-GRAY_700 animate-spin' />
          </div>

          {isBuffering && !isLoading && (
            <div className='bg-BG_GRAY_2/80 pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-t-[10px]'>
              <LoaderCircle size={48} className='text-GRAY_700 animate-spin' />
            </div>
          )}

          {error && !onClose ? (
            <div className='text-center'>
              <Music size={64} className='text-GRAY_500 mx-auto mb-2' />
              <p className='f-13-450 text-GRAY_700'>Error loading audio</p>
            </div>
          ) : (
            <div
              className={cn(
                'flex flex-col items-center gap-4 transition-opacity duration-300 ease-in-out',
                isLoading ? 'opacity-0' : 'opacity-100',
              )}
            >
              <div
                className={cn(
                  'bg-GRAY_200 flex h-24 w-24 items-center justify-center rounded-full transition-transform duration-300',
                  isPlaying && 'scale-110 animate-pulse',
                )}
              >
                <Music size={48} className='text-GRAY_700' />
              </div>
              {fileName && <p className='f-14-500 text-GRAY_900 max-w-full truncate px-4'>{fileName}</p>}
            </div>
          )}
        </div>

        <div className='bg-GRAY_100 border-GRAY_400 flex h-[60px] w-full items-center gap-x-2.5 rounded-b-[10px] border-x border-b p-4'>
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

export default AudioViewer;
