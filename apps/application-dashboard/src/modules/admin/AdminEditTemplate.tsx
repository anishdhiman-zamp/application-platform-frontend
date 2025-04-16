import { FC, useEffect, useState } from 'react';
import MonacoEditor from '@monaco-editor/react';
import { type Edge } from '@xyflow/react';
import { useGetTemplatesMutation } from '@/apis/admin';
import { Button } from '@/components/common/button/Button';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import DynamicLottiePlayer from '@/components/DynamicLottiePlayer';
import FullScreenPopup from '@/components/FullScreenPopup';
import { ZAMP_LOGO_LOADER } from '@/constants/lottie/zamp-logo-loader';
import { SIZE_TYPES } from '@/types/common/components';

type AdminEditTemplateProps = {
  isOpen: boolean;
  onClose: () => void;
  edge: Edge;
};

const AdminEditTemplate: FC<AdminEditTemplateProps> = ({ isOpen, onClose, edge }) => {
  const [getTemplates, { data, isLoading, isError }] = useGetTemplatesMutation();
  const [jsonData, setJsonData] = useState('');

  const handleEditorChange = (value: string | undefined) => {
    setJsonData(value ?? '');
  };

  const handleUpdateTemplate = () => {
    console.log({ jsonData });
  };

  useEffect(() => {
    if (edge?.label) {
      getTemplates({ template_ids: [edge?.label as string] })
        .unwrap()
        .then((data) => {
          if (data?.templates?.[0]?.configuration) {
            setJsonData(JSON.stringify(JSON.parse(data?.templates?.[0]?.configuration), null, 2));
          }
        });
    }
  }, [edge]);

  return (
    <FullScreenPopup isOpen={isOpen} onClose={onClose}>
      <CommonWrapper
        isLoading={isLoading}
        isError={isError}
        skeletonType={SkeletonTypes.CUSTOM}
        loader={
          <div className='flex justify-center items-center h-full overflow-y-auto w-full z-1000 bg-white'>
            <DynamicLottiePlayer
              src={ZAMP_LOGO_LOADER}
              className='lottie-player h-[140px]'
              autoplay
              loop
              keepLastFrame
            />
          </div>
        }
      >
        <div className='flex justify-between m-4 items-center'>
          <div className='f-20-600'>{data?.templates?.[0]?.name}</div>
          <Button size={SIZE_TYPES.MEDIUM} id='update-template' onClick={handleUpdateTemplate}>
            Update Template
          </Button>
        </div>
        <div className='h-full w-full'>
          <MonacoEditor
            height='90vh'
            language='json'
            value={jsonData}
            onChange={handleEditorChange}
            theme='light'
            options={{
              selectOnLineNumbers: true,
              automaticLayout: true,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              formatOnPaste: true,
              formatOnType: true,
            }}
          />
        </div>
      </CommonWrapper>
    </FullScreenPopup>
  );
};

export default AdminEditTemplate;
