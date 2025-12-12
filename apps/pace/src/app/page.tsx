'use client';

import { useState } from 'react';
import { ArrowRight, Mic, Paperclip } from 'lucide-react';
import Image from 'next/image';

function getGreeting(): string {
  const hour = new Date().getHours();

  if (hour < 12) return 'Morning';
  if (hour < 17) return 'Afternoon';

  return 'Evening';
}

export default function PaceHomePage() {
  const [message, setMessage] = useState('');
  const greeting = getGreeting();
  const userName = 'Razi'; // This would come from user context/auth

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      console.log('Sending message:', message);
      setMessage('');
    }
  };

  return (
    <div className='flex h-full flex-col items-center justify-center px-4'>
      <div className='flex w-full max-w-xl flex-col items-center'>
        {/* Logo */}
        <div className='relative h-12 w-12'>
          <Image src='/pace/icons/pace.svg' alt='Pace Logo' width={48} height={48} unoptimized priority />
        </div>

        {/* Greeting */}
        <h1 className='text-GRAY_900 mt-4 text-xl font-semibold'>
          {greeting}, {userName}!
        </h1>

        {/* Chat Input */}
        <form onSubmit={handleSubmit} className='mt-8 w-full'>
          <div className='border-GRAY_200 focus-within:border-GRAY_300 relative rounded-xl border bg-white shadow-sm transition-shadow focus-within:shadow-md'>
            {/* Input field */}
            <input
              type='text'
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Do your life's best work with Pace"
              className='text-15 text-GRAY_900 placeholder:text-GRAY_500 w-full rounded-xl bg-transparent px-4 pt-4 pb-12 focus:outline-none'
            />

            {/* Bottom toolbar */}
            <div className='absolute right-3 bottom-3 left-3 flex items-center justify-between'>
              <div className='flex items-center gap-1'>
                <button
                  type='button'
                  className='text-GRAY_500 hover:bg-GRAY_100 hover:text-GRAY_700 flex h-8 w-8 items-center justify-center rounded-md transition-colors'
                >
                  <Mic className='h-4 w-4' />
                </button>
                <button
                  type='button'
                  className='text-GRAY_500 hover:bg-GRAY_100 hover:text-GRAY_700 flex h-8 w-8 items-center justify-center rounded-md transition-colors'
                >
                  <Paperclip className='h-4 w-4' />
                </button>
              </div>

              <button
                type='submit'
                disabled={!message.trim()}
                className='bg-GRAY_900 hover:bg-GRAY_800 disabled:bg-GRAY_300 flex h-8 w-8 items-center justify-center rounded-full text-white transition-colors disabled:cursor-not-allowed'
              >
                <ArrowRight className='h-4 w-4' />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
