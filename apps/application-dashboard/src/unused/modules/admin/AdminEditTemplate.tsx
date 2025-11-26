import { FC, useEffect, useState } from 'react';
import MonacoEditor from '@monaco-editor/react';
import { captureException } from '@sentry/browser';
import { type Edge } from '@xyflow/react';
import { useGetTemplatesMutation, useUpsertTemplateMutation } from '@/apis/admin';
import { Button } from '@/components/common/button/Button';
import Input from '@/components/common/input';
import ImageLoader from '@/components/common/loader/ImageLoader';
import { TOAST_MESSAGES } from '@/components/common/toast/toast.constants';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import FullScreenPopup from '@/components/FullScreenPopup';
import { ZAMP_LOGO_LOADER_SVG } from '@/constants/icons';
import { SIZE_TYPES } from '@/types/common/components';
import { toast } from 'components/common/toast/Toast';

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
        toast.success(TOAST_MESSAGES.SUCCESS_TEMPLATE_UPDATED);
      })
      .catch((error) => {
        captureException(error);
        toast.error(TOAST_MESSAGES.ERROR_TEMPLATE_UPDATED);
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
        })
        .catch((error) => {
          captureException(error);
          toast.error(TOAST_MESSAGES.ERROR_TEMPLATE_FETCH);
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
          <ImageLoader imageSrc={ZAMP_LOGO_LOADER_SVG} width={140} height={140} className='z-1000 overflow-y-auto' />
        }
      >
        <div className='m-4 flex items-center justify-between'>
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
