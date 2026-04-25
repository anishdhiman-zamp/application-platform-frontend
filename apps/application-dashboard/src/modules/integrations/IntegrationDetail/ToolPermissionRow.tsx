'use client';

import { Skeleton } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { motion } from 'motion/react';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import type { ToolPermissionRowPropsType } from '@/modules/integrations/types/integrations.types';
import ToolPermissionControl from '@/modules/pace/components/agents/components/ToolPermissionControl';
import { PERMISSION_OPTIONS } from '@/modules/pace/components/agents/constants/agents.constants';

const ToolPermissionRow = ({
  tool,
  isLast,
  isLoadingPolicies,
  canEdit,
  onPermissionChange,
}: ToolPermissionRowPropsType) => {
  const permissionOption = PERMISSION_OPTIONS.find((opt) => opt.value === tool.permission);
  const PermissionIcon = permissionOption?.icon;

  return (
    <motion.div
      variants={{
        expanded: { opacity: 1, y: 0 },
        collapsed: { opacity: 0, y: -4 },
      }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={cn('flex items-center pl-5', isLast ? 'pt-2 pb-0' : 'py-2')}
    >
      <span className='f-12-400 text-GRAY_950 flex-1'>{tool.name}</span>
      <CommonWrapper
        isLoading={isLoadingPolicies}
        skeletonType={SkeletonTypes.CUSTOM}
        loader={<Skeleton className='h-6 w-[88px] rounded-md' />}
        disableAnimation
      >
        {canEdit ? (
          <ToolPermissionControl permission={tool.permission} onPermissionChange={onPermissionChange} />
        ) : (
          PermissionIcon && (
            <span
              className='text-GRAY_700 flex h-6 w-6 items-center justify-center'
              aria-label={permissionOption?.label}
            >
              <PermissionIcon size={12} />
            </span>
          )
        )}
      </CommonWrapper>
    </motion.div>
  );
};

export default ToolPermissionRow;
