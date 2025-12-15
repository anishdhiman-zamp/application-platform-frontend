import { useCallback, useState } from 'react';

const usePopoverWithTooltip = () => {
  const [open, setOpen] = useState(false);
  const [tooltipDisabled, setTooltipDisabled] = useState(false);

  const handleOpenChange = useCallback((open: boolean) => {
    setOpen(open);
    if (open) {
      setTooltipDisabled(true);
    } else {
      setTimeout(() => setTooltipDisabled(false), 150);
    }
  }, []);

  return { open, handleOpenChange, tooltipDisabled };
};

export default usePopoverWithTooltip;
