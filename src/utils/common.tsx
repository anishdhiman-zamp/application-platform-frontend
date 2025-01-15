import { MouseEventHandler } from "react";
import clsx, { ClassValue } from 'clsx';
import { DATE_FILTER_CATEGORIES, DATE_FILTER_OPTIONS } from "constants/date.constants";
import { format, startOfYear } from "date-fns";
import { twMerge } from 'tailwind-merge';
import { DateFilterValueType } from "components/filter/DateRangeFilter";

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


export const getStartOfYear = (year: number) => {
  return startOfYear(new Date(year, 0, 1)); // January 1st of the specified year
};

export const isUserInUS = function () {
  const userLocale = navigator.language;

  return userLocale.endsWith('-US');
};

export const getDateRangeTitle = (dateRangeFilter: DateFilterValueType, showSingleDate?: boolean): string => {
  const start = dateRangeFilter?.start_date;
  const end = dateRangeFilter?.end_date;

  if (dateRangeFilter?.date_category === DATE_FILTER_CATEGORIES.CUSTOM_DATE_RANGE && start && end) {
    if (showSingleDate && start?.toDateString() === end?.toDateString()) {
      return format(start, 'dd MMM yyyy');
    }

    return `${format(start, 'dd MMM yyyy')} - ${format(end, 'dd MMM yyyy')}`;
  }

  const dateRangeCategory =
    DATE_FILTER_OPTIONS.find((category) => category.value === dateRangeFilter?.date_category) ?? DATE_FILTER_OPTIONS[0];

  return `Date range - ${dateRangeCategory?.label}`;
};

/**
 * Inject the dynamic parameters in the url from a parameter object
 * @param url
 * @param params
 * @returns
 */
export const formRequestUrlWithParams = (url: string, params: MapAny) => {
  let formattedUrl = url;

  Object.keys(params).forEach((key) => {
    formattedUrl = formattedUrl.replace(`{{${key}}}`, params[key]);
  });

  return formattedUrl;
};

export function isCamelCase(str: string) {
  // Regular expression to match camelCase
  const camelCaseRegex = /^[a-z]+([A-Z][a-z]*)*$/;

  return camelCaseRegex.test(str);
}

export function camelCaseToNormalText(camelCaseStr: string) {
  const isCamelCaseString = isCamelCase(camelCaseStr);

  if (!isCamelCaseString) return camelCaseStr;

  return camelCaseStr?.replace(/([A-Z])/g, ' $1') // Insert a space before uppercase letters
    ?.replace(/^./, (str) => str.toUpperCase()); // Capitalize the first letter
}
