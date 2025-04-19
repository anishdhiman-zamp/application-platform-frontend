import { FC, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import MonacoEditor from '@monaco-editor/react';
import { type Edge } from '@xyflow/react';
import { useGetTemplatesMutation, useUpsertTemplateMutation } from '@/apis/admin';
import { Button } from '@/components/common/button/Button';
import Input from '@/components/common/input';
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
  const [name, setName] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [upsertTemplate, { isLoading: isUpserting }] = useUpsertTemplateMutation();
  const handleEditorChange = (value: string | undefined) => {
    setJsonData(value ?? '');
  };

  const handleUpdateTemplate = () => {
    upsertTemplate({
      id: templateId,
      name: name,
      configuration: jsonData,
    })
      .unwrap()
      .then(() => {
        toast.success('Template updated successfully');
      })
      .catch((error) => {
        console.error(error);
        toast.error('Error updating template');
      });
  };

  useEffect(() => {
    if (edge?.label) {
      getTemplates({ template_ids: [edge?.label as string] })
        .unwrap()
        .then((data) => {
          const template = data?.templates?.[0];

          if (template) {
            setJsonData(JSON.stringify(JSON.parse(template?.configuration), null, 2));
            setName(template?.name);
            setTemplateId(template?.id);
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
          <Button
            size={SIZE_TYPES.MEDIUM}
            id='update-template'
            onClick={handleUpdateTemplate}
            disabled={isUpserting}
            isLoading={isUpserting}
          >
            Update Template
          </Button>
        </div>
        <div className='m-4'>
          <Input label='Template Name' value={name} onChange={(e) => setName(e.target.value)} />
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
