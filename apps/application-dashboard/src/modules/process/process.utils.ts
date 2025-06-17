import { format } from 'date-fns';
import { ARTIFACT_ICON_MAPPING } from 'modules/process/process.constant';
import { ARTIFACT_TYPE } from 'modules/process/process.types';
import { DATE_FORMATS } from '@/constants/date.constants';
import { VERCEL_BLOB_ICON_URL } from '@/constants/icons';

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

/**
 * Retrieves the icon source URL for a given artifact type and icon identifier.
 * @param {ARTIFACT_TYPE} artifactType - The type of the artifact.
 * @param {string} iconIdentifier - The identifier for the icon.
 * @returns {string | undefined} The URL of the icon or undefined if not found.
 */
export const getArtifactPrefixIconSrc = (artifactType: ARTIFACT_TYPE, iconIdentifier?: string) => {
  if (artifactType === ARTIFACT_TYPE.EXTERNAL_LINK && iconIdentifier) {
    return `${VERCEL_BLOB_ICON_URL}/${iconIdentifier}`;
  }

  return (
    (artifactType && ARTIFACT_ICON_MAPPING[artifactType as keyof typeof ARTIFACT_ICON_MAPPING]?.icon_url) ||
    ARTIFACT_ICON_MAPPING[ARTIFACT_TYPE.PDF_DATASET]?.icon_url
  );
};

/**
 * Formats time in seconds to minutes:seconds format
 * @param {number} time - Input time in seconds
 * @returns {string} Formatted time (e.g. "1:30")
 */
export const formatTime = (time: number) => {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};
