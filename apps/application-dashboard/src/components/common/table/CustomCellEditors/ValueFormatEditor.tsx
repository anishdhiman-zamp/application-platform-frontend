import { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogHeaderTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Input,
} from '@zamp-platform/ui';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { DATE_FORMATS } from '@zamp-platform/utils';
import type { IRowNode } from 'ag-grid-community';
import { DISPLAY_CONFIG_HEADERS } from '@/modules/admin/admin.types';
import type { ValueFormatType } from '@/types/api/dataset.types';
import type { MapAny } from '@/types/commonTypes';
import { VALUE_FORMAT_TYPE } from 'components/common/table/table.types';

const ValueFormatEditor = (props: MapAny) => {
  const { value, api, data, onValueChange, stopEditing } = props;

  const [valueFormats, setValueFormats] = useState<ValueFormatType[]>(value?.value_format || []);

  const allColumns = useMemo(() => {
    const allValues: string[] = [];

    api.forEachNode((node: IRowNode) => {
      allValues.push(node.data[DISPLAY_CONFIG_HEADERS.COLUMN]);
    });

    return allValues.filter((item) => item !== data[DISPLAY_CONFIG_HEADERS.COLUMN]);
  }, [api, data]);

  const handleAddValueFormat = () => {
    setValueFormats((prev) => {
      const existingTypes = prev.map((item) => item.type);
      const nextType = Object.values(VALUE_FORMAT_TYPE).find((type) => !existingTypes.includes(type));

      if (!nextType) return prev;

      switch (nextType) {
        case VALUE_FORMAT_TYPE.DATE_TIME:
          return [...prev, { type: nextType, value: DATE_FORMATS.ddMMMyyyy }];
        case VALUE_FORMAT_TYPE.COLUMN_PREFIX:
          return [...prev, { type: nextType, value: allColumns[0] }];
        default:
          return [...prev, { type: nextType, value: '' }];
      }
    });
  };

  const handleDeleteValueFormat = (type: VALUE_FORMAT_TYPE) => {
    setValueFormats((prev) => prev.filter((item) => item.type !== type));
  };

  const handleChangeValueFormat = (valueFormat: ValueFormatType) => {
    setValueFormats((prev) =>
      prev.map((item) => (item.type === valueFormat.type ? { ...item, value: valueFormat.value } : item)),
    );
  };

  const handleChangeValueFormatType = (type: VALUE_FORMAT_TYPE, index: number) => {
    setValueFormats((prev) => {
      const newFormats = [...prev];

      newFormats[index] = { type, value: '' };

      return newFormats;
    });
  };

  const handleSaveValueFormat = () => {
    onValueChange({ value_format: valueFormats });
    stopEditing();
  };

  const getValueFormatComponent = (valueFormat: ValueFormatType, onChange: (value: ValueFormatType) => void) => {
    switch (valueFormat.type) {
      case VALUE_FORMAT_TYPE.PREFIX:
        return (
          <Input
            value={valueFormat.value}
            onChange={(e) => onChange({ ...valueFormat, value: e.target.value })}
            size='small'
          />
        );
      case VALUE_FORMAT_TYPE.ROUND_OFF:
        return (
          <Input
            type='number'
            value={valueFormat.value}
            onChange={(e) => onChange({ ...valueFormat, value: e.target.value })}
            size='small'
          />
        );
      case VALUE_FORMAT_TYPE.DATE_TIME:
        return (
          <DropdownMenu>
            <DropdownMenuTrigger className='w-full'>
              <div className='f-12-400 flex h-8 items-center justify-between gap-2 rounded-md border border-gray-200 p-2'>
                {valueFormat.value} <SvgSpriteLoader id='chevron-down' />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className='z-1002 max-h-[200px] overflow-y-auto'>
              {Object.values(DATE_FORMATS).map((item: string) => (
                <DropdownMenuItem key={item} onClick={() => onChange({ ...valueFormat, value: item })}>
                  {item}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      case VALUE_FORMAT_TYPE.COLUMN_PREFIX:
        return (
          <DropdownMenu>
            <DropdownMenuTrigger className='w-full'>
              <div className='f-12-400 flex h-8 items-center justify-between gap-2 rounded-md border border-gray-200 p-2'>
                {valueFormat.value} <SvgSpriteLoader id='chevron-down' />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className='z-1002 max-h-[200px] overflow-y-auto'>
              {allColumns.map((item: string) => (
                <DropdownMenuItem key={item} onClick={() => onChange({ ...valueFormat, value: item })}>
                  {item}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        );
    }
  };

  const dialogContent = (
    <Dialog open={true} onOpenChange={stopEditing}>
      <DialogContent size='small' showCloseButton>
        <DialogHeader>
          <DialogHeaderTitle>Edit Value Format</DialogHeaderTitle>
        </DialogHeader>
        <DialogBody className='p-2'>
          <div className='flex flex-col items-center justify-center gap-2'>
            {valueFormats.map((valueFormat, index) => (
              <div key={valueFormat.type} className='flex items-center gap-2'>
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <div className='f-12-400 flex h-8 w-40 items-center justify-between gap-2 rounded-md border border-gray-200 p-2'>
                      {valueFormat.type} <SvgSpriteLoader id='chevron-down' />
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className='z-1002'>
                    {Object.values(VALUE_FORMAT_TYPE)
                      .filter((item) => valueFormats.findIndex((v) => v.type === item && v.value !== '') === -1)
                      .map((item) => (
                        <DropdownMenuItem key={item} onClick={() => handleChangeValueFormatType(item, index)}>
                          {item}
                        </DropdownMenuItem>
                      ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <div className='w-80'>{getValueFormatComponent(valueFormat, handleChangeValueFormat)}</div>
                <Button variant='secondary' onClick={() => handleDeleteValueFormat(valueFormat.type)} size='small'>
                  <SvgSpriteLoader id='trash-02' />
                </Button>
              </div>
            ))}
            <Button
              onClick={handleAddValueFormat}
              disabled={valueFormats.length >= Object.values(VALUE_FORMAT_TYPE).length}
              size='medium'
              className='mt-4'
            >
              Add Value Format
            </Button>
          </div>
        </DialogBody>
        <DialogFooter className='flex justify-end gap-2'>
          <Button variant='secondary' size='xsmall' onClick={stopEditing}>
            Cancel
          </Button>
          <Button size='xsmall' onClick={handleSaveValueFormat}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  // Render the dialog in a portal to prevent ag-grid focus issues
  return createPortal(dialogContent, document.body);
};

export default ValueFormatEditor;
