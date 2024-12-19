import { MouseEventHandler } from "react";
import clsx, { ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

declare type MapAny = Record<string, any>;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const checkIsObjectEmpty = (obj: MapAny, ignoreKeys?: string[]) => {
  if (!obj) return true;

  if (typeof obj === 'object' && !Object.keys(obj).length) return true;

  if (!ignoreKeys?.length && typeof obj === 'object' && !Object.keys(obj).length) return true;

  if (ignoreKeys?.length && typeof obj === 'object') {
    const keys = Object.keys(obj);

    if (JSON.stringify(keys.sort()) === JSON.stringify(ignoreKeys?.sort())) return true;
  }

  return false;
};

export const stopPropagationAction: MouseEventHandler<Element> = (event) => {
  event?.stopPropagation();
};

export const isArrayOrObject = (value: unknown): boolean => {
  return Array.isArray(value) || typeof value === 'object';
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
export function debounce<T extends (...args: any[]) => any>(func: T, wait: number) {
  let timeout: ReturnType<typeof setTimeout> | null;

  return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      timeout = null;
      func.apply(this, args);
    }, wait);
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
export function doDebounce<T extends (...args: any[]) => any>(func: T, wait: number) {
  let timeout: ReturnType<typeof setTimeout> | null;

  return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
    if (!timeout) {
      func.apply(this, args);
      timeout = setTimeout(() => {
        timeout = null;
      }, wait);
    }
  };
}
