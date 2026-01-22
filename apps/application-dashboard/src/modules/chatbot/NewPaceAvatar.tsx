import Image from 'next/image';

const NewPaceAvatar = () => {
  return (
    <div className='grid h-5 min-h-5 w-5 min-w-5 place-items-center rounded-full'>
      <Image src='/icons/pace/pace-avatar.svg' alt='Pace Avatar' height={20} width={20} />
    </div>
  );
};

export default NewPaceAvatar;
