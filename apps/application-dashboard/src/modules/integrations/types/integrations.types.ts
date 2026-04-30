import type { ReactNode } from 'react';
import { FormField } from '@zamp-platform/form-builder';
import type { ButtonVariant } from '@zamp-platform/ui';
import { CONNECTION_TAB } from '@/modules/integrations/constants/integrations.constant';
import type { ActionAudienceKind } from '@/modules/integrations/types/policies.types';
import type {
  AccessLevelType,
  AgentToolType,
  ToolPermissionType,
} from '@/modules/pace/components/agents/types/agents.types';
import type { IntegrationConnection, IntegrationItem } from '@/types/api/integrations';
import type { defaultFnType } from '@/types/commonTypes';

export const enum ACTION_TYPE {
  TOOL_CALL = 'tool_call',
}

export const enum AUTH_TYPE {
  FORM = 'form',
  CUSTOM = 'custom',
  CONNECTED_URL = 'connected_url',
}

export interface IntegrationAuthButtonAction {
  action_type: ACTION_TYPE;
  tool_name: string;
}

export interface IntegrationAuthButton {
  label: string;
  action: IntegrationAuthButtonAction;
}

export interface IntegrationAuth {
  auth_type: AUTH_TYPE;
  fields: Record<string, FormField>;
  button?: IntegrationAuthButton;
}

export interface IntegrationEvent {
  id: string;
  display_name: string;
}

export interface IntegrationType {
  name?: string;
  id: string;
  display_name: string;
  logo: string;
  description?: string;
  what_possible: string[];
  guide: string;
  auth?: string;
  events?: IntegrationEvent[];
  connectionMetadata?: IntegrationConnection;
}

export interface IntegrationsDataType {
  version: number;
  integrations: IntegrationType[];
}

export interface ConnectionModalPropsType {
  integration: IntegrationType;
  isOpen: boolean;
  onClose: () => void;
  isCreatingTrigger?: boolean;
  onSubmit?: (connectionId: string) => void;
  animated?: boolean;
}

export interface ConnectionPillsDetails {
  title: string;
  action: string;
  accounts: { id: string; email: string }[];
}

export const enum CONNECTION_PILLS_TYPE {
  SYNCED = 'synced',
  REAUTH = 'reauth',
  DISCONNECTED = 'disconnected',
}

export const enum PILLS_ACTIONS {
  CONNECT = 'connect',
  RE_AUTH = 're-auth',
  DISCONNECT = 'disconnect',
}

export type ConnectionPillsDetailsMap = Record<CONNECTION_PILLS_TYPE, ConnectionPillsDetails>;

export interface PillConfig {
  type: CONNECTION_PILLS_TYPE;
  icon: ReactNode;
  tooltipWidth: string;
}

export const ACCOUNT_STATUS = {
  CONNECTED: 'connected',
  ARCHIVED: 'archived',
  NEEDS_REAUTH: 'needs_reauth',
  DISCONNECTED: 'disconnected',
} as const;

export type AccountStatus = (typeof ACCOUNT_STATUS)[keyof typeof ACCOUNT_STATUS];

export interface StatusConfig {
  labelClassName: string;
  icon: ReactNode | null;
  actionLabel: string;
  actionIcon: ReactNode | null;
}

export const CONNECTION_ROLE = {
  ADMIN: 'admin',
  VIEWER: 'viewer',
} as const;

export type ConnectionRoleType = (typeof CONNECTION_ROLE)[keyof typeof CONNECTION_ROLE];

export type ConnectionTabType = (typeof CONNECTION_TAB)[keyof typeof CONNECTION_TAB];

export interface ConnectionEntryType {
  id: string;
  name: string;
}

export interface PersonEntryType {
  userId: string;
  name: string;
  email: string;
  resourceAudiencePolicyId?: string;
  isAgent: boolean;
  isTeam?: boolean;
  /** Theme-resolved chip background color; only set for team entries. */
  teamColor?: string;
  role: ConnectionRoleType;
  tools: AgentToolType[];
  accessLevel: AccessLevelType;
  isLoadingPolicies?: boolean;
  /** Snapshot of currently-saved policy rows for this person; used to diff on save. */
  existingPolicies?: { id: string; tool_name: string; legacyPolicy: string }[];
  /** Cached (audience_type, audience_id) for this RAP; resolved once during load. */
  audience?: { type: ActionAudienceKind; id: string };
}

export interface ConnectionWithPeopleType {
  connectionId: string;
  connectionName: string;
  people: PersonEntryType[];
  agents: PersonEntryType[];
  isLoadingAudiences?: boolean;
}

