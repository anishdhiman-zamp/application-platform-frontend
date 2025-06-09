import React from 'react';
import DatasetById from 'modules/data/Dataset';

const Dataset = async ({ params }: { params: Promise<{ datasetId: string }> }) => {
  const { datasetId } = await params;

  return <DatasetById id={datasetId} />;
};

export default Dataset;
