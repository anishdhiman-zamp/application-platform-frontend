import { MutableRefObject } from 'react';
import { LocationType } from '@zamp-platform/chat';
import { DATE_FORMATS } from '@zamp-platform/utils';
import { format } from 'date-fns';
import { CHATBOT_LOCATION_PARAMS } from 'modules/chatbot/constants';
import { formatArrayValue } from 'modules/data/data.utils';
import { ARTIFACT_ICON_MAPPING, N_A_VALUE } from 'modules/process/process.constant';
import { ARTIFACT_TYPE, CTA_ACTION } from 'modules/process/process.types';
import type { ReadonlyURLSearchParams } from 'next/navigation';
import type { CtasType, EmailArtifactsResponseType } from '@/types/api/processApi.types';

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
 * @returns {React.ReactNode | undefined} The icon or undefined if not found.
 */
export const getArtifactPrefixIconSrc = (artifactType: ARTIFACT_TYPE, ctaAction?: CTA_ACTION) => {
  if (artifactType === ARTIFACT_TYPE.PDF_DATASET) {
    const type = ctaAction === CTA_ACTION.VIEW_DATASET_PDF_PDF_FIRST ? ARTIFACT_TYPE.PDF : ARTIFACT_TYPE.DATASET;

    return ARTIFACT_ICON_MAPPING[type]?.icon;
  }

  return ARTIFACT_ICON_MAPPING[artifactType as keyof typeof ARTIFACT_ICON_MAPPING]?.icon;
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

/**
 * Formats a value for display in a row
 * @param {any} value - The value to format
 * @returns {string} The formatted value
 */
export const formatRowValue = (value: unknown): string => {
  if (value === null || value === undefined || value === '') {
    return N_A_VALUE;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return N_A_VALUE;
    }

    return formatArrayValue(value);
  }

  if (typeof value === 'object' && value !== null) {
    return JSON.stringify(value);
  }

  // For non-array values, convert to string
  return value.toString();
};

/**
 * Safely parses a string to an integer
 * @param {string | null | undefined} value - The value to parse
 * @param {number} fallback - The fallback value if parsing fails
 * @returns {number} The parsed integer or the fallback value
 */
export const parseIntSafely = (value: string | null | undefined, fallback: number): number => {
  if (!value) return fallback;
  const parsed = parseInt(value, 10);

  return isNaN(parsed) ? fallback : parsed;
};

/**
 * Encodes a string to base64
 * @param {string} str - The string to encode
 * @returns {string} The base64 encoded string
 */
export const base64Encode = (str: string) => {
  const bytes = new TextEncoder().encode(str);
  let binary = '';

  bytes.forEach((b) => (binary += String.fromCharCode(b)));

  return btoa(binary);
};

/**
 * Extracts chatbot dataset field navigation params from URL search params
 * @param {ReadonlyURLSearchParams | null} searchParams - The URL search params
 * @returns {Object | null} Object containing chatbot navigation data or null if not valid
 */
export const getChatbotDatasetFieldParams = (
  searchParams: ReadonlyURLSearchParams | null,
): {
  datasetId: string;
  rowId: string;
  fieldId: string;
} | null => {
  if (!searchParams) return null;

  const chatbotType = searchParams.get(CHATBOT_LOCATION_PARAMS.CHATBOT_ANNOTATION_LOCATION_TYPE);
  const chatbotDatasetId = searchParams.get(CHATBOT_LOCATION_PARAMS.CHATBOT_DATASET_ID);
  const chatbotRowId = searchParams.get(CHATBOT_LOCATION_PARAMS.CHATBOT_DATASET_ROW_ID);
  const chatbotFieldId = searchParams.get(CHATBOT_LOCATION_PARAMS.CHATBOT_DATASET_FIELD_ID);

  if (chatbotType === LocationType.DATASET_FIELD && chatbotDatasetId && chatbotRowId && chatbotFieldId) {
    return {
      datasetId: chatbotDatasetId,
      rowId: chatbotRowId,
      fieldId: chatbotFieldId,
    };
  }

  return null;
};

/**
 * Checks if chatbot params indicate navigation to a specific dataset tab
 * @param {ReadonlyURLSearchParams | null} searchParams - The URL search params
 * @returns {string | null} The dataset ID to navigate to, or null if not specified
 */
export const getChatbotDatasetTabId = (searchParams: ReadonlyURLSearchParams | null): string | null => {
  if (!searchParams) return null;

  const chatbotType = searchParams.get(CHATBOT_LOCATION_PARAMS.CHATBOT_ANNOTATION_LOCATION_TYPE);
  const datasetIdFromUrl = searchParams.get(CHATBOT_LOCATION_PARAMS.CHATBOT_DATASET_ID);

  if (chatbotType === LocationType.DATASET_FIELD && datasetIdFromUrl) {
    return datasetIdFromUrl;
  }

  return null;
};

/**
 * Checks if chatbot dataset field navigation should be performed
 * @param {ReadonlyURLSearchParams | null} searchParams - The URL search params
 * @param {string} currentDatasetId - The current dataset ID
 * @returns {boolean} True if navigation should be performed
 */
export const shouldPerformChatbotDatasetNavigation = (
  searchParams: ReadonlyURLSearchParams | null,
  currentDatasetId: string,
): boolean => {
  const params = getChatbotDatasetFieldParams(searchParams);

  return params !== null && params.datasetId === currentDatasetId;
};

/**
 * Generates a unique loading ID for a CTA
 * @param {CtasType} cta - The CTA object
 * @returns {string} A unique loading ID
 */
export const getCtaLoadingId = (cta: CtasType): string => `${cta?.id}-${cta?.display_name}`;

/**
 * Serializes form data to an array for HITL submission
 * @param {Record<string, unknown>} formData - The form data to serialize
 * @returns {Array<string>} Array of serialized values (strings)
 */
export const serializeFormData = (formData: Record<string, unknown>): Array<string> => {
  const result: Array<string> = [];
  const processedKeys = new Set<string>();

  Object.entries(formData).forEach(([key, value]) => {
    // Skip if already processed (e.g., _text fields merged with their parent)
    if (processedKeys.has(key)) return;

    const textFieldKey = `${key}_text`;
    const hasTextField = textFieldKey in formData;

    // Handle string values - check for corresponding _text field
    if (typeof value === 'string') {
      const inputValue = hasTextField ? String(formData[textFieldKey] ?? '') : '';

      if (hasTextField) {
        processedKeys.add(textFieldKey);
      }

      result.push(
        JSON.stringify({
          value,
          input: inputValue,
        }),
      );

      return;
    }

    // Handle object values by stringifying them
    if (typeof value === 'object' && value !== null) {
      result.push(JSON.stringify(value));

      return;
    }

    // Handle other primitive types (number, boolean, etc.)
    if (value !== null && value !== undefined) {
      result.push(String(value));
    }
  });

  return result;
};

/**
 * Builds the HITL action payload
 * @param {CtasType} cta - The CTA object
 * @param {string} logGroupId - The log group ID
 * @param {string} userId - The user ID
 * @param {Array<string>} customValues - Optional custom values to include (strings)
 * @returns {Object} The HITL payload object
 */
export const buildHITLPayload = (cta: CtasType, logGroupId: string, userId: string, customValues?: Array<string>) => ({
  hitl_request_id: cta.hitl_request_id,
  log_group_id: logGroupId,
  submitted_by: userId,
  responses: [
    {
      action_id: cta.cta_action_id,
      values: [...(customValues ?? []), ...(cta.cta_value ? [cta.cta_value] : [])],
      cta_component_type: cta.cta_component_type,
    },
  ],
});
