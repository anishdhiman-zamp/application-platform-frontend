import { useEffect, useRef, useState } from 'react';
import { type TUsePDFSlickStore } from '@pdfslick/react';
import { Button, Input } from '@zamp-platform/ui';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { cn } from '@zamp-platform/ui/utils';
import { useArtifactContextStore } from 'modules/process/artifacts/context/artifact.context';
import { COLORS } from '@/constants/colors';
import type { MapAny } from '@/types/commonTypes';
import { formatPlural } from '@/utils/common';

interface SearchBarProps {
  usePDFSlickStore: TUsePDFSlickStore;
}

const SearchBar = ({ usePDFSlickStore }: SearchBarProps) => {
  const pdfSlick = usePDFSlickStore((s) => s.pdfSlick);
  const searchRef = useRef<HTMLInputElement>(null);
  const { state } = useArtifactContextStore();

  const [term, setTerm] = useState('');
  const [searchResults, setSearchResults] = useState({ current: 0, total: 0 });

  useEffect(() => {
    if (!pdfSlick || !pdfSlick.eventBus) return;
    const eventBus = pdfSlick.eventBus;

    const handleSearchResults = (event: MapAny) => {
      setSearchResults({
        current: (pdfSlick.findController?.selected?.matchIdx ?? -1) + 1,
        total: event.matchesCount?.total || pdfSlick.findController?._matchesCountTotal || 0,
      });
    };

    eventBus.on('updatefindmatchescount', handleSearchResults);
    eventBus.on('updatefindcontrolstate', handleSearchResults);

    return () => {
      eventBus.off('updatefindmatchescount', handleSearchResults);
      eventBus.off('updatefindcontrolstate', handleSearchResults);
    };
  }, [pdfSlick, state.searchTerm]);

  useEffect(() => {
    if (state.searchTerm) {
      setTerm(state.searchTerm);
      pdfSlick?.eventBus.dispatch('find', {
        type: '',
        query: state.searchTerm,
        caseSensitive: false,
        highlightAll: true,
        entireWord: false,
      });
    }
  }, [state.searchTerm]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;

    setTerm(query);
    pdfSlick?.eventBus.dispatch('find', {
      type: '',
      query,
      caseSensitive: false,
      highlightAll: true,
      entireWord: false,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const query = (e.target as HTMLInputElement).value;

    if (e.key === 'Enter') {
      pdfSlick?.eventBus.dispatch('find', {
        type: 'again',
        query,
        caseSensitive: false,
        highlightAll: true,
        entireWord: false,
        findPrevious: e.shiftKey,
      });
    }
  };

  const handleFindAgain = (findPrevious: boolean) => {
    pdfSlick?.eventBus.dispatch('find', {
      type: 'again',
      query: searchRef.current?.value,
      caseSensitive: false,
      highlightAll: true,
      entireWord: false,
      findPrevious,
    });
  };

  const handleClear = () => {
    setTerm('');
    if (searchRef.current) {
      searchRef.current.value = '';
    }
    pdfSlick?.eventBus.dispatch('find', { type: '' });
  };

  const handlePrevious = () => {
    if (searchResults?.total === 0 || searchResults?.current <= 1) return;
    handleFindAgain(true);
  };

  const handleNext = () => {
    if (searchResults?.total === 0 || searchResults?.current >= searchResults?.total) return;
    handleFindAgain(false);
  };

  return (
    <div className='my-3 h-16 w-full'>
      <div className='relative w-full'>
        <Input
          ref={(el) => {
            searchRef.current = el;
          }}
          placeholder='Search PDF'
          size='small'
          value={term}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          wrapperClassName='flex-1 flex items-center'
          className='focus:border-input focus:ring-0'
          icon={<SvgSpriteLoader size={16} id='search-sm' color={COLORS.GRAY_700} />}
        />
        {term && (
          <Button
            type='button'
            variant='ghost'
            size='icon'
            className='absolute top-1/2 right-1 h-7 w-7 -translate-y-1/2 hover:bg-transparent'
            onClick={handleClear}
          >
            <SvgSpriteLoader size={16} id='x-close' color={COLORS.GRAY_700} />
          </Button>
        )}
      </div>

      {term && (
        <div className='w-full px-4'>
          <div className='border-input flex w-full items-center justify-between rounded-md rounded-t-none border border-t-0 bg-white px-2 py-1'>
            <span className='f-11-450 text-GRAY_900 select-none'>
              {!searchResults?.total
                ? 'No results found'
                : formatPlural(searchResults?.total, 'result found', 'results found')}
            </span>
            <div className='flex items-center gap-x-1.5'>
              <SvgSpriteLoader
                size={16}
                id='chevron-up'
                color={COLORS.GRAY_900}
                onClick={handlePrevious}
                className={cn('flex-shrink-0 cursor-pointer rounded p-0.5', {
                  '!cursor-not-allowed': searchResults?.total === 0 || searchResults?.current <= 1,
                })}
              />
              <span className='f-11-450 text-GRAY_700 text-center whitespace-nowrap select-none'>
                {searchResults?.current} / {searchResults?.total}
              </span>
              <SvgSpriteLoader
                size={16}
                id='chevron-down'
                color={COLORS.GRAY_900}
                onClick={handleNext}
                className={cn('flex-shrink-0 cursor-pointer rounded p-0.5', {
                  '!cursor-not-allowed': searchResults?.total === 0 || searchResults?.current >= searchResults?.total,
                })}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
