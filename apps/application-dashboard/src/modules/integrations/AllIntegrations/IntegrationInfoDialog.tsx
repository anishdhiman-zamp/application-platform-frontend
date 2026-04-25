'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogHeaderTitle,
  ScrollContainer,
  Skeleton,
  toast,
} from '@zamp-platform/ui';
import { Plus, Wrench, X } from 'lucide-react';
import { useGetIntegrationToolsQuery } from '@/apis/agents';
import { useAuthenticateIntegrationV2Mutation } from '@/apis/integrations';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import { handleActivationKeyDown } from '@/constants/shortcuts';
import EmailForwardingDialog from '@/modules/integrations/AllIntegrations/components/EmailForwardingDialoge';
import ConnectIntegrationDialog from '@/modules/integrations/AllIntegrations/ConnectIntegrationDialog';
import { AUTH_TYPE, type IntegrationInfoDialogPropsType } from '@/modules/integrations/types/integrations.types';
import { getNameInitial } from '@/utils/common';

const INITIAL_TOOLS_VISIBLE = 4;

const IntegrationInfoDialog = ({ integrationItem, isOpen, onOpenChange }: IntegrationInfoDialogPropsType) => {
  // state
  const [imgError, setImgError] = useState(false);
  const [showAllTools, setShowAllTools] = useState(false);
  const [isConnectDialogOpen, setIsConnectDialogOpen] = useState(false);
  const [isEmailForwardingDialogOpen, setIsEmailForwardingDialogOpen] = useState(false);

  // derived from props
  const { name, title, description, icon, auth } = integrationItem;
  const primaryAuth = auth?.[0];

  // hooks (RTK)
  const [authenticateIntegrationV2, { isLoading: isAuthenticating }] = useAuthenticateIntegrationV2Mutation();
  const {
    data: integrationToolsData,
    isLoading: isToolsLoading,
    isError: isToolsError,
    refetch: refetchTools,
  } = useGetIntegrationToolsQuery({ integrationName: name }, { skip: !isOpen || !name });

  // derived state
  const catalogDefaultScopes = useMemo(() => primaryAuth?.default_scopes ?? [], [primaryAuth]);
  const supportsScopes = catalogDefaultScopes.length > 0;
  const tools = useMemo(() => integrationToolsData?.items ?? integrationToolsData?.tools ?? [], [integrationToolsData]);
  const visibleTools = showAllTools ? tools : tools.slice(0, INITIAL_TOOLS_VISIBLE);
  const remainingToolsCount = tools.length - INITIAL_TOOLS_VISIBLE;

  // handlers
  const handleConnect = useCallback(
    (payload?: { name?: string; scopes?: string[] }) => {
      if (!primaryAuth || !name) return;

      authenticateIntegrationV2({
        integration_name: name,
        auth_type: primaryAuth.auth_type,
        name: payload?.name ?? '',
        scopes: payload?.scopes,
      })
        .unwrap()
        .then((result) => {
          if (result?.metadata?.redirect_url) {
            window.open(result.metadata.redirect_url, '_blank', 'noopener,noreferrer');
          }
          setIsConnectDialogOpen(false);
        })
        .catch(() => {
          toast.error('Failed to connect integration');
        });
    },
    [primaryAuth, name, authenticateIntegrationV2],
  );

  const handleAddConnectionClick = useCallback(() => {
    onOpenChange(false);
    if (primaryAuth?.auth_type === AUTH_TYPE.CUSTOM) {
      setIsEmailForwardingDialogOpen(true);

      return;
    }
    setIsConnectDialogOpen(true);
  }, [primaryAuth, onOpenChange]);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) setShowAllTools(false);
      onOpenChange(open);
    },
    [onOpenChange],
  );

  const handleShowAllTools = useCallback(() => setShowAllTools(true), []);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent
          className='bg-BG_WHITE border-GRAY_300 h-auto max-h-none w-[640px] max-w-[640px] rounded-xl border p-0'
          showCloseButton={false}
          title={title}
        >
          <DialogHeader className='border-none px-8 pt-6'>
            <DialogHeaderTitle className='flex items-center gap-x-3'>
              <div className='relative flex h-7 w-7 shrink-0 items-center justify-center'>
                {imgError || !icon ? (
                  <div className='bg-GRAY_200 text-GRAY_700 f-14-550 flex h-full w-full items-center justify-center rounded'>
                    {getNameInitial(title)}
                  </div>
                ) : (
                  <img src={icon} alt={title} className='object-contain' onError={() => setImgError(true)} />
                )}
              </div>
              <span className='f-18-600 text-GRAY_1000'>{title}</span>
            </DialogHeaderTitle>
            <DialogClose className='cursor-pointer'>
              <X className='text-GRAY_700 h-4 w-4' />
            </DialogClose>
          </DialogHeader>

          <div className='mt-2 flex flex-col'>
            {description && <p className='f-14-450 text-GRAY_700 px-8'>{description}</p>}

            <div className='flex flex-col gap-y-3 pb-6'>
              <CommonWrapper
                isLoading={isToolsLoading}
                isError={isToolsError}
                isNoData={!isToolsLoading && !isToolsError && tools.length === 0}
                refetchFunction={refetchTools}
                skeletonType={SkeletonTypes.CUSTOM}
                loader={
                  <>
                    <Skeleton className='mx-8 mt-5 h-7 w-24' />
                    <div className='mt-5 flex flex-wrap items-center gap-2 px-8'>
                      {Array.from({ length: INITIAL_TOOLS_VISIBLE }).map((_, index) => (
                        <Skeleton key={index} className='h-7 w-32 rounded-full' />
                      ))}
                    </div>
                  </>
                }
                noDataBanner={<p className='f-13-450 text-GRAY_700 px-8'>No tools available for this integration</p>}
                errorCardTitle='Failed to load tools'
                disableAnimation
              >
                <div className='bg-BG_GRAY_2 f-13-500 text-GRAY_1000 mx-8 mt-5 inline-flex w-fit items-center gap-x-1.5 rounded-md px-2 py-1'>
                  <Wrench className='text-GRAY_700 h-3.5 w-3.5 -scale-x-100' />
                  <span>Tools</span>
                  <span className='text-GRAY_700'>{tools.length}</span>
                </div>
                <ScrollContainer className='mt-5 max-h-52' scrollClassName='px-8' scrollbarStyle='thin'>
                  <div className='flex flex-wrap items-center gap-2'>
                    {visibleTools?.map((tool) => (
                      <span
                        key={tool.name}
                        className='border-GRAY_400 text-GRAY_1000 f-13-500 rounded-full border px-2.5 py-1'
                      >
                        {tool?.display_name || tool?.name}
                      </span>
                    ))}
                    {!showAllTools && remainingToolsCount > 0 && (
                      <div
                        role='button'
                        tabIndex={0}
                        onClick={handleShowAllTools}
                        onKeyDown={(e) => handleActivationKeyDown(e, handleShowAllTools)}
                        className='f-13-500 text-GRAY_700 hover:text-GRAY_1000 cursor-pointer px-2.5 py-1'
                      >
                        +{remainingToolsCount} more
                      </div>
                    )}
                  </div>
                </ScrollContainer>
              </CommonWrapper>
            </div>
          </div>

          <div className='border-GRAY_400 flex justify-end border-t px-5 py-4'>
            <Button
              variant='default'
              size='small'
              onClick={handleAddConnectionClick}
              className='f-12-500 hover:bg-GRAY_1000/90 active:bg-GRAY_950 flex items-center gap-1 px-3 py-1.5'
            >
              <Plus className='h-3.5 w-3.5' />
              Add connection
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ConnectIntegrationDialog
        integrationName={name}
        integrationTitle={title}
        integrationIcon={icon}
        isOpen={isConnectDialogOpen}
        isLoading={isAuthenticating}
        onOpenChange={setIsConnectDialogOpen}
        onConnect={handleConnect}
        defaultScopes={catalogDefaultScopes}
        showScopesOption={supportsScopes}
      />
      <EmailForwardingDialog
        integration={integrationItem}
        isOpen={isEmailForwardingDialogOpen}
        onClose={() => setIsEmailForwardingDialogOpen(false)}
      />
    </>
  );
};

export default IntegrationInfoDialog;
