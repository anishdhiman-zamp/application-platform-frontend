import { FC, useState } from 'react';
import { ICON_SPRITE_TYPES } from 'constants/icons';
import { ROUTES_PATH } from 'constants/routeConfig';
import Properties from 'modules/data/RowProperties/Properties';
import { ROW_PROPERTIES_TABS } from 'modules/data/RowProperties/rowProperties.constants';
import { ROW_PROPERTIES_TABS_TYPES } from 'modules/data/RowProperties/rowProperties.types';
import Rules from 'modules/data/RowProperties/Rules';
import { useRouter } from 'next/router';
import { MenuItem, SIZE_TYPES, TAB_TYPES } from 'types/common/components';
import { defaultFnType, MapAny } from 'types/commonTypes';
import { BUTTON_TYPES, ICON_POSITION_TYPES } from 'types/components/button.type';
import { Button } from 'components/common/button/Button';
import SideDrawer from 'components/common/SideDrawer/SideDrawer';
import { Tabs } from 'components/common/tabs/Tabs';

type RowPropertiesSideDrawerProps = {
  onClose: defaultFnType;
  data: MapAny;
  datasetId: string;
  isDrillDownEnabled?: boolean;
};

const RowProperties: FC<RowPropertiesSideDrawerProps> = ({ onClose, data, datasetId, isDrillDownEnabled = false }) => {
  const [selectedTab, setSelectedTab] = useState<ROW_PROPERTIES_TABS_TYPES>(ROW_PROPERTIES_TABS_TYPES.PROPERTIES);
  const router = useRouter();

  const handleSourceDrillDownClick = () => {
    router.push(ROUTES_PATH.DRILLDOWN.replace(':datasetId', datasetId).replace(':rowId', data?._zamp_id as string));
  };

  const handleTabChange = (item?: MenuItem) => {
    setSelectedTab(item?.value as ROW_PROPERTIES_TABS_TYPES);
  };

  const getTabContent = () => {
    switch (selectedTab) {
      case ROW_PROPERTIES_TABS_TYPES.PROPERTIES:
        return <Properties data={data} />;
      case ROW_PROPERTIES_TABS_TYPES.RULES:
        return <Rules />;
    }
  };

  return (
    <SideDrawer
      isOpen
      id='row-properties-side-drawer'
      onClose={onClose}
      hideCloseButton
      headerClassName='!p-6'
      topBar={
        <div className='flex items-center justify-between flex-1'>
          <Tabs
            id='row-properties-tabs'
            list={ROW_PROPERTIES_TABS}
            type={TAB_TYPES.FILLED}
            onSelect={handleTabChange}
          />
          {isDrillDownEnabled && (
            <Button
              type={BUTTON_TYPES.SECONDARY}
              id='row-properties-source-drill-down-button'
              className='border-none !text-GRAY_900'
              iconProps={{
                id: 'arrow-up-left',
                iconCategory: ICON_SPRITE_TYPES.ARROWS,
                width: 12,
                height: 12,
              }}
              iconPosition={ICON_POSITION_TYPES.LEFT}
              size={SIZE_TYPES.XSMALL}
              onClick={handleSourceDrillDownClick}
            >
              Source drill down
            </Button>
          )}
        </div>
      }
    >
      {getTabContent()}
    </SideDrawer>
  );
};

export default RowProperties;
