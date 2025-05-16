import { Tabs, TabsContent } from '@zamp-platform/ui';
import ArtifactTopbar from 'modules/process/artifacts/components/ArtifactTopbar';

interface ArtifactsProps {
  onClose: () => void;
  onExpand: () => void;
  isExpanded: boolean;
}

const Artifacts = ({ onClose, onExpand, isExpanded }: ArtifactsProps) => {
  return (
    <div className='overflow-auto max-w-full h-full flex flex-col'>
      <Tabs defaultValue='tab-1'>
        <ArtifactTopbar onClose={onClose} onExpand={onExpand} isExpanded={isExpanded} />
        <TabsContent value='tab-1'>
          <div className='h-full flex-1 p-4'>Tab 1</div>
        </TabsContent>
        <TabsContent value='tab-2'>
          <div className='h-full flex-1 p-4'>Tab 2</div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Artifacts;
