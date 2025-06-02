import { format, formatDistanceToNow, parse } from 'date-fns';
import { DATE_FORMATS } from '@/constants/date.constants';

/**
 * Formats date string to include day, time and relative time
 * @param {string} date - Input date string
 * @returns {string} Formatted date with relative time (e.g. "Mon Jan 1 2:30 PM (2 hours ago)")
 */
export const getEmailDate = (date: string) => {
  // Parse the input date string
  const parsedDate = parse(date, 'yyyy-MM-dd EEEE hh:mm:ss a', new Date());

  if (isNaN(parsedDate.getTime())) {
    return date;
  }

  return `${format(parsedDate, DATE_FORMATS.EEE_MMM_d_h_mm_a)} (${formatDistanceToNow(parsedDate)} ago)`;
};
