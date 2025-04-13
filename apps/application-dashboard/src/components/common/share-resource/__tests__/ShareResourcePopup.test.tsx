import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { ShareResourcePopup } from '../index';
import { ResourceType } from '../share-resource.types';
import { datasetConfig, pageConfig } from '../resource-configs';
import { toast } from 'components/common/toast/Toast';
import { TOAST_MESSAGES } from 'components/common/toast/toast.constants';
import { ResourceAudienceType } from 'types/api/auth.types';

jest.mock('components/common/toast/Toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('hooks', () => ({
  useOnClickOutside: jest.fn(),
}));

jest.mock('apis/people', () => ({
  useGetAudiencesByOrganisationIdQuery: jest.fn(() => ({
    data: [
      {
        user: { email: 'user1@example.com', name: 'User 1' },
        resource_audience_type: 'user',
        resource_audience_id: 'user1-id',
      },
      {
        user: { email: 'user2@example.com', name: 'User 2' },
        resource_audience_type: 'user',
        resource_audience_id: 'user2-id',
      },
    ],
    isLoading: false,
  })),
  useGetTeamsByOrganizationIdQuery: jest.fn(() => ({
    data: [
      {
        team_id: 'team1-id',
        name: 'Team 1',
        metadata: { color_hex_code: '#FF0000' },
      },
      {
        team_id: 'team2-id',
        name: 'Team 2',
        metadata: { color_hex_code: '#00FF00' },
      },
    ],
  })),
}));

jest.mock('components/multiSelectInput/MultiSelectInput', () => ({
  __esModule: true,
  default: jest.fn(({ onSelectOption, selectedRole }) => (
    <div data-testid="multi-select-input">
      <button 
        data-testid="select-option-button" 
        onClick={() => onSelectOption({ 
          label: 'User 1', 
          value: 'user1@example.com', 
          type: 'user' 
        })}
      >
        Select User
      </button>
      <div data-testid="selected-role">{selectedRole}</div>
    </div>
  )),
}));

jest.mock('components/CopyToClipboardBrowserUrl', () => ({
  __esModule: true,
  default: () => <div data-testid="copy-url">Copy URL</div>,
}));

jest.mock('components/SvgSpriteLoader', () => ({
  __esModule: true,
  default: () => <div data-testid="svg-icon">Icon</div>,
}));

jest.mock('components/commonWrapper', () => ({
  __esModule: true,
  default: ({ children, isLoading }) => (
    <div data-testid="common-wrapper">
      {isLoading ? <div>Loading...</div> : children}
    </div>
  ),
}));

const MockAccessComponent = ({ resourceId, privilege, user }) => (
  <div data-testid="access-component">
    {resourceId} - {privilege} - {user.email}
  </div>
);

const mockStore = configureStore([]);
const initialState = {
  user: {
    user: {
      orgs: [{ organization_id: 'org1', name: 'Test Org' }],
    },
  },
};

