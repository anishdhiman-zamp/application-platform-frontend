'use client';

import { useState } from 'react';
import { Button } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { motion, useAnimation } from 'motion/react';
import ZampLogo, {
  ZAMP_LOGO_PLAYABLE_ANIMATIONS,
  ZAMP_LOGO_WRAPPER_VARIANTS,
  type ZampLogoAnimationType,
} from '@/modules/chatbot/ZampLogo';

type BackgroundType = 'light' | 'dark';

const ZampLogoControlPanel = () => {
  const [size, setSize] = useState(120);
  const [background, setBackground] = useState<BackgroundType>('light');
  const [activeVariant, setActiveVariant] = useState<ZampLogoAnimationType | null>(null);
  const [isPlayingAll, setIsPlayingAll] = useState(false);
  const controls = useAnimation();

  const playVariant = async (variant: ZampLogoAnimationType) => {
    setActiveVariant(variant);
    await controls.start(variant);
    if (variant !== 'rest') {
      await controls.start('rest', { duration: 0 });
    }
  };

  const handlePlay = (variant: ZampLogoAnimationType) => {
    if (isPlayingAll) return;
    playVariant(variant);
  };

  const handleReset = () => {
    if (isPlayingAll) return;
    setActiveVariant(null);
    controls.start('rest', { duration: 0 });
  };

  const handlePlayAll = async () => {
    if (isPlayingAll) return;
    setIsPlayingAll(true);
    for (const variant of ZAMP_LOGO_PLAYABLE_ANIMATIONS) {
      // eslint-disable-next-line no-await-in-loop
      await playVariant(variant);
    }
    setIsPlayingAll(false);
  };

  const previewBgClass = background === 'dark' ? 'bg-GRAY_1000' : 'bg-GRAY_100';
  const previewLogoClass = background === 'dark' ? 'text-BG_WHITE' : 'text-GRAY_1000';

  return (
    <div className='flex h-full w-full flex-col gap-6 px-8 py-6'>
      <header className='flex flex-col gap-1'>
        <h1 className='f-20-600 text-GRAY_1000'>ZampLogo Animation Lab</h1>
        <p className='f-13-400 text-GRAY_700'>
          Trigger each hover variant in isolation. The same controls drive the icon on the chat home page.
        </p>
      </header>

      <section
        className={cn(
          'border-GRAY_300 flex min-h-[320px] items-center justify-center rounded-xl border transition-colors',
          previewBgClass,
        )}
        style={{ perspective: size * 8 }}
      >
        <motion.div
          variants={ZAMP_LOGO_WRAPPER_VARIANTS}
          animate={controls}
          initial='rest'
          className='grid place-items-center'
          style={{ transformStyle: 'preserve-3d' }}
        >
          <ZampLogo size={size} className={previewLogoClass} controls={controls} />
        </motion.div>
      </section>

      <section className='flex flex-col gap-3'>
        <span className='f-13-500 text-GRAY_900'>Variants</span>
        <div className='flex flex-wrap gap-2'>
          {ZAMP_LOGO_PLAYABLE_ANIMATIONS.map((variant) => (
            <Button
              key={variant}
              size='medium'
              variant={activeVariant === variant ? 'default' : 'outline'}
              onClick={() => handlePlay(variant)}
              disabled={isPlayingAll}
            >
              {variant}
            </Button>
          ))}
          <Button size='medium' variant='secondary' onClick={handlePlayAll} disabled={isPlayingAll}>
            {isPlayingAll ? 'Playing all…' : 'Play all'}
          </Button>
          <Button size='medium' variant='ghost' onClick={handleReset} disabled={isPlayingAll}>
            Reset
          </Button>
        </div>
      </section>

      <section className='flex flex-col gap-3'>
        <span className='f-13-500 text-GRAY_900'>Preview controls</span>
        <div className='flex flex-wrap items-center gap-6'>
          <label className='flex items-center gap-3'>
            <span className='f-13-400 text-GRAY_800 w-14 shrink-0'>Size</span>
            <input
              type='range'
              min={32}
              max={240}
              step={4}
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              className='accent-GRAY_1000 w-48'
            />
            <span className='f-12-500 text-GRAY_700 tabular-nums'>{size}px</span>
          </label>

          <div className='flex items-center gap-2'>
            <span className='f-13-400 text-GRAY_800'>Background</span>
            <Button
              size='small'
              variant={background === 'light' ? 'default' : 'outline'}
              onClick={() => setBackground('light')}
            >
              Light
            </Button>
            <Button
              size='small'
              variant={background === 'dark' ? 'default' : 'outline'}
              onClick={() => setBackground('dark')}
            >
              Dark
            </Button>
          </div>
        </div>
      </section>

      {activeVariant ? (
        <p className='f-12-400 text-GRAY_700'>
          Last played: <span className='text-GRAY_1000 font-mono'>{activeVariant}</span>
        </p>
      ) : null}
    </div>
  );
};

export default ZampLogoControlPanel;
