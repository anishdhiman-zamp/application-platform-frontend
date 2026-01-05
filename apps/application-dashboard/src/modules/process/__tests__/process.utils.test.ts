import { LocationType } from '@zamp-platform/chat';
import { CHATBOT_LOCATION_PARAMS } from 'modules/chatbot/constants';
import { ARTIFACT_ICON_MAPPING, N_A_VALUE } from 'modules/process/process.constant';
import { ARTIFACT_TYPE, CTA_ACTION, EMAIL_STATUS } from 'modules/process/process.types';
import {
  base64Encode,
  buildHITLPayload,
  formatRowValue,
  formatTime,
  getArtifactPrefixIconSrc,
  getChatbotDatasetFieldParams,
  getChatbotDatasetTabId,
  getCtaLoadingId,
  getEmailDate,
  getInitialEmailData,
  handleStrokeShimmerSequence,
  parseIntSafely,
  serializeFormData,
  shouldPerformChatbotDatasetNavigation,
} from 'modules/process/process.utils';
import type { ReadonlyURLSearchParams } from 'next/navigation';
import type { CtasType, EmailArtifactsResponseType } from '@/types/api/processApi.types';

// Mock dependencies
jest.mock('modules/data/data.utils', () => ({
  formatArrayValue: jest.fn((value: unknown[]) => {
    if (value.length === 0) return N_A_VALUE;

    return value.join(', ');
  }),
}));

