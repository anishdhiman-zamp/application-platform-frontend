import React, { useEffect, useRef, useState } from 'react';
import { captureException } from '@sentry/nextjs';
import Image from 'next/image';
import { PAUSED_OVERLAY } from '@/constants/icons';
import PlayButton from '@/modules/process/artifacts/components/browser-artifact/PlayButton';
import ProgressBar from '@/modules/process/artifacts/components/browser-artifact/ProgressBar';
import { formatTime } from '@/modules/process/process.utils';
import { cn } from '@/utils/common';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  className?: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, poster, className = '' }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleError = (e: ErrorEvent) => {
    setIsLoading(false);
    setError(true);
    captureException(e);
  };

  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => setIsPlaying(false);
  const handleEnded = () => setIsPlaying(false);

  const togglePlayPause = () => {
    const video = videoRef.current;

    if (!video) return;

    if (isPlaying) {
      video?.pause();
    } else {
      video?.play();
    }
  };

  const handleSeek = (time: number) => {
    const video = videoRef.current;

    if (!video) return;

    video.currentTime = time;
    setCurrentTime(time);
  };

  useEffect(() => {
    const video = videoRef.current;

    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video?.duration ?? 0);
      setIsLoading(false);
      setError(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video?.currentTime ?? 0);
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('error', handleError);
    };
  }, []);

  return (
    <div className={cn(`flex flex-col`, className)}>
      <div
        className='border-GRAY_500 relative aspect-[3/2] w-full overflow-hidden rounded-[10px] border bg-black'
        onClick={togglePlayPause}
        tabIndex={0}
      >
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          className='h-full w-full object-contain'
          preload='auto'
          playsInline
          muted
        />

        {/* Loading overlay */}
        {isLoading && (
          <div className='bg-opacity-50 animate-opacity absolute inset-0 flex items-center justify-center bg-black'>
            <div className='h-12 w-12 animate-spin rounded-full border-b-2 border-white'></div>
          </div>
        )}

        {/* Error overlay */}
        {error && (
          <div className='bg-opacity-50 animate-opacity absolute inset-0 flex items-center justify-center bg-black'>
            <div className='text-center text-white'>
              <p>Error loading video</p>
            </div>
          </div>
        )}

        {/* Play overlay */}
        {!isPlaying && !isLoading && !error && (
          <div className='absolute inset-0 flex items-center justify-center bg-transparent' aria-hidden='true'>
            <Image src={PAUSED_OVERLAY} alt='play' width={58} height={69} priority />
          </div>
        )}
      </div>

      <div className='bg-gray-70 -mt-[15px] flex h-[76px] w-full items-center gap-x-2.5 rounded-b-[10px] p-4 pt-[30px]'>
        <PlayButton isPlaying={isPlaying} onClick={togglePlayPause} disabled={isLoading || error} />
        <ProgressBar currentTime={currentTime} duration={duration} onSeek={handleSeek} disabled={isLoading || error} />
        <span className='f-11-450 text-GRAY_700 ml-2 whitespace-nowrap' aria-label='Time left'>
          {formatTime(!isPlaying && currentTime >= duration - 0.1 ? 0 : Math.ceil(Math.max(0, duration - currentTime)))}
        </span>
      </div>
    </div>
  );
};

export default VideoPlayer;
