import type { HeaderItem } from '@/modules/knowledge-based/KnowledgeBaseNavigation';
import { cn } from '@/utils/common';
interface KnowledgeBaseNavCardProps {
  header: HeaderItem;
  handleClick: (id: string) => void;
  currentSelectedHeader: string | null;
  level: number;
}

const KnowledgeBaseNavCard = ({ header, handleClick, currentSelectedHeader, level }: KnowledgeBaseNavCardProps) => {
  return (
    <div>
      <div
        className={cn('border-l border-gray-200 px-2', {
          '!border-gray-1000 !text-gray-1000 f-13-500 border-l-2': currentSelectedHeader === header?.id,
        })}
        style={{ paddingLeft: `${level * 16 + 16}px` }}
      >
        <div
          key={header?.id}
          onClick={(e) => {
            e.preventDefault();
            handleClick(header?.id);
          }}
          className={cn(
            'f-13-500 block w-full cursor-pointer rounded bg-white px-2 py-1.5 text-left text-gray-700 hover:bg-gray-100',
            {
              '!text-gray-1000': currentSelectedHeader === header?.id,
            },
          )}
        >
          {header?.text}
        </div>
      </div>
      <div>
        {header?.children &&
          header?.children?.map((child) => (
            <KnowledgeBaseNavCard
              key={child?.id}
              header={child ?? {}}
              handleClick={handleClick}
              currentSelectedHeader={currentSelectedHeader}
              level={level + 1}
            />
          ))}
      </div>
    </div>
  );
};

export default KnowledgeBaseNavCard;
