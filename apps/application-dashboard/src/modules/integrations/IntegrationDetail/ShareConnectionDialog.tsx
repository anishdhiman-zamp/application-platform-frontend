'use client';

import { useCallback, useState } from 'react';
import {
  Button,
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogHeaderTitle,
  ScrollContainer,
} from '@zamp-platform/ui';
import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import MultiSelectInput from '@/components/multiSelectInput/MultiSelectInput';
import { ROLE_OPTIONS } from '@/modules/integrations/constants/integrations.constant';
import SharedToolPermissionRow from '@/modules/integrations/IntegrationDetail/SharedToolPermissionRow';
import { useShareConnection } from '@/modules/integrations/IntegrationDetail/useShareConnection';
import type {
  ConnectionRoleType,
  ShareConnectionDialogPropsType,
} from '@/modules/integrations/types/integrations.types';
import AccessLevelDropdown from '@/modules/pace/components/agents/components/AccessLevelDropdown';
import { getNameInitial } from '@/utils/common';

const ShareConnectionDialog = ({
  open,
  connectionId,
  connectionName,
  integrationName,
  integrationLogo,
  onClose,
  onShared,
}: ShareConnectionDialogPropsType) => {
  // state
  const [logoError, setLogoError] = useState(false);

  // hooks
  const {
    search,
    setSearch,
    tools,
    showValidationError,
    setShowValidationError,
    selectedItems,
    setSelectedItems,
    role,
    setRole,
    accessLevel,
    optionsList,
    hasSelection,
    canShare,
    isSharing,
    handleValidateAndAdd,
    handleOptionSelection,
    handleAccessLevelChange,
    handleToolPermissionChange,
    handleShare,
  } = useShareConnection({ open, connectionId, integrationName, onShared, onClose });

  // handlers
  const handleDialogOpenChange = useCallback((next: boolean) => !next && onClose(), [onClose]);

  const handleRoleSelect = useCallback((value: string) => setRole(value as ConnectionRoleType), [setRole]);

  const handleLogoError = useCallback(() => {
    console.error('[ShareConnectionDialog] integration logo failed to load', {
      integrationName,
      integrationLogo,
    });
    setLogoError(true);
  }, [integrationName, integrationLogo]);

  // render
  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent
        size='small'
        showCloseButton={false}
        className='max-h-[80vh] w-[522px] rounded-xl'
        title='Share connection'
      >
        <DialogHeader className='border-none p-5'>
          <DialogHeaderTitle className='f-16-600 text-GRAY_950'>Share connection</DialogHeaderTitle>
          <DialogClose onClick={onClose} className='cursor-pointer'>
            <X className='text-GRAY_700 h-3.5 w-3.5' />
          </DialogClose>
        </DialogHeader>

        <DialogBody className='flex flex-col gap-2.5 overflow-visible pt-0 pb-4'>
          <div className='bg-BG_GRAY_2 mx-4 flex items-center gap-x-2 rounded-xl px-3 py-3'>
            {(() => {
              if (open) {
                console.log('[ShareConnectionDialog] render', {
                  integrationName,
                  integrationLogo,
                  logoError,
                });
              }

              return null;
            })()}
            {integrationLogo && !logoError ? (
              <img
                src={integrationLogo}
                alt={connectionName}
                className='h-4 w-4 shrink-0 object-contain'
                onError={handleLogoError}
              />
            ) : (
              <span className='bg-GRAY_200 text-GRAY_700 f-10-550 flex h-4 w-4 shrink-0 items-center justify-center rounded'>
                {getNameInitial(connectionName)}
              </span>
            )}
            <span className='f-12-500 text-GRAY_950'>{connectionName}</span>
          </div>

          <div className='flex flex-col gap-2.5 px-4'>
            <label className='f-12-450 text-GRAY_700'>Share with</label>
            <MultiSelectInput
              id={`share-connection-${connectionId}`}
              search={search}
              setSearch={setSearch}
              isOpen={open}
              placeholderText='Share with agents, teams or people'
              inputArrayList={selectedItems}
              setInputArrayList={setSelectedItems}
              showValidationError={showValidationError}
              setShowValidationError={setShowValidationError}
              validationErrorText='Invalid email address'
              onValidateAndAdd={handleValidateAndAdd}
              optionsList={optionsList}
              onSelectOption={handleOptionSelection}
              optionalOpenDropdownOptions={false}
              inputWrapperClassName='max-h-[80px] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
              roleOptions={hasSelection ? ROLE_OPTIONS : undefined}
              selectedRole={role}
              setSelectedRole={handleRoleSelect}
            />
          </div>

          <AnimatePresence initial={false}>
            {hasSelection && tools.length > 0 && (
              <motion.div
                key='tools-section'
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{
                  height: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
                  opacity: { duration: 0.2, ease: 'easeOut' },
                }}
                className='overflow-hidden'
              >
                <div className='flex flex-col pl-4'>
                  <div className='flex items-center pt-1.5 pr-4'>
                    <span className='f-12-400 text-GRAY_700 flex-1'>Tool permissions {tools.length}</span>
                    <AccessLevelDropdown value={accessLevel} onChange={handleAccessLevelChange} />
                  </div>
                  <ScrollContainer className='mt-1 mb-1 flex max-h-[150px] flex-col overflow-y-auto py-1'>
                    <div className='flex flex-col pb-3'>
                      {tools.map((tool, idx) => (
                        <SharedToolPermissionRow
                          key={tool.id}
                          tool={tool}
                          isLast={idx === tools.length - 1}
                          onPermissionChange={handleToolPermissionChange}
                        />
                      ))}
                    </div>
                  </ScrollContainer>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogBody>

        <DialogFooter className='flex items-center justify-end px-5 py-4'>
          <Button size='small' variant='outline' disabled={!canShare || isSharing} onClick={handleShare}>
            Share
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ShareConnectionDialog;
