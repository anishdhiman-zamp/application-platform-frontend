import { memo, useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from 'hooks/toolkit';
import { formatUrlFilters, parseDatasets } from 'modules/data/data.utils';
import DatasetById from 'modules/data/Dataset';
import { usePathname, useSearchParams } from 'next/navigation';
import { RootState } from 'store';
import { MenuItem, TAB_TYPES } from 'types/common/components';
import { addBreadcrumb, removeLastBreadcrumb, resetBreadcrumb } from '@/store/slices/layout-configs';
import { Tabs } from 'components/common/tabs/Tabs';

const DrilldownMultiDataset = ({ datasetIds }: { datasetIds: string }) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get the query string from searchParams
  const queryString = searchParams ? searchParams.toString() : '';

  // Reconstruct asPath
  const currentAsPath = `${pathname}${queryString ? '?' : ''}${queryString}`;
  const dispatch = useAppDispatch();
  const breadcrumbStack = useAppSelector((state: RootState) => state.layoutConfig.breadcrumbStack);

  const [selectedTab, setSelectedTab] = useState<string>();

  const datasetsArray = useMemo(
    () => parseDatasets(currentAsPath || '', datasetIds?.split(',')),
    [currentAsPath, datasetIds],
  );

  const tabs = useMemo(
    () =>
      datasetsArray.map((tab) => ({
        value: tab.id,
        label: tab.title,
      })) ?? [],
    [datasetsArray],
  );

  const currentTabIndex = useMemo(() => {
    return tabs.findIndex((val) => (val as MenuItem).value === selectedTab);
  }, [selectedTab, tabs]);

  const updateBreadcrumb = (label: string, isTabChange: boolean) => {
    const hasCommonValue = breadcrumbStack?.some((value) => tabs?.some((obj) => obj?.label === value?.title));

    if (isTabChange) {
      dispatch(removeLastBreadcrumb());
      dispatch(addBreadcrumb({ title: label }));
    } else if (!hasCommonValue) {
      dispatch(addBreadcrumb({ title: label }));
    } else {
      const newBreadcrumbStack = [...breadcrumbStack.slice(0, breadcrumbStack.length - 1)];

      dispatch(resetBreadcrumb(newBreadcrumbStack));
      dispatch(addBreadcrumb({ title: label }));
    }
  };

  const handleTabSelect = (selected?: MenuItem) => {
    if (!selected?.value || !selected.label) return;
    setSelectedTab(selected.value as string);
    updateBreadcrumb(selected.label, true);
  };

  useEffect(() => {
    if (tabs?.length > 0) {
      setSelectedTab(tabs[0].value as string);
      updateBreadcrumb(tabs[0].label as string, false);
    }
  }, [tabs]);

  return (
    <div className='h-full'>
      <div className='p-3 bg-BG_GRAY_2 border-b border-BORDER_GRAY_400 rounded-tl-xl'>
        {tabs?.length > 1 && (
          <Tabs
            list={tabs}
            id='drilldown-tabs'
            onSelect={handleTabSelect}
            customSelectedIndex={currentTabIndex >= 0 ? currentTabIndex : 0}
            type={TAB_TYPES.OUTLINE}
            tabItemSelectedStyle='bg-white'
          />
        )}
      </div>
      {selectedTab && (
        <DatasetById
          key={selectedTab}
          id={selectedTab}
          isDrilldown
          drilldownFilters={formatUrlFilters(
            JSON.stringify(datasetsArray.find((ds) => ds.id === selectedTab)?.filters),
          )}
        />
      )}
    </div>
  );
};

DrilldownMultiDataset.displayName = 'DrilldownMultiDataset';

export default memo(DrilldownMultiDataset);
