import { MenuNode } from '..';
import { useState } from 'react';

const useDrilldownMenu = (root: MenuNode) => {
  const [stack, setStack] = useState<MenuNode[]>([root]);

  const current = stack[stack.length - 1];

  return {
    current,
    canGoBack: stack.length > 1,
    goForward: (node: MenuNode) => setStack((s) => [...s, node]),
    goBack: () => setStack((s) => s.slice(0, -1)),
    reset: () => setStack([root]),
    backText: current.backText,
  };
};

export default useDrilldownMenu;
