import { FC, ReactNode } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@zamp-platform/ui';
import { MenuItem } from '@/types/common/components';

type TabsV2Props = {
  children?: ReactNode;
  onValueChange: (value: string) => void;
  tabsList: MenuItem[];
  currentTab: string;
  className?: string;
  listClassName?: string;
  contentClassName?: string;
  triggerClassName?: string;
};

const TabsV2: FC<TabsV2Props> = ({
  children,
  onValueChange,
  tabsList,
  currentTab,
  className,
  listClassName,
  contentClassName,
  triggerClassName,
}) => {
  return (
    <Tabs onValueChange={onValueChange} className={className} defaultValue={currentTab}>
      <TabsList className={listClassName}>
        {tabsList.map((tab, idx) => (
          <TabsTrigger key={idx} value={tab?.value as string} className={triggerClassName}>
            {tab?.label}
          </TabsTrigger>
        ))}
      </TabsList>
      <TabsContent className={contentClassName} value={currentTab}>
        {children}
      </TabsContent>
    </Tabs>
  );
};

export default TabsV2;
