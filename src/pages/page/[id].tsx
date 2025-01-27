import React, { ReactElement, useMemo } from 'react';
import { useGetPageDetailsQuery } from 'apis/pages';
import Sheets from 'modules/sheets';
import SheetsTabs from 'modules/sheets/SheetsTabs';
import { getSheetIdFromPath } from 'modules/widgets/widgets.utils';
import { useRouter } from 'next/router';
import DashboardLayout from 'components/layouts/dashboard-layout';
import 'ag-charts-enterprise';

const Page = () => {
  const router = useRouter();
  const { id } = router.query;
  const { data: pageDetails } = useGetPageDetailsQuery(id as string, { skip: !id });
  const currentSheetId = useMemo(
    () => getSheetIdFromPath(router.asPath, id as string) ?? pageDetails?.sheets?.[0]?.sheet_id,
    [pageDetails, router.asPath],
  );

  const tabs = useMemo(
    () =>
      pageDetails?.sheets?.map((sheet) => ({
        value: sheet.sheet_id,
        label: sheet.name,
      })) ?? [],
    [pageDetails],
  );

  return (
    <div className='relative bg-white h-full rounded-tl-md py-6 px-8 overflow-y-auto pb-16'>
      <Sheets pageId={id as string} sheetId={currentSheetId as string} />
      <SheetsTabs tabs={tabs} currentSheetId={currentSheetId as string} />
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
