import { FC, useEffect, useState } from 'react';
import { useCreateDatasetMutation } from 'apis/admin';
import { ProviderOptions } from 'modules/admin/admin.constants';
import { ProviderType } from 'modules/admin/admin.types';
import { CreateDatasetResponseType } from 'types/api/admin.types';
import { defaultFn, defaultFnType, OptionsType } from 'types/commonTypes';
import { Dropdown } from 'components/common/dropdown';
import Input from 'components/common/input';
import SideDrawer from 'components/common/SideDrawer/SideDrawer';
type CreateDatasetProps = {
  isOpen: boolean;
  onClose: defaultFnType;
  onSuccessfulCreate: (data: CreateDatasetResponseType) => void;
};

const CreateDataset: FC<CreateDatasetProps> = ({ onClose, isOpen, onSuccessfulCreate }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [s3Path, setS3Path] = useState('');
  const [dedupColumns, setDedupColumns] = useState('');
  const [partitionColumns, setPartitionColumns] = useState('');
  const [provider, setProvider] = useState<OptionsType>(ProviderOptions[0]);

  const [createDataset, { isLoading, isSuccess, data }] = useCreateDatasetMutation();

  const handleSubmit = () => {
    createDataset({
      title,
      description,
      s3_path: s3Path,
      dedup_columns: dedupColumns.split(',').map((column) => column.trim()),
      partition_columns: partitionColumns.split(',').map((column) => column.trim()),
      provider: provider.value as ProviderType,
    });
  };

  useEffect(() => {
    if (isSuccess && data) {
      onClose();
      onSuccessfulCreate(data);
    }
  }, [isSuccess, data, onSuccessfulCreate, onClose]);

  return (
    <SideDrawer
      title='Create Dataset'
      isOpen={isOpen}
      onClose={onClose}
      id='create-dataset'
      nextButtonTitle='Submit'
      backButtonTitle='Cancel'
      onNext={handleSubmit}
      onBack={onClose}
      childrenWrapperClassName='h-[calc(100%-170px)] overflow-y-auto'
      isNextButtonLoading={isLoading}
      isNextButtonDisabled={!title || !description || !s3Path}
    >
      <div className='space-y-4'>
        <Input label='Title' value={title} onChange={(e) => setTitle(e.target.value)} />
        <Input label='Description' value={description} onChange={(e) => setDescription(e.target.value)} />
        <Input label='S3 Path' value={s3Path} onChange={(e) => setS3Path(e.target.value)} />
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
      </div>
    </SideDrawer>
  );
};

export default CreateDataset;
