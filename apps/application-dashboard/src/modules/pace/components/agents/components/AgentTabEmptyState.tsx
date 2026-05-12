import { Button } from '@zamp-platform/ui';
import ImageKitImage from '@/components/ImageKitImage';

interface AgentTabEmptyStateProps {
  agentAvatarSrc?: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

const AgentTabEmptyState = ({ agentAvatarSrc, description, actionLabel, onAction }: AgentTabEmptyStateProps) => (
  <div className='border-GRAY_400 flex h-full w-full flex-col items-center justify-center gap-4 rounded-xl border px-25 py-6'>
    <span className='f-13-450 text-GRAY_700 flex items-start justify-start gap-2'>
      {agentAvatarSrc ? (
        <ImageKitImage src={agentAvatarSrc} alt='Agent' width={16} height={16} className='shrink-0 object-contain' />
      ) : (
        <span className='shrink-0'>🤖</span>
      )}
      <span>{description}</span>
    </span>
    {actionLabel && onAction && (
      <Button variant='outline' size='small' className='shrink-0 rounded-lg px-3 text-xs' onClick={onAction}>
        {actionLabel}
      </Button>
    )}
  </div>
);

export default AgentTabEmptyState;
