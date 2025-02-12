import { FC, Fragment } from 'react';
import { ColDef } from 'ag-grid-community';
import { MapAny } from 'types/commonTypes';
import TagChip from 'components/common/table/CustomCellEditors/CustomTagEditor/TagChip';
import { CUSTOM_COLUMNS_TYPE } from 'components/common/table/table.types';

type PropertiesProps = {
  data: MapAny;
  columns: ColDef[];
};

const Properties: FC<PropertiesProps> = ({ data, columns }) => {
  const getValue = (column: ColDef, value: any) => {
    if (column.cellRenderer) {
      if (column.headerComponentParams?.metadata?.custom_type === CUSTOM_COLUMNS_TYPE.TAG)
        return <TagChip item={value} />;

      return column.cellRenderer({ colDef: column, data, value });
    }

    return <p>{value}</p>;
  };

  return (
    <div className='grid grid-cols-2 gap-2.5'>
      {Object.entries(data).map(([key, value]) => {
        const column = columns.find((column) => column.field === key);

        return value && column ? (
          <Fragment key={key}>
            <div className='f-12-400 text-GRAY_700 h-6 flex items-center'>
              <p>{key}</p>
            </div>
            <div className='f-11-400 text-GRAY_1000 h-6 flex items-center'>{getValue(column, value)}</div>
          </Fragment>
        ) : null;
      })}
    </div>
  );
};

export default Properties;
