# Block-Based Chat Renderer

The block-based chat renderer allows you to display interactive chat messages with various components including plain text, markdown, single select (radio buttons), and action buttons.

## Overview

The chat renderer supports messages that come from the backend in a structured block format. Each message can contain multiple blocks of different types that render together to create rich, interactive chat experiences.

## Message Structure

Messages follow this structure:

```typescript
interface BlockMessage {
  block: Block[];
}
```

Each `Block` has the following base structure:

- `id` - Unique identifier for the block
- `type` - Type of block (plain_text, markdown, single_select, button)
- `order` - Display order (blocks are sorted by this field)
- `payload` - Block-specific data

Where `Block` can be one of:

- `PlainTextBlockType` - Simple text display
- `MarkdownBlockType` - Text with markdown formatting
- `SingleSelectBlockType` - Single select (radio button) group with options
- `ButtonBlockType` - Action button that can submit form data

## Block Types

### 1. Plain Text Block

Displays simple text without formatting.

```typescript
{
  id: "m_txt_001",
  type: "plain_text",
  order: 1,
  payload: {
    text: "Your plain text message here"
  }
}
```

### 2. Markdown Block

Displays text with markdown formatting support (bold, italic, links, code).

```typescript
{
  id: "m_md_001",
  type: "markdown",
  order: 1,
  payload: {
    text: "Text with **bold**, *italic*, `code`, and [links](https://example.com)"
  }
}
```

### 3. Single Select Block

Displays a group of radio button options. Each option can have plain text or markdown formatting.

```typescript
{
  id: "r_123",
  type: "single_select",
  order: 1,
  payload: {
    options: [
      {
        id: "op_01",
        type: "markdown",
        label: "Option 1 with **bold** text",
        value: "value-0"
      },
      {
        id: "op_02",
        type: "plain_text",
        label: "Option 2",
        value: "value-1"
      }
    ],
    initial_value: "op_01",
    action: {
      type: "state_update"
    }
  }
}
```

**Note**: The `initial_value` should match an option's `id`, not its `value`. The component tracks selections by option `id`.

### 4. Button Block

Displays an action button that can collect values from dependent elements (like single select) and trigger an action.

```typescript
{
  id: "btn_001",
  type: "button",
  order: 1,
  payload: {
    is_disabled: false,
    label: "Submit",
    value: "button_value",
    action: {
      type: "internal-api",
      dependent_elements: ["r_123"]
    }
  }
}
```

## Action Types

### State Update

Use `type: "state_update"` for actions that only update internal state without making API calls.

### Internal API

Use `type: "internal-api"` for actions that collect values from dependent elements and submit them. When a button with this action type is clicked, it will:

1. Collect values from all elements listed in `dependent_elements` (using block IDs)
2. Create a payload object like `{ "r_123": "op_01" }` (block ID → selected option ID)
3. Pass this payload to the `onAction` handler

## Usage Example

### Basic Usage

```typescript
import { BlockMessage, BlockRenderer } from '@zamp-platform/chat';

const MyComponent = () => {
  const message: BlockMessage = {
    block: [
      {
        id: "m_txt_001",
        type: "plain_text",
        order: 1,
        payload: {
          text: "Which option do you prefer?"
        }
      },
      {
        id: "r_123",
        type: "single_select",
        order: 2,
        payload: {
          options: [
            {
              id: "op_01",
              type: "plain_text",
              label: "Option A",
              value: "option-a"
            },
            {
              id: "op_02",
              type: "plain_text",
              label: "Option B",
              value: "option-b"
            }
          ],
          initial_value: "op_01",
          action: {
            type: "state_update"
          }
        }
      },
      {
        id: "btn_001",
        type: "button",
        order: 3,
        payload: {
          is_disabled: false,
          label: "Submit",
          value: "submit",
          action: {
            type: "internal-api",
            dependent_elements: ["r_123"]
          }
        }
      }
    ]
  };

  const handleAction = async (action, payload) => {
    console.log('Action:', action);
    console.log('Payload:', payload);

    // Handle the action based on type
    if (action.type === 'internal-api') {
      // Make API call with the payload
      await fetch('/api/submit-choice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    }
  };

  return (
    <BlockRenderer
      message={message}
      onAction={handleAction}
    />
  );
};
```

