import React, { FC } from 'react';
import { Label } from 'components/common/Label';
import { getTagLabel, getTagParents } from 'components/filter/filter.utils';
import MultiSelectFilterMenuItem from 'components/filter/filterMenu/MultiSelectFilterMenuItem';

interface TagsProps {
  column: { colId: string };
  values: string[];
  className?: string;
}

const Tags: FC<TagsProps> = ({ column, values, className }) => {
  return (
    <MultiSelectFilterMenuItem
      column={column}
      values={values}
      className={className}
      LabelComponent={(item: string) => (
        <Label
          title={getTagLabel(item)}
          description={getTagParents(item)}
          titleClassName='f-11-400 py-1 px-1.5 bg-GRAY_100 rounded-md mb-1 w-fit'
          descriptionClassName='f-11-400 text-GRAY_700 ml-1'
        />
      )}
    />
  );
};

export default Tags;
