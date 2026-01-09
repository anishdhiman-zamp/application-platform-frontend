import { ReactElement, ReactNode } from 'react';
import { SvgSpriteLoaderProps } from '@zamp-platform/ui/assets';
import { POSITION_TYPES } from 'types/common/components';
import { defaultFnType } from 'types/commonTypes';

export enum SIDE_DRAWER_TYPES {
  PRIMARY = 'PRIMARY',
  SECONDARY = 'SECONDARY',
}

type ButtonSize = 'xlarge' | 'large' | 'medium' | 'small' | 'xsmall';

export interface OverlayTitleProps {
  topBar?: ReactElement | string;
  subtitle?: string | ReactElement;
  step?: string;
  title?: string | ReactElement;
  hideCloseButton?: boolean;
  onClose: defaultFnType;
  headerClassName?: string;
  closeButtonClassName?: string;
  closeButtonDimensions?: { width: number; height: number };
  titleClassName?: string;
  subtitleClassName?: string;
}

export interface OverlayFooterProps {
  bottomBar?: ReactElement;
  onBack?: defaultFnType;
  onNext?: defaultFnType;
  isNextButtonDisabled?: boolean;
  nextButtonClassName?: string;
  backButtonClassName?: string;
  nextButtonTitle?: string | ReactElement;
  backButtonTitle?: string | ReactElement;
  isBackButtonLoading?: boolean;
  isNextButtonLoading?: boolean;
  nextButtonIconProps?: SvgSpriteLoaderProps;
  nextButtonIconPosition?: 'LEFT' | 'RIGHT';
  footerClassName?: string;
  nextButtonSize?: ButtonSize;
  backButtonSize?: ButtonSize;
}

export interface SideDrawerProps extends OverlayTitleProps, OverlayFooterProps {
  isOpen: boolean;
  children: ReactNode;
  className?: string;
  closeOnClickOutside?: boolean;
  stackPosition?: number;
  backdropClassName?: string;
  id: string;
  size?: ButtonSize;
  childrenWrapperClassName?: string;
  animateOnClose?: boolean;
  titleClassName?: string;
  subtitleClassName?: string;
  position?: POSITION_TYPES;
  type?: SIDE_DRAWER_TYPES;
}
