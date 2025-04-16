import { FC, useEffect, useState } from 'react';
import { useCreateDatasetMutation, useUpdateDatasetMutation } from 'apis/admin';
import { ProviderOptions, TRANSFORM_DATASET_LABEL_PROPS } from 'modules/admin/admin.constants';
import { EditDatasetType, ProviderType } from 'modules/admin/admin.types';
import { CreateDatasetResponseType } from 'types/api/admin.types';
import { defaultFn, defaultFnType, OptionsType } from 'types/commonTypes';
import { Dropdown } from 'components/common/dropdown';
import Input from 'components/common/input';
import SideDrawer from 'components/common/SideDrawer/SideDrawer';

type CreateDatasetProps = {
  isOpen: boolean;
  onClose: defaultFnType;
  onSuccessfulCreate: (data: CreateDatasetResponseType) => void;
  editDataset?: EditDatasetType;
};

const CreateDataset: FC<CreateDatasetProps> = ({ onClose, isOpen, onSuccessfulCreate, editDataset }) => {
  const [title, setTitle] = useState(editDataset?.title ?? '');
  const [description, setDescription] = useState(editDataset?.description ?? '');
  const [s3Path, setS3Path] = useState('');
  const [dedupColumns, setDedupColumns] = useState(editDataset?.dedup_columns?.join(',') ?? '');
  const [partitionColumns, setPartitionColumns] = useState(editDataset?.partition_columns?.join(',') ?? '');
  const [clusterColumns, setClusterColumns] = useState(editDataset?.cluster_columns?.join(',') ?? '');
  const [provider, setProvider] = useState<OptionsType>(ProviderOptions[0]);

  const [createDataset, { isLoading, isSuccess, data }] = useCreateDatasetMutation();
  const [updateDataset, { isLoading: isUpdating, isSuccess: isUpdateSuccess, data: updateData }] =
    useUpdateDatasetMutation();

  const handleSubmit = () => {
    if (editDataset) {
      updateDataset({
        datasetId: editDataset.datasetId,
        title,
        description,
        dedup_columns: dedupColumns.split(',').map((column) => column.trim()),
        cluster_columns: clusterColumns.split(',').map((column) => column.trim()),
        partition_columns: partitionColumns.split(',').map((column) => column.trim()),
      });
    } else {
      createDataset({
        title,
        description,
        s3_path: s3Path,
        partition_columns: partitionColumns.split(',').map((column) => column.trim()),
        cluster_columns: clusterColumns.split(',').map((column) => column.trim()),
        provider: provider.value as ProviderType,
      });
    }
  };

  useEffect(() => {
    if (isSuccess && data) {
      onClose();
      onSuccessfulCreate(data);
    }
  }, [isSuccess, data, onSuccessfulCreate, onClose]);

  useEffect(() => {
    if (isUpdateSuccess && updateData) {
      onClose();
      onSuccessfulCreate(updateData);
    }
  }, [isUpdateSuccess, updateData, onSuccessfulCreate, onClose]);

  return (
    <SideDrawer
      title={editDataset ? 'Edit Dataset' : 'Create Dataset'}
      isOpen={isOpen}
      onClose={onClose}
      id='create-dataset'
      nextButtonTitle='Submit'
      backButtonTitle='Cancel'
      onNext={handleSubmit}
      onBack={onClose}
      childrenWrapperClassName='h-[calc(100%-170px)] overflow-y-auto'
      isNextButtonLoading={isLoading || isUpdating}
      isNextButtonDisabled={!title || !description || (!editDataset && !s3Path)}
    >
      <div className='space-y-4'>
        <Input label='Title*' value={title} onChange={(e) => setTitle(e.target.value)} />
        <Input label='Description*' value={description} onChange={(e) => setDescription(e.target.value)} />
        {!editDataset && <Input label='S3 Path*' value={s3Path} onChange={(e) => setS3Path(e.target.value)} />}
        {!editDataset && (
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
              description: 'Provider of the dataset',
              ...TRANSFORM_DATASET_LABEL_PROPS.dropdown,
            }}
            showLabel
            defaultValue={ProviderOptions[0]}
          />
        )}
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
        <Input
          label='Cluster Columns'
          description='Comma separated list of columns to cluster on'
          value={clusterColumns}
          onChange={(e) => setClusterColumns(e.target.value)}
          {...TRANSFORM_DATASET_LABEL_PROPS.input}
        />
      </div>
    </SideDrawer>
  );
};

export default CreateDataset;
