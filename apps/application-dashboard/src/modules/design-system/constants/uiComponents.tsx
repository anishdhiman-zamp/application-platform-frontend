'use client';

import { useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  ActivityIcon,
  AgentIcon,
  AgentNavIcon,
  AnimatedDot,
  AnimatedTerminalIcon,
  ArrowDownIcon,
  Attribute,
  AutoSizeTextarea,
  BookIcon,
  BookTextIcon,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Button,
  Checkbox,
  ConfirmationDialog,
  CopyToClipboard,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogHeaderTitle,
  DialogTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  EmailInputToChips,
  FileIcon,
  FolderOpenIcon,
  HomeIcon,
  Input,
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  Label,
  LayoutGridIcon,
  ListCard,
  MessageSquareIcon,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Progress,
  Radio,
  RadioGroup,
  RevealElement,
  RouteIcon,
  SearchInput,
  SelectButton,
  SettingsIcon,
  ShapesIcon,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetHeaderTitle,
  SheetTrigger,
  ShimmerText,
  Skeleton,
  StaggerText,
  StepCard,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Tag,
  Textarea,
  toast,
  Toaster,
  Toggle,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  TooltipV2,
} from '@zamp-platform/ui';
import { Bell } from 'lucide-react';
import type { ComponentEntryType } from 'modules/design-system/types/design-system.types';

const DialogPreview = () => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant='outline' size='small'>
          Open dialog
        </Button>
      </DialogTrigger>
      <DialogContent size='small' showCloseButton>
        <DialogHeader>
          <DialogHeaderTitle>Sample dialog</DialogHeaderTitle>
        </DialogHeader>
        <DialogBody>
          <div className='p-4 text-sm'>This is a sample dialog body.</div>
        </DialogBody>
        <DialogFooter>
          <Button variant='outline' size='small' onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button size='small' onClick={() => setOpen(false)}>
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const SheetPreview = () => {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant='outline' size='small'>
          Open sheet
        </Button>
      </SheetTrigger>
      <SheetContent showCloseButton size='medium'>
        <SheetHeader>
          <SheetHeaderTitle>Sample sheet</SheetHeaderTitle>
        </SheetHeader>
        <div className='p-4 text-sm'>Side panel content.</div>
      </SheetContent>
    </Sheet>
  );
};

const ConfirmationDialogPreview = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant='outline' size='small' onClick={() => setOpen(true)}>
        Open confirmation
      </Button>
      <ConfirmationDialog
        open={open}
        onOpenChange={setOpen}
        title='Delete this item?'
        description='This action cannot be undone.'
        onConfirm={() => setOpen(false)}
      />
    </>
  );
};

const PopoverPreview = () => (
  <Popover>
    <PopoverTrigger asChild>
      <Button variant='outline' size='small'>
        Open popover
      </Button>
    </PopoverTrigger>
    <PopoverContent>
      <div className='text-GRAY_900 px-3 py-2 text-sm'>I&apos;m a popover.</div>
    </PopoverContent>
  </Popover>
);

const DropdownMenuPreview = () => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant='outline' size='small'>
        Open menu
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuItem>First item</DropdownMenuItem>
      <DropdownMenuItem>Second item</DropdownMenuItem>
      <DropdownMenuItem>Third item</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

const TooltipPreview = () => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant='outline' size='small'>
          Hover me
        </Button>
      </TooltipTrigger>
      <TooltipContent>Tooltip body</TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

const TooltipV2Preview = () => (
  <TooltipV2 tooltipBody='Hello from TooltipV2' asChildTrigger>
    <Button variant='outline' size='small'>
      Hover me
    </Button>
  </TooltipV2>
);

