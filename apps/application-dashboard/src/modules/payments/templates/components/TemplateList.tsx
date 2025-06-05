import { type FC, useMemo } from 'react';
import { useState } from 'react';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import TemplateFilter from 'modules/payments/move-money/components/TemplateFilter';
import { MOVE_MONEY_TEMPLATE_FILTER_ITEMS } from 'modules/payments/payments.constant';
import { type MOVE_MONEY_TYPE, TEMPLATE_STATUS_TYPES } from 'modules/payments/payments.types';
import RecipientCardSkeleton from 'modules/payments/recipients/components/RecipientCardSkeleton';
import CreateTemplatePopover from 'modules/payments/templates/components/CreateTemplatePopover';
import TemplateCard from 'modules/payments/templates/components/TemplateCard';
import { TEMPLATE_LIST_TABS } from 'modules/payments/templates/templates.constant';
import { useRouter } from 'next/navigation';
import { useGetTemplateListQuery } from '@/apis/payments';
import Input from '@/components/common/input';
import TabsV2 from '@/components/common/tabs/TabsV2';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import { ROUTES_PATH } from '@/constants/routeConfig';
import type { TemplateDetailsType } from '@/types/api/paymentApi.types';
import type { MenuItem } from '@/types/common/components';

type TemplateListProps = {
  onTemplateClick: (template: TemplateDetailsType) => void;
};

const TemplateList: FC<TemplateListProps> = ({ onTemplateClick }) => {
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
    const currentTypeTemplates = templateList?.templates?.filter((template) => {
      if (selectedFilter?.value === 'all') return template?.type === currentTab;
      if (selectedFilter?.value === TEMPLATE_STATUS_TYPES.DRAFTED)
        return template?.status === TEMPLATE_STATUS_TYPES.DRAFTED || template?.status === TEMPLATE_STATUS_TYPES.PENDING;

      return template?.type === currentTab && template?.status === selectedFilter?.value;
    });

    if (!search.length) return currentTypeTemplates;

    return currentTypeTemplates?.filter((template) => template?.name?.toLowerCase()?.includes(search?.toLowerCase()));
  }, [currentTab, templateList, search, selectedFilter]);

  const handleTemplateSendClick = (template: TemplateDetailsType) => {
    router.push(`${ROUTES_PATH.MONEY_TRANSFER}?type=${template?.type}&templateId=${template?.id}`);
  };

  return (
    <div className='h-full' tabIndex={-1}>
      <div>
        <div className='border-GRAY_400 border-b pt-6 pr-4 pb-1.5 pl-6'>
          <div className='f-16-600 mb-4.5'>Templates</div>
          <div className='flex flex-col gap-3'>
            <TabsV2
              tabsList={TEMPLATE_LIST_TABS}
              currentTab={currentTab}
              onValueChange={handleTabSelect}
              contentClassName='max-h-[314px] overflow-y-scroll f-12-450 mt-0!'
              listClassName='grid w-full grid-cols-2 mx-auto'
              triggerClassName='mt-0!'
            />
            <Input
              type='text'
              placeholder='Search...'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              overrideInputBgClassName='border-none! px-2! focus:outline-hidden py-0! h-6! placeholder:!text-GRAY_500'
              focusClassNames=''
              tabIndex={createTemplateType ? -1 : 0}
            />
            <div className='flex justify-between'>
              <div
                className='f-12-500 px flex cursor-pointer items-center gap-2 py-1.5'
                onClick={() => setCreateTemplateType(currentTab as MOVE_MONEY_TYPE)}
              >
                <SvgSpriteLoader id='plus' size={14} />
                Create Template
              </div>
              <TemplateFilter selectedFilter={selectedFilter} setSelectedFilter={setSelectedFilter} />
            </div>
          </div>
        </div>
        <div className='h-[calc(100vh-220px)] overflow-y-auto px-4.5 py-2'>
          <CommonWrapper
            isNoData={!templates?.length}
            isLoading={isLoading}
            isError={isError}
            noDataBanner={<div className='text-GRAY_500 f-12-450 px-2.5 py-2'>No templates found</div>}
            skeletonType={SkeletonTypes.CUSTOM}
            loader={<RecipientCardSkeleton className='mb-4' />}
          >
            {templates?.map((template) => (
              <TemplateCard
                key={template?.id}
                template={template}
                onSendClick={() => handleTemplateSendClick(template)}
                onTemplateClick={() => onTemplateClick(template)}
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
  );
};

export default TemplateList;
