import { Button, Popover, PopoverContent, PopoverPortal, PopoverTrigger } from '@zamp-platform/ui';
import { ICellRendererParams } from 'ag-grid-community';
import { ValueFormatType } from '@/types/api/dataset.types';

const ValueFormatCell = (props: ICellRendererParams) => {
  const { value } = props;
  const valueFormatLength = value?.value_format?.length;

  return (
    <>
      {valueFormatLength ? (
        <div>
          {value?.value_format[0]?.type} : {value?.value_format[0]?.value}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant='link' size='xxsmall'>
                {valueFormatLength > 1 ? `+${valueFormatLength - 1} more` : ''}
              </Button>
            </PopoverTrigger>
            <PopoverPortal>
              <PopoverContent className='f-12-500 z-1003 p-4'>
                {value?.value_format.map((item: ValueFormatType, index: number) => (
                  <div key={index}>{`${index + 1}. ${item.type} : ${item.value}`}</div>
                ))}
              </PopoverContent>
            </PopoverPortal>
          </Popover>
        </div>
      ) : null}
    </>
  );
};

export default ValueFormatCell;
