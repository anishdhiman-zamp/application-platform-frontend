import { FC, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { API_ENDPOINTS } from 'apis/apiEndpoint.constants';
import { MapAny } from 'types/commonTypes';
import { FilterModelType } from 'types/components/table.type';
import CommonFilterTable from 'components/common/table/CommonFilterTable';
import { withFiltersContext } from 'components/filter/filters.context';

type AccountsListProps = {
  updateFiltersInParent?: (filters: MapAny) => void;
  updateFilterConfigInParent?: (filterConfig: MapAny[]) => void;
  parentSelectedFilters?: MapAny;
  fgacFilters?: FilterModelType;
  disableFilterActions?: boolean;
  gridStyle?: MapAny;
};

const AccountsList: FC<AccountsListProps> = ({
  updateFiltersInParent,
  updateFilterConfigInParent,
  parentSelectedFilters,
  fgacFilters,
  disableFilterActions,
  gridStyle,
}) => {
  const tableRef = useRef<AgGridReact>(null);

  return (
    <CommonFilterTable
      tableRef={tableRef}
      filterConfigUrl={API_ENDPOINTS.PAYMENTS_ACCOUNT_FILTER_CONFIG_GET}
      dataUrl={API_ENDPOINTS.PAYMENTS_ACCOUNTS_GET}
      id='payments-accounts'
      updateFiltersInParent={updateFiltersInParent}
      updateFilterConfigInParent={updateFilterConfigInParent}
      parentSelectedFilters={parentSelectedFilters}
      drilldownFilters={fgacFilters}
      disableFilterActions={disableFilterActions}
      gridStyle={gridStyle}
    />
  );
};

export default withFiltersContext(AccountsList);
