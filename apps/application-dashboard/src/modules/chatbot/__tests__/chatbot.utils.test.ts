import { getZampLogoEntryDirection } from '@/modules/chatbot/utils';

const RECT = { left: 0, top: 0, width: 100, height: 100 };

describe('getZampLogoEntryDirection', () => {
  it('returns fromTop when cursor enters near the top edge', () => {
    expect(getZampLogoEntryDirection(RECT, 50, 0)).toBe('fromTop');
  });

  it('returns fromBottom when cursor enters near the bottom edge', () => {
    expect(getZampLogoEntryDirection(RECT, 50, 100)).toBe('fromBottom');
  });

  it('returns fromLeft when cursor enters near the left edge', () => {
    expect(getZampLogoEntryDirection(RECT, 0, 50)).toBe('fromLeft');
  });

  it('returns fromRight when cursor enters near the right edge', () => {
    expect(getZampLogoEntryDirection(RECT, 100, 50)).toBe('fromRight');
  });

  it('picks the closer of two near-equal edges deterministically', () => {
    expect(getZampLogoEntryDirection(RECT, 49, 50)).toBe('fromLeft');
    expect(getZampLogoEntryDirection(RECT, 51, 50)).toBe('fromRight');
    expect(getZampLogoEntryDirection(RECT, 50, 49)).toBe('fromTop');
    expect(getZampLogoEntryDirection(RECT, 50, 51)).toBe('fromBottom');
  });

  it('handles offset rects (non-zero left/top)', () => {
    const offsetRect = { left: 200, top: 300, width: 100, height: 100 };

    expect(getZampLogoEntryDirection(offsetRect, 250, 300)).toBe('fromTop');
    expect(getZampLogoEntryDirection(offsetRect, 200, 350)).toBe('fromLeft');
  });

  it('falls back to fromTop on a zero-size rect', () => {
    expect(getZampLogoEntryDirection({ left: 0, top: 0, width: 0, height: 0 }, 0, 0)).toBe('fromTop');
  });
});
