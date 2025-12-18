import { Brain } from 'lucide-react';
import { type RecentItem, SectionType, type Skill } from '@/modules/macs/types';

// Mock recently visited items - replace with actual API data
export const MOCK_RECENT_ITEMS: RecentItem[] = [
  { id: '1', title: 'Daily Liquidity Summary', type: 'page', icon: 'FileText' },
  { id: '2', title: 'Cash Summary', type: 'dashboard', icon: 'LayoutDashboard' },
  { id: '3', title: 'Accounts Payable Report', type: 'report', icon: 'FileBarChart' },
];

// Mock skills data - replace with actual API data
export const MOCK_SKILLS: Skill[] = [
  {
    id: '1',
    name: 'ghost-blog-publisher',
    description:
      "Publish blog posts to Zamp Finance's Ghost blog. Primary use case is the Glossary workflow for creating AI term definitions with auto-generated icons. Use when user wants to (1) suggest new glossary terms, (2) write glossary definitions, (3) generate icons for glossary terms.",
    enabled: true,
    addedBy: 'you',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    name: 'qna',
    description:
      'Skill for answering questions about building and deploying processes on Zamp. Use when people ask about coder, accounts payable, extraction, onboarding, process guides, platform tools, or demos.',
    enabled: true,
    addedBy: 'you',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    name: 'book-saving',
    description:
      "Save books (PDFs, EPUB) to Cloudflare R2 storage by extracting content using Datalab's Marker API and generating browsable HTML with readable titles and permanent access links. EPUB files are automatically converted to PDF first using Calibre.",
    enabled: true,
    addedBy: 'you',
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    name: 'algorithmic-art',
    description:
      'Creating algorithmic art using p5.js with seeded randomness and interactive parameter exploration. Use this when users request creating art using code, generative art, algorithmic art, flow fields, or particle systems. Create original algorithmic art.',
    enabled: false,
    addedBy: 'anthropic',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '5',
    name: 'brand-guidelines',
    description:
      "Applies Anthropic's official brand colors and typography to any sort of artifact that may benefit from having Anthropic's look-and-feel. Use it when brand colors or style guidelines, visual formatting, or company design standards apply.",
    enabled: false,
    addedBy: 'anthropic',
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '6',
    name: 'canvas-design',
    description:
      'Create beautiful visual art in .png and .pdf documents using design philosophy. You should use this skill when the user asks to create a poster, piece of art, design, or other static piece. Create original visual designs, never copying existing artists.',
    enabled: false,
    addedBy: 'anthropic',
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const SECTION_ICONS: Record<SectionType, React.ComponentType<{ size?: number; className?: string }>> = {
  [SectionType.Skills]: Brain,
};
