import type { FC } from 'react';
import { CSS_VARS } from '@zamp-platform/ui';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { CTA_COMPONENT_TYPE_ICON_MAPPING } from 'modules/process/process.constant';
import type { CTA_COMPONENT_TYPE } from 'modules/process/process.types';
import { motion } from 'motion/react';
import { cn } from '@/utils/common';

type ActionCommentProps = {
  action_comment: {
    action_type: CTA_COMPONENT_TYPE;
    comment: string;
  };
  isLastLog: boolean;
  staggerCompleteRef: React.RefObject<boolean>;
  ctasLength: number;
};

const ActionComment: FC<ActionCommentProps> = ({ action_comment, isLastLog, staggerCompleteRef, ctasLength }) => {
  return (
    <motion.div
      className={cn('mt-2 flex items-center justify-center gap-x-1.5', {
        'mt-4': !ctasLength,
      })}
      initial={{ opacity: isLastLog && !staggerCompleteRef.current ? 0 : 1 }}
      animate={{ opacity: isLastLog && !staggerCompleteRef.current ? 0 : 1 }}
    >
      <SvgSpriteLoader
        id={
          CTA_COMPONENT_TYPE_ICON_MAPPING[
            action_comment?.action_type as keyof typeof CTA_COMPONENT_TYPE_ICON_MAPPING
          ] ?? 'check'
        }
        size={12}
        color={CSS_VARS.GRAY_600}
      />
      <span className='f-11-450 text-GRAY_600'>{action_comment?.comment}</span>
    </motion.div>
  );
};

export default ActionComment;
