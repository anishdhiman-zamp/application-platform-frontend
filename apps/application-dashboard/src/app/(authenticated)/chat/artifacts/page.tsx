'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Input, Tabs, TabsContent } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { motion } from 'framer-motion';
import { FileText, Table2 } from 'lucide-react';

type ArtifactType = 'page' | 'dataset';

interface ArtifactUser {
  name: string;
  color: string;
}

interface Artifact {
  id: string;
  name: string;
  type: ArtifactType;
  updatedAt: string;
  users: ArtifactUser[];
}

// Dummy data
const DUMMY_ARTIFACTS: Artifact[] = [
  {
    id: '1',
    name: 'Pace rebrand',
    type: 'page',
    updatedAt: '23 mins ago',
    users: [
      { name: 'Sarah', color: '#FFD6D6' },
      { name: 'Victor', color: '#FFE4B8' },
      { name: 'John', color: '#B8D4FF' },
    ],
  },
  {
    id: '2',
    name: 'Recon dashboard',
    type: 'page',
    updatedAt: '23 mins ago',
    users: [{ name: 'John', color: '#B8D4FF' }],
  },
  {
    id: '3',
    name: 'HSBC Transactions',
    type: 'dataset',
    updatedAt: '23 mins ago',
    users: [{ name: 'Oliver', color: '#E8E8E8' }],
  },
  {
    id: '4',
    name: 'Pace rebrand',
    type: 'page',
    updatedAt: '23 mins ago',
    users: [{ name: 'Sarah', color: '#FFD6D6' }],
  },
  {
    id: '5',
    name: 'Recon dashboard',
    type: 'page',
    updatedAt: '23 mins ago',
    users: [{ name: 'John', color: '#B8D4FF' }],
  },
  {
    id: '6',
    name: 'HSBC Transactions',
    type: 'dataset',
    updatedAt: '23 mins ago',
    users: [{ name: 'Victor', color: '#FFE4B8' }],
  },
  {
    id: '7',
    name: 'Pace rebrand',
    type: 'page',
    updatedAt: '23 mins ago',
    users: [{ name: 'Sarah', color: '#FFD6D6' }],
  },
  {
    id: '8',
    name: 'Recon dashboard',
    type: 'page',
    updatedAt: '23 mins ago',
    users: [{ name: 'John', color: '#B8D4FF' }],
  },
];

const ArtifactIcon = ({ type }: { type: ArtifactType }) => {
  if (type === 'page') {
    return <FileText size={16} className='text-GRAY_900' />;
  }

  return <Table2 size={16} className='text-GRAY_900' />;
};

const ArtifactItem = ({ artifact }: { artifact: Artifact }) => {
  return (
    <div className='hover:bg-BG_GRAY_2 flex cursor-pointer items-center justify-between rounded-md p-3'>
      <div className='flex items-center gap-x-2.5'>
        <div className='border-GRAY_400 flex h-8 w-8 items-center justify-center rounded-md border p-2'>
          <ArtifactIcon type={artifact.type} />
        </div>
        <div className='flex flex-col'>
          <span className='f-13-500 text-GRAY_1000'>{artifact.name}</span>
          <span className='f-10-400 text-GRAY_700'>{artifact.updatedAt}</span>
        </div>
      </div>
    </div>
  );
};

const TABS = [
  { id: 'all', label: 'All', icon: null },
  { id: 'pages', label: 'Pages', icon: FileText },
  { id: 'datasets', label: 'Datasets', icon: Table2 },
];

const ArtifactsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const tabRefs = useRef<Map<string, HTMLSpanElement>>(new Map());
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  useEffect(() => {
    const activeTabElement = tabRefs.current.get(activeTab);

    if (activeTabElement) {
      setIndicatorStyle({
        left: activeTabElement.offsetLeft,
        width: activeTabElement.offsetWidth,
      });
    }
  }, [activeTab]);

  const filteredArtifacts = useMemo(() => {
    let artifacts = DUMMY_ARTIFACTS;

    // Filter by search query
    if (searchQuery) {
      artifacts = artifacts.filter((artifact) => artifact.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    // Filter by tab
    if (activeTab === 'pages') {
      artifacts = artifacts.filter((artifact) => artifact.type === 'page');
    } else if (activeTab === 'datasets') {
      artifacts = artifacts.filter((artifact) => artifact.type === 'dataset');
    }

    return artifacts;
  }, [searchQuery, activeTab]);

  const pages = useMemo(() => filteredArtifacts.filter((a) => a.type === 'page'), [filteredArtifacts]);

  const datasets = useMemo(() => filteredArtifacts.filter((a) => a.type === 'dataset'), [filteredArtifacts]);

  return (
    <div className='mx-auto flex h-full w-full max-w-[700px] flex-col gap-y-8 overflow-hidden px-6 pt-15'>
      <h1 className='f-20-500 text-GRAY_1000 shrink-0'>Artifacts</h1>
      <Input
        placeholder='Search'
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className='f-12-450 placeholder:text-GRAY_500 h-8 p-3'
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className='flex min-h-0 w-full flex-1 flex-col'>
        <div className='relative mb-4 flex shrink-0 items-center gap-x-3'>
          <motion.div
            className='bg-GRAY_100 absolute h-full rounded-md'
            initial={false}
            animate={{
              left: indicatorStyle.left,
              width: indicatorStyle.width,
            }}
            transition={{
              type: 'spring',
              stiffness: 500,
              damping: 35,
            }}
          />
          {TABS.map((tab) => (
            <span
              key={tab.id}
              ref={(el) => {
                if (el) tabRefs.current.set(tab.id, el);
              }}
            >
              <Button
                onClick={() => setActiveTab(tab.id)}
                variant='ghost'
                leadingIcon={tab.icon ? <tab.icon size={12} /> : undefined}
                className={cn(
                  'relative z-10 flex h-6 items-center justify-center rounded border-none bg-transparent px-2 py-1 hover:bg-transparent',
                  activeTab === tab.id ? 'text-GRAY_1000' : 'text-GRAY_700 hover:text-GRAY_900',
                  'f-12-500',
                )}
              >
                {tab.label}
              </Button>
            </span>
          ))}
        </div>

        <TabsContent value='all' className='flex-1 overflow-y-auto [scrollbar-width:thin]'>
          {pages.map((artifact) => (
            <ArtifactItem key={artifact.id} artifact={artifact} />
          ))}
          {datasets.map((artifact) => (
            <ArtifactItem key={artifact.id} artifact={artifact} />
          ))}
        </TabsContent>

        <TabsContent value='pages' className='flex-1 overflow-y-auto [scrollbar-width:thin]'>
          {pages.map((artifact) => (
            <ArtifactItem key={artifact.id} artifact={artifact} />
          ))}
        </TabsContent>

        <TabsContent value='datasets' className='flex-1 overflow-y-auto [scrollbar-width:thin]'>
          {datasets.map((artifact) => (
            <ArtifactItem key={artifact.id} artifact={artifact} />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ArtifactsPage;