const TabsPreview = () => (
  <Tabs defaultValue='one' className='w-full'>
    <TabsList>
      <TabsTrigger value='one'>One</TabsTrigger>
      <TabsTrigger value='two'>Two</TabsTrigger>
      <TabsTrigger value='three'>Three</TabsTrigger>
    </TabsList>
    <TabsContent value='one' className='text-GRAY_700 text-xs'>
      Tab one content
    </TabsContent>
    <TabsContent value='two' className='text-GRAY_700 text-xs'>
      Tab two content
    </TabsContent>
    <TabsContent value='three' className='text-GRAY_700 text-xs'>
      Tab three content
    </TabsContent>
  </Tabs>
);

const AccordionPreview = () => (
  <Accordion type='single' collapsible className='w-full'>
    <AccordionItem value='one'>
      <AccordionTrigger>Section one</AccordionTrigger>
      <AccordionContent>First section content.</AccordionContent>
    </AccordionItem>
    <AccordionItem value='two'>
      <AccordionTrigger>Section two</AccordionTrigger>
      <AccordionContent>Second section content.</AccordionContent>
    </AccordionItem>
  </Accordion>
);

const BreadcrumbPreview = () => (
  <Breadcrumb>
    <BreadcrumbList>
      <BreadcrumbItem>
        <BreadcrumbLink href='#'>Home</BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbSeparator />
      <BreadcrumbItem>
        <BreadcrumbLink href='#'>Settings</BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbSeparator />
      <BreadcrumbItem>
        <BreadcrumbPage>Design system</BreadcrumbPage>
      </BreadcrumbItem>
    </BreadcrumbList>
  </Breadcrumb>
);

const SearchInputPreview = () => {
  const [value, setValue] = useState('');

  return <SearchInput value={value} onChange={setValue} placeholder='Search…' showSearchIcon />;
};

const InputOTPPreview = () => {
  const [value, setValue] = useState('');

  return (
    <InputOTP maxLength={4} value={value} onChange={setValue}>
      <InputOTPGroup>
        <InputOTPSlot index={0} className='border-GRAY_400 h-9 w-9 border' />
        <InputOTPSlot index={1} className='border-GRAY_400 h-9 w-9 border' />
        <InputOTPSlot index={2} className='border-GRAY_400 h-9 w-9 border' />
        <InputOTPSlot index={3} className='border-GRAY_400 h-9 w-9 border' />
      </InputOTPGroup>
    </InputOTP>
  );
};

const EmailInputToChipsPreview = () => {
  const [emails, setEmails] = useState<string[]>(['ada@example.com']);

  return <EmailInputToChips value={emails} onChange={setEmails} placeholder='Add email' />;
};

const RadioGroupPreview = () => (
  <RadioGroup defaultValue='one' className='flex flex-col gap-2'>
    <label className='inline-flex items-center gap-2 text-sm'>
      <Radio value='one' /> Option one
    </label>
    <label className='inline-flex items-center gap-2 text-sm'>
      <Radio value='two' /> Option two
    </label>
  </RadioGroup>
);

const SwitchPreview = () => {
  const [checked, setChecked] = useState(true);

  return <Switch checked={checked} onCheckedChange={setChecked} />;
};

const SelectButtonPreview = () => {
  const [value, setValue] = useState('list');

  return (
    <SelectButton
      options={[
        { label: 'List', value: 'list' },
        { label: 'Grid', value: 'grid' },
        { label: 'Map', value: 'map' },
      ]}
      value={value}
      onValueChange={setValue}
    />
  );
};

const TagSamples = (
  <div className='flex flex-wrap gap-1.5'>
    <Tag variant='blue'>blue</Tag>
    <Tag variant='yellow'>yellow</Tag>
    <Tag variant='green'>green</Tag>
    <Tag variant='orange'>orange</Tag>
    <Tag variant='violet'>violet</Tag>
    <Tag variant='pink'>pink</Tag>
    <Tag variant='gray'>gray</Tag>
    <Tag variant='outline'>outline</Tag>
    <Tag variant='ghost'>ghost</Tag>
  </div>
);

