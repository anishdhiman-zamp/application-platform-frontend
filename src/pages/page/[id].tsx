import React, { ReactElement, useMemo } from 'react';
import { useGetPageDetailsQuery, useGetSheetDetailsQuery, } from 'apis/pages';
import { getSheetIdFromPath } from 'modules/widgets/widgets.utils';
import WidgetsWrapper from 'modules/widgets/WidgetsWrapper';
import { useRouter } from 'next/router';
import { MenuItem, SIZE_TYPES } from 'types/common/components';
import { BUTTON_TYPES } from 'types/components/button.type';
import { LOCAL_STORAGE_KEYS, setToLocalStorage } from 'utils/localstorage';
import { Button } from 'components/common/button/Button';
import DashboardLayout from 'components/layouts/dashboard-layout';
import 'ag-charts-enterprise';

const Page = () => {
    const router = useRouter();
    const { id } = router.query;
    const { data: pageDetails } = useGetPageDetailsQuery(id as string, { skip: !id });
    const currentSheetId = useMemo(() => getSheetIdFromPath(router.asPath, id as string) ?? pageDetails?.sheets?.[0]?.sheet_id, [pageDetails, router.asPath]);
    const { data: sheetDetails } = useGetSheetDetailsQuery({ pageId: id as string, sheetId: currentSheetId as string }, { skip: !id || !currentSheetId, refetchOnMountOrArgChange: false });

    const tabs = useMemo(
        () =>
            pageDetails?.sheets?.map((sheet) => ({
                value: sheet.sheet_id,
                label: sheet.name,
            })) ?? [],
        [pageDetails],
    );

    const handleTabSelect = (selected?: MenuItem) => {
        if (!selected?.value) return;
        router.push(`#${selected?.value}`);
        setToLocalStorage(LOCAL_STORAGE_KEYS.DATA_SHEET_ID, JSON.stringify({ [id as string]: selected?.value }));
    };

    return (
        <div className='relative bg-white h-full rounded-tl-md py-6 px-8'>
            <div className='f-24-450 text-GRAY_950 mb-5.5'>{sheetDetails?.name}</div>
            <div className='grid grid-cols-2 gap-5'>
                {sheetDetails &&
                    sheetDetails?.widget_instances?.map((widget) => (
                        <div key={widget?.widget_instance_id}>
                            <WidgetsWrapper key={widget?.widget_instance_id} widgetDetails={widget} />
                        </div>
                    ))}
            </div>
            <div className='flex items-center absolute bottom-0 right-0 border-t border-border-GRAY_400 h-14 w-full bg-white shadow-pageBottomBar px-16 gap-3'>
                {
                    tabs?.map((tab) => (
                        <Button
                            key={tab?.value}
                            id='login'
                            onClick={() => handleTabSelect(tab)}
                            type={BUTTON_TYPES.SECONDARY}
                            className='w-fit !rounded-lg !bg-BG_GRAY_2'
                            size={SIZE_TYPES.MEDIUM}

                        >
                            <div className={` transition-all duration-100 ${currentSheetId === tab?.value ? 'f-13-600' : 'f-13-500'}`}>
                                {tab?.label}
                            </div>
                        </Button>
                    ))
                }
            </div>
        </div>
    );
};

Page.getLayout = function getLayout(page: ReactElement) {
    return (
        <div>
            <DashboardLayout>{page}</DashboardLayout>
        </div>
    );
};

export default Page;
