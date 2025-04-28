import { useEffect } from 'react';

type FilterBuilderPropsType = {
  getData: () => void;
  getFilterConfig: () => void;
  data: any;
  isLoading: boolean;
  filterConfig: any;
};

export const FilterBuilder = (props: FilterBuilderPropsType) => {
  const { getData, getFilterConfig } = props;

  useEffect(() => {
    getData();
    getFilterConfig();
  }, []);

  // TODO

  return <div>FilterBuilder</div>;
};