const ToastPreview = () => (
  <div className='flex flex-wrap gap-2'>
    <Toaster position='bottom-right' />
    <Button variant='outline' size='small' onClick={() => toast.success('Saved!')}>
      Success toast
    </Button>
    <Button variant='outline' size='small' onClick={() => toast.error('Something broke')}>
      Error toast
    </Button>
    <Button variant='outline' size='small' onClick={() => toast.warning('Heads up')}>
      Warning toast
    </Button>
  </div>
);

export const UI_COMPONENTS: ComponentEntryType[] = [
  // Buttons
  {
    id: 'button',
    name: 'Button',
    category: 'Buttons',
    filePath: 'packages/ui/src/components/ui/button.tsx',
    description: '7 variants, 8 sizes, isLoading, leading/trailing icons, debounce.',
    renderable: true,
    preview: <Button>Default button</Button>,
    variantSamples: [
      { label: 'default', node: <Button size='small'>Default</Button> },
      {
        label: 'destructive',
        node: (
          <Button variant='destructive' size='small'>
            Destructive
          </Button>
        ),
      },
      {
        label: 'outline',
        node: (
          <Button variant='outline' size='small'>
            Outline
          </Button>
        ),
      },
      {
        label: 'secondary',
        node: (
          <Button variant='secondary' size='small'>
            Secondary
          </Button>
        ),
      },
      {
        label: 'ghost',
        node: (
          <Button variant='ghost' size='small'>
            Ghost
          </Button>
        ),
      },
      {
        label: 'link',
        node: (
          <Button variant='link' size='small'>
            Link
          </Button>
        ),
      },
      {
        label: 'destructive-outline',
        node: (
          <Button variant='destructive-outline' size='small'>
            Destructive outline
          </Button>
        ),
      },
      {
        label: 'isLoading',
        node: (
          <Button size='small' isLoading>
            Loading
          </Button>
        ),
      },
      {
        label: 'with leadingIcon',
        node: (
          <Button size='small' leadingIcon={<Bell size={14} />}>
            Notify
          </Button>
        ),
      },
      { label: 'size: xxsmall', node: <Button size='xxsmall'>xxsmall</Button> },
      { label: 'size: xsmall', node: <Button size='xsmall'>xsmall</Button> },
      { label: 'size: small', node: <Button size='small'>small</Button> },
      { label: 'size: medium', node: <Button size='medium'>medium</Button> },
      { label: 'size: large', node: <Button size='large'>large</Button> },
      { label: 'size: xlarge', node: <Button size='xlarge'>xlarge</Button> },
    ],
  },
  {
    id: 'toggle',
    name: 'Toggle',
    category: 'Buttons',
    filePath: 'packages/ui/src/components/ui/toggle.tsx',
    description: 'Pressable on/off button. variant: default | outline. size: sm | default | lg.',
    renderable: true,
    preview: <Toggle aria-label='Bold'>Toggle me</Toggle>,
    variantSamples: [
      { label: 'default', node: <Toggle>Default</Toggle> },
      { label: 'outline', node: <Toggle variant='outline'>Outline</Toggle> },
      { label: 'sm', node: <Toggle size='sm'>sm</Toggle> },
      { label: 'lg', node: <Toggle size='lg'>lg</Toggle> },
    ],
  },

  // Form Inputs
  {
    id: 'input',
    name: 'Input',
    category: 'Form Inputs',
    filePath: 'packages/ui/src/components/ui/input.tsx',
    description: '6 sizes, default + error variants, optional leading/trailing icon.',
    renderable: true,
    preview: <Input placeholder='Type here…' className='w-full' />,
    variantSamples: [
      { label: 'small', node: <Input size='small' placeholder='small' /> },
      { label: 'medium', node: <Input size='medium' placeholder='medium' /> },
      { label: 'large', node: <Input size='large' placeholder='large' /> },
      { label: 'error', node: <Input error='Required' placeholder='error state' /> },
    ],
  },
  {
    id: 'textarea',
    name: 'Textarea',
    category: 'Form Inputs',
    filePath: 'packages/ui/src/components/ui/textarea.tsx',
    description: 'Standard multiline text area.',
    renderable: true,
    preview: <Textarea placeholder='Write something…' className='w-full' />,
  },
  {
    id: 'autosize-textarea',
    name: 'AutoSizeTextarea',
    category: 'Form Inputs',
    filePath: 'packages/ui/src/components/ui/autosize-textarea.tsx',
    description: 'Textarea that grows with content, with optional maxHeight.',
    renderable: true,
    preview: <AutoSizeTextarea placeholder='Type and watch me grow…' minRows={1} maxHeight={120} className='w-full' />,
  },
  {
    id: 'label',
    name: 'Label',
    category: 'Form Inputs',
    filePath: 'packages/ui/src/components/ui/label.tsx',
    description: 'Radix-based form label.',
    renderable: true,
    preview: <Label htmlFor='sample'>Email address</Label>,
  },
  {
    id: 'checkbox',
    name: 'Checkbox',
    category: 'Form Inputs',
    filePath: 'packages/ui/src/components/ui/checkbox.tsx',
    description: 'Radix checkbox with checked / indeterminate states.',
    renderable: true,
    preview: (
      <div className='flex items-center gap-3'>
        <Checkbox defaultChecked /> <span className='text-sm'>Checked</span>
        <Checkbox /> <span className='text-sm'>Unchecked</span>
      </div>
    ),
  },
  {
    id: 'radio',
    name: 'Radio / RadioGroup',
    category: 'Form Inputs',
    filePath: 'packages/ui/src/components/ui/radio.tsx',
    description: 'Radix radio group with single-select semantics.',
    renderable: true,
    preview: <RadioGroupPreview />,
  },
  {
    id: 'switch',
    name: 'Switch',
    category: 'Form Inputs',
    filePath: 'packages/ui/src/components/ui/switch.tsx',
    description: 'Toggle switch. size: small | medium | default.',
    renderable: true,
    preview: <SwitchPreview />,
    variantSamples: [
      { label: 'small', node: <Switch size='small' defaultChecked /> },
      { label: 'medium', node: <Switch size='medium' defaultChecked /> },
      { label: 'default', node: <Switch defaultChecked /> },
    ],
  },
  {
    id: 'input-otp',
    name: 'InputOTP',
    category: 'Form Inputs',
    filePath: 'packages/ui/src/components/ui/input-otp.tsx',
    description: 'Slot-based OTP input. Compose with InputOTPGroup, InputOTPSlot, InputOTPSeparator.',
    renderable: true,
    preview: <InputOTPPreview />,
  },
  {
    id: 'search-input',
    name: 'SearchInput',
    category: 'Form Inputs',
    filePath: 'packages/ui/src/components/ui/search-input.tsx',
    description: 'Debounced search input with optional clear button + search icon.',
    renderable: true,
    preview: <SearchInputPreview />,
  },
  {
    id: 'email-input-to-chips',
    name: 'EmailInputToChips',
    category: 'Form Inputs',
    filePath: 'packages/ui/src/components/ui/email-input-to-chips.tsx',
    description: 'Email-validating chip input. Press Enter or comma to add.',
    renderable: true,
    preview: <EmailInputToChipsPreview />,
  },

  // Selection
  {
    id: 'select',
    name: 'Select',
    category: 'Selection',
    filePath: 'packages/ui/src/components/ui/select.tsx',
    description: 'Combobox-backed select with sync + paginated options.',
    renderable: false,
  },
  {
    id: 'combobox',
    name: 'Combobox',
    category: 'Selection',
    filePath: 'packages/ui/src/components/ui/combobox.tsx',
    description: 'Search-filtered popover with single + multi-select modes.',
    renderable: false,
  },
  {
    id: 'combobox-v2',
    name: 'ComboboxV2',
    category: 'Selection',
    filePath: 'packages/ui/src/components/ui/combobox-v2.tsx',
    description: 'Enhanced combobox variant.',
    renderable: false,
  },
  {
    id: 'dropdown-menu',
    name: 'DropdownMenu',
    category: 'Selection',
    filePath: 'packages/ui/src/components/ui/dropdown-menu.tsx',
    description: 'Radix dropdown with items, sub-menus, checkbox/radio items.',
    renderable: true,
    preview: <DropdownMenuPreview />,
  },
  {
    id: 'context-menu',
    name: 'ContextMenu',
    category: 'Selection',
    filePath: 'packages/ui/src/components/ui/context-menu.tsx',
    description: 'Radix right-click menu — open via ContextMenuTrigger over a target area.',
    renderable: false,
  },
  {
    id: 'select-button',
    name: 'SelectButton',
    category: 'Selection',
    filePath: 'packages/ui/src/components/ui/select-button.tsx',
    description: 'Segmented control with sliding selection indicator.',
    renderable: true,
    preview: <SelectButtonPreview />,
  },
  {
    id: 'command',
    name: 'Command',
    category: 'Selection',
    filePath: 'packages/ui/src/components/ui/command.tsx',
    description: 'cmdk command palette primitives — used internally by Combobox.',
    renderable: false,
  },
  {
    id: 'drilldown-menu',
    name: 'DrilldownMenu',
    category: 'Selection',
    filePath: 'packages/ui/src/components/ui/DrilldownMenu/index.tsx',
    description:
      'Multi-level dropdown with motion-animated drill-in / back navigation. Requires MenuNode tree + click + pointer enter handlers.',
    renderable: false,
  },

  // Overlays
  {
    id: 'dialog',
    name: 'Dialog',
    category: 'Overlays',
    filePath: 'packages/ui/src/components/ui/dialog.tsx',
    description: 'Modal dialog. Compose Header / Body / Footer. 4 sizes.',
    renderable: true,
    preview: <DialogPreview />,
  },
  {
    id: 'sheet',
    name: 'Sheet',
    category: 'Overlays',
    filePath: 'packages/ui/src/components/ui/sheet.tsx',
    description: 'Side-panel dialog. side: top | right | bottom | left. size: medium | large.',
    renderable: true,
    preview: <SheetPreview />,
  },
  {
    id: 'confirmation-dialog',
    name: 'ConfirmationDialog',
    category: 'Overlays',
    filePath: 'packages/ui/src/components/ui/confirmation-dialog.tsx',
    description: 'Pre-configured confirm/cancel modal.',
    renderable: true,
    preview: <ConfirmationDialogPreview />,
  },
  {
    id: 'popover',
    name: 'Popover',
    category: 'Overlays',
    filePath: 'packages/ui/src/components/ui/popover.tsx',
    description: 'Radix popover with arrow positioning + PopoverMenuItem helper.',
    renderable: true,
    preview: <PopoverPreview />,
  },

  // Tooltips & Disclosure
  {
    id: 'tooltip',
    name: 'Tooltip',
    category: 'Tooltips & Disclosure',
    filePath: 'packages/ui/src/components/ui/tooltip.tsx',
    description: 'Radix tooltip primitives. Wrap consumers in TooltipProvider.',
    renderable: true,
    preview: <TooltipPreview />,
  },
  {
    id: 'tooltip-v2',
    name: 'TooltipV2',
    category: 'Tooltips & Disclosure',
    filePath: 'packages/ui/src/components/ui/tooltip-v2.tsx',
    description: 'Higher-level tooltip with showOnlyWhenTruncated, scrollableBody, etc.',
    renderable: true,
    preview: <TooltipV2Preview />,
  },
  {
    id: 'accordion',
    name: 'Accordion',
    category: 'Tooltips & Disclosure',
    filePath: 'packages/ui/src/components/ui/accordion.tsx',
    description: 'Radix accordion with motion expand/collapse and optional tooltip on trigger icon.',
    renderable: true,
    preview: <AccordionPreview />,
  },

  // Navigation
  {
    id: 'tabs',
    name: 'Tabs',
    category: 'Navigation',
    filePath: 'packages/ui/src/components/ui/tabs.tsx',
    description: 'Radix tabs (Tabs, TabsList, TabsTrigger, TabsContent).',
    renderable: true,
    preview: <TabsPreview />,
  },
  {
    id: 'breadcrumb',
    name: 'Breadcrumb',
    category: 'Navigation',
    filePath: 'packages/ui/src/components/ui/breadcrumb.tsx',
    description: 'Composable breadcrumb (List, Item, Link, Separator, Page, Ellipsis).',
    renderable: true,
    preview: <BreadcrumbPreview />,
  },
  {
    id: 'resizable',
    name: 'Resizable',
    category: 'Navigation',
    filePath: 'packages/ui/src/components/ui/resizable.tsx',
    description: 'react-resizable-panels wrapper for draggable pane dividers.',
    renderable: false,
  },
  {
    id: 'scroll-container',
    name: 'ScrollContainer',
    category: 'Navigation',
    filePath: 'packages/ui/src/components/ui/scroll-container.tsx',
    description: 'Custom scroll wrapper exposing useScrollRef + scroll-aware refs.',
    renderable: false,
  },

  // Feedback
  {
    id: 'progress',
    name: 'Progress',
    category: 'Feedback',
    filePath: 'packages/ui/src/components/ui/progress.tsx',
    description: 'Radix progress bar. value: 0–100, indicatorClassName for color.',
    renderable: true,
    preview: (
      <div className='flex w-full flex-col gap-2'>
        <Progress value={25} />
        <Progress value={60} />
        <Progress value={90} />
      </div>
    ),
  },
  {
    id: 'skeleton',
    name: 'Skeleton',
    category: 'Feedback',
    filePath: 'packages/ui/src/components/ui/skeleton.tsx',
    description: 'Animated pulse placeholder.',
    renderable: true,
    preview: (
      <div className='flex w-full flex-col gap-2'>
        <Skeleton className='h-3 w-3/4' />
        <Skeleton className='h-3 w-1/2' />
        <Skeleton className='h-10 w-full' />
      </div>
    ),
  },
  {
    id: 'toast',
    name: 'Toast / Toaster',
    category: 'Feedback',
    filePath: 'packages/ui/src/components/ui/toast.tsx',
    description: 'sonner-based global toast. Mount Toaster once, then call toast(...).',
    renderable: true,
    preview: <ToastPreview />,
  },

  // Rich Content
  {
    id: 'list-card',
    name: 'ListCard',
    category: 'Rich Content',
    filePath: 'packages/ui/src/components/ui/list-card.tsx',
    description: 'Card with a header strip, body content, and optional right component.',
    renderable: true,
    preview: (
      <ListCard header={<span className='text-sm font-medium'>Card header</span>} className='w-full'>
        <div className='text-GRAY_700 text-xs'>Card body content goes here.</div>
      </ListCard>
    ),
  },
  {
    id: 'image-with-fallback',
    name: 'ImageWithFallback',
    category: 'Rich Content',
    filePath: 'packages/ui/src/components/ui/image-with-fallback.tsx',
    description: 'next/image with a fallback when the source fails to load.',
    renderable: false,
  },
  {
    id: 'file-icon',
    name: 'FileIcon',
    category: 'Rich Content',
    filePath: 'packages/ui/src/components/ui/file-icon/FileIcon.tsx',
    description: 'Maps a file extension to a colored icon.',
    renderable: true,
    preview: (
      <div className='flex flex-wrap gap-2'>
        <FileIcon extension='pdf' />
        <FileIcon extension='png' />
        <FileIcon extension='csv' />
        <FileIcon extension='xlsx' />
        <FileIcon extension='docx' />
      </div>
    ),
  },
  {
    id: 'attribute',
    name: 'Attribute',
    category: 'Rich Content',
    filePath: 'packages/ui/src/components/ui/attribute.tsx',
    description: 'Key-value chip used for metadata badges.',
    renderable: true,
    preview: (
      <div className='flex flex-wrap gap-2'>
        <Attribute label='Status' displayValue='Live' />
        <Attribute label='Owner' displayValue='Anish' />
      </div>
    ),
  },
  {
    id: 'tags',
    name: 'Tag',
    category: 'Rich Content',
    filePath: 'packages/ui/src/components/ui/tags.tsx',
    description: '9 color variants. Use for status / category chips.',
    renderable: true,
    preview: TagSamples,
  },
  {
    id: 'step-card',
    name: 'StepCard',
    category: 'Rich Content',
    filePath: 'packages/ui/src/components/ui/step-card.tsx',
    description: 'Numbered card with optional remove handler.',
    renderable: true,
    preview: (
      <StepCard stepNumber={1} className='w-full'>
        <div className='text-sm'>First step</div>
        <div className='text-GRAY_700 text-xs'>Description of the step.</div>
      </StepCard>
    ),
  },

  // Specialized
  {
    id: 'live-waveform',
    name: 'LiveWaveform',
    category: 'Specialized',
    filePath: 'packages/ui/src/components/ui/live-waveform.tsx',
    description: 'Real-time audio waveform visualization. Needs a media stream.',
    renderable: false,
  },
  {
    id: 'copy-to-clipboard',
    name: 'CopyToClipboard',
    category: 'Specialized',
    filePath: 'packages/ui/src/components/ui/copy-to-clipboard.tsx',
    description: 'Wraps any element with a click-to-copy + tooltip portal.',
    renderable: true,
    preview: (
      <CopyToClipboard text='hello-from-design-system'>
        <span className='border-GRAY_400 inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs'>
          Click me to copy
        </span>
      </CopyToClipboard>
    ),
  },

  // Animations
  {
    id: 'reveal-element',
    name: 'RevealElement',
    category: 'Animations',
    filePath: 'packages/ui/src/components/animations/RevealElement.tsx',
    description: 'Stagger-reveals children when the container scrolls into view.',
    renderable: true,
    preview: (
      <RevealElement>
        <span className='text-sm'>One</span>
        <span className='text-sm'>Two</span>
        <span className='text-sm'>Three</span>
      </RevealElement>
    ),
  },
  {
    id: 'shimmer-text',
    name: 'ShimmerText',
    category: 'Animations',
    filePath: 'packages/ui/src/components/animations/ShimmerText.tsx',
    description: 'Animated gradient shimmer over a text label.',
    renderable: true,
    preview: <ShimmerText text='Loading something amazing…' />,
  },
  {
    id: 'stagger-text',
    name: 'StaggerText',
    category: 'Animations',
    filePath: 'packages/ui/src/components/animations/StaggerText.tsx',
    description: 'Reveals letters one-by-one on mount.',
    renderable: true,
    preview: <StaggerText text='Welcome to the design system' className='text-sm' />,
  },

  // Animated Icons
  {
    id: 'animated-dot',
    name: 'AnimatedDot',
    category: 'Animated Icons',
    filePath: 'packages/ui/src/components/ui/animated-dot.tsx',
    description: 'Pulsing dot indicator. Toggle showAnimation to switch states.',
    renderable: true,
    preview: (
      <div className='flex items-center gap-3'>
        <AnimatedDot showAnimation /> <span className='text-xs'>animating</span>
        <AnimatedDot showAnimation={false} /> <span className='text-xs'>idle</span>
      </div>
    ),
  },
  {
    id: 'animated-terminal-icon',
    name: 'AnimatedTerminalIcon',
    category: 'Animated Icons',
    filePath: 'packages/ui/src/components/ui/animated-terminal-icon.tsx',
    description: 'Terminal icon with cycle animation.',
    renderable: true,
    preview: <AnimatedTerminalIcon showAnimation />,
  },
  {
    id: 'arrow-down-icon',
    name: 'ArrowDownIcon',
    category: 'Animated Icons',
    filePath: 'packages/ui/src/components/ui/arrow-down.tsx',
    description: 'Hover-animated down arrow icon.',
    renderable: true,
    preview: <ArrowDownIcon />,
  },
  {
    id: 'book-text-icon',
    name: 'BookTextIcon',
    category: 'Animated Icons',
    filePath: 'packages/ui/src/components/ui/book-text.tsx',
    description: 'Hover-animated book icon with text lines.',
    renderable: true,
    preview: <BookTextIcon />,
  },
  {
    id: 'home-icon',
    name: 'HomeIcon',
    category: 'Animated Icons',
    filePath: 'packages/ui/src/components/ui/home.tsx',
    description: 'Animated home icon.',
    renderable: true,
    preview: <HomeIcon />,
  },
  {
    id: 'route-icon',
    name: 'RouteIcon',
    category: 'Animated Icons',
    filePath: 'packages/ui/src/components/ui/route-icon.tsx',
    description: 'Animated route / path icon.',
    renderable: true,
    preview: <RouteIcon />,
  },
  {
    id: 'settings-icon',
    name: 'SettingsIcon',
    category: 'Animated Icons',
    filePath: 'packages/ui/src/components/ui/settings.tsx',
    description: 'Animated gear icon.',
    renderable: true,
    preview: <SettingsIcon />,
  },
  {
    id: 'activity-icon',
    name: 'ActivityIcon',
    category: 'Animated Icons',
    filePath: 'packages/ui/src/components/ui/activity.tsx',
    description: 'Animated activity / pulse icon.',
    renderable: true,
    preview: <ActivityIcon />,
  },
  {
    id: 'layout-grid-icon',
    name: 'LayoutGridIcon',
    category: 'Animated Icons',
    filePath: 'packages/ui/src/components/ui/layout-grid.tsx',
    description: 'Animated 4-cell grid icon.',
    renderable: true,
    preview: <LayoutGridIcon />,
  },
  {
    id: 'book-icon',
    name: 'BookIcon',
    category: 'Animated Icons',
    filePath: 'packages/ui/src/components/ui/book.tsx',
    description: 'Animated book icon.',
    renderable: true,
    preview: <BookIcon />,
  },
  {
    id: 'agent-icon',
    name: 'AgentIcon',
    category: 'Animated Icons',
    filePath: 'packages/ui/src/components/ui/agent-icon.tsx',
    description: 'Animated agent avatar icon.',
    renderable: true,
    preview: <AgentIcon />,
  },
  {
    id: 'agent-nav-icon',
    name: 'AgentNavIcon',
    category: 'Animated Icons',
    filePath: 'packages/ui/src/components/ui/agent-nav-icon.tsx',
    description: 'Sidebar variant of the agent icon.',
    renderable: true,
    preview: <AgentNavIcon />,
  },
  {
    id: 'shapes-icon',
    name: 'ShapesIcon',
    category: 'Animated Icons',
    filePath: 'packages/ui/src/components/ui/shapes.tsx',
    description: 'Animated shapes icon.',
    renderable: true,
    preview: <ShapesIcon />,
  },
  {
    id: 'folder-open-icon',
    name: 'FolderOpenIcon',
    category: 'Animated Icons',
    filePath: 'packages/ui/src/components/ui/folder-open.tsx',
    description: 'Animated folder-open icon.',
    renderable: true,
    preview: <FolderOpenIcon />,
  },
  {
    id: 'message-square-icon',
    name: 'MessageSquareIcon',
    category: 'Animated Icons',
    filePath: 'packages/ui/src/components/ui/message-square.tsx',
    description: 'Animated chat-bubble icon.',
    renderable: true,
    preview: <MessageSquareIcon />,
  },
];
