import { Button } from '@zamp-platform/ui';
import { MessageSquarePlusIcon } from 'lucide-react';
import TooltipV2 from '@/components/common/TooltipV2';

const CommentButton = () => {
  return (
    <TooltipV2 tooltipBody='Work with Pace' asChildTrigger>
      <Button
        variant='ghost'
        size='icon'
        data-comment-button
        className='h-5 w-7.5 text-gray-900 opacity-0 group-hover:opacity-100 [&_svg]:size-3'
      >
        <MessageSquarePlusIcon />
      </Button>
    </TooltipV2>
  );
};

export default CommentButton;
