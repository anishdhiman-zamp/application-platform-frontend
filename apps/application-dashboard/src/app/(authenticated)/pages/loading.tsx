import ZampLogoLoader from '@/components/common/loader/ZampLogoLoader';

export default function Loading() {
  return (
    <div className='flex h-full items-center justify-center'>
      <div className='z-50 flex h-[calc(100vh-200px)] w-full items-center justify-center bg-white'>
        <ZampLogoLoader />
      </div>
    </div>
  );
}
