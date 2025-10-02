import { useMemo } from 'react';
import { toast } from '@zamp-platform/ui';
import { useWidgetCreationContext } from 'modules/widgets/create/context/WidgetCreationContext';
import { getWidgetLayout } from 'modules/widgets/create/utils';
import { WidgetSize } from 'modules/widgets/widget.types';
import { useParams, useSearchParams } from 'next/navigation';
import { useGetPagesQuery, useUpdateSheetLayoutMutation } from '@/apis/pages';
import { useCreateWidgetMutation, useUpdateWidgetMutation } from '@/apis/widgets';
import useWidgetResize from '@/modules/sheets/useWidgetResize';
import { LayoutType } from '@/types/api/pagesApi.types';
import { CreateWidgetDataMappingsType, CreateWidgetPayloadType, WIDGET_TYPES } from '@/types/api/widgets.types';
import { defaultFnType } from '@/types/commonTypes';

const useSubmitWidgetForm = (handleClose: defaultFnType) => {
  const params = useParams();
  const searchParams = useSearchParams();
  const pageId = params?.pageId as string;
  const sheetId = params?.sheetId as string;
  const layout = JSON.parse(searchParams?.get('layout') ?? '{}') as LayoutType;
  const size = searchParams?.get('size') as WidgetSize;

  const { formData, mockWidgetDetails, editWidgetInstanceId } = useWidgetCreationContext();
  const handleWidgetResize = useWidgetResize({ pageId, sheetId });

  const [createWidget, { isLoading }] = useCreateWidgetMutation();
  const [updateSheetLayout, { isLoading: isUpdatingSheetLayout }] = useUpdateSheetLayoutMutation();
  const [updateWidget, { isLoading: isUpdatingWidget }] = useUpdateWidgetMutation();
  const { data: pages } = useGetPagesQuery(undefined, {
    refetchOnMountOrArgChange: false,
    skip: !editWidgetInstanceId,
  });

  const sheetDetails = useMemo(() => {
    return pages?.find((page) => page.page_id === pageId)?.sheets?.find((sheet) => sheet.sheet_id === sheetId);
  }, [pages, pageId, sheetId]);

  const handleEditSuccess = () => {
    toast.success(`${formData.title} widget updated successfully`);
    handleClose();
  };

  const handleSubmit = () => {
    if (!formData.datasetId) return;
    const payload: CreateWidgetPayloadType = {
      sheet_id: sheetId,
      title: formData.title || 'New Widget',
      widget_type: formData.visualizationType,
      data_mappings: mockWidgetDetails?.data_mappings as CreateWidgetDataMappingsType,
    };

    const widgetLayout = getWidgetLayout({
      lastWidgetLayout: layout,
      size: formData.size,
      visualizationType: formData.visualizationType,
    });

    if (editWidgetInstanceId) {
      updateWidget({
        widget_instance_id: editWidgetInstanceId,
        sheet_id: sheetId,
        title: formData.title,
        widget_type: formData.visualizationType,
        data_mappings: JSON.stringify(mockWidgetDetails?.data_mappings ?? {}),
      })
        .unwrap()
        .then(() => {
          if (size !== formData.size && formData.visualizationType !== WIDGET_TYPES.KPI) {
            handleWidgetResize({
              widgetId: editWidgetInstanceId,
              size: formData.size,
              sheetLayout:
                sheetDetails?.sheet_config?.sheet_layout?.map((widget) => ({
                  i: widget.default_widget,
                  ...widget.layout,
                })) ?? [],
              sheetDetails,
            });
          }
          handleEditSuccess();
        })
        .catch(() => {
          toast.error(`Failed to update ${formData.title} widget`);
        });
    } else {
      createWidget(payload)
        .unwrap()
        .then((res) => {
          updateSheetLayout({
            pageId: pageId,
            sheetId: sheetId,
            body: [
              {
                layout: widgetLayout,
                widget_id: res.widget_instance_id,
              },
            ],
          })
            .unwrap()
            .then(() => {
              toast.success(`${formData.title} widget created successfully`);
              handleClose();
            })
            .catch(() => {
              toast.error(`Failed to create ${formData.title} widget`);
            });
        })
        .catch(() => {
          toast.error(`Failed to create ${formData.title} widget`);
        });
    }
  };

  return { handleSubmit, isSubmitting: isLoading || isUpdatingSheetLayout || isUpdatingWidget };
};

export default useSubmitWidgetForm;
