import { MouseEventHandler } from 'react';
import clsx, { ClassValue } from 'clsx';
import { DATE_FILTER_CATEGORIES, DATE_FILTER_OPTIONS } from 'constants/date.constants';
import { format, startOfYear } from 'date-fns';
import { twMerge } from 'tailwind-merge';
import { DateFilterValueType } from 'components/filter/DateRangeFilter';

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

  return camelCaseStr
    ?.replace(/([A-Z])/g, ' $1') // Insert a space before uppercase letters
    ?.replace(/^./, (str) => str.toUpperCase()); // Capitalize the first letter
}

/**
 * Format the number to a comma separated number
 * @param num 1000000
 * @returns 1,000,000
 */
export const getCommaSeparatedNumber = (num?: number, precision = 0) =>
  num ? num.toLocaleString('en-US', { maximumFractionDigits: precision, minimumFractionDigits: precision }) : 0;

export const capitalizeFirstLetter = (str: string) => {
  if (!str) return '';

  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const getColorValue = () => Math.floor(Math.random() * 64) + 80;

export const getRandomColor = () => `rgb(${getColorValue()}, ${getColorValue()}, ${getColorValue()}`;

export const getFirstLetters = (str: string) =>
  str
    ?.split(' ')
    .map((word, index) => {
      if (index > 1 || !word.length) return null;
      else return word[0].toUpperCase();
    })
    .join('');

export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Check if the email is valid
 * @param email string admin@zamp.ai
 * @returns boolean true
 */
export const isValidEmail = (email: string) => {
  return emailRegex.test(email);
};

/**
 * Get the domain from the email
 * @param email string admin@zamp.ai
 * @returns string zamp.ai
 */
export const getDomainFromEmail = (email: string) => {
  return email.split('@')[1];
};

/**
 * Get the username from the email
 * @param email string admin@zamp.ai
 * @returns string admin
 */
export const getUserNameFromEmail = (email: string) => {
  return email.split('@')[0];
};

/**
 * Convert the email username to name
 * @param emailUsername string admin.zamp
 * @returns string Admin Zamp
 */
export const convertEmailUsernameToName = (emailUsername: string) => {
  return emailUsername
    .split('.')
    .map((name) => capitalizeFirstLetter(name))
    .join(' ');
};

export function isValidDate(dateString: string) {
  // Try to parse the string into a Date object
  const date = new Date(dateString);

  // Check if the date is invalid or not
  return !isNaN(date.getTime());
}

/**
 * Shuffle the array position of elements
 * @param array
 * @returns
 */
export function shuffleArray(array: any[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); // Random index between 0 and i

    [array[i], array[j]] = [array[j], array[i]]; // Swap elements
  }

  return array;
}

/**
 * Format the number to a short format
 * @param number
 * @returns string number with suffix
 */
export function formatNumber(
  value = 0,
  precision: number = 1,
  allowSuffix: boolean = true,
  getSuffix: boolean = false,
): string {
  const suffixes = [
    { threshold: 1000000000, suffix: 'B', valueString: 'Billions' },
    { threshold: 1000000, suffix: 'M', valueString: 'Millions' },
    { threshold: 1000, suffix: 'K', valueString: 'Thousands' },
  ];

  if (getSuffix) {
    for (const { threshold, valueString } of suffixes) {
      if (value >= threshold) {
        return valueString;
      }
    }
  }

  for (const { threshold, suffix } of suffixes) {
    if (value >= threshold) {
      return (value / threshold).toFixed(value % 10 === 0 ? 0 : precision) + (allowSuffix ? suffix : '');
    }
  }

  return value.toString();
}

/**
 * Get all data values for the given keys
 * @param data
 * @param keys
 * @returns return the max value from the data for the given keys
 */
export const getMaxValue = (data: MapAny[], keys: string[]) => {
  const maxValue = Math.max(...data.flatMap((item) => keys.map((key) => item[key] || 0)));

  return maxValue;
};
