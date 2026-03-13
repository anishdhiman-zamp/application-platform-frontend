import { cn } from '@zamp-platform/ui/utils';

interface ScrollFadeOverlayProps {
  canScrollTop: boolean;
  canScrollBottom: boolean;
}

const ScrollFadeOverlay = ({ canScrollTop, canScrollBottom }: ScrollFadeOverlayProps) => {
  return (
    <>
      <div
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-x-0 top-0 z-20 h-6',
          'transition-opacity duration-200',
          canScrollTop ? 'opacity-100' : 'opacity-0',
        )}
        style={{
          background: 'linear-gradient(180deg, var(--BG_WHITE) 0%, transparent 100%)',
        }}
      />
      <div
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-x-0 bottom-0 z-20 h-6',
          'transition-opacity duration-200',
          canScrollBottom ? 'opacity-100' : 'opacity-0',
        )}
        style={{
          background: 'linear-gradient(0deg, var(--BG_WHITE) 0%, transparent 100%)',
        }}
      />
    </>
  );
};

export default ScrollFadeOverlay;