describe('ShareResourcePopup', () => {
  let store;
  let mockApiHooks;
  let mockPostShare;

  beforeEach(() => {
    store = mockStore(initialState);
    mockPostShare = jest.fn().mockResolvedValue({ unwrap: () => Promise.resolve() });
    
    mockApiHooks = {
      useGetAudiencesQuery: jest.fn(() => ({
        data: [
          {
            user: { email: 'current@example.com' },
            resource_audience_type: 'user',
            resource_audience_id: 'current-user-id',
            privilege: 'admin',
            resource_type: 'dataset',
          },
        ],
        isLoading: false,
        refetch: jest.fn(),
      })),
      usePostShareMutation: jest.fn(() => [mockPostShare, { isLoading: false }]),
      accessPermissionFn: jest.fn(() => true),
    };

    jest.spyOn(require('utils/accessPermission/accessPermission.utils'), 'getUserEmail')
      .mockImplementation(() => 'current@example.com');
    jest.spyOn(require('utils/accessPermission/accessPermission.utils'), 'getUserPrivilege')
      .mockImplementation(() => 'admin');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the share button', () => {
    render(
      <Provider store={store}>
        <ShareResourcePopup
          resourceId="resource-123"
          resourceType={ResourceType.DATASET}
          apiHooks={mockApiHooks}
          resourceConfig={{
            ...datasetConfig,
            accessComponent: MockAccessComponent,
          }}
        />
      </Provider>
    );

    expect(screen.getByText('Share')).toBeInTheDocument();
  });

  it('opens the popup when share button is clicked', () => {
    render(
      <Provider store={store}>
        <ShareResourcePopup
          resourceId="resource-123"
          resourceType={ResourceType.DATASET}
          apiHooks={mockApiHooks}
          resourceConfig={{
            ...datasetConfig,
            accessComponent: MockAccessComponent,
          }}
        />
      </Provider>
    );

    fireEvent.click(screen.getByText('Share'));
    expect(screen.getByText(`Share this ${datasetConfig.displayName}`)).toBeInTheDocument();
  });

  it('selects a user and shares the resource', async () => {
    render(
      <Provider store={store}>
        <ShareResourcePopup
          resourceId="resource-123"
          resourceType={ResourceType.DATASET}
          apiHooks={mockApiHooks}
          resourceConfig={{
            ...datasetConfig,
            accessComponent: MockAccessComponent,
          }}
        />
      </Provider>
    );

    fireEvent.click(screen.getByText('Share'));
    
    fireEvent.click(screen.getByTestId('select-option-button'));
    
    fireEvent.click(screen.getByText('Share').closest('button'));
    
    await waitFor(() => {
      expect(mockPostShare).toHaveBeenCalledWith({
        datasetId: 'resource-123',
        body: {
          audiences: expect.arrayContaining([
            expect.objectContaining({
              audience_type: expect.any(String),
              audience_id: expect.any(String),
              role: expect.any(String),
            }),
          ]),
        },
      });
      expect(toast.success).toHaveBeenCalledWith(datasetConfig.toastMessages.success);
    });
  });

  it('handles API errors when sharing fails', async () => {
    mockPostShare.mockRejectedValue({ data: { error: 'API error' } });
    
    render(
      <Provider store={store}>
        <ShareResourcePopup
          resourceId="resource-123"
          resourceType={ResourceType.DATASET}
          apiHooks={mockApiHooks}
          resourceConfig={{
            ...datasetConfig,
            accessComponent: MockAccessComponent,
          }}
        />
      </Provider>
    );

    fireEvent.click(screen.getByText('Share'));
    
    fireEvent.click(screen.getByTestId('select-option-button'));
    
    fireEvent.click(screen.getByText('Share').closest('button'));
    
    await waitFor(() => {
      expect(mockPostShare).toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalledWith('API error');
    });
  });

  it('works with page resource type', () => {
    render(
      <Provider store={store}>
        <ShareResourcePopup
          resourceId="page-123"
          resourceType={ResourceType.PAGE}
          apiHooks={mockApiHooks}
          resourceConfig={{
            ...pageConfig,
            accessComponent: MockAccessComponent,
          }}
        />
      </Provider>
    );

    fireEvent.click(screen.getByText('Share'));
    expect(screen.getByText(`Share this ${pageConfig.displayName}`)).toBeInTheDocument();
  });

  it('shows the access list', () => {
    render(
      <Provider store={store}>
        <ShareResourcePopup
          resourceId="resource-123"
          resourceType={ResourceType.DATASET}
          apiHooks={mockApiHooks}
          resourceConfig={{
            ...datasetConfig,
            accessComponent: MockAccessComponent,
          }}
        />
      </Provider>
    );

    fireEvent.click(screen.getByText('Share'));
    expect(screen.getByText('Who has access')).toBeInTheDocument();
    expect(screen.getByTestId('access-component')).toBeInTheDocument();
  });

  it('disables share button when no items are selected', () => {
    render(
      <Provider store={store}>
        <ShareResourcePopup
          resourceId="resource-123"
          resourceType={ResourceType.DATASET}
          apiHooks={mockApiHooks}
          resourceConfig={{
            ...datasetConfig,
            accessComponent: MockAccessComponent,
          }}
        />
      </Provider>
    );

    fireEvent.click(screen.getByText('Share'));
    const shareButton = screen.getAllByText('Share')[1].closest('button');
    expect(shareButton).toBeDisabled();
  });
});
