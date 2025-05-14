import { FC, ReactNode, useRef, useState } from 'react';
import { RowClickedEvent } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { COLORS } from 'constants/colors';
import TableSchemaAlignmentStatus from 'modules/data/components/importDataset/TableSchemaAlignmentStatus';
import { LOADER_STATUS } from 'modules/data/data.types';
import MoveMoneyButton from 'modules/payments/move-money/components/MoveMoneyButton';
import RecipientsSideDrawer from 'modules/payments/recipients/RecipientsSidedrawer';
import { useResourceAccess } from 'modules/shareResource/hooks/useResourceAccess';
import { PAYMENT_ACCESS_PRIVILEGES, ResourceType } from 'modules/shareResource/shareResource.types';
import { SIZE_TYPES } from 'types/common/components';
import CommonFilterTable from '@/components/common/table/CommonFilterTable';
import PaymentDetailsSideDrawer from '@/modules/payments/payment-details/PaymentDetailsSideDrawer';
import TemplateListSideDrawer from '@/modules/payments/templates/TemplateListSideDrawer';
import TooltipButton from 'components/common/button/TooltipButton';
import DisplayOptions from 'components/common/table/DisplayOptions';
import { TooltipPositions } from 'components/common/tooltip';
import { withFiltersContext } from 'components/filter/filters.context';

type PaymentsListProps = {
  id: string;
  zampIds?: string[];
  children?: ReactNode;
};

const PaymentsList: FC<PaymentsListProps> = ({ id, zampIds, children }) => {
  const tableRef = useRef<AgGridReact>(null);

  const { checkUserPrivilege } = useResourceAccess(ResourceType.PAYMENTS, '');
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
    <div className='flex'>
      <div className='flex-1'>
        <CommonFilterTable
          id={id}
          zampIds={zampIds}
          handleRowClicked={handleRowClicked}
          tableRef={tableRef}
          cellClass='!py-0'
          actionElements={
            <div className='relative flex items-center gap-3'>
              <TooltipButton
                id='export-dataset'
                onClick={() => setIsRecipientsSideDrawerOpen(true)}
                tooltipBody='Recipients'
                className='border-none'
                tooltipClassName='!z-1000'
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
                className='border-none !z-1000'
                tooltipClassName='!z-1000'
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
      </div>
      {children && <div className='w-1/3 border-l'>{children}</div>}
    </div>
  );
};

export default withFiltersContext(PaymentsList);
