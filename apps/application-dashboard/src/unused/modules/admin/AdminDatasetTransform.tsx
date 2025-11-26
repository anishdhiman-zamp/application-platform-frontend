import { FC, useEffect, useMemo, useState } from 'react';
import MonacoEditor from '@monaco-editor/react';
import DatasetById from 'modules/data/Dataset';
import { TransformDatasetResponseType } from 'types/api/admin.types';
import { defaultFn, defaultFnType, OptionsType } from 'types/commonTypes';
import { cn } from 'utils/common';
import { useGetAllDatasetsQuery, useTransformDatasetMutation } from '@/apis/admin';
import ImageLoader from '@/components/common/loader/ImageLoader';
import { ZAMP_LOGO_LOADER_SVG } from '@/constants/icons';
import { SIZE_TYPES } from '@/types/common/components';
import {
  DatasetTypeOptions,
  ProviderOptions,
  TRANSFORM_DATASET_LABEL_PROPS,
} from '@/unused/modules/admin/admin.constants';
import { DatasetType, ProviderType } from '@/unused/modules/admin/admin.types';
import { Button } from 'components/common/button/Button';
import { Dropdown } from 'components/common/dropdown';
import Input from 'components/common/input';
import { Label } from 'components/common/Label';
import CommonWrapper from 'components/commonWrapper';
import { SkeletonTypes } from 'components/commonWrapper/commonWrapper.types';
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
  const [clusterColumns, setClusterColumns] = useState('');
  const [datasetType, setDatasetType] = useState<OptionsType>(DatasetTypeOptions[0]);
  const [provider, setProvider] = useState<OptionsType>(ProviderOptions[0]);
  const [templateName, setTemplateName] = useState('');
  const [targetDataset, setTargetDataset] = useState<OptionsType | null>(null);
  const [sourceDatasetId, setSourceDatasetId] = useState('');
  const [orderByColumn, setOrderByColumn] = useState('');

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
      source_dataset_id: sourceDatasetId,
      destination_dataset_id: targetDataset?.value as string,
      dedup_columns: dedupColumns.split(',').map((column) => column.trim()),
      partition_columns: partitionColumns.split(',').map((column) => column.trim()),
      cluster_columns: clusterColumns.split(',').map((column) => column.trim()),
      dataset_type: datasetType.value as DatasetType,
      provider: provider.value as ProviderType,
      transformation_template_name: templateName,
      order_by_column: orderByColumn,
    });
  };

  const handleSourceDatasetDropdownChange = (selectedOption: OptionsType) => {
    setSourceDatasetId(selectedOption.value as string);
  };

  const handleTargetDatasetDropdownChange = (selectedOption: OptionsType) => {
    setTargetDataset(Array.isArray(selectedOption) ? null : selectedOption);
  };

  const dropdownOptions = useMemo(() => {
    return (
      data?.datasets?.map((dataset) => ({
        label: `${dataset.Title} (${dataset.ID})`,
        value: dataset.ID,
      })) || []
    );
  }, [data]);

  const isDisabled = !(sourceDatasetId && jsonData && templateName && (targetDataset?.value || (title && description)));
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
          <ImageLoader imageSrc={ZAMP_LOGO_LOADER_SVG} width={140} height={140} className='z-1000 overflow-y-auto' />
        }
      >
        <div className='h-full space-y-4 overflow-y-auto'>
          <div className='flex items-center justify-between'>
            <div className='f-20-600 mb-4'>Transform</div>
            <Button
              onClick={handleSubmit}
              id='trigger-transformation'
              childrenClassName='text-nowrap'
              disabled={isDisabled}
              isLoading={isTransformLoading}
              size={SIZE_TYPES.MEDIUM}
            >
              Trigger Transformation
            </Button>
          </div>
          <div className='flex flex-1 gap-4'>
            <div className='w-1/2 space-y-2'>
              <Dropdown
                options={dropdownOptions}
                id='select-source-dataset'
                eventCallback={defaultFn}
                onChange={handleSourceDatasetDropdownChange}
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
                  title: 'Source Dataset*',
                  description: 'Dataset on which the transformation will be applied',
                  ...TRANSFORM_DATASET_LABEL_PROPS.dropdown,
                }}
                showLabel
              />
              <Label titleClassName='f-12-500 text-GRAY_900' title={`Source Dataset Id:- ${sourceDatasetId}`} />
            </div>
            <div className='w-1/2 space-y-2'>
              <Dropdown
                options={dropdownOptions}
                id='select-target-dataset'
                eventCallback={defaultFn}
                onChange={handleTargetDatasetDropdownChange}
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
                  title: 'Target Dataset',
                  description: 'Dataset that will be updated after transformation',
                  ...TRANSFORM_DATASET_LABEL_PROPS.dropdown,
                }}
                showLabel
                enableReset
                defaultValue={targetDataset}
                value={targetDataset}
                controlled={!targetDataset}
                resetProps={{
                  resetClassName: '',
                  resetTextClassName: '',
                  resetText: 'Clear',
                }}
              />
              <Label
                titleClassName='f-12-500 text-GRAY_900'
                title={`Target Dataset Id:- ${targetDataset?.value ?? ''}`}
              />
            </div>
          </div>
          {!targetDataset && (
            <div className='grid grid-cols-3 items-end gap-4'>
              <Input
                label='Name*'
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
                description='Name of the transformed dataset'
                {...TRANSFORM_DATASET_LABEL_PROPS.input}
              />
              <Input
                label='Description*'
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                description='Description of the transformed dataset'
                {...TRANSFORM_DATASET_LABEL_PROPS.input}
              />
              <Input
                label='Dedup Columns'
                description='Comma separated list of columns to dedup on'
                value={dedupColumns}
                onChange={(e) => setDedupColumns(e.target.value)}
                {...TRANSFORM_DATASET_LABEL_PROPS.input}
              />
              <Input
                label='Partition Columns'
                description='Comma separated list of columns to partition on'
                value={partitionColumns}
                onChange={(e) => setPartitionColumns(e.target.value)}
                {...TRANSFORM_DATASET_LABEL_PROPS.input}
              />
              <Input
                label='Cluster Columns'
                description='Comma separated list of columns to cluster on'
                value={clusterColumns}
                onChange={(e) => setClusterColumns(e.target.value)}
                {...TRANSFORM_DATASET_LABEL_PROPS.input}
              />
              <Input
                label='Order By Column'
                description='Column to order by'
                value={orderByColumn}
                onChange={(e) => setOrderByColumn(e.target.value)}
                {...TRANSFORM_DATASET_LABEL_PROPS.input}
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
                  title: 'Dataset Type*',
                  description: 'Whether the transformed dataset will be visible to users',
                  ...TRANSFORM_DATASET_LABEL_PROPS.dropdown,
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
                  title: 'Provider*',
                  description: 'Provider of the transformed dataset',
                  ...TRANSFORM_DATASET_LABEL_PROPS.dropdown,
                }}
                showLabel
                defaultValue={ProviderOptions[0]}
              />
            </div>
          )}
          <div className='flex gap-2'>
            <Button
              id='show-source-dataset'
              onClick={() => setDatasetId(sourceDatasetId)}
              size={SIZE_TYPES.XSMALL}
              disabled={!sourceDatasetId}
            >
              Show Source Dataset
            </Button>
            <Button
              id='show-target-dataset'
              onClick={() => setDatasetId(targetDataset?.value as string)}
              size={SIZE_TYPES.XSMALL}
              disabled={!targetDataset?.value}
            >
              Show Target Dataset
            </Button>
          </div>
          {datasetId && (
            <div className='h-[470px]'>
              <DatasetById
                id={datasetId as string}
                pageSize={10}
                isReadOnly
                gridStyle={{ width: '100%', height: '420px' }}
              />
            </div>
          )}
          <Input
            label='Template Name*'
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            description='Name of the transformation template that will be created'
            labelClassName={TRANSFORM_DATASET_LABEL_PROPS.input.labelClassName}
            className='w-96 space-y-2'
          />
          <Label titleClassName='f-12-500 text-GRAY_900 mb-2 select-none' title='Template*' />
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
