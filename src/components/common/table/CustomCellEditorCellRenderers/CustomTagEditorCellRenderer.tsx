import { CustomCellRendererProps } from 'ag-grid-react';
import { Label } from 'components/common/Label';
import { getTagLabel, getTagParents } from 'components/filter/filter.utils';

const CustomTagEditorCellRenderer = (props: CustomCellRendererProps) => {
  const { value } = props;

  return (
    <Label
      title={getTagLabel(value)}
      description={getTagParents(value)}
      titleClassName='f-11-400 py-1 px-1.5 bg-GRAY_100 rounded-md mb-1 w-fit'
      descriptionClassName='f-11-400 text-GRAY_700 ml-1'
      wrapperClassName='w-full my-2'
    />
  );
};

export default CustomTagEditorCellRenderer;