describe('process.utils', () => {
  describe('getEmailDate', () => {
    it('should format a valid date string correctly', () => {
      const date = '2025-02-04T12:30:00Z';
      const result = getEmailDate(date);

      expect(result).toMatch(/Feb 4, 2025/);
      expect(result).toMatch(/\d{1,2}:\d{2}(AM|PM)/); // Matches time format like "6:00PM" or "12:30PM"
    });

    it('should return the original string for invalid date', () => {
      const invalidDate = 'invalid-date-string';
      const result = getEmailDate(invalidDate);

      expect(result).toBe(invalidDate);
    });

    it('should handle ISO date strings', () => {
      const date = '2025-12-25T15:45:30.000Z';
      const result = getEmailDate(date);

      expect(result).toMatch(/Dec 25, 2025/);
      expect(result).toMatch(/\d{1,2}:\d{2}(AM|PM)/);
    });

    it('should format date in correct format', () => {
      const date = '2025-02-04T12:30:00Z';
      const result = getEmailDate(date);

      // Should match format: "MMM d, yyyy, h:mma" (e.g., "Feb 4, 2025, 6:00PM")
      expect(result).toMatch(/^[A-Z][a-z]{2} \d{1,2}, \d{4}, \d{1,2}:\d{2}(AM|PM)$/);
    });
  });

  describe('getArtifactPrefixIconSrc', () => {
    it('should return PDF icon for PDF_DATASET when action is VIEW_DATASET_PDF_PDF_FIRST', () => {
      const result = getArtifactPrefixIconSrc(ARTIFACT_TYPE.PDF_DATASET, CTA_ACTION.VIEW_DATASET_PDF_PDF_FIRST);

      expect(result).toBe(ARTIFACT_ICON_MAPPING[ARTIFACT_TYPE.PDF]?.icon);
    });

    it('should return DATASET icon for PDF_DATASET when action is not VIEW_DATASET_PDF_PDF_FIRST', () => {
      const result = getArtifactPrefixIconSrc(ARTIFACT_TYPE.PDF_DATASET, CTA_ACTION.VIEW_DATASET_PDF_DATASET_FIRST);

      expect(result).toBe(ARTIFACT_ICON_MAPPING[ARTIFACT_TYPE.DATASET]?.icon);
    });

    it('should return undefined for EMAIL artifact type (not in mapping)', () => {
      const result = getArtifactPrefixIconSrc(ARTIFACT_TYPE.EMAIL);

      expect(result).toBeUndefined();
    });

    it('should return correct icon for PDF artifact type', () => {
      const result = getArtifactPrefixIconSrc(ARTIFACT_TYPE.PDF);

      expect(result).toBe(ARTIFACT_ICON_MAPPING[ARTIFACT_TYPE.PDF]?.icon);
    });

    it('should return undefined for unknown artifact type', () => {
      const result = getArtifactPrefixIconSrc('UNKNOWN_TYPE' as ARTIFACT_TYPE);

      expect(result).toBeUndefined();
    });
  });

  describe('formatTime', () => {
    it('should format time in seconds to minutes:seconds format', () => {
      expect(formatTime(90)).toBe('1:30');
      expect(formatTime(125)).toBe('2:05');
      expect(formatTime(60)).toBe('1:00');
      expect(formatTime(45)).toBe('0:45');
    });

    it('should handle zero seconds', () => {
      expect(formatTime(0)).toBe('0:00');
    });

    it('should handle large time values', () => {
      expect(formatTime(3661)).toBe('61:01');
    });

    it('should pad seconds with zero when less than 10', () => {
      expect(formatTime(65)).toBe('1:05');
      expect(formatTime(122)).toBe('2:02');
    });
  });

  describe('getInitialEmailData', () => {
    it('should transform email artifact data correctly', () => {
      const emailArtifact: EmailArtifactsResponseType = {
        heading: 'Test Email',
        to_mail_ids: ['test@example.com'],
        cc_mail_ids: ['cc@example.com'],
        bcc_mail_ids: ['bcc@example.com'],
        body_html: '<p>HTML content</p>',
        body_plain_text: 'Plain text content',
        attachments: [],
        display_name: 'Test Email',
        status: EMAIL_STATUS.RECEIVED,
        icon_identifier: 'email',
        date: '2025-02-04T12:30:00Z',
        from_mail_id: 'sender@example.com',
        from_name: 'Sender Name',
        is_email_body_encoded: false,
        last_updated_by: {
          id: 'user-123',
          name: 'Test User',
        },
      };

      const result = getInitialEmailData(emailArtifact);

      expect(result).toEqual({
        header: {
          heading: 'Test Email',
          to_mail_ids: ['test@example.com'],
          cc_mail_ids: ['cc@example.com'],
          bcc_mail_ids: ['bcc@example.com'],
        },
        content: '<p>HTML content</p>',
        attachments: [],
      });
    });

    it('should use body_plain_text when body_html is not available', () => {
      const emailArtifact: EmailArtifactsResponseType = {
        heading: 'Test Email',
        to_mail_ids: [],
        cc_mail_ids: [],
        bcc_mail_ids: [],
        body_html: '',
        body_plain_text: 'Plain text only',
        attachments: [],
        display_name: 'Test Email',
        status: EMAIL_STATUS.DRAFT,
        icon_identifier: 'email',
        date: '2025-02-04T12:30:00Z',
        from_mail_id: 'sender@example.com',
        from_name: 'Sender Name',
        is_email_body_encoded: false,
        last_updated_by: {
          id: 'user-123',
        },
      };

      const result = getInitialEmailData(emailArtifact);

      expect(result.content).toBe('<p>Plain text only</p>');
    });

    it('should handle null/undefined arrays', () => {
      const emailArtifact: EmailArtifactsResponseType = {
        heading: 'Test Email',
        to_mail_ids: null as unknown as string[],
        cc_mail_ids: undefined as unknown as string[],
        bcc_mail_ids: null as unknown as string[],
        body_html: '',
        body_plain_text: 'Content',
        attachments: null as unknown as [],
        display_name: 'Test Email',
        status: EMAIL_STATUS.RECEIVED,
        icon_identifier: 'email',
        date: '2025-02-04T12:30:00Z',
        from_mail_id: 'sender@example.com',
        from_name: 'Sender Name',
        is_email_body_encoded: false,
        last_updated_by: {
          id: 'user-123',
        },
      };

      const result = getInitialEmailData(emailArtifact);

      expect(result.header.to_mail_ids).toEqual([]);
      expect(result.header.cc_mail_ids).toEqual([]);
      expect(result.header.bcc_mail_ids).toEqual([]);
      expect(result.attachments).toEqual([]);
    });
  });

  describe('handleStrokeShimmerSequence', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.runOnlyPendingTimers();
      jest.useRealTimers();
    });

    it('should call showBlueStrokeRef with true initially', () => {
      const showBlueStrokeRef = { current: jest.fn() };
      const shimmerControlRef = { current: jest.fn() };
      const cancelledRef = { current: false };

      handleStrokeShimmerSequence({ showBlueStrokeRef, shimmerControlRef, cancelledRef });

      expect(showBlueStrokeRef.current).toHaveBeenCalledWith(true);
    });

    it('should hide stroke and start shimmer after 300ms', () => {
      const showBlueStrokeRef = { current: jest.fn() };
      const shimmerControlRef = { current: jest.fn() };
      const cancelledRef = { current: false };

      handleStrokeShimmerSequence({ showBlueStrokeRef, shimmerControlRef, cancelledRef });

      jest.advanceTimersByTime(300);

      expect(showBlueStrokeRef.current).toHaveBeenCalledWith(false);
      expect(shimmerControlRef.current).toHaveBeenCalled();
    });

    it('should not execute if cancelled before timeout', () => {
      const showBlueStrokeRef = { current: jest.fn() };
      const shimmerControlRef = { current: jest.fn() };
      const cancelledRef = { current: false };

      handleStrokeShimmerSequence({ showBlueStrokeRef, shimmerControlRef, cancelledRef });

      cancelledRef.current = true;
      jest.advanceTimersByTime(300);

      expect(shimmerControlRef.current).not.toHaveBeenCalled();
    });

    it('should loop again after shimmer duration', () => {
      const showBlueStrokeRef = { current: jest.fn() };
      const shimmerControlRef = { current: jest.fn() };
      const cancelledRef = { current: false };

      handleStrokeShimmerSequence({ showBlueStrokeRef, shimmerControlRef, cancelledRef });

      jest.advanceTimersByTime(300);
      jest.advanceTimersByTime(2000);

      expect(showBlueStrokeRef.current).toHaveBeenCalledTimes(3); // initial + hide + new cycle
    });
  });

  describe('formatRowValue', () => {
    it('should return N/A for null values', () => {
      expect(formatRowValue(null)).toBe(N_A_VALUE);
    });

    it('should return N/A for undefined values', () => {
      expect(formatRowValue(undefined)).toBe(N_A_VALUE);
    });

    it('should return N/A for empty string', () => {
      expect(formatRowValue('')).toBe(N_A_VALUE);
    });

    it('should format arrays using formatArrayValue', () => {
      const result = formatRowValue([1, 2, 3]);

      expect(result).toBe('1, 2, 3');
    });

    it('should return N/A for empty arrays', () => {
      expect(formatRowValue([])).toBe(N_A_VALUE);
    });

    it('should stringify objects', () => {
      const obj = { key: 'value', number: 123 };
      const result = formatRowValue(obj);

      expect(result).toBe(JSON.stringify(obj));
    });

    it('should convert numbers to string', () => {
      expect(formatRowValue(123)).toBe('123');
      expect(formatRowValue(0)).toBe('0');
      expect(formatRowValue(-42)).toBe('-42');
    });

    it('should convert booleans to string', () => {
      expect(formatRowValue(true)).toBe('true');
      expect(formatRowValue(false)).toBe('false');
    });

    it('should return string values as-is', () => {
      expect(formatRowValue('test string')).toBe('test string');
    });
  });

  describe('parseIntSafely', () => {
    it('should parse valid integer strings', () => {
      expect(parseIntSafely('123', 0)).toBe(123);
      expect(parseIntSafely('0', 0)).toBe(0);
      expect(parseIntSafely('-42', 0)).toBe(-42);
    });

    it('should return fallback for null', () => {
      expect(parseIntSafely(null, 999)).toBe(999);
    });

    it('should return fallback for undefined', () => {
      expect(parseIntSafely(undefined, 999)).toBe(999);
    });

    it('should return fallback for empty string', () => {
      expect(parseIntSafely('', 999)).toBe(999);
    });

    it('should return fallback for invalid number strings', () => {
      expect(parseIntSafely('abc', 999)).toBe(999);
      expect(parseIntSafely('12.34', 999)).toBe(12); // parseInt truncates decimals
    });

    it('should handle decimal strings by truncating', () => {
      expect(parseIntSafely('12.99', 0)).toBe(12);
    });
  });

  describe('base64Encode', () => {
    it('should encode a simple string to base64', () => {
      const result = base64Encode('hello');

      expect(result).toBe('aGVsbG8=');
    });

    it('should encode an empty string', () => {
      const result = base64Encode('');

      expect(result).toBe('');
    });

    it('should encode strings with special characters', () => {
      const result = base64Encode('hello world!');

      expect(result).toBe('aGVsbG8gd29ybGQh');
    });

    it('should encode unicode characters', () => {
      const result = base64Encode('🚀 test');

      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });
  });

  describe('getChatbotDatasetFieldParams', () => {
    const createMockSearchParams = (params: Record<string, string>): ReadonlyURLSearchParams => {
      const searchParams = new URLSearchParams();

      Object.entries(params).forEach(([key, value]) => {
        searchParams.set(key, value);
      });

      return searchParams as unknown as ReadonlyURLSearchParams;
    };

    it('should return null for null searchParams', () => {
      expect(getChatbotDatasetFieldParams(null)).toBeNull();
    });

    it('should return null when chatbot type is not DATASET_FIELD', () => {
      const searchParams = createMockSearchParams({
        [CHATBOT_LOCATION_PARAMS.CHATBOT_ANNOTATION_LOCATION_TYPE]: 'OTHER_TYPE',
        [CHATBOT_LOCATION_PARAMS.CHATBOT_DATASET_ID]: 'dataset-123',
        [CHATBOT_LOCATION_PARAMS.CHATBOT_DATASET_ROW_ID]: 'row-123',
        [CHATBOT_LOCATION_PARAMS.CHATBOT_DATASET_FIELD_ID]: 'field-123',
      });

      expect(getChatbotDatasetFieldParams(searchParams)).toBeNull();
    });

    it('should return null when required params are missing', () => {
      const searchParams = createMockSearchParams({
        [CHATBOT_LOCATION_PARAMS.CHATBOT_ANNOTATION_LOCATION_TYPE]: LocationType.DATASET_FIELD,
        [CHATBOT_LOCATION_PARAMS.CHATBOT_DATASET_ID]: 'dataset-123',
      });

      expect(getChatbotDatasetFieldParams(searchParams)).toBeNull();
    });

    it('should return correct params when all required fields are present', () => {
      const searchParams = createMockSearchParams({
        [CHATBOT_LOCATION_PARAMS.CHATBOT_ANNOTATION_LOCATION_TYPE]: LocationType.DATASET_FIELD,
        [CHATBOT_LOCATION_PARAMS.CHATBOT_DATASET_ID]: 'dataset-123',
        [CHATBOT_LOCATION_PARAMS.CHATBOT_DATASET_ROW_ID]: 'row-456',
        [CHATBOT_LOCATION_PARAMS.CHATBOT_DATASET_FIELD_ID]: 'field-789',
      });

      const result = getChatbotDatasetFieldParams(searchParams);

      expect(result).toEqual({
        datasetId: 'dataset-123',
        rowId: 'row-456',
        fieldId: 'field-789',
      });
    });
  });

  describe('getChatbotDatasetTabId', () => {
    const createMockSearchParams = (params: Record<string, string>): ReadonlyURLSearchParams => {
      const searchParams = new URLSearchParams();

      Object.entries(params).forEach(([key, value]) => {
        searchParams.set(key, value);
      });

      return searchParams as unknown as ReadonlyURLSearchParams;
    };

    it('should return null for null searchParams', () => {
      expect(getChatbotDatasetTabId(null)).toBeNull();
    });

    it('should return null when chatbot type is not DATASET_FIELD', () => {
      const searchParams = createMockSearchParams({
        [CHATBOT_LOCATION_PARAMS.CHATBOT_ANNOTATION_LOCATION_TYPE]: 'OTHER_TYPE',
        [CHATBOT_LOCATION_PARAMS.CHATBOT_DATASET_ID]: 'dataset-123',
      });

      expect(getChatbotDatasetTabId(searchParams)).toBeNull();
    });

    it('should return dataset ID when type is DATASET_FIELD', () => {
      const searchParams = createMockSearchParams({
        [CHATBOT_LOCATION_PARAMS.CHATBOT_ANNOTATION_LOCATION_TYPE]: LocationType.DATASET_FIELD,
        [CHATBOT_LOCATION_PARAMS.CHATBOT_DATASET_ID]: 'dataset-123',
      });

      expect(getChatbotDatasetTabId(searchParams)).toBe('dataset-123');
    });

    it('should return null when dataset ID is missing', () => {
      const searchParams = createMockSearchParams({
        [CHATBOT_LOCATION_PARAMS.CHATBOT_ANNOTATION_LOCATION_TYPE]: LocationType.DATASET_FIELD,
      });

      expect(getChatbotDatasetTabId(searchParams)).toBeNull();
    });
  });

  describe('shouldPerformChatbotDatasetNavigation', () => {
    const createMockSearchParams = (params: Record<string, string>): ReadonlyURLSearchParams => {
      const searchParams = new URLSearchParams();

      Object.entries(params).forEach(([key, value]) => {
        searchParams.set(key, value);
      });

      return searchParams as unknown as ReadonlyURLSearchParams;
    };

    it('should return true when params match current dataset ID', () => {
      const searchParams = createMockSearchParams({
        [CHATBOT_LOCATION_PARAMS.CHATBOT_ANNOTATION_LOCATION_TYPE]: LocationType.DATASET_FIELD,
        [CHATBOT_LOCATION_PARAMS.CHATBOT_DATASET_ID]: 'dataset-123',
        [CHATBOT_LOCATION_PARAMS.CHATBOT_DATASET_ROW_ID]: 'row-456',
        [CHATBOT_LOCATION_PARAMS.CHATBOT_DATASET_FIELD_ID]: 'field-789',
      });

      expect(shouldPerformChatbotDatasetNavigation(searchParams, 'dataset-123')).toBe(true);
    });

    it('should return false when dataset ID does not match', () => {
      const searchParams = createMockSearchParams({
        [CHATBOT_LOCATION_PARAMS.CHATBOT_ANNOTATION_LOCATION_TYPE]: LocationType.DATASET_FIELD,
        [CHATBOT_LOCATION_PARAMS.CHATBOT_DATASET_ID]: 'dataset-123',
        [CHATBOT_LOCATION_PARAMS.CHATBOT_DATASET_ROW_ID]: 'row-456',
        [CHATBOT_LOCATION_PARAMS.CHATBOT_DATASET_FIELD_ID]: 'field-789',
      });

      expect(shouldPerformChatbotDatasetNavigation(searchParams, 'dataset-456')).toBe(false);
    });

    it('should return false when params are null', () => {
      expect(shouldPerformChatbotDatasetNavigation(null, 'dataset-123')).toBe(false);
    });

    it('should return false when params are invalid', () => {
      const searchParams = createMockSearchParams({
        [CHATBOT_LOCATION_PARAMS.CHATBOT_ANNOTATION_LOCATION_TYPE]: 'OTHER_TYPE',
      });

      expect(shouldPerformChatbotDatasetNavigation(searchParams, 'dataset-123')).toBe(false);
    });
  });

  describe('getCtaLoadingId', () => {
    it('should generate unique loading ID from CTA', () => {
      const cta: CtasType = {
        id: 'cta-123',
        display_name: 'Submit Form',
      } as CtasType;

      expect(getCtaLoadingId(cta)).toBe('cta-123-Submit Form');
    });

    it('should handle CTA with undefined display_name', () => {
      const cta: CtasType = {
        id: 'cta-123',
        display_name: undefined as unknown as string,
      } as CtasType;

      expect(getCtaLoadingId(cta)).toBe('cta-123-undefined');
    });
  });

  describe('serializeFormData', () => {
    it('should serialize string values as JSON stringified objects', () => {
      const formData = {
        name: 'John Doe',
        email: 'john@example.com',
      };

      const result = serializeFormData(formData);

      expect(result).toHaveLength(2);
      expect(result[0]).toBe(JSON.stringify({ value: 'John Doe', input: '' }));
      expect(result[1]).toBe(JSON.stringify({ value: 'john@example.com', input: '' }));
    });

    it('should stringify object values', () => {
      const formData = {
        user: { name: 'John', age: 30 },
        metadata: { key: 'value' },
      };

      const result = serializeFormData(formData);

      expect(result).toHaveLength(2);
      expect(result[0]).toBe(JSON.stringify({ name: 'John', age: 30 }));
      expect(result[1]).toBe(JSON.stringify({ key: 'value' }));
    });

    it('should stringify array values', () => {
      const formData = {
        items: [1, 2, 3],
        tags: ['tag1', 'tag2'],
      };

      const result = serializeFormData(formData);

      expect(result).toHaveLength(2);
      expect(result[0]).toBe(JSON.stringify([1, 2, 3]));
      expect(result[1]).toBe(JSON.stringify(['tag1', 'tag2']));
    });

    it('should convert primitive values to strings', () => {
      const formData = {
        count: 42,
        active: true,
        price: 99.99,
      };

      const result = serializeFormData(formData);

      expect(result).toHaveLength(3);
      expect(result[0]).toBe('42');
      expect(result[1]).toBe('true');
      expect(result[2]).toBe('99.99');
    });

    it('should skip null and undefined values', () => {
      const formData = {
        name: 'John',
        nullValue: null,
        undefinedValue: undefined,
        age: 30,
      };

      const result = serializeFormData(formData);

      expect(result).toHaveLength(2);
      expect(result[0]).toBe(JSON.stringify({ value: 'John', input: '' }));
      expect(result[1]).toBe('30');
    });

    it('should handle empty form data', () => {
      const result = serializeFormData({});

      expect(result).toEqual([]);
    });

    it('should handle mixed types', () => {
      const formData = {
        string: 'test',
        number: 123,
        boolean: false,
        object: { key: 'value' },
        array: [1, 2, 3],
        nullValue: null,
      };

      const result = serializeFormData(formData);

      expect(result).toHaveLength(5);
      expect(result[0]).toBe(JSON.stringify({ value: 'test', input: '' }));
      expect(result[1]).toBe('123');
      expect(result[2]).toBe('false');
      expect(result[3]).toBe(JSON.stringify({ key: 'value' }));
      expect(result[4]).toBe(JSON.stringify([1, 2, 3]));
    });
  });

  describe('buildHITLPayload', () => {
    const mockCta: CtasType = {
      hitl_request_id: 'hitl-123',
      cta_action_id: 'action-456',
      cta_component_type: 'BUTTON',
      cta_value: 'default-value',
    } as CtasType;

    it('should build payload with required fields', () => {
      const result = buildHITLPayload(mockCta, 'log-group-123', 'user-789');

      expect(result).toEqual({
        hitl_request_id: 'hitl-123',
        log_group_id: 'log-group-123',
        submitted_by: 'user-789',
        responses: [
          {
            action_id: 'action-456',
            values: ['default-value'],
            cta_component_type: 'BUTTON',
          },
        ],
      });
    });

    it('should include custom values in payload', () => {
      const customValues = ['custom1', 'custom2'];
      const result = buildHITLPayload(mockCta, 'log-group-123', 'user-789', customValues);

      expect(result.responses[0].values).toEqual(['custom1', 'custom2', 'default-value']);
    });

    it('should handle empty custom values', () => {
      const result = buildHITLPayload(mockCta, 'log-group-123', 'user-789', []);

      expect(result.responses[0].values).toEqual(['default-value']);
    });

    it('should handle undefined custom values', () => {
      const result = buildHITLPayload(mockCta, 'log-group-123', 'user-789', undefined);

      expect(result.responses[0].values).toEqual(['default-value']);
    });

    it('should handle CTA without cta_value', () => {
      const ctaWithoutValue = { ...mockCta, cta_value: undefined } as unknown as CtasType;
      const result = buildHITLPayload(ctaWithoutValue, 'log-group-123', 'user-789');

      expect(result.responses[0].values).toEqual([]);
    });

    it('should combine custom values and cta_value correctly', () => {
      const customValues = ['value1', 'value2'];
      const result = buildHITLPayload(mockCta, 'log-group-123', 'user-789', customValues);

      expect(result.responses[0].values).toEqual(['value1', 'value2', 'default-value']);
    });
  });
});
