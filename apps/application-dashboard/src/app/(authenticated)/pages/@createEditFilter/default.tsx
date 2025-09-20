'use client';
import { withFiltersContext } from '@/components/filter/filters.context';
import CreateEditFilter from '@/modules/sheets/CreateEditFilter';
import { CreateEditFilterProvider } from '@/modules/sheets/CreateEditFilter/context';

const CreateEditFilterSlot = () => (
  <CreateEditFilterProvider>
    <CreateEditFilter />
  </CreateEditFilterProvider>
);

export default withFiltersContext(CreateEditFilterSlot);
