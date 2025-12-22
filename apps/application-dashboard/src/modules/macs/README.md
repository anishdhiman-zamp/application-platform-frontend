# MACS Module

A chat-first interface with tabbed sections for capabilities, components, and dynamic content.

## Overview

The MACS (Multi-Agent Chat System) page provides a dual-panel layout with:

- **Chat Panel (Left, 40%)** - AI chat interface with welcome screen and message input
- **Section Panel (Right, 60%)** - Dynamic content based on selected tabs

When no tabs are open, the chat occupies 100% width.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    MacsLayout (layout.tsx)                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                   MacsProvider                        │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │              Topbar Row                         │  │  │
│  │  │  ┌──────────────┬────────────────────────────┐  │  │  │
│  │  │  │ ChatTopbar   │      MacsTopbar            │  │  │  │
│  │  │  │ (40%)        │      (60%)                 │  │  │  │
│  │  │  │ [title][+][h]│ [icons] [tabs...] [+]      │  │  │  │
│  │  │  └──────────────┴────────────────────────────┘  │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │         ResizablePanelGroup                     │  │  │
│  │  │  ┌──────────────┬────────────────────────────┐  │  │  │
│  │  │  │  MacsChat    │     SectionPanel           │  │  │  │
│  │  │  │  (40%)       │     (60%)                  │  │  │  │
│  │  │  │              │                            │  │  │  │
│  │  │  │ ┌──────────┐ │  ┌──────────────────────┐  │  │  │  │
│  │  │  │ │ChatHome  │ │  │  CapabilitiesSection │  │  │  │  │
│  │  │  │ │"Hello!"  │ │  │  ComponentsSection   │  │  │  │  │
│  │  │  │ └──────────┘ │  │  GenericSection      │  │  │  │  │
│  │  │  │              │  └──────────────────────┘  │  │  │  │
│  │  │  │ ┌──────────┐ │                            │  │  │  │
│  │  │  │ │ChatInput │ │                            │  │  │  │
│  │  │  │ └──────────┘ │                            │  │  │  │
│  │  │  └──────────────┴────────────────────────────┘  │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## File Structure

```
src/modules/macs/
├── README.md                    # This file
├── index.ts                     # Module exports
├── types.ts                     # TypeScript type definitions
├── constants.ts                 # Constants and mock data
├── context/
│   └── MacsContext.tsx          # React Context for state management
└── components/
    ├── MacsTopbar.tsx           # Main topbar with icons, tabs, and add button
    ├── ChatTopbar.tsx           # Chat topbar with title and action buttons
    ├── MacsChat.tsx             # Main chat component container
    ├── MacsChatHome.tsx         # Welcome screen ("Afternoon, Razi!")
    ├── MacsTab.tsx              # Individual tab component
    ├── SectionIconButton.tsx    # Puzzle/Shapes icon buttons
    ├── AddTabMenu.tsx           # Dropdown menu for adding tabs
    ├── SectionPanel.tsx         # Renders active tab content
    └── sections/
        ├── CapabilitiesSection.tsx  # Capabilities content
        ├── ComponentsSection.tsx    # Components content
        └── GenericSection.tsx       # Generic content for other tabs
```

## State Management

### MacsContext

The context manages all state for the MACS module:

```typescript
type MacsContextType = {
  // Which section icons are currently open as tabs
  openSections: SectionType[]; // ['capabilities', 'components']

  // Additional tabs added via + button
  additionalTabs: Tab[];

  // Currently active tab ID
  activeTabId: string | null;

  // Computed: all tabs (sections + additional)
  allTabs: Tab[];

  // Whether any tabs are open
  hasTabs: boolean;

  // Actions
  toggleSection: (section: SectionType) => void;
  addTab: (tab: Tab) => void;
  removeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  closeSection: (section: SectionType) => void;

  // Chat state
  chatTitle: string;
  setChatTitle: (title: string) => void;
};
```