### With Loading State

```typescript
const [isLoading, setIsLoading] = useState(false);

const handleAction = async (action, payload) => {
  setIsLoading(true);
  try {
    // Make API call
    await submitData(payload);
  } finally {
    setIsLoading(false);
  }
};

<BlockRenderer
  message={message}
  onAction={handleAction}
  isLoading={isLoading}
/>
```

### Using BlockRenderer Directly

If you want more control over the styling, you can use `BlockRenderer` directly:

```typescript
import { BlockRenderer, BlockMessage } from '@zamp-platform/chat';

<div className="my-custom-wrapper">
  <BlockRenderer
    message={message}
    onAction={handleAction}
  />
</div>
```

## Complete Example

Here's a complete example with conflict resolution:

```typescript
const conflictResolutionMessage: BlockMessage = {
  block: [
    {
      id: 'm_txt_001',
      type: 'plain_text',
      order: 1,
      payload: {
        text: "There is 1 feedback chat that is conflicting with yours, regarding the supplier name for The Guardian Life Insurance of America. Which one should I use? I'll update the other one to remove the conflicting logic.",
      },
    },
    {
      id: 'r_123',
      type: 'single_select',
      order: 2,
      payload: {
        options: [
          {
            id: 'op_01',
            type: 'markdown',
            label: 'Satabdi\'s feedback says to search for "TGLIA Ltd" on Coupa.',
            value: 'value-0',
          },
          {
            id: 'op_02',
            type: 'markdown',
            label: 'This feedback asks me to use "TGL Ltd" as the supplier name',
            value: 'value-1',
          },
        ],
        initial_value: 'op_02',
        action: {
          type: 'state_update',
        },
      },
    },
    {
      id: 'btn_001',
      type: 'button',
      order: 3,
      payload: {
        is_disabled: false,
        label: 'Use this',
        value: 'click_me_123',
        action: {
          type: 'internal-api',
          dependent_elements: ['r_123'],
        },
      },
    },
  ],
};

const handleAction = async (action, payload) => {
  // payload will be: { "r_123": "op_01" } or { "r_123": "op_02" }
  console.log('Selected option:', payload['r_123']);

  // Handle the action based on type
  if (action.type === 'internal-api') {
    // Make API call to backend
    const response = await fetch('/api/submit-choice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    // Handle response...
  }
};
```

## Components Exported

- `BlockRenderer` - Main component with built-in styling
- `PlainTextBlock` - Plain text block component
- `MarkdownBlock` - Markdown text block component
- `SingleSelectBlock` - Single select (radio button) group component
- `RadioButtonBlock` - Alias for `SingleSelectBlock` (for backward compatibility)
- `ButtonBlock` - Action button component

## Types Exported

- `BlockMessage` - Main message interface
- `Block` - Union type of all block types
- `PlainTextBlockType` - Plain text block type
- `MarkdownBlockType` - Markdown block type
- `SingleSelectBlockType` - Single select block type
- `ButtonBlockType` - Button block type
- `BlockType` - Enum of block type values (`PLAIN_TEXT`, `MARKDOWN`, `SINGLE_SELECT`, `BUTTON`)
- `ActionType` - Enum of action type values (`STATE_UPDATE`, `INTERNAL_API`, `REDIRECT`)
- `BlockAction` - Action configuration interface
- `SingleSelectOption` - Single select option interface

## Styling

The components use Tailwind CSS for styling and integrate with the existing `@zamp-platform/ui` components. You can customize the appearance by:

1. Using `BlockRenderer` directly with your own wrapper
2. Creating custom block components if needed

## Dependencies

- `@zamp-platform/ui` - For Button, Radio, RadioGroup, and Label components
- React 19
- Tailwind CSS
