import { Button } from '@zamp-platform/ui';
import { MessageSquarePlusIcon } from 'lucide-react';

const CommentButton = () => {
  return (
    <Button
      variant='ghost'
      size='icon'
      className='h-5 w-7.5 text-gray-900 opacity-0 group-hover:opacity-100 [&_svg]:size-3'
    >
      <MessageSquarePlusIcon />
    </Button>
  );
};

export default CommentButton;
