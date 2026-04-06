import type { AgentAvatarConfig } from 'modules/pace/components/agents/constants/agents.constants';
import ImageKitImage from '@/components/ImageKitImage';

interface AgentTabIconProps {
  avatar: AgentAvatarConfig;
}

const AgentTabIcon = ({ avatar }: AgentTabIconProps) => (
  <div className='flex size-4 shrink-0 items-center justify-center'>
    <ImageKitImage src={avatar.src} alt={avatar.alt} width={16} height={16} className='size-full object-contain' />
  </div>
);

export default AgentTabIcon;
