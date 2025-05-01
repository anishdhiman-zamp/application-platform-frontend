import React, { FC, useMemo, useState } from 'react';
import { Sheet, SheetContent } from '@zamp-platform/ui';
import TemplateFilter from 'modules/payments/move-money/components/TemplateFilter';
import { MOVE_MONEY_TEMPLATE_FILTER_ITEMS } from 'modules/payments/payments.constant';
import { MOVE_MONEY_TYPE } from 'modules/payments/payments.types';
import RecipientCardSkeleton from 'modules/payments/recipients/components/RecipientCardSkeleton';
import CreateTemplatePopover from 'modules/payments/templates/components/CreateTemplatePopover';
import TemplateCard from 'modules/payments/templates/components/TemplateCard';
import { TEMPLATE_LIST_TABS } from 'modules/payments/templates/templates.constant';
import { useRouter } from 'next/router';
import { defaultFnType } from 'types/commonTypes';
import { useGetTemplateListQuery } from '@/apis/payments';
import Input from '@/components/common/input';
import TabsV2 from '@/components/common/tabs/TabsV2';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import SvgSpriteLoader from '@/components/SvgSpriteLoader';
import { ROUTES_PATH } from '@/constants/routeConfig';
import { TemplateDetailsType } from '@/types/api/paymentApi.types';
import { MenuItem } from '@/types/common/components';

type TemplateListSideDrawerProps = {
  onClose: defaultFnType;
  isOpen: boolean;
};

const TemplateListSideDrawer: FC<TemplateListSideDrawerProps> = ({ onClose, isOpen }) => {
  const router = useRouter();
  const [currentTab, setCurrentTab] = useState<string>(TEMPLATE_LIST_TABS[0].value);
  const [search, setSearch] = useState<string>('');
  const [createTemplateType, setCreateTemplateType] = useState<MOVE_MONEY_TYPE | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<MenuItem>(MOVE_MONEY_TEMPLATE_FILTER_ITEMS[0]);

  const { data: templateList, isLoading, isError } = useGetTemplateListQuery();

  const handleTabSelect = (value: string) => {
    if (value) setCurrentTab(value);
  };

  const templates = useMemo(() => {
    const currentTypeTemplates = templateList?.templates?.filter(
      (template) =>
        template?.type === currentTab &&
        (selectedFilter?.value !== 'all' ? template?.status === selectedFilter?.value : true),
    );

    if (!search.length) return currentTypeTemplates;

    return currentTypeTemplates?.filter((template) => template?.name?.toLowerCase()?.includes(search?.toLowerCase()));
  }, [currentTab, templateList, search, selectedFilter]);

  const handleTemplateSendClick = (template: TemplateDetailsType) => {
    router.push(`${ROUTES_PATH.MONEY_TRANSFER}?type=${template?.type}&templateId=${template?.id}`);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent size='large' tabIndex={-1} className='p-0 h-screen overflow-hidden'>
        <div className='overflow-y-scroll h-full' tabIndex={-1}>
          <div>
            <div className='border-b border-GRAY_400 pt-6 pl-6 pr-4 pb-1.5'>
              <div className='f-16-600 mb-4.5'>Templates</div>
              <div className='flex flex-col gap-3'>
                <TabsV2
                  tabsList={TEMPLATE_LIST_TABS}
                  currentTab={currentTab}
                  onValueChange={handleTabSelect}
                  contentClassName='max-h-[314px] overflow-y-scroll f-12-450 !mt-0'
                  listClassName='grid w-full grid-cols-2 mx-auto'
                  triggerClassName='!mt-0'
                />
                <Input
                  type='text'
                  placeholder='Search...'
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  overrideInputBgClassName='!border-none !px-2 focus:outline-none !py-0 !h-6 placeholder:!text-GRAY_500'
                  focusClassNames=''
                  tabIndex={createTemplateType ? -1 : 0}
                />
                <div className='flex justify-between'>
                  <div
                    className='flex items-center cursor-pointer f-12-500 gap-2 px py-1.5'
                    onClick={() => setCreateTemplateType(currentTab as MOVE_MONEY_TYPE)}
                  >
                    <SvgSpriteLoader id='plus' size={14} />
                    Create Template
                  </div>
                  <TemplateFilter selectedFilter={selectedFilter} setSelectedFilter={setSelectedFilter} />
                </div>
              </div>
            </div>
            <div className='px-4.5 py-2 h-[calc(100vh-220px)] overflow-y-auto'>
              <CommonWrapper
                isNoData={!templates?.length}
                isLoading={isLoading}
                isError={isError}
                noDataBanner={<div className='text-GRAY_500 f-12-450 px-2.5 py-2'>No templates found</div>}
                skeletonType={SkeletonTypes.CUSTOM}
                loader={<RecipientCardSkeleton className='mb-4' />}
              >
                {templates?.map((template, index) => (
                  <TemplateCard
                    key={index}
                    template={template}
                    handleSendClick={() => handleTemplateSendClick(template)}
                  />
                ))}
              </CommonWrapper>
            </div>
          </div>
          {!!createTemplateType && (
            <CreateTemplatePopover
              paymentType={createTemplateType}
              isOpen={!!createTemplateType}
              onClose={() => setCreateTemplateType(null)}
            />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default TemplateListSideDrawer;
