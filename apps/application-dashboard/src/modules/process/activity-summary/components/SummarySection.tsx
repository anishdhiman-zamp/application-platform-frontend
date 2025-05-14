import SectionTitle from 'modules/process/activity-summary/components/SectionTitle';

const SummarySection = ({
  data,
}: {
  data: {
    id: number;
    title: string;
    fields: {
      id: number;
      label: string;
      value: string;
    }[];
  };
}) => {
  return (
    <div className='flex flex-col items-start justify-start w-full'>
      <SectionTitle title={data.title} />
      <div className='flex flex-col items-start justify-start w-full'>
        {data.fields.map((field) => (
          <div key={field.id} className='grid grid-cols-[180px_1fr] items-center w-full gap-x-3'>
            <p className='f-12-450 text-GRAY_900 truncate max-w-[180px]' title={field.label}>
              {field.label}
            </p>
            <p className='f-12-450 text-GRAY_1000 py-1.5 px-2 truncate max-w-full' title={field.value}>
              {field.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SummarySection;
