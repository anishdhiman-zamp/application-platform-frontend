import React, { FC, useMemo, useState } from 'react';
import { TEMPLATES } from 'modules/payments/move-money/move-money.dummy';
import { MOVE_MONEY_TYPE } from 'modules/payments/payments.types';
import TemplateCard from 'modules/payments/templates/components/TemplateCard';
import { TEMPLATE_LIST_TABS } from 'modules/payments/templates/templates.constant';
import { defaultFnType } from 'types/commonTypes';
import Input from '@/components/common/input';
import { Tabs } from '@/components/common/tabs/Tabs';
import SvgSpriteLoader from '@/components/SvgSpriteLoader';
import { MenuItem, SIZE_TYPES, TAB_TYPES } from '@/types/common/components';
import SideDrawer from 'components/common/SideDrawer/SideDrawer';
import { SIDE_DRAWER_TYPES } from 'components/common/SideDrawer/sideDrawer.types';

type TemplateListSideDrawerProps = {
  onClose: defaultFnType;
  isOpen: boolean;
  onTemplateClick: (paymentType: MOVE_MONEY_TYPE) => void;
};

const TemplateListSideDrawer: FC<TemplateListSideDrawerProps> = ({ onClose, isOpen, onTemplateClick }) => {
  const [currentTab, setCurrentTab] = useState<MenuItem>(TEMPLATE_LIST_TABS[0]);
  const [search, setSearch] = useState<string>('');

  const handleTabSelect = (option?: MenuItem) => {
    if (option) setCurrentTab(option);
  };

  const templates = useMemo(() => {
    return TEMPLATES.filter((template) => template.type === currentTab.value);
  }, [currentTab]);

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
            <Tabs
              list={TEMPLATE_LIST_TABS}
              onSelect={handleTabSelect}
              wrapperStyle='border-white !w-auto'
              tabItemWrapperStyle='!w-auto'
              scrollWrapperClassName='pb-0'
              id='PAYMENT_TEMPLATES_TABS'
              type={TAB_TYPES.OUTLINE}
            />
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
              onClick={() => onTemplateClick(currentTab.value as MOVE_MONEY_TYPE)}
            >
              <SvgSpriteLoader id='plus' size={14} />
              Create Template
            </div>
          </div>
        </div>
        <div className='px-4.5 py-2 h-[calc(100vh-220px)] overflow-y-auto'>
          <div>
            {templates.map((template, index) => (
              <TemplateCard key={index} title={template.name} source={[template?.source, template?.destination]} />
            ))}
          </div>
        </div>
      </div>
    </SideDrawer>
  );
};

export default TemplateListSideDrawer;
