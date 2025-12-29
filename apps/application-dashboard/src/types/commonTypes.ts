import { ReactElement, ReactNode, RefObject } from 'react';
import { NextPage } from 'next';

export type defaultFnType = () => void;
export declare type MapAny = Record<string, any>;
export const defaultFn = (): void => {};
export declare type EventCallbackType = (id: string, payload: MapAny) => void;

export interface CommonPageLayoutProps {
  scrollToTop?: defaultFnType;
  scrollToBottom?: defaultFnType;
  rootContainerRef?: RefObject<HTMLDivElement | null>;
}

export type NextPageWithLayout<P = object, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

export interface OptionsType {
  label?: ReactNode;
  value: string | number;
  id?: string;
  spriteIcon?: string;
  icon?: ReactNode;
  isDisabled?: boolean;
  metadata?: MapAny;
  options?: OptionsType[];
  desc?: string;
}

export type DashboardLayoutProps = {
  pageType?: string;
  children: ReactNode;
  containerStyle?: string;
  contentWrapperClassName?: string;
};
export type ChildrenLayoutPropsType = {
  children: ReactNode;
};

export type ResponsiveGridLayoutType = {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
};

export enum SIDE_OPTIONS {
  TOP = 'top',
  BOTTOM = 'bottom',
  LEFT = 'left',
  RIGHT = 'right',
}

export enum ALIGN_OPTIONS {
  START = 'start',
  CENTER = 'center',
  END = 'end',
}

export enum MODULE_TYPE {
  PAGES = 'pages',
  DATASETS = 'datasets',
  PROCESSES = 'processes',
}
