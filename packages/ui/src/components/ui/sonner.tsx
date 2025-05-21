'use client';

import { Toaster as Sonner, toast } from 'sonner';
import { SvgSpriteLoader } from '../assets';
import { COLORS } from '../../constants';

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className='toaster group'
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:rounded-2.5  group-[.toaster]:flex  group-[.toaster]:items-center group-[.toaster]:w-[420px] group-[.toaster]:p-5  group-[.toaster]:border',
          description: 'group-[.toast]:text-muted-foreground',
          closeButton: 'group-[.toast]:order-3 group-[.toast]:ml-1.5',
          icon: 'group-[.toast]:mr-2.5',
          content: 'group-[.toast]:w-full text-gray-950',
        },
      }}
      closeButton
      icons={{
        success: <SvgSpriteLoader id='check-circle' size={20} color={COLORS.GRAY_950} />,
        error: <SvgSpriteLoader id='x-circle' size={20} color={COLORS.GRAY_950} />,
        warning: <SvgSpriteLoader id='alert-circle' size={20} color={COLORS.GRAY_950} />,
        close: <SvgSpriteLoader id='x-close' size={16} color={COLORS.GRAY_950} />,
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
