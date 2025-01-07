import { FC } from 'react';
import { defaultFnType } from 'types/commonTypes';
import { stopPropagationAction } from 'utils/common';

type PopupProps = {
  isOpen: boolean;
  children: any;
  className?: string;
  onClose?: defaultFnType;
  closeOnClickOutside?: boolean;
};

const Popup: FC<PopupProps> = ({ isOpen = false, children, className = '', onClose, closeOnClickOutside = true }) => {
  if (!isOpen) return null;

  return (
    <div
      className={`bg-GRAY_70 transition-all duration-300 ease-in fixed w-screen h-screen z-1000 top-0 left-0 ${
        isOpen ? 'opacity-1' : 'hidden opacity-0'
      }`}
      role='presentation'
      onClick={() => {
        if (closeOnClickOutside) onClose?.();
      }}
    >
      <div className='w-full h-full flex items-center justify-center'>
        <div
          className={`transition-all duration-300 ease-in px-5 py-5 rounded-xl block ${className} ${
            isOpen ? ' translate-y-0 opacity-1' : 'translate-y-[50px] opacity-0'
          }`}
          role='presentation'
          onClick={stopPropagationAction}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default Popup;
