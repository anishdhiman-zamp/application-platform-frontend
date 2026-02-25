import { FC } from 'react';

type Props = {
  disabled?: boolean;
};

export const AnimatedDitherArrow: FC<Props> = ({ disabled }) => (
  <span className='relative z-[1] inline-flex h-[17px] w-[17px] overflow-hidden'>
    <svg
      className={`h-[17px] w-[17px] -translate-x-[40%] translate-y-[40%] opacity-0 transition-all duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${
        !disabled ? 'group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100' : 'opacity-30'
      }`}
      viewBox='0 0 17 17'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <rect x='3' y='11.9998' width='8.48409' height='2.12102' transform='rotate(-45 3 11.9998)' fill='currentColor' />
      <rect x='9' y='5.99979' width='2.12102' height='2.12102' transform='rotate(-45 9 5.99979)' fill='currentColor' />
      <rect
        x='7.49609'
        y='4.49979'
        width='2.12102'
        height='2.12102'
        transform='rotate(-45 7.49609 4.49979)'
        fill='currentColor'
      />
      <rect
        x='4.49609'
        y='4.5037'
        width='2.12102'
        height='2.12102'
        transform='rotate(-45 4.49609 4.5037)'
        fill='currentColor'
      />
      <rect
        x='10.5'
        y='7.50174'
        width='2.12102'
        height='2.12102'
        transform='rotate(-45 10.5 7.50174)'
        fill='currentColor'
      />
      <rect
        x='10.5'
        y='4.50174'
        width='2.12102'
        height='2.12102'
        transform='rotate(-45 10.5 4.50174)'
        fill='currentColor'
      />
      <rect
        x='10.4961'
        y='10.5037'
        width='2.12102'
        height='2.12102'
        transform='rotate(-45 10.4961 10.5037)'
        fill='currentColor'
      />
    </svg>
  </span>
);
