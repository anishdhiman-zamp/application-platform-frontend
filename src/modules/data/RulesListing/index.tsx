import { FC, useMemo, useState } from 'react';
import { useGetRulesByDatasetColumnsQuery } from 'apis/dataset';
import { DatasetColumnRequest } from 'modules/data/data.types';
import { convertApiFiltersToRuleFilters } from 'modules/data/data.utils';
import RuleCard, { RuleCardProps } from 'modules/data/RulesListing/RuleCard';
import { SIZE_TYPES } from 'types/common/components';
import { defaultFnType } from 'types/commonTypes';
import Input from 'components/common/input';
import SideDrawer from 'components/common/SideDrawer/SideDrawer';
import CommonWrapper from 'components/commonWrapper';
import { getTagLabel } from 'components/filter/filter.utils';

type RulesListingSideDrawerProps = {
  onClose: defaultFnType;
  datasetId: string;
  column: string;
};

const RulesListingSideDrawer: FC<RulesListingSideDrawerProps> = ({ onClose, datasetId, column }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data, isLoading, isError } = useGetRulesByDatasetColumnsQuery(
    {
      dataset_columns: JSON.stringify([{ dataset_id: datasetId, columns: [column] }] as DatasetColumnRequest[]),
    },
    { skip: !datasetId || !column },
  );

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const listOfFilters: RuleCardProps[] = useMemo(
    () =>
      data?.[datasetId]?.[column]?.map((rule) => {
        return {
          filters: convertApiFiltersToRuleFilters(rule?.filter_config?.query_config?.filters),
          value: rule?.value,
          createdOn: rule?.created_at,
        };
      }) ?? [],
    [data, datasetId, column],
  );

  return (
    <SideDrawer isOpen id='rules-listing-side-drawer' onClose={onClose} hideCloseButton>
      <div className='h-full px-2 pt-2'>
        <div className='f-16-600'>{column}</div>
        <Input
          placeholder='Search'
          size={SIZE_TYPES.XSMALL}
          noBorders
          focusClassNames='mt-6 mb-3.5 !px-0'
          onChange={handleSearch}
          value={searchTerm}
        />
        <CommonWrapper isLoading={isLoading} isError={isError}>
          <div className='space-y-3.5'>
            {listOfFilters?.map((filter, index) => (
              <RuleCard
                filters={filter?.filters}
                key={index}
                value={getTagLabel(filter?.value ?? '')}
                createdOn={filter?.createdOn}
              />
            ))}
          </div>
        </CommonWrapper>
      </div>
    </SideDrawer>
  );
};

export default RulesListingSideDrawer;
