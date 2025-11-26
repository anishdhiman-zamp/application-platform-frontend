'use client';
import CommonFilterTable from '@/components/common/table/CommonFilterTable';
import MoveMoneyButton from '@/deprecated/modules/payments/move-money/components/MoveMoneyButton';
import PaymentDetailsSideDrawer from '@/deprecated/modules/payments/payment-details/PaymentDetailsSideDrawer';
import RecipientsSideDrawer from '@/deprecated/modules/payments/recipients/RecipientsSidedrawer';
import TemplateListSideDrawer from '@/deprecated/modules/payments/templates/TemplateListSideDrawer';
import { useResourceAccess } from '@/hooks/useResourceAccess';
import { RowClickedEvent } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { API_ENDPOINTS } from 'apis/apiEndpoint.constants';
import TooltipButton from 'components/common/button/TooltipButton';
import DisplayOptions from 'components/common/table/DisplayOptions';
import { TooltipPositions } from 'components/common/tooltip';
import { withFiltersContext } from 'components/filter/filters.context';
import { COLORS } from 'constants/colors';
import TableSchemaAlignmentStatus from 'modules/data/components/importDataset/TableSchemaAlignmentStatus';
import { LOADER_STATUS } from 'modules/data/data.types';
import { PAYMENT_ACCESS_PRIVILEGES, ResourceType } from 'modules/shareResource/shareResource.types';
import { FC, useRef, useState } from 'react';
import { SIZE_TYPES } from 'types/common/components';

type PaymentsListProps = {
  id: string;
};

const PaymentsList: FC<PaymentsListProps> = ({ id }) => {
  const tableRef = useRef<AgGridReact>(null);

  const { checkUserPrivilege } = useResourceAccess({
    resourceType: ResourceType.PAYMENTS,
    resourceId: id,
  });
  const [isRecipientsSideDrawerOpen, setIsRecipientsSideDrawerOpen] = useState<boolean>(false);
  const [isPaymentTemplatesSideDrawerOpen, setIsPaymentTemplatesSideDrawerOpen] = useState<boolean>(false);
  const [paymentDetailsId, setPaymentDetailsId] = useState<string>('');
  const [showAiTransformationStatus, setShowAiTransformationStatus] = useState<{
    open: boolean;
    status: string;
    title: string;
    description: string;
  }>({
    open: false,
    status: LOADER_STATUS.LOADING,
    title: '',
    description: '',
  });

  const handleRowClicked = (event: RowClickedEvent) => {
    setPaymentDetailsId(event?.data?.payment_id);
    tableRef.current?.api?.clearFocusedCell();
  };

  return (
    <>
      <CommonFilterTable
        id={id}
        handleRowClicked={handleRowClicked}
        tableRef={tableRef}
        cellClass='py-0!'
        filterConfigUrl={API_ENDPOINTS.PAYMENT_LIST_FILTER_CONFIG_GET}
        dataUrl={API_ENDPOINTS.PAYMENT_LIST_GET}
        actionElements={
          <div className='relative flex items-center gap-3'>
            <TooltipButton
              id='export-dataset'
              onClick={() => setIsRecipientsSideDrawerOpen(true)}
              tooltipBody='Recipients'
              className='border-none'
              tooltipClassName='z-1000!'
              tooltipColor={COLORS.BLACK}
              buttonSize={SIZE_TYPES.XSMALL}
              tooltipPosition={TooltipPositions.TOP}
              buttonIcon={{
                id: 'user-up-01',
                size: 14,
              }}
            />
            <TooltipButton
              id='payment-templates'
              onClick={() => setIsPaymentTemplatesSideDrawerOpen(true)}
              tooltipBody='Payment Templates'
              className='z-1000! border-none'
              tooltipClassName='z-1000!'
              tooltipColor={COLORS.BLACK}
              buttonSize={SIZE_TYPES.XSMALL}
              tooltipPosition={TooltipPositions.TOP}
              buttonIcon={{
                id: 'file-05',
                size: 14,
              }}
            />

            <TableSchemaAlignmentStatus
              showAiTransformationStatus={showAiTransformationStatus}
              setShowAiTransformationStatus={setShowAiTransformationStatus}
            />
            <DisplayOptions tableRef={tableRef} datasetId={id as string} />

            {(checkUserPrivilege(PAYMENT_ACCESS_PRIVILEGES.ADMIN) ||
              checkUserPrivilege(PAYMENT_ACCESS_PRIVILEGES.INITIATOR)) && <MoveMoneyButton />}
          </div>
        }
      />

      {isRecipientsSideDrawerOpen && (
        <RecipientsSideDrawer isOpen={isRecipientsSideDrawerOpen} onClose={setIsRecipientsSideDrawerOpen} />
      )}
      {isPaymentTemplatesSideDrawerOpen && (
        <TemplateListSideDrawer
          isOpen={isPaymentTemplatesSideDrawerOpen}
          onClose={() => setIsPaymentTemplatesSideDrawerOpen(false)}
        />
      )}
      {paymentDetailsId && (
        <PaymentDetailsSideDrawer paymentDetailsId={paymentDetailsId} onClose={() => setPaymentDetailsId('')} />
      )}
    </>
  );
};

export default withFiltersContext(PaymentsList);
