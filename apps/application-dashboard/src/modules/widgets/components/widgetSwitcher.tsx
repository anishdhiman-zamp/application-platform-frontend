import { FC, useMemo, useState } from 'react';
import { ResizeProps } from 'modules/widgets/widget.types';
import WidgetsWrapper from 'modules/widgets/WidgetsWrapper';
import { WidgetType } from 'types/api/pagesApi.types';
import { WidgetInstanceType } from 'types/api/widgets.types';
import { ResponsiveGridLayoutType } from '@/types/commonTypes';

interface WidgetSwitcherProps {
  widgetConfig: WidgetType;
  widgetInstances: WidgetInstanceType[];
  currency: string[];
  defaultCurrency: string;
  handleWidgetHeightChange: (height: number, isSingleHeader: boolean) => void;
  sheetId: string;
  isBff?: boolean;
  currentWidgetLayout?: ResponsiveGridLayoutType;
  resizeProps?: ResizeProps;
}

const WidgetSwitcher: FC<WidgetSwitcherProps> = ({
  widgetConfig,
  widgetInstances,
  currency,
  defaultCurrency,
  handleWidgetHeightChange,
  sheetId,
  isBff,
  currentWidgetLayout,
  resizeProps,
}) => {
  const [activeWidget, setActiveWidget] = useState<string>(widgetConfig?.default_widget);

  const onWidgetChange = (widgetId: string) => {
    setActiveWidget(widgetId);
  };

  const groupWidgetsOptions = useMemo(() => {
    return widgetInstances
      ?.filter((widget) => widgetConfig?.widget_group?.includes(widget.widget_instance_id))
      ?.map((widget) => ({ label: widget?.title, value: widget?.widget_instance_id }));
  }, [widgetInstances, widgetConfig]);

  const widgetDetails = useMemo(
    () => widgetInstances?.find((widget) => widget?.widget_instance_id === activeWidget),
    [widgetInstances, activeWidget],
  );

  return widgetDetails ? (
    <WidgetsWrapper
      widgetDetails={widgetDetails}
      groupWidgetsOptions={groupWidgetsOptions}
      onWidgetChange={onWidgetChange}
      currency={currency}
      defaultCurrency={defaultCurrency}
      activeWidget={activeWidget}
      setActiveWidget={setActiveWidget}
      handleWidgetHeightChange={handleWidgetHeightChange}
      sheetId={sheetId}
      isBff={isBff}
      currentWidgetLayout={currentWidgetLayout}
      resizeProps={resizeProps}
    />
  ) : (
    <div>No widget found</div>
  );
};

export default WidgetSwitcher;
