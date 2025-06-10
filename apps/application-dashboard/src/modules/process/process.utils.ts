import { format } from 'date-fns';
import { DATE_FORMATS } from '@/constants/date.constants';

/**
 * Formats date string to include day and time
 * @param {string} date - Input date string
 * @returns {string} Formatted date (e.g. "Feb 4, 2025, 12:30PM")
 */
export const getEmailDate = (date: string) => {
  // Parse the input date string
  const parsedDate = new Date(date);

  if (isNaN(parsedDate.getTime())) {
    return date;
  }

  return format(parsedDate, DATE_FORMATS.MMM_d_yyyy_h_mm_a);
};
