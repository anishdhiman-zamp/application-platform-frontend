import { FC, useMemo } from 'react';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { useGetRulesByRuleIdsQuery } from 'apis/dataset';
import { RuleConfigType } from 'modules/data/RowProperties/rowProperties.types';
import RuleCard, { RuleCardProps } from 'modules/data/RulesListing/RuleCard';
import { cn } from 'utils/common';
import CommonWrapper from 'components/commonWrapper';

type RulesProps = {
  ruleConfigs: RuleConfigType[];
  selectedRuleId: string;
};

const Rules: FC<RulesProps> = ({ ruleConfigs, selectedRuleId }) => {
  const {
    data: rulesData,
    isLoading,
    isError,
  } = useGetRulesByRuleIdsQuery({ rule_ids: ruleConfigs.map((config) => config.id) }, { skip: !ruleConfigs?.length });

  const listOfFilters: RuleCardProps[] = useMemo(
    () =>
      rulesData?.map((rule) => {
        return {
          filters: rule?.filter_config?.query_config?.filters,
          value: rule?.value,
          createdOn: rule?.created_at,
          defaultExpanded: selectedRuleId === rule?.rule_id,
        };
      }) ?? [],
    [rulesData, selectedRuleId],
  );

  return (
    <CommonWrapper
      isLoading={isLoading}
      isError={isError}
      isNoData={!ruleConfigs?.length}
      className={cn({ 'h-full': !ruleConfigs?.length })}
      noDataBanner={
        <div className='text-GRAY_700 f-12-450 flex h-full items-center justify-center gap-2.5'>
          <SvgSpriteLoader id='lightning-01' width={24} height={24} />
          <div>No rules found</div>
        </div>
      }
    >
      <div className='space-y-3.5'>
        {listOfFilters?.map((filter, index) => (
          <RuleCard
            filters={filter?.filters}
            key={index}
            value={filter?.value}
            createdOn={filter?.createdOn}
            defaultExpanded={filter?.defaultExpanded}
            labelColor={ruleConfigs?.[index]?.tagColorMap?.[filter?.value ?? '']}
          />
        ))}
      </div>
    </CommonWrapper>
  );
};

export default Rules;