## Key Components

### MacsTopbar

The main topbar that displays:

- **Section Icon Buttons** - Puzzle (Capabilities) and Shapes (Components) icons
- **Tab Bar** - Open tabs with close buttons
- **Add Button (+)** - Opens dropdown to add new tabs

When an icon is clicked, it transforms into a tab (icon disappears, tab appears).

### ChatTopbar

Displays when tabs are open. Contains:

- Chat title
- **+** - New chat button
- **Clock** - Chat history button
- **Expand** - Expand chat to full width
- **Minimize** - Minimize chat

### MacsChat

Container component that includes:

- `MacsChatHome` - Welcome screen with greeting

### AddTabMenu

Popover dropdown with:

- Search input to filter items
- Recently visited items list
- Click to add as new tab

### SectionPanel

Renders content based on active tab:

- `capabilities` → CapabilitiesSection
- `components` → ComponentsSection
- Other types → GenericSection

## Layout Behavior

### Default State (No Tabs Open)

```
┌─────────────────────────────────────┐
│  MacsTopbar (100%)                  │
│  [Puzzle] [Shapes] [+]              │
├─────────────────────────────────────┤
│  ChatTopbar (inside chat area)      │
│  [title]              [+] [history] │
├─────────────────────────────────────┤
│                                     │
│         MacsChat (100%)             │
│     "Afternoon, Razi!"              │
│                                     │
│         [Input field]               │
│                                     │
└─────────────────────────────────────┘
```

Note: In default state, ChatTopbar is part of the chat area (not the main topbar row).
Expand/minimize buttons are NOT shown in default state.

### Tabs Open State

```
┌──────────────────────┬───────────────────────┐
│ ChatTopbar 40%       │ MacsTopbar 60%        │
│ [title] [+][h][^][-] │ [Shapes][Tab X][+]    │
├──────────────────────┼───────────────────────┤
│                      │                       │
│  MacsChat            │  SectionPanel         │
│  (40%)               │  (60%)                │
│                      │                       │
│  [Input]             │  [Active Content]     │
│                      │                       │
└──────────────────────┴───────────────────────┘
```

Note: In tabs open state, ChatTopbar is in the main topbar row (not inside chat area).
Expand [^] and minimize [-] buttons ARE shown in tabs open state.

## Icon-to-Tab Transformation

The two permanent icons (Puzzle, Shapes) behave specially:

| Action          | Result                                                  |
| --------------- | ------------------------------------------------------- |
| Click icon      | Icon transforms into a tab, section panel shows content |
| Close tab (X)   | Tab disappears, icon reappears                          |
| Multiple clicks | Each icon can only be open once                         |

## User Flows

### Opening a Section

1. User clicks Puzzle icon
2. Icon disappears from topbar
3. "Capabilities" tab appears in tab bar
4. Layout splits to 40/60
5. SectionPanel shows CapabilitiesSection

### Adding a Tab via +

1. User clicks + button
2. Dropdown appears with search and recent items
3. User selects "Daily Liquidity Summary"
4. New tab appears in tab bar
5. SectionPanel shows GenericSection with that content

### Closing All Tabs

1. User closes all tabs via X buttons
2. Layout returns to 100% chat
3. All section icons reappear in topbar

## Dependencies

- `@zamp-platform/ui` - UI components (Button, Textarea, Popover, ResizablePanel)
- `lucide-react` - Icons (Puzzle, Shapes, Plus, X, Clock, etc.)
- React Context - State management
- Next.js App Router - Routing

## Future Enhancements

The following features have UI placeholders but are not yet implemented:

- **Chat functionality** - Actual message sending/receiving
- **Mic button** - Voice input
- **Attachment button** - File upload
- **New chat button** - Create new conversation
- **Chat history** - View previous conversations
- **Expand/Minimize** - Full-width chat mode
- **Real data** - Replace MOCK_RECENT_ITEMS with API data
