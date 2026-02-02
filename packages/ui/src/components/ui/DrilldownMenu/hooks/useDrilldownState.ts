import { useState } from 'react';

export type DrilldownStateOutput<T extends Record<string, any> = Record<string, any>> = {
  getState: (id: string) => T | undefined; // eslint-disable-line no-unused-vars
  setNodeState: (id: string, value: T) => void; // eslint-disable-line no-unused-vars
};

const useDrilldownState = <T extends Record<string, any>>(): DrilldownStateOutput<T> => {
  const [state, setState] = useState<Record<string, T>>({});

  const getState = (id: string): T | undefined => state[id];

  const setNodeState = (id: string, value: T) => {
    setState((prev) => ({ ...prev, [id]: value }));
  };

  return { getState, setNodeState };
};

export default useDrilldownState;
