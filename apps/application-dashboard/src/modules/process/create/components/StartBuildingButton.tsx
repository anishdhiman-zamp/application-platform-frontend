import { FC } from 'react';
import { Button } from '@zamp-platform/ui';

type StartBuildingButtonProps = {
  onClick: () => void;
  disabled: boolean;
};

const StartBuildingButton: FC<StartBuildingButtonProps> = ({ onClick, disabled }) => {
  return (
    <div className='mt-8 w-1/2'>
      <Button
        onClick={onClick}
        className='disabled:bg-GRAY_100 disabled:text-GRAY_700 w-full disabled:opacity-100'
        variant='default'
        size='large'
        disabled={disabled}
        data-testid='start-building-button'
      >
        Start building
      </Button>
    </div>
  );
};

export default StartBuildingButton;
