import { KeyRound } from 'lucide-react';

const CredentialsEmptyState = () => (
  <div className='border-GRAY_400 bg-BG_WHITE flex h-full min-h-[320px] flex-1 flex-col items-center justify-center gap-3 rounded-xl border px-6 py-12'>
    <div className='bg-GRAY_100 flex h-12 w-12 items-center justify-center rounded-full'>
      <KeyRound className='text-GRAY_700 h-5 w-5' />
    </div>
    <div className='flex flex-col items-center gap-1'>
      <p className='f-14-500 text-GRAY_1000'>No credentials yet</p>
      <p className='f-12-400 text-GRAY_700 max-w-[320px] text-center'>
        Add your first API key to make it available to your agents.
      </p>
    </div>
  </div>
);

export default CredentialsEmptyState;
