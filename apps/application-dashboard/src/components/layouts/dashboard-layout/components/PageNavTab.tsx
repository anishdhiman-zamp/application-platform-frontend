'use client';

import { KeyboardEvent, useOptimistic, useState } from 'react';
import { Button, Input, Popover, PopoverContent, PopoverTrigger, toast } from '@zamp-platform/ui';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { useGetPagesQuery, useGetProcessesQuery, useUpdatePageMutation } from 'apis/pages';
import { COLORS } from 'constants/colors';
import { getPageRouteById, getProcessRouteById, ROUTES_PATH } from 'constants/routeConfig';
import { KEYBOARD_KEYS } from 'constants/shortcuts';
import { useRouter } from 'next/navigation';
import { PageResponseType } from 'types/api/pagesApi.types';
import { cn, preventAutoFocus } from 'utils/common';
import PageIcon from '@/assets/Icons/PageIcon';
import { TOAST_MESSAGES } from '@/components/common/toast/toast.constants';
import PermissionGuard from '@/components/hoc/PermissionGuard';
import { PAGE_ACCESS_PRIVILEGES, ResourceType } from '@/modules/shareResource/shareResource.types';
import DeletePageDialog from 'components/layouts/dashboard-layout/components/DeletePageDialog';

export interface PageNavTabProps {
  label: string;
  pageId: string;
  isSelected?: boolean;
  page?: PageResponseType;
}

const PageNavTab = ({ label, pageId, isSelected, page }: PageNavTabProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [pageName, setPageName] = useState<string>();
  const [finalName, setFinalName] = useState<string>();

  const router = useRouter();

  const [updatePage] = useUpdatePageMutation();
  const { data: pages } = useGetPagesQuery(undefined, { refetchOnMountOrArgChange: false });
  const { data: processes } = useGetProcessesQuery(undefined, { refetchOnMountOrArgChange: false });

  const [optimisticName, updateOptimisticName] = useOptimistic(finalName || label, (state, newName: string) => newName);

  const handleInputBlur = () => {
    const trimmedName = pageName?.trim();

    if (trimmedName === label || !trimmedName) {
      return;
    }

    setFinalName(trimmedName);
    updateOptimisticName(trimmedName);

    updatePage({
      pageId: pageId,
      body: {
        name: trimmedName,
      },
    })
      .unwrap()
      .then(() => {
        toast.success(TOAST_MESSAGES.SUCCESS_PAGE_NAME_UPDATED);
      })
      .catch(() => {
        toast.error(TOAST_MESSAGES.ERROR_PAGE_NAME_UPDATE);
        setPageName(label);
        setFinalName(label);
        updateOptimisticName(label);
      });
  };

  const handleMenuOpen = (open: boolean) => {
    setIsMenuOpen(open);
    if (open) {
      setPageName(optimisticName);
    }
  };

  const handleEditKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === KEYBOARD_KEYS.ENTER) {
      e.preventDefault();
      e.stopPropagation();
      handleMenuOpen(false);
      handleInputBlur();
    }
  };

  const handleDeleteSuccess = () => {
    if (isSelected) {
      const remainingPages = pages?.filter((p) => p.page_id !== pageId);

      if (remainingPages && remainingPages.length > 0) {
        router.push(getPageRouteById(remainingPages[0]?.page_id, remainingPages[0]?.sheets[0]?.sheet_id));
      } else if (processes && processes.length > 0) {
        router.push(getProcessRouteById(processes[0]?.id));
      } else {
        router.push(ROUTES_PATH.DATA);
      }
    }
  };

  const handleDeletePage = () => {
    setIsMenuOpen(false);
    setIsDeleteDialogOpen(true);
  };

  return (
    <>
      <div
        className={cn(
          'text-GRAY_900 f-13-500 hover:bg-GRAY_20 group flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 select-none',
          isSelected ? 'bg-GRAY_100 text-GRAY_1000' : '',
        )}
        data-testid={`${pageId}-page-nav-tab`}
      >
        <PageIcon height={14} width={14} isSelected={isSelected} />

        <div className='flex-1'>{optimisticName}</div>

        <Popover open={isMenuOpen} onOpenChange={handleMenuOpen}>
          <PopoverTrigger
            className={cn('cursor-pointer opacity-0 group-hover:opacity-100')}
            data-testid={`${pageId}-page-nav-tab-popover-trigger`}
            id='page-nav-tab-popover-trigger'
            aria-label='Page options'
          >
            <PermissionGuard
              resourceType={ResourceType.PAGE}
              resourceId={pageId}
              privilege={PAGE_ACCESS_PRIVILEGES.ADMIN}
            >
              <SvgSpriteLoader id='dots-vertical' size={14} color={isMenuOpen ? COLORS.GRAY_800 : COLORS.GRAY_500} />
            </PermissionGuard>
          </PopoverTrigger>
          <PopoverContent
            align='end'
            sideOffset={16}
            className='space-y-2'
            onCloseAutoFocus={preventAutoFocus}
            id='page-nav-tab-popover-content'
          >
            <Input
              size='small'
              placeholder='Page name'
              value={pageName}
              onChange={(e) => setPageName(e.target.value)}
              icon={<SvgSpriteLoader id='edit-03' size={16} color={COLORS.GRAY_500} />}
              autoFocus
              onBlur={handleInputBlur}
              onKeyDown={handleEditKeyDown}
              data-testid={`${pageId}-page-nav-tab-input`}
            />
            <Button
              variant='ghost'
              size='medium'
              className='flex w-full items-center justify-start gap-1.5 text-red-700 hover:text-red-700'
              onClick={handleDeletePage}
              data-testid={`${pageId}-page-nav-tab-delete-page-btn`}
              id='page-nav-tab-delete-page-button'
            >
              <SvgSpriteLoader id='trash-04' size={12} />
              <span>Delete page</span>
            </Button>
          </PopoverContent>
        </Popover>
      </div>

      <DeletePageDialog
        page={page}
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onDeleteSuccess={handleDeleteSuccess}
      />
    </>
  );
};

export default PageNavTab;
