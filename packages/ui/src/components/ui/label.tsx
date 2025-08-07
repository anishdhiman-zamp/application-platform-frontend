import * as React from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';
import { cva } from 'class-variance-authority';

import { cn } from '@zamp-platform/ui/utils';

const labelVariants = cva(
  'f-12-500 text-gray-900 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
);

const Label = ({ className, ...props }: React.ComponentProps<typeof LabelPrimitive.Root>) => (
  <LabelPrimitive.Root className={cn(labelVariants(), className)} {...props} />
);
Label.displayName = LabelPrimitive.Root.displayName;

export { Label };
