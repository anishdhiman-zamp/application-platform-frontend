// import { FC, useMemo } from 'react';
// import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
// import { COLORS } from 'constants/colors';
// import { ICON_SPRITE_TYPES } from 'constants/icons';
// import { CustomToastPropsType } from 'components/common/toast/toast.types';
import { toast as sonnerToast } from '@zamp-platform/ui';

// const CustomToast: FC<CustomToastPropsType> = ({ text = '' }) => {
//   return <div className='f-14-400 flex w-full items-center gap-6 text-GRAY_700 -ml-[8px] -mt-[2px]'>{text}</div>;
// };

// const closeToast = () => {
//   sonnerToast.dismiss();
// };

// const GetToastIcon = (type: string) => {
//   return useMemo(() => {
//     switch (type) {
//       case 'success':
//         return (
//           <SvgSpriteLoader
//             id='check-circle'
//             iconCategory={ICON_SPRITE_TYPES.GENERAL}
//             width={16}
//             height={16}
//             color={COLORS.GREEN_PRIMARY}
//           />
//         );
//       case 'error':
//         return (
//           <SvgSpriteLoader
//             id='x-circle'
//             iconCategory={ICON_SPRITE_TYPES.GENERAL}
//             width={16}
//             height={16}
//             color={COLORS.RED_PRIMARY}
//           />
//         );
//       case 'warning':
//         return (
//           <SvgSpriteLoader
//             id='alert-circle'
//             iconCategory={ICON_SPRITE_TYPES.ALERTS_AND_FEEDBACK}
//             width={16}
//             height={16}
//             color={COLORS.ORANGE_SECONDARY}
//           />
//         );
//       case 'loading':
//         return (
//           <SvgSpriteLoader
//             id='alert-circle'
//             iconCategory={ICON_SPRITE_TYPES.GENERAL}
//             width={16}
//             height={16}
//             color={COLORS.GREEN_PRIMARY}
//           />
//         );
//       default:
//         return (
//           <SvgSpriteLoader
//             id='alert-circle'
//             iconCategory={ICON_SPRITE_TYPES.ALERTS_AND_FEEDBACK}
//             width={16}
//             height={16}
//             color={COLORS.GREEN_PRIMARY}
//           />
//         );
//     }
//   }, [type]);
// };

export const toast = {
  success: (message: string) => {
    sonnerToast.success(message);
  },
  error: (message: string) => {
    sonnerToast.error(message);
  },
  warn: (message: string) => {
    sonnerToast.warning(message);
  },
  loading: (message: string) => {
    return sonnerToast.loading(message);
  },
  dismiss: (toastId: string | number) => {
    sonnerToast.dismiss(toastId);
  },
};
