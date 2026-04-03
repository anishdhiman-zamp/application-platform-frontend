import { formatExpectedDuration } from 'utils/time.utils';

describe('formatExpectedDuration', () => {
  it('returns "less than a minute" for 0 seconds', () => {
    expect(formatExpectedDuration(0)).toBe('less than a minute');
  });

  it('returns "less than a minute" for 60 seconds', () => {
    expect(formatExpectedDuration(60)).toBe('less than a minute');
  });

  it('returns "less than 2 minutes" for 61 seconds', () => {
    expect(formatExpectedDuration(61)).toBe('less than 2 minutes');
  });

  it('returns "less than 2 minutes" for 120 seconds (exact multiple)', () => {
    expect(formatExpectedDuration(120)).toBe('less than 2 minutes');
  });

  it('returns "less than 3 minutes" for 121 seconds', () => {
    expect(formatExpectedDuration(121)).toBe('less than 3 minutes');
  });

  it('returns "less than 3 minutes" for 180 seconds (exact multiple)', () => {
    expect(formatExpectedDuration(180)).toBe('less than 3 minutes');
  });

  it('returns "less than 2 minutes" for fractional seconds just above 60', () => {
    expect(formatExpectedDuration(60.5)).toBe('less than 2 minutes');
  });
});