export interface ConnectionPeopleSectionPropsType {
  connection: ConnectionWithPeopleType;
  integrationName: string;
  integrationLogo?: string;
  isExpanded: boolean;
  onToggle: () => void;
  onToolPermissionChange: (userId: string, toolId: string, permission: ToolPermissionType) => void;
  onAccessLevelChange: (userId: string, accessLevel: AccessLevelType) => void;
  onRoleChange: (userId: string, role: ConnectionRoleType) => void;
  onRemoveAudience: (userId: string) => void;
  onDelete: (connectionId: string) => void;
  onShared?: () => void;
  isDeleting?: boolean;
}

// -- Component prop types -----------------------------------------------------

export interface ConnectIntegrationActionPropsType {
  integrationItem: IntegrationItem;
  redirectUrl?: string;
  buttonClassName?: string;
  copy?: string;
  buttonVariant?: ButtonVariant;
  icon?: ReactNode;
}

export interface ConnectIntegrationDialogAudience {
  audience_type: string;
  audience_id: string;
  role: string;
}

export interface ConnectIntegrationDialogPayload {
  name?: string;
  scopes?: string[];
  audiences?: ConnectIntegrationDialogAudience[];
}

export interface ConnectIntegrationDialogTypedAudience {
  value: string;
  label: string;
  color?: string;
  type?: string;
  team_id?: string;
}

export interface ConnectIntegrationDialogPropsType {
  integrationName: string;
  integrationTitle: string;
  integrationIcon: string;
  isOpen: boolean;
  isLoading: boolean;
  onOpenChange: (open: boolean) => void;
  onConnect: (payload: ConnectIntegrationDialogPayload) => void;
  defaultScopes?: string[];
  showScopesOption?: boolean;
}

export interface ConnectionAudienceBubblesPropsType {
  connectionId: string;
  maxVisible?: number;
}

export interface ConnectionsPopoverPropsType {
  connections: IntegrationConnection[];
  integrationName: string;
}

export interface IntegrationCardPropsType {
  integrationItem: IntegrationItem;
  className?: string;
  redirectUrl?: string;
  enabled?: boolean;
  buttonVariant?: ButtonVariant;
  isToolCallBlock?: boolean;
  onCardClick?: (item: IntegrationItem) => void;
}

export interface IntegrationHeaderPropsType {
  title?: string;
}

export interface IntegrationInfoDialogPropsType {
  integrationItem: IntegrationItem;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export interface EmailForwardingDialogPropsType {
  integration: IntegrationItem;
  isOpen: boolean;
  onClose: () => void;
  isCreatingTrigger?: boolean;
  onSubmit?: (connectionId: string) => void;
  animated?: boolean;
}

export interface ConnectionPeopleTabPropsType {
  connections: ConnectionEntryType[];
  integrationName: string;
  integrationLogo?: string;
}

export interface ConnectionRoleDropdownPropsType {
  value: ConnectionRoleType;
  onChange: (value: ConnectionRoleType) => void;
  onRemove?: () => void;
}

export interface ConnectionSharingTabPropsType {
  label: string;
  count: number;
  isActive: boolean;
  onClick: defaultFnType;
}

export interface IntegrationDetailHeaderPropsType {
  displayName: string;
  logo: string;
  guide?: string;
  showGuide?: boolean;
  onGuideClick?: defaultFnType;
  integrationItem?: IntegrationItem;
}

export interface IntegrationDetailPagePropsType {
  integration: IntegrationType;
}

export interface PersonRowPropsType {
  person: PersonEntryType;
  isUserExpanded: boolean;
  canManage: boolean;
  isCurrentUser: boolean;
  onToggleUser: (userId: string) => void;
  onToolPermissionChange: (userId: string, toolId: string, permission: ToolPermissionType) => void;
  onAccessLevelChange: (userId: string, accessLevel: AccessLevelType) => void;
  onRoleChange: (userId: string, role: ConnectionRoleType) => void;
  onRemove: (userId: string, name: string) => void;
  isLast: boolean;
}

export interface ShareConnectionDialogPropsType {
  open: boolean;
  connectionId: string;
  connectionName: string;
  integrationName: string;
  integrationLogo?: string;
  onClose: () => void;
  onShared?: () => void;
}

export interface ToolPermissionRowPropsType {
  tool: AgentToolType;
  isLast: boolean;
  isLoadingPolicies: boolean;
  canEdit: boolean;
  onPermissionChange: (permission: ToolPermissionType) => void;
}

export interface ScopeCheckboxItemPropsType {
  scope: string;
  checked: boolean;
  onToggle: (scope: string) => void;
}

export interface SharedToolPermissionRowPropsType {
  tool: AgentToolType;
  isLast: boolean;
  onPermissionChange: (toolId: string, permission: ToolPermissionType) => void;
}
