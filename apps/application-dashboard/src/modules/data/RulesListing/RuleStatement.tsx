import { FC } from 'react';

type RuleStatementProps = {
  index: number;
  filterStatement: React.JSX.Element;
  numberOfFilters: number;
};

const RuleStatement: FC<RuleStatementProps> = ({ index, filterStatement, numberOfFilters }) => {
  return (
    <>
      {filterStatement}
      {index !== numberOfFilters - 1 && <span className='text-GRAY_1000 h-fit py-1 pr-2 pl-1.5'>and</span>}
    </>
  );
};

export default RuleStatement;
