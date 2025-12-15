import React, { FC } from 'react';
import { cn } from '@/utils/common';
import { SKELETON_ELEMENT_SHAPES } from 'components/common/skeletons/skeletons.types';

interface SkeletonElementProps {
  elementCount?: number;
  className?: string;
  shape?: (typeof SKELETON_ELEMENT_SHAPES)[keyof typeof SKELETON_ELEMENT_SHAPES];
  style?: React.CSSProperties;
}

const SHAPE_STYLE = {
  [SKELETON_ELEMENT_SHAPES.CIRCLE]: 'rounded-full',
};

const SkeletonElement: FC<SkeletonElementProps> = ({ elementCount = 1, className = '', shape = null, style = {} }) => {
  const elements = Array(elementCount)?.fill('');

  return elements?.map((_, index) => {
    return (
      <span
        key={index}
        style={style}
        className={cn('bg-BASE_PRIMARY block animate-pulse', className, shape && SHAPE_STYLE[shape])}
      >
        &zwnj;
      </span>
    );
  });
};

export default SkeletonElement;
