import Image from 'next/image';

const NewPaceAvatar = () => {
  return (
    <div className='grid h-6 min-h-6 w-6 min-w-6 place-items-center rounded-full'>
      <Image src='/icons/pace/pace-avatar.svg' alt='Pace Avatar' height={20} width={20} />
    </div>
  );
};

export default NewPaceAvatar;
