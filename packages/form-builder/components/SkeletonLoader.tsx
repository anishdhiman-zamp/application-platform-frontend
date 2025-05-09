import React from 'react';

import { cn } from '../utils/cn';

interface SkeletonLoaderProps {
  height?: string;
  width?: string;
  className?: string;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ height = '20px', width = '100%', className = '' }) => {
  return <div className={cn('animate-pulse rounded-md bg-muted', className)} style={{ height, width }} />;
};
