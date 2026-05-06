import { CSS_VARS } from '@zamp-platform/ui';
import type { LucideIcon } from 'lucide-react';
import { Ban, Bot, CircleCheck, Hand, HandMetal, List, Users } from 'lucide-react';
import {
  ACCESS_LEVEL,
  type AccessLevelOptionType,
  AGENT_DETAIL_TAB,
  AGENT_LISTING_TAB,
  type AgentDetailTabType,
  type AgentListingTabType,
  type PermissionOptionType,
  TOOL_PERMISSION,
  type ToolPermissionType,
} from 'modules/pace/components/agents/types/agents.types';
import {
  AGENT_AVATAR_1,
  AGENT_AVATAR_2,
  AGENT_AVATAR_3,
  AGENT_AVATAR_4,
  AGENT_AVATAR_5,
  AGENT_AVATAR_6,
  AGENT_AVATAR_7,
  AGENT_AVATAR_8,
  AGENT_AVATAR_9,
  AGENT_AVATAR_10,
  AGENT_AVATAR_11,
} from '@/constants/icons';

export const AGENT_TAB_CONFIG: { id: AgentListingTabType; label: string; icon: LucideIcon }[] = [
  { id: AGENT_LISTING_TAB.ALL, label: 'All', icon: List },
  { id: AGENT_LISTING_TAB.MY_AGENTS, label: 'My agents', icon: Bot },
  { id: AGENT_LISTING_TAB.SHARED_WITH_ME, label: 'Shared with me', icon: Users },
];

export const VALID_AGENT_TABS = new Set<string>(Object.values(AGENT_LISTING_TAB));
export const TRANSPARENT_PIXEL = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

export const AGENT_SEARCH_DEBOUNCE_MS = 300;
export const TRIGGER_STATUS_ACTIVE = 'active';
export const AGENT_DEFAULT_DESCRIPTION = "Hi, I'm your new agent! Let me know what you want me to do:";
export const enum PrefixMessage {
  OPTIMISTIC_AGENT_CREATION = 'Create an agent which can',
  ADD_TRIGGER = 'I want to add a trigger for agent',
  TEST_AGENT = 'I want to add some triggers for',
}

export const getAddTriggerMessage = (agentName: string) =>
  `I want to add a trigger to **${agentName}**. Ask me which type of trigger I'd like (e.g., on a schedule like daily/hourly, or when something specific happens?) then collect the details needed to set it up.`;

export const getAddConnectionMessage = (agentName: string) =>
  `I want to grant **${agentName}** access to my connections. List all my connections for me — I'll pick.`;

export const getAddInstructionsMessage = (agentName: string) => `I want to add to **${agentName}**'s instructions.`;

export const AGENT_GREETING_MESSAGE = "@ Let's collaborate — chat, add triggers, or edit me";

export const AGENT_DETAIL_TAB_CONFIG: { id: AgentDetailTabType; label: string }[] = [
  { id: AGENT_DETAIL_TAB.TASKS, label: 'Tasks' },
  { id: AGENT_DETAIL_TAB.TRIGGERS, label: 'Triggers' },
  { id: AGENT_DETAIL_TAB.INSTRUCTIONS, label: 'Instructions' },
  { id: AGENT_DETAIL_TAB.FILES, label: 'Files' },
  { id: AGENT_DETAIL_TAB.TOOLS_AND_ACCESS, label: 'Tools & Access' },
];

export const AGENT_ICON_COLORS = [
  { bg: CSS_VARS.RED_100, text: CSS_VARS.RED_800, key: 'RED_100' },
  { bg: CSS_VARS.GREEN_100, text: CSS_VARS.GREEN_800, key: 'GREEN_100' },
  { bg: CSS_VARS.ORANGE_100, text: CSS_VARS.ORANGE_800, key: 'ORANGE_100' },
] as const;

export type AgentIconColorType = (typeof AGENT_ICON_COLORS)[number];

export const getAgentColorByIndex = (index: number): AgentIconColorType => {
  return AGENT_ICON_COLORS[index % AGENT_ICON_COLORS.length];
};

export const getAgentColor = (agentName: string): AgentIconColorType => {
  return AGENT_ICON_COLORS[agentName.length % AGENT_ICON_COLORS.length];
};

export interface AgentAvatarConfig {
  src: string;
  alt: string;
  key: string;
}

