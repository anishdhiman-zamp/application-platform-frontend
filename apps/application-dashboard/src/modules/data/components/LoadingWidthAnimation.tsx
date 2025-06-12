import React from 'react';

const LoadingWidthAnimation = () => {
  return (
    <div className='relative'>
      <div className='border-GRAY_400 w-4 rounded-full border'></div>
      <div className='border-GRAY_1000 animate-width absolute top-0 w-2 rounded-full border'></div>
    </div>
  );
};

export default LoadingWidthAnimation;
