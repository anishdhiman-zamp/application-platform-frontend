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
  hideTabs?: boolean;
  tabIndex?: number;
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
  hideTabs,
  tabIndex = -1,
}) => {
  return (
    <Tabs onValueChange={onValueChange} className={className} defaultValue={currentTab} tabIndex={tabIndex}>
      {!hideTabs && (
        <TabsList tabIndex={tabIndex} className={listClassName}>
          {tabsList.map((tab, idx) => (
            <TabsTrigger
              tabIndex={tabIndex}
              key={idx}
              data-testid={`tabs-v2-trigger-${tab?.value}`}
              value={tab?.value as string}
              className={triggerClassName}
            >
              {tab?.label}
            </TabsTrigger>
          ))}
        </TabsList>
      )}
      <TabsContent tabIndex={tabIndex} className={contentClassName} value={currentTab}>
        {children}
      </TabsContent>
    </Tabs>
  );
};

export default TabsV2;
