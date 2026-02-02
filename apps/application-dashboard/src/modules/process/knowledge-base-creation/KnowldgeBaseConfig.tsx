'use client';

import { Fragment } from 'react';
import { Link2, Zap } from 'lucide-react';
import IntegrationSelector from 'modules/process/knowledge-base-creation/components/IntegrationSelector';
import TriggerSelector from 'modules/process/knowledge-base-creation/components/TriggerSelector';
import { IntegrationType } from '@/modules/integrations/types/integrations.types';

const getKnowledgeBaseConfigList = (integrations: IntegrationType[]) => [
  {
    icon: <Zap size={14} />,
    label: 'Trigger',
    key: 'trigger',
    selector: <TriggerSelector integrations={integrations} />,
  },
  {
    icon: <Link2 size={14} className='-rotate-45' />,
    label: 'Integration',
    key: 'integration',
    selector: <IntegrationSelector integrations={integrations} />,
  },
];

const KnowledgeBaseConfig = ({ integrations }: { integrations: IntegrationType[] }) => {
  const KNOWLEDGE_BASE_CONFIG_LIST = getKnowledgeBaseConfigList(integrations);

  return (
    <div className='grid grid-cols-[110px_1fr] gap-x-8 gap-y-4 border-b pt-1 pb-8'>
      {KNOWLEDGE_BASE_CONFIG_LIST.map((item) => (
        <Fragment key={item.key}>
          <div className='f-13-500 mt-1 flex items-start gap-1 text-gray-900'>
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </div>
          <div className='flex items-start'>{item.selector}</div>
        </Fragment>
      ))}
    </div>
  );
};

export default KnowledgeBaseConfig;
