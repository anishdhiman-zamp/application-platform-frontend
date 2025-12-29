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
        className='w-full'
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
