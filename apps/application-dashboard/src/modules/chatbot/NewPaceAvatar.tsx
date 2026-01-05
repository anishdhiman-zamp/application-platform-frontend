import NewPaceIcons from '@/assets/Icons/NewPaceIcons';

const NewPaceAvatar = () => {
  return (
    <div className='flex h-4 min-h-4 w-4 min-w-4 items-center justify-center rounded-md [&_svg_path]:fill-blue-700'>
      <NewPaceIcons height={16} width={16} />
    </div>
  );
};

export default NewPaceAvatar;
