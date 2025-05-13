import React, { FC } from 'react';
import { MapAny } from 'types/commonTypes';
import { Label } from 'components/common/Label';
import TagChip from 'components/common/table/CustomCellEditors/CustomTagEditor/TagChip';
import { getTagLabel, getTagParents, getValueString } from 'components/filter/filter.utils';
import MultiSelectFilterMenuItem, {
  MultiSelectFilterValue,
} from 'components/filter/filterMenu/MultiSelectFilterMenuItem';
import { TAGS_SELECT_FILTER_OPTIONS } from 'components/filter/filters.constants';

interface TagsProps {
  column: { colId: string };
  values: string[];
  className?: string;
  tagColorMap?: MapAny;
  label?: string;
  isDisabled?: boolean;
}

const Tags: FC<TagsProps> = ({ column, values, className, tagColorMap, label, isDisabled = false }) => {
  return (
    <MultiSelectFilterMenuItem
      column={column}
      values={values}
      className={className}
      operatorOptions={TAGS_SELECT_FILTER_OPTIONS}
      label={label}
      LabelComponent={(item: MultiSelectFilterValue) => {
        const value = getValueString(item);

        return (
          <Label
            title={<TagChip item={getTagLabel(value)} externalColor={tagColorMap?.[value]} />}
            description={getTagParents(value)}
            descriptionClassName='f-11-400 text-GRAY_700 ml-1'
          />
        );
      }}
      isDisabled={isDisabled}
    />
  );
};

export default Tags;
