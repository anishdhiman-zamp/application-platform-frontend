import { FC, useEffect, useMemo, useState } from 'react';
import MonacoEditor from '@monaco-editor/react';
import { useGetAllDatasetsQuery, useTransformDatasetMutation } from 'apis/admin';
import { ZAMP_LOGO_LOADER } from 'constants/lottie/zamp-logo-loader';
import { DatasetTypeOptions, ProviderOptions } from 'modules/admin/admin.constants';
import { DatasetType, ProviderType } from 'modules/admin/admin.types';
import DatasetById from 'modules/data/Dataset';
import { TransformDatasetResponseType } from 'types/api/admin.types';
import { defaultFn, defaultFnType, OptionsType } from 'types/commonTypes';
import { cn } from 'utils/common';
import { Button } from 'components/common/button/Button';
import { Dropdown } from 'components/common/dropdown';
import Input from 'components/common/input';
import { Label } from 'components/common/Label';
import CommonWrapper from 'components/commonWrapper';
import { SkeletonTypes } from 'components/commonWrapper/commonWrapper.types';
import DynamicLottiePlayer from 'components/DynamicLottiePlayer';
import FullScreenPopup from 'components/FullScreenPopup';

type AdminDatasetTransformProps = {
  onClose: defaultFnType;
  onSuccessfulTransform: (data: TransformDatasetResponseType) => void;
  isOpen: boolean;
};

const AdminDatasetTransform: FC<AdminDatasetTransformProps> = ({ onClose, onSuccessfulTransform, isOpen }) => {
  const { data, isLoading, isError } = useGetAllDatasetsQuery(undefined, {
    refetchOnMountOrArgChange: false,
  });
  const [transformDataset, { data: transformData, isLoading: isTransformLoading, isSuccess: isTransformSuccess }] =
    useTransformDatasetMutation();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [jsonData, setJsonData] = useState('');
  const [datasetId, setDatasetId] = useState('');
  const [dedupColumns, setDedupColumns] = useState('');
  const [partitionColumns, setPartitionColumns] = useState('');
  const [datasetType, setDatasetType] = useState<OptionsType>(DatasetTypeOptions[0]);
  const [provider, setProvider] = useState<OptionsType>(ProviderOptions[0]);
  const [templateName, setTemplateName] = useState('');

  const handleEditorChange = (value?: string) => {
    if (value) {
      setJsonData(value);
    }
  };

  const handleSubmit = () => {
    transformDataset({
      title,
      description,
      transformation_template_json: jsonData,
      source_dataset_id: datasetId,
      dedup_columns: dedupColumns.split(',').map((column) => column.trim()),
      partition_columns: partitionColumns.split(',').map((column) => column.trim()),
      dataset_type: datasetType.value as DatasetType,
      provider: provider.value as ProviderType,
      transformation_template_name: templateName,
    });
  };

  const handleDropdownChange = (selectedOption: OptionsType) => {
    setDatasetId(selectedOption.value as string);
  };

  const dropdownOptions = useMemo(() => {
    return (
      data?.datasets?.map((dataset) => ({
        label: dataset.Title,
        value: dataset.ID,
      })) || []
    );
  }, [data]);

  const isDisabled = !title || !description || !jsonData || !datasetId || !templateName;
  const editorHeight = `calc(100vh - 200px)`;

  useEffect(() => {
    if (isTransformSuccess && transformData) {
      onClose();
      onSuccessfulTransform(transformData);
    }
  }, [isTransformSuccess, transformData, onSuccessfulTransform, onClose]);

  return (
    <FullScreenPopup isOpen={isOpen} onClose={onClose}>
      <CommonWrapper
        className={cn('h-full px-4 pt-4', {
          'flex flex-col items-center justify-center': isLoading,
        })}
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
        <div className='space-y-4 h-full overflow-y-auto'>
          <div className='f-20-600 mb-4'>Transform</div>
          <div className='grid grid-cols-3 gap-4 items-end'>
            <Input label='Name' value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
            <Input label='Description' value={description} onChange={(e) => setDescription(e.target.value)} />
            <Input label='Template Name' value={templateName} onChange={(e) => setTemplateName(e.target.value)} />
            <Input
              label='Dedup Columns'
              description='Comma separated list of columns to dedup on'
              value={dedupColumns}
              onChange={(e) => setDedupColumns(e.target.value)}
              labelClassName='!mb-1'
              className='w-full space-y-2'
            />
            <Input
              label='Partition Columns'
              description='Comma separated list of columns to partition on'
              value={partitionColumns}
              onChange={(e) => setPartitionColumns(e.target.value)}
              labelClassName='!mb-1'
              className='w-full space-y-2'
            />
            <Dropdown
              options={DatasetTypeOptions}
              id='select-dataset-type'
              eventCallback={defaultFn}
              onChange={setDatasetType}
              value={datasetType}
              customStyles={{
                control: {
                  width: '100%',
                },
                menu: {
                  width: '100%',
                },
              }}
              labelProps={{
                title: 'Dataset Type',
              }}
              showLabel
              defaultValue={DatasetTypeOptions[0]}
            />
            <Dropdown
              options={ProviderOptions}
              id='select-provider'
              eventCallback={defaultFn}
              onChange={setProvider}
              value={provider}
              customStyles={{
                control: {
                  width: '100%',
                },
                menu: {
                  width: '100%',
                },
              }}
              labelProps={{
                title: 'Provider',
              }}
              showLabel
              defaultValue={ProviderOptions[0]}
            />
            <Button
              onClick={handleSubmit}
              id='trigger-transformation'
              childrenClassName='text-nowrap'
              disabled={isDisabled}
              isLoading={isTransformLoading}
            >
              Trigger Transformation
            </Button>
          </div>
          <Dropdown
            options={dropdownOptions}
            id='select-dataset'
            eventCallback={defaultFn}
            onChange={handleDropdownChange}
            customStyles={{
              control: {
                width: '100%',
              },
              menu: {
                width: '100%',
                zIndex: 1000,
              },
            }}
            labelProps={{
              title: 'Check Dataset',
            }}
            showLabel
            wrapperClass='w-1/2'
          />
          <Label titleClassName='f-12-500 text-GRAY_900' title={`Dataset Id:- ${datasetId}`} />
          <div className='h-[470px]'>
            {datasetId && (
              <DatasetById
                id={datasetId as string}
                pageSize={10}
                isReadOnly
                gridStyle={{ width: '100%', height: '420px' }}
              />
            )}
          </div>
          <Label titleClassName='f-12-500 text-GRAY_900 mb-2 select-none' title='Template' />
          <div style={{ height: editorHeight }}>
            <MonacoEditor
              height={editorHeight}
              language='json'
              value={jsonData}
              onChange={handleEditorChange}
              theme='light' // You can change the theme to 'vs' for light mode
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
        </div>
      </CommonWrapper>
    </FullScreenPopup>
  );
};

export default AdminDatasetTransform;
