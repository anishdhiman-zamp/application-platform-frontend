import { useEffect } from 'react';
import { NavigationItemSchema } from 'types/config';

const IGNORE_TAGS = ['INPUT', 'TEXTAREA'];

const useKeyDown = (
  handleShortcuts: (val: KeyboardEvent) => void,
  filterKey?: string | string[],
  functionKey?: string | string[],
  ignoreInputs = true,
  navigation?: NavigationItemSchema[],
  handleKeyUp?: (val: KeyboardEvent) => void,
) => {
  useEffect(() => {
    const handleKeyDown = async (event: KeyboardEvent) => {
      const isIgnoreInput =
        !ignoreInputs ||
        (ignoreInputs && !IGNORE_TAGS.includes((event?.target as HTMLElement)?.tagName?.toUpperCase()));
      const isFilterEvents =
        !filterKey || (typeof filterKey === 'string' && event.code === filterKey) || filterKey.includes(event.code);
      const isFunctionKey =
        !functionKey ||
        (typeof functionKey === 'string' && event[functionKey as keyof KeyboardEvent]) ||
        (Array.isArray(functionKey) &&
          functionKey.some((key: string) => event[key as keyof KeyboardEvent] || event.code === key));

      if (isIgnoreInput && !event.repeat && isFilterEvents && isFunctionKey) {
        handleShortcuts(event);
      }
    };

    const onKeyUp = (event: KeyboardEvent) => {
      if (handleKeyUp) {
        const isFilterEvents =
          !filterKey || (typeof filterKey === 'string' && event.code === filterKey) || filterKey.includes(event.code);

        if (isFilterEvents) {
          handleKeyUp(event);
        }
      }
    };

    window?.addEventListener('keydown', handleKeyDown, { passive: false });

    if (handleKeyUp) {
      window?.addEventListener('keyup', onKeyUp);
    }

    return () => {
      window?.removeEventListener('keydown', handleKeyDown);

      if (handleKeyUp) {
        window?.removeEventListener('keyup', onKeyUp);
      }
    };
  }, [navigation, handleKeyUp, filterKey, functionKey, ignoreInputs, handleShortcuts]);
};

export default useKeyDown;
