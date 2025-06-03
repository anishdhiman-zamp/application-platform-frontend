import React, { FC } from 'react';
import { cn } from 'utils/common';
import { HtmlTablePropsType } from 'components/common/htmlTable/HtmlTable.types';
import CustomNoRowsOverlay from 'components/common/table/CustomNoRowsOverlay';
import CommonWrapper from 'components/commonWrapper';

const HtmlTable: FC<HtmlTablePropsType> = ({ rows, columns, wrapperClassName, colCellClassName, rowCellClassName }) => {
  return (
    <CommonWrapper
      isNoData={!rows?.length || !columns?.length}
      noDataBanner={
        <div className='flex h-full w-full items-center justify-center'>
          <CustomNoRowsOverlay />
        </div>
      }
      className='h-full w-full'
    >
      <div className={cn('h-full w-full overflow-auto', wrapperClassName)}>
        <table className='border-collapse'>
          <thead>
            <tr>
              {columns?.map((col, index) => (
                <th
                  key={index}
                  className={cn(
                    'text-GRAY_950 border-GRAY_100 f-12-500 overflow-hidden whitespace-nowrap border px-3.5 py-4 text-start',
                    colCellClassName,
                  )}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows?.map((row, rowIndex) => (
              <tr key={rowIndex} className='hover:bg-GRAY_20'>
                {columns?.map((col, colIndex) => (
                  <td
                    key={colIndex}
                    className={cn(
                      'text-GRAY_950 border-GRAY_100 f-11-400 overflow-hidden whitespace-nowrap border px-3 py-2 text-start',
                      rowCellClassName,
                    )}
                  >
                    {row[col] ?? ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </CommonWrapper>
  );
};

export default HtmlTable;
