import posthogJs from 'posthog-js';
import { identifyPostHogUser } from 'utils/postHog';

// Mock posthog-js
jest.mock('posthog-js', () => ({
  identify: jest.fn(),
  people: {
    set: jest.fn(),
  },
  group: jest.fn(),
}));

describe('identifyPostHogUser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call posthog.identify() with correct id and merchant properties (no PII)', () => {
    const userId = 'user-123';
    const merchantName = 'example.com';

    identifyPostHogUser(userId, merchantName);

    expect(posthogJs.identify).toHaveBeenCalledWith(userId, {
      id: userId,
      merchant: merchantName,
    });
  });

  it('should call posthog.people.set() with correct properties (no email PII)', () => {
    const userId = 'user-123';
    const merchantName = 'example.com';

    identifyPostHogUser(userId, merchantName);

    expect(posthogJs.people.set).toHaveBeenCalledWith({
      id: userId,
      merchant: merchantName,
    });
  });

  it('should call posthog.group("company", orgId, { name: orgName }) when org data is provided', () => {
    const userId = 'user-123';
    const merchantName = 'example.com';
    const organizationId = 'org-456';
    const organizationName = 'Test Organization';

    identifyPostHogUser(userId, merchantName, organizationId, organizationName);

    expect(posthogJs.group).toHaveBeenCalledWith('company', organizationId, {
      name: organizationName,
    });
  });

  it('should NOT call posthog.group() when org data is missing', () => {
    const userId = 'user-123';
    const merchantName = 'example.com';

    identifyPostHogUser(userId, merchantName);

    expect(posthogJs.group).not.toHaveBeenCalled();
  });

  it('should NOT call posthog.group() when organizationId is missing', () => {
    const userId = 'user-123';
    const merchantName = 'example.com';
    const organizationName = 'Test Organization';

    identifyPostHogUser(userId, merchantName, undefined, organizationName);

    expect(posthogJs.group).not.toHaveBeenCalled();
  });

  it('should NOT call posthog.group() when organizationName is missing', () => {
    const userId = 'user-123';
    const merchantName = 'example.com';
    const organizationId = 'org-456';

    identifyPostHogUser(userId, merchantName, organizationId, undefined);

    expect(posthogJs.group).not.toHaveBeenCalled();
  });

  it('should call all PostHog methods in correct order: identify, people.set, group', () => {
    const userId = 'user-123';
    const merchantName = 'example.com';
    const organizationId = 'org-456';
    const organizationName = 'Test Organization';

    identifyPostHogUser(userId, merchantName, organizationId, organizationName);

    const identifyCallOrder = (posthogJs.identify as jest.Mock).mock.invocationCallOrder[0];
    const peopleSetCallOrder = (posthogJs.people.set as jest.Mock).mock.invocationCallOrder[0];
    const groupCallOrder = (posthogJs.group as jest.Mock).mock.invocationCallOrder[0];

    expect(identifyCallOrder).toBeLessThan(peopleSetCallOrder);
    expect(peopleSetCallOrder).toBeLessThan(groupCallOrder);
  });
});
