import React, { FC, memo, MouseEventHandler, Suspense, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { SPRITE_CATEGORY_BY_ID } from './constants';
import '@zamp-platform/svg-loader';
import { ICON_SPRITE_TYPES } from '@zamp-platform/ui/types';
import { cn } from '@zamp-platform/ui/lib/utils';

export interface SvgSpriteLoaderProps {
  width?: number;
  size?: number;
  height?: number;
  fillColor?: string;
  color?: string;
  iconCategory?: ICON_SPRITE_TYPES;
  id: string;
  viewBox?: string;
  domain?: string;
  dataCache?: string;
  version?: number;
  className?: string;
  onClick?: MouseEventHandler<HTMLDivElement>;
  customSpriteUrl?: string;
  fallback?: React.ReactNode;
  lazyLoading?: boolean;
}

const SvgSpriteLoaderBaseComponent: FC<SvgSpriteLoaderProps> = ({
  size,
  width = 20,
  height = 20,
  viewBox = '0 0 24 24',
  fillColor = 'none',
  color,
  iconCategory,
  id = 'alert-circle',
  version = 0,
  domain = 'https://assets.zamp.finance',
  dataCache = '',
  className = '',
  onClick,
  customSpriteUrl,
  fallback,
  lazyLoading = false,
}) => {
  // Memoize the category lookup
  const category = useMemo(() => iconCategory ?? SPRITE_CATEGORY_BY_ID[id], [iconCategory, id]);

  // Memoize the sprite URL
  const spriteUrl = useMemo(
    () => customSpriteUrl ?? `${domain}/sprites/v${version}/${category}.svg#${id}`,
    [customSpriteUrl, domain, version, category, id],
  );

  // Memoize the dimensions
  const dimensions = useMemo(
    () => ({
      width: size ?? width,
      height: size ?? height,
    }),
    [size, width, height],
  );

  return (
    <div
      onClick={onClick}
      className={cn(className, onClick && 'cursor-pointer')}
      data-testid={`svg-sprite-loader-${id}`}
    >
      <Suspense fallback={fallback ?? <div style={dimensions} />}>
        <svg
          id={id}
          viewBox={viewBox}
          width={dimensions.width}
          height={dimensions.height}
          fill={fillColor}
          color={color}
          data-src={spriteUrl}
          data-cache={dataCache}
          data-loading={lazyLoading ? 'lazy' : 'eager'}
          onError={(e) => {
            console.error(`Failed to load SVG sprite: ${spriteUrl}`);
            if (fallback) {
              e.currentTarget.style.display = 'none';
            }
          }}
        />
      </Suspense>
    </div>
  );
};

// Custom comparison function for memo
const arePropsEqual = (prevProps: SvgSpriteLoaderProps, nextProps: SvgSpriteLoaderProps) => {
  return (
    prevProps.id === nextProps.id &&
    prevProps.size === nextProps.size &&
    prevProps.width === nextProps.width &&
    prevProps.height === nextProps.height &&
    prevProps.fillColor === nextProps.fillColor &&
    prevProps.color === nextProps.color &&
    prevProps.iconCategory === nextProps.iconCategory &&
    prevProps.viewBox === nextProps.viewBox &&
    prevProps.domain === nextProps.domain &&
    prevProps.dataCache === nextProps.dataCache &&
    prevProps.version === nextProps.version &&
    prevProps.className === nextProps.className &&
    prevProps.customSpriteUrl === nextProps.customSpriteUrl &&
    prevProps.lazyLoading === nextProps.lazyLoading
  );
};

// Export with memoization and custom comparison
const MemoizedSvgSpriteLoader = memo(SvgSpriteLoaderBaseComponent, arePropsEqual);

// Disable SSR using dynamic import with loading state
export const SvgSpriteLoader = dynamic(() => Promise.resolve(MemoizedSvgSpriteLoader), {
  ssr: false,
  loading: () => <div style={{ width: 20, height: 20 }} />,
});