export const AGENT_AVATARS: AgentAvatarConfig[] = [
  { src: AGENT_AVATAR_1, alt: 'Agent avatar 1', key: 'agent_1' },
  { src: AGENT_AVATAR_2, alt: 'Agent avatar 2', key: 'agent_2' },
  { src: AGENT_AVATAR_3, alt: 'Agent avatar 3', key: 'agent_3' },
  { src: AGENT_AVATAR_4, alt: 'Agent avatar 4', key: 'agent_4' },
  { src: AGENT_AVATAR_5, alt: 'Agent avatar 5', key: 'agent_5' },
  { src: AGENT_AVATAR_6, alt: 'Agent avatar 6', key: 'agent_6' },
  { src: AGENT_AVATAR_7, alt: 'Agent avatar 7', key: 'agent_7' },
  { src: AGENT_AVATAR_8, alt: 'Agent avatar 8', key: 'agent_8_v2' },
  { src: AGENT_AVATAR_9, alt: 'Agent avatar 9', key: 'agent_9' },
  { src: AGENT_AVATAR_10, alt: 'Agent avatar 10', key: 'agent_10' },
  { src: AGENT_AVATAR_11, alt: 'Agent avatar 11', key: 'agent_11' },
];

export const getAgentAvatar = (agentName: string): AgentAvatarConfig => {
  return AGENT_AVATARS[agentName.length % AGENT_AVATARS.length];
};

export const getAgentAvatarByKey = (key: string): AgentAvatarConfig | undefined => {
  return AGENT_AVATARS.find((a) => a.key === key);
};

export const getRandomAgentAvatar = (): AgentAvatarConfig => {
  return AGENT_AVATARS[Math.floor(Math.random() * AGENT_AVATARS.length)];
};

export const PERMISSION_OPTIONS: PermissionOptionType[] = [
  { value: TOOL_PERMISSION.ALLOWED, icon: CircleCheck, label: 'Allowed' },
  { value: TOOL_PERMISSION.ASK, icon: Hand, label: 'Ask before running' },
  { value: TOOL_PERMISSION.BLOCKED, icon: Ban, label: 'Blocked' },
];

export const ACCESS_LEVEL_OPTIONS: AccessLevelOptionType[] = [
  { value: ACCESS_LEVEL.CUSTOM, icon: HandMetal, label: 'Custom' },
  { value: ACCESS_LEVEL.ALWAYS_ALLOW, icon: CircleCheck, label: 'Always allow', permission: TOOL_PERMISSION.ALLOWED },
  { value: ACCESS_LEVEL.NEED_APPROVAL, icon: Hand, label: 'Needs approval', permission: TOOL_PERMISSION.ASK },
  { value: ACCESS_LEVEL.NEVER_ALLOW, icon: Ban, label: 'Never allow', permission: TOOL_PERMISSION.BLOCKED },
];

// Maps FE permission values to BE policy values
export const PERMISSION_TO_POLICY: Record<ToolPermissionType, string> = {
  [TOOL_PERMISSION.ALLOWED]: 'always_allow',
  [TOOL_PERMISSION.ASK]: 'needs_approval',
  [TOOL_PERMISSION.BLOCKED]: 'blocked',
};

// Maps BE policy values to FE permission values
export const POLICY_TO_PERMISSION: Record<string, ToolPermissionType> = {
  always_allow: TOOL_PERMISSION.ALLOWED,
  needs_approval: TOOL_PERMISSION.ASK,
  blocked: TOOL_PERMISSION.BLOCKED,
};

export const RANDOM_AGENT_TITLES = [
  'Summarize my weekly PRs by teammate and theme',
  'Send me a daily news digest every morning',
  'Monitor Slack for urgent messages and alert me',
  'Track competitor pricing and email me changes',
  'Generate a weekly report of completed tasks',
  'Remind me to review pull requests every afternoon',
  'Fetch top headlines and send via email daily',
  'Notify me when a new issue is assigned to me',
  'Compile a daily standup summary from Slack',
  'Alert me when server costs exceed threshold',
] as const;

export const getRandomAgentTitle = (): string => {
  return RANDOM_AGENT_TITLES[Math.floor(Math.random() * RANDOM_AGENT_TITLES.length)];
};

export const RANDOM_AGENT_NAMES = [
  'Sprint Crusader',
  'Pixel Pioneer',
  'Code Whisperer',
  'Data Voyager',
  'Logic Weaver',
  'Cloud Ranger',
  'Byte Sentinel',
  'Flux Navigator',
  'Signal Scout',
  'Stream Architect',
] as const;

export const getRandomAgentName = (): string => {
  return RANDOM_AGENT_NAMES[Math.floor(Math.random() * RANDOM_AGENT_NAMES.length)];
};
