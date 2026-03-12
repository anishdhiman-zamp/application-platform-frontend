'use client';

import { useRef } from 'react';
import { ZAMP_FULL_LOGO } from 'constants/icons';
import { LoginForm } from 'modules/login/LoginForm';
import { ProfessionRevealBackground } from 'modules/login/ProfessionRevealBackground';
import Image from 'next/image';

// Noise texture + gradient pseudo-elements — SVG data URLs are impractical as tailwind arbitrary values
const btnLoginStyles = `
.btn-login::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 16px;
  opacity: 0.3;
  pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-size: 100px 100px;
}
.btn-login::after {
  content: '';
  position: absolute;
  top: 0;
  left: 20%;
  width: 60%;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.5), transparent);
  pointer-events: none;
}
.dark .btn-login::after {
  background: linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.15), transparent);
}`;

export const LoginRoot = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div className='bg-GRAY_100 relative flex h-screen w-screen items-center justify-center overflow-hidden'>
      <style>{btnLoginStyles}</style>
      <ProfessionRevealBackground containerRef={containerRef} />
      <div ref={containerRef} className='relative z-2 w-full max-w-[400px] px-6 py-10'>
        <div className='mb-9 flex items-center justify-center'>
          <Image
            src={ZAMP_FULL_LOGO}
            priority
            alt='Zamp'
            width={68}
            height={15}
            draggable={false}
            className='select-none dark:invert'
          />
        </div>
        <LoginForm />
      </div>
    </div>
  );
};
