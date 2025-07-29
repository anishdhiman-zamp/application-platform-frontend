import { MutableRefObject } from 'react';
import { DATE_FORMATS } from '@zamp-platform/utils';
import { format } from 'date-fns';
import { ARTIFACT_ICON_MAPPING } from 'modules/process/process.constant';
import { ARTIFACT_TYPE, CTA_ACTION } from 'modules/process/process.types';
import { LINK, VERCEL_BLOB_ICON_URL } from '@/constants/icons';
import type { EmailArtifactsResponseType } from '@/types/api/processApi.types';

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
export const getArtifactPrefixIconSrc = (
  artifactType: ARTIFACT_TYPE,
  iconIdentifier?: string,
  ctaAction?: CTA_ACTION,
) => {
  if (artifactType === ARTIFACT_TYPE.EXTERNAL_LINK) {
    return iconIdentifier ? `${VERCEL_BLOB_ICON_URL}/${iconIdentifier}` : LINK;
  }

  if (artifactType === ARTIFACT_TYPE.PDF_DATASET) {
    const type = ctaAction === CTA_ACTION.VIEW_DATASET_PDF_PDF_FIRST ? ARTIFACT_TYPE.PDF : ARTIFACT_TYPE.DATASET;

    return ARTIFACT_ICON_MAPPING[type]?.icon_url;
  }

  return ARTIFACT_ICON_MAPPING[artifactType as keyof typeof ARTIFACT_ICON_MAPPING]?.icon_url;
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

/**
 * Transforms email artifact data into a standardized format for display
 * @param {EmailArtifactsResponseType} emailArtifact - The email artifact data
 * @returns {Object} Formatted email data with header, content, and attachments
 */
export const getInitialEmailData = (emailArtifact: EmailArtifactsResponseType) => ({
  header: {
    heading: emailArtifact.heading,
    to_mail_ids: emailArtifact.to_mail_ids ?? [],
    cc_mail_ids: emailArtifact.cc_mail_ids ?? [],
    bcc_mail_ids: emailArtifact.bcc_mail_ids ?? [],
  },
  content: emailArtifact.body_html || `<p>${emailArtifact.body_plain_text}</p>`,
  attachments: emailArtifact.attachments ?? [],
});

/**
 * Handles the stroke shimmer sequence for a log.
 * @param {Object} params - The parameters for the stroke shimmer sequence.
 * @param {MutableRefObject<((show: boolean) => void) | null>} params.showBlueStrokeRef - The ref to the show blue stroke function.
 * @param {MutableRefObject<(() => void) | null>} params.shimmerControlRef - The ref to the shimmer control function.
 * @param {MutableRefObject<boolean>} params.cancelledRef - The ref to the cancelled flag.
 */
export const handleStrokeShimmerSequence = ({
  showBlueStrokeRef,
  shimmerControlRef,
  cancelledRef,
}: {
  showBlueStrokeRef: MutableRefObject<((show: boolean) => void) | null>;
  shimmerControlRef: MutableRefObject<(() => void) | null>;
  cancelledRef: MutableRefObject<boolean>;
}) => {
  if (cancelledRef.current) return;

  // 1. Show blue stroke
  showBlueStrokeRef.current?.(true);

  // 2. After 300ms, hide stroke and start shimmer
  setTimeout(() => {
    if (cancelledRef.current) return;

    showBlueStrokeRef.current?.(false);
    shimmerControlRef.current?.();

    // 3. After shimmer, loop again
    setTimeout(() => {
      if (!cancelledRef.current) {
        handleStrokeShimmerSequence({ showBlueStrokeRef, shimmerControlRef, cancelledRef });
      }
    }, 2000); // shimmer duration
  }, 300); // stroke visible duration
};
