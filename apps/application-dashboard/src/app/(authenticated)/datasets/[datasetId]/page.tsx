import DatasetById from 'modules/data/Dataset';

export default async function DatasetPage({ params }: { params: Promise<{ datasetId: string }> }) {
  const { datasetId } = await params;

  return <DatasetById id={datasetId} />;
}
