'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Button,
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogHeaderTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Input,
  ShimmerText,
  Switch,
} from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { ArrowRight, EllipsisVertical, Plus, Trash2, X } from 'lucide-react';
import { KEYBOARD_KEYS } from '@/constants/shortcuts';
import { TestStatus } from '@/modules/organisation-settings/constants/organisation-settings.constants';
import {
  type ConfiguredDomainType,
  type ProviderCredentialsDialogPropsType,
} from '@/modules/organisation-settings/types/organisation-settings.types';
import { isValidDomain, isValidUrl } from '@/modules/organisation-settings/utils/organisation-settings.util';

export type { ProviderCredentialsDialogPropsType };

const EMPTY_DOMAIN = (): ConfiguredDomainType => ({ id: crypto.randomUUID(), value: '', enabled: true });

const ProviderCredentialsDialog = (props: ProviderCredentialsDialogPropsType) => {
  const isManage = props.mode === 'manage';
  const provider = isManage ? (props.configuredProvider?.provider ?? null) : props.provider;
  const isOpen = isManage ? !!props.configuredProvider : !!props.provider;

  const userScrolledUp = useRef(false);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const testTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const metadataUrlDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const debounceTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const [metadataUrl, setMetadataUrl] = useState(isManage ? (props.configuredProvider?.metadataUrl ?? '') : '');
  const [metadataUrlError, setMetadataUrlError] = useState('');
  const [domains, setDomains] = useState<ConfiguredDomainType[]>(
    isManage && props.configuredProvider?.domains?.length ? props.configuredProvider.domains : [EMPTY_DOMAIN()],
  );
  const [domainErrors, setDomainErrors] = useState<Record<string, string>>({});
  const [testStatus, setTestStatus] = useState<TestStatus>(TestStatus.Idle);
  const isIdle = testStatus === TestStatus.Idle;
  const isTesting = testStatus === TestStatus.Testing;
  const isSuccess = testStatus === TestStatus.Success;

  // Dummy test function to simulate a api call
  const handleTest = () => {
    setTestStatus(TestStatus.Testing);
    testTimerRef.current = setTimeout(() => {
      setTestStatus(TestStatus.Success);
    }, 2000);
  };

  const handleScroll = () => {
    const el = scrollContainerRef.current;

    if (!el) return;
    const isAtBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 8;

    userScrolledUp.current = !isAtBottom;
  };

  const handleMetadataUrlChange = (value: string) => {
    setMetadataUrl(value);

    if (metadataUrlDebounce.current) clearTimeout(metadataUrlDebounce.current);
    metadataUrlDebounce.current = setTimeout(() => {
      if (value.trim() && !isValidUrl(value.trim())) {
        setMetadataUrlError('Not a valid URL');
      } else {
        setMetadataUrlError('');
      }
    }, 500);
  };

  const handleDomainChange = (id: string, value: string) => {
    setDomains((prev) => prev.map((d) => (d.id === id ? { ...d, value } : d)));

    clearTimeout(debounceTimers.current[id]);
    debounceTimers.current[id] = setTimeout(() => {
      if (value.trim() && !isValidDomain(value.trim())) {
        setDomainErrors((prev) => ({ ...prev, [id]: 'Not a valid domain' }));
      } else {
        setDomainErrors((prev) => {
          const next = { ...prev };

          delete next[id];

          return next;
        });
      }
    }, 500);
  };

  const handleDomainToggle = (id: string, enabled: boolean) => {
    setDomains((prev) => prev.map((d) => (d.id === id ? { ...d, enabled } : d)));
  };

  const handleRemoveDomain = (id: string) => {
    clearTimeout(debounceTimers.current[id]);
    delete debounceTimers.current[id];
    setDomains((prev) => prev.filter((d) => d.id !== id));
    setDomainErrors((prev) => {
      const next = { ...prev };

      delete next[id];

      return next;
    });
  };

  const handleAddDomain = () => {
    const newDomain = EMPTY_DOMAIN();

    setDomains((prev) => [...prev, newDomain]);
    setTimeout(() => inputRefs.current[newDomain.id]?.focus(), 0);
  };

  const handleDomainKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, currentId: string) => {
    if (e.key === KEYBOARD_KEYS.ENTER) {
      e.preventDefault();
      const newDomain = EMPTY_DOMAIN();

      setDomains((prev) => {
        const idx = prev.findIndex((d) => d.id === currentId);
        const updated = [...prev];

        updated.splice(idx + 1, 0, newDomain);

        return updated;
      });
      setTimeout(() => inputRefs.current[newDomain.id]?.focus(), 0);
    }
  };

  const resetState = () => {
    setMetadataUrl('');
    setMetadataUrlError('');
    if (metadataUrlDebounce.current) clearTimeout(metadataUrlDebounce.current);
    if (testTimerRef.current) clearTimeout(testTimerRef.current);
    setDomains([EMPTY_DOMAIN()]);
    setDomainErrors({});
    setTestStatus(TestStatus.Idle);
    userScrolledUp.current = false;
  };

  const handleClose = () => {
    if (!isManage) resetState();
    props.onClose();
  };

  const handleDone = () => {
    if (isManage && props.configuredProvider) {
      props.onSave({ ...props.configuredProvider, metadataUrl, domains: domains.filter((d) => d.value.trim()) });
    }
    props.onClose();
  };

  const renderFooterDialog = () => {
    if (isManage) {
      return (
        <DialogFooter className='p-4'>
          <Button size='small' onClick={handleDone} disabled={!!metadataUrlError}>
            Done
          </Button>
        </DialogFooter>
      );
    }

    return (
      <DialogFooter className={cn('relative h-[60px] overflow-hidden', !isIdle && 'border-t-0')}>
        {!isIdle && (
          <div className={cn('absolute inset-x-0 top-0 h-0.5', isSuccess ? 'bg-GREEN_600' : 'bg-GRAY_300')}>
            {isTesting && (
              <div className='bg-BLUE_600 h-full w-1/3 animate-[progress_1.5s_ease-in-out_infinite] rounded-full' />
            )}
          </div>
        )}

        <div className='flex flex-1 items-center'>
          {isTesting && (
            <div className='flex w-full items-center justify-between gap-2'>
              <ShimmerText text='Testing in progress...' autoAnimate className='f-12-450' />
              <Button
                variant='secondary'
                size='icon'
                onClick={() => {
                  if (testTimerRef.current) clearTimeout(testTimerRef.current);
                  setTestStatus(TestStatus.Idle);
                }}
                aria-label='Cancel test'
                className='h-6 w-6 p-0'
              >
                <X className='text-GRAY_600 h-3.5 w-3.5' />
              </Button>
            </div>
          )}
          {isSuccess && <span className='f-12-500 text-GREEN_700'>Test successful!</span>}
        </div>

        {isIdle && (
          <Button
            variant='outline'
            size='small'
            onClick={handleTest}
            disabled={!metadataUrl.trim() || !!metadataUrlError}
          >
            Test
          </Button>
        )}
        {isSuccess && (
          <Button size='small' className='flex items-center gap-1.5' onClick={handleSetupComplete}>
            <ArrowRight className='h-3.5 w-3.5' />
            Setup SSO
          </Button>
        )}
      </DialogFooter>
    );
  };

  const handleSetupComplete = () => {
    if (!isManage && provider) {
      props.onSetupComplete({ provider, domains: domains.filter((d) => d.value.trim()), metadataUrl });
    }
    resetState();
    props.onClose();
  };

  useEffect(() => {
    return () => {
      if (testTimerRef.current) clearTimeout(testTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const el = scrollContainerRef.current;

    if (el && !userScrolledUp.current) {
      el.scrollTop = el.scrollHeight;
    }
  }, [domains.length]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent size='small' showCloseButton={false} id='provider-credentials-dialog'>
        <DialogHeader className='border-none p-5'>
          <DialogHeaderTitle>
            {isManage ? `Manage ${provider?.label}` : `Add ${provider?.label} credentials`}
          </DialogHeaderTitle>
          <DialogClose onClick={handleClose} className='cursor-pointer'>
            <X className='text-GRAY_700 h-4 w-4' />
          </DialogClose>
        </DialogHeader>

        <DialogBody className='flex flex-col border-none'>
          {/* Metadata URL */}
          <div className='flex flex-col gap-2 px-5'>
            <span className='f-12-400 text-GRAY_700'>App Federation Metadata Url</span>
            <Input
              value={metadataUrl}
              onChange={(e) => handleMetadataUrlChange(e.target.value)}
              placeholder='Paste url here'
              error={!!metadataUrlError}
              className={cn(
                'f-12-450 rounded-[8px] shadow-none focus-visible:ring-0',
                metadataUrlError && 'border-RED_600 focus:border-RED_600 focus:ring-RED_600 focus:ring-1',
              )}
            />
            {metadataUrlError && <span className='f-10-400 text-RED_600'>{metadataUrlError}</span>}
          </div>

          {/* Domains */}
          <div className='mt-6 flex flex-col gap-2 pl-5'>
            <span className='f-12-400 text-GRAY_700'>Enable domains</span>
            <div
              ref={scrollContainerRef}
              onScroll={handleScroll}
              className='flex max-h-[160px] flex-col gap-2 overflow-y-auto pr-5'
            >
              {domains.map((domain) => (
                <div key={domain.id} className='flex items-center gap-2'>
                  <div className='flex w-full flex-col items-start gap-2'>
                    <div className='flex w-full items-center gap-1'>
                      <Input
                        ref={(el) => {
                          inputRefs.current[domain.id] = el;
                        }}
                        value={domain.value}
                        onChange={(e) => handleDomainChange(domain.id, e.target.value)}
                        onKeyDown={(e) => handleDomainKeyDown(e, domain.id)}
                        placeholder='Add domain name here'
                        wrapperClassName='flex-1'
                        className={cn(
                          'f-12-450 rounded-[8px] shadow-none focus-visible:ring-0',
                          domainErrors[domain.id] &&
                            'border-RED_600 focus:border-RED_600 focus:ring-RED_600 focus:ring-1',
                        )}
                        error={!!domainErrors[domain.id]}
                      />
                      <DropdownMenu modal={false}>
                        <DropdownMenuTrigger asChild>
                          <div
                            role='button'
                            tabIndex={0}
                            className='text-GRAY_600 hover:text-GRAY_1000 cursor-pointer p-0.5 transition-colors'
                          >
                            <EllipsisVertical className='h-3.5 w-3.5' />
                          </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end' className='bg-BG_WHITE z-[10000] w-40 p-1'>
                          <div
                            role='button'
                            tabIndex={0}
                            className='hover:bg-GRAY_100 flex cursor-pointer items-center justify-between rounded-sm px-3 py-2.5'
                            onClick={() => handleDomainToggle(domain.id, !domain.enabled)}
                            onKeyDown={(e) => {
                              if (e.key === KEYBOARD_KEYS.ENTER || e.key === KEYBOARD_KEYS.SPACE) {
                                e.preventDefault();
                                handleDomainToggle(domain.id, !domain.enabled);
                              }
                            }}
                          >
                            <span className='f-12-400 text-GRAY_1000'>Enabled</span>
                            <Switch
                              size='medium'
                              checked={domain.enabled}
                              onCheckedChange={(checked) => handleDomainToggle(domain.id, checked)}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                          <div className='bg-GRAY_300 mx-0.5 h-px' />
                          <DropdownMenuItem
                            className='f-12-400 text-RED_600 hover:bg-GRAY_100 cursor-pointer gap-2 rounded-sm px-3 py-2.5 data-[disabled]:pointer-events-none data-[disabled]:cursor-not-allowed data-[disabled]:opacity-40 data-[disabled]:hover:bg-transparent'
                            disabled={domains.length <= 1}
                            onClick={() => domains.length > 1 && handleRemoveDomain(domain.id)}
                          >
                            <Trash2 className='h-3.5 w-3.5' />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    {domainErrors[domain.id] && (
                      <span className='f-10-400 text-RED_600'>{domainErrors[domain.id]}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <Button
              variant='secondary'
              size='small'
              className={cn('text-GRAY_700 hover:text-GRAY_1000 w-fit gap-1.5', !isManage && 'mb-5')}
              onClick={handleAddDomain}
            >
              <Plus className='h-3.5 w-3.5' />
              Add
            </Button>
          </div>

          {/* Disconnect section — manage mode only */}
          {isManage && provider && (
            <div className='mt-6 flex flex-col items-start justify-between px-5 pb-5'>
              <div className='bg-GRAY_300 mb-4 h-px w-full' />
              <div className='flex w-full items-center justify-between'>
                <div className='flex flex-col gap-1.5'>
                  <span className='f-12-600 text-GRAY_1000'>Disconnect {provider.label}?</span>
                  <span className='f-12-400 text-GRAY_700 max-w-[300px]'>
                    People will no longer be able to use their {provider.label} account to log into Zamp.
                  </span>
                </div>
                <Button
                  variant='destructive-outline'
                  size='small'
                  className='shrink-0'
                  onClick={() => {
                    if (isManage) props.onDisconnect(provider.id);
                    props.onClose();
                  }}
                >
                  Disconnect {provider.label}
                </Button>
              </div>
            </div>
          )}
        </DialogBody>

        {renderFooterDialog()}
      </DialogContent>
    </Dialog>
  );
};

export default ProviderCredentialsDialog;
