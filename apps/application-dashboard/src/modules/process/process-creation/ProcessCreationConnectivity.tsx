import { PlusCircle } from 'lucide-react';
import IntegrationsCard from 'modules/process/process-creation/components/IntegrationsCard';
import { PROCESS_CREATION_DUMMY_DATA } from 'modules/process/process-creation/process-creation.dummy';

const ProcessCreationConnectivity = () => {
  return (
    <div className='flex flex-col gap-4'>
      {PROCESS_CREATION_DUMMY_DATA.map((section, index) => {
        const IconComponent = section.icon;

        return (
          <div key={index} className='grid grid-cols-2 gap-2'>
            <div className='flex min-w-[150px] items-center gap-1 text-gray-900'>
              <IconComponent size={14} className={`text-gray-700 ${section.iconClassName || ''}`} />
              <div className='f-13-500'>{section.label}</div>
            </div>
            <div className='flex items-center gap-0.5'>
              {section.cards.map((card, cardIndex) => (
                <IntegrationsCard
                  key={cardIndex}
                  type={card.type}
                  title={card.title}
                  isFirstCard={card.isFirstCard}
                  isLastCard={card.isLastCard}
                />
              ))}
              {section.showAddButton && <PlusCircle size={12} className='ml-2 cursor-pointer text-gray-900' />}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ProcessCreationConnectivity;
