import { ChangeEvent, useState } from 'react';
import { MapAny } from 'types/commonTypes';
import { moveToTop } from '@/utils/common';
import { MenuWrapper } from 'components/common/MenuWrapper';
import CreateTag from 'components/common/table/CustomCellEditors/CustomTagEditor/CreateTag';
import TagWithHierarchy from 'components/common/table/CustomCellEditors/CustomTagEditor/TagWithHierarchy';

const CustomTagEditor = (props: MapAny) => {
  const { values, stopEditing, onValueChange, tagColorMap, initialValue } = props;

  const [searchValue, setSearchValue] = useState<string>('');
  const [searchResults, setSearchResults] = useState<string[]>(moveToTop(values, initialValue));

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (value?.includes('.')) return;
    setSearchValue(value);
    const cleanedValue = value
      ?.split('/')
      ?.map((str) => str.trim())
      ?.join('.')
      ?.toLowerCase();
    let filteredSearchResults = values.filter((tag: string) => tag?.toLowerCase()?.includes(cleanedValue));

    if (filteredSearchResults.includes(initialValue)) {
      filteredSearchResults = moveToTop(filteredSearchResults, initialValue);
    }
    setSearchResults(filteredSearchResults);
  };

  const handleTagClick = (tag: string) => {
    onValueChange(tag);
    stopEditing();
  };

  const handleCreateTag = () => {
    const formattedValue = searchValue
      ?.trim()
      ?.split('/')
      ?.map((str: string) => str.trim())
      ?.join('.');

    onValueChange(formattedValue);
    stopEditing();
  };

  return (
    <div>
      <input
        type='text'
        value={searchValue}
        onChange={handleChange}
        className='h-6 -my-1 w-full outline-hidden'
        autoFocus
      />
      <MenuWrapper
        id='custom-tag-editor-menu'
        className='!fixed mt-1 w-64 top-7'
        childrenWrapperClassName='overflow-y-visible! max-h-fit!'
      >
        <div className='text-GRAY_700 f-11-500 p-2'>Select an option or create one</div>
        <div className='space-y-1 my-1 overflow-y-auto max-h-[300px]'>
          {searchResults.map((tag: string) => (
            <div key={tag} onClick={() => handleTagClick(tag)}>
              <TagWithHierarchy tag={tag} labelColor={tagColorMap?.[tag]} isSelected={tag === initialValue} />
            </div>
          ))}
        </div>
        <CreateTag value={searchValue} handleCreateTag={handleCreateTag} existingList={values} />
        <div className='flex items-center p-2 bg-BG_GRAY_2 gap-2 rounded-b-md'>
          <span>💡</span>
          <span className='text-GRAY_900 f-11-400'>Use “ / “ to create hierarchy</span>
        </div>
      </MenuWrapper>
    </div>
  );
};

export default CustomTagEditor;
