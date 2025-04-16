import React, { FC, useMemo, useState } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@zamp-platform/ui';
import { MOVE_MONEY_TYPE } from 'modules/payments/payments.types';
import TemplateCard from 'modules/payments/templates/components/TemplateCard';
import { TEMPLATE_LIST_TABS } from 'modules/payments/templates/templates.constant';
import { useRouter } from 'next/router';
import { defaultFnType } from 'types/commonTypes';
import { useGetTemplateListQuery } from '@/apis/payments';
import Input from '@/components/common/input';
import CommonWrapper from '@/components/commonWrapper';
import SvgSpriteLoader from '@/components/SvgSpriteLoader';
import { ROUTES_PATH } from '@/constants/routeConfig';
import { TemplateDetailsType } from '@/types/api/paymentApi.types';
import { SIZE_TYPES } from '@/types/common/components';
import SideDrawer from 'components/common/SideDrawer/SideDrawer';
import { SIDE_DRAWER_TYPES } from 'components/common/SideDrawer/sideDrawer.types';

type TemplateListSideDrawerProps = {
  onClose: defaultFnType;
  isOpen: boolean;
  onTemplateClick: (paymentType: MOVE_MONEY_TYPE) => void;
};

const TemplateListSideDrawer: FC<TemplateListSideDrawerProps> = ({ onClose, isOpen, onTemplateClick }) => {
  const router = useRouter();
  const [currentTab, setCurrentTab] = useState<string>(TEMPLATE_LIST_TABS[0].value);
  const [search, setSearch] = useState<string>('');

  const { data: templateList, isLoading, isError } = useGetTemplateListQuery();

  const handleTabSelect = (value: string) => {
    if (value) setCurrentTab(value);
  };

  const templates = useMemo(() => {
    const currentTypeTemplates = templateList?.templates.filter((template) => template.type === currentTab);

    if (!search.length) return currentTypeTemplates;

    return currentTypeTemplates?.filter((template) => template.name.toLowerCase().includes(search.toLowerCase()));
  }, [currentTab, templateList, search]);

  const handleTemplateSendClick = (template: TemplateDetailsType) => {
    router.push(`${ROUTES_PATH.MONEY_TRANSFER}?type=${template.type}&templateId=${template.id}`);
  };

  return (
    <SideDrawer
      id='payment-templates-sidebar'
      isOpen={isOpen}
      size={SIZE_TYPES.LARGE}
      onClose={onClose}
      hideCloseButton
      type={SIDE_DRAWER_TYPES.SECONDARY}
      className='h-screen overflow-hidden'
      childrenWrapperClassName='!p-0 overflow-y-hidden'
    >
      <div>
        <div className='border-b border-GRAY_400 pt-6 pl-6 pr-4 pb-1.5'>
          <div className='f-16-600 mb-4.5'>Templates</div>
          <div className='flex flex-col gap-3'>
            <Tabs onValueChange={handleTabSelect} className='' defaultValue={currentTab}>
              <TabsList className='grid w-full grid-cols-2'>
                {TEMPLATE_LIST_TABS.map((tab, idx) => (
                  <TabsTrigger key={idx} value={tab.value}>
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            <Input
              type='text'
              placeholder='Search...'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              inputClassName='!border-none !px-0 focus:outline-none'
              focusClassNames=''
            />
            <div
              className='flex items-center cursor-pointer f-12-500 gap-2 px py-1.5'
              onClick={() => onTemplateClick(currentTab as MOVE_MONEY_TYPE)}
            >
              <SvgSpriteLoader id='plus' size={14} />
              Create Template
            </div>
          </div>
        </div>
        <div className='px-4.5 py-2 h-[calc(100vh-220px)] overflow-y-auto'>
          <CommonWrapper
            isNoData={!templates?.length}
            isLoading={isLoading}
            isError={isError}
            noDataBanner={<div className='tw-text-GRAY_900 f-12-500 px-2.5 py-2'>No templates found</div>}
          >
            {templates?.map((template, index) => (
              <TemplateCard key={index} template={template} handleSendClick={() => handleTemplateSendClick(template)} />
            ))}
          </CommonWrapper>
        </div>
      </div>
    </SideDrawer>
  );
};

export default TemplateListSideDrawer;
