import React, { useMemo } from 'react';
import { ICellRendererParams } from 'ag-grid-community';
import TagChip from 'components/common/table/CustomCellEditors/CustomTagEditor/TagChip';
import { getTagLabel } from 'components/filter/filter.utils';

const CustomTagRenderer = (props: ICellRendererParams) => {
  const { value } = props;

  const tag = useMemo(() => getTagLabel(value), [value]);

  return tag ? <TagChip item={tag} /> : <></>;
};

export default CustomTagRenderer;
