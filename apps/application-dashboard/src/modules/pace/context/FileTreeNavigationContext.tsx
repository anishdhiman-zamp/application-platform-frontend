'use client';

import { createContext, Dispatch, FC, ReactElement, useCallback, useContext, useReducer, useRef } from 'react';

type RevealHandler = (path: string) => void;

enum fileTreeNavigationContextActions {
  REVEAL_PATH = 'REVEAL_PATH',
}

interface InitialStateType {
  revealedPath: string | null;
}

export interface ActionType {
  type: keyof typeof fileTreeNavigationContextActions;
  payload?: { revealedPath: string | null };
}

const initialState: InitialStateType = {
  revealedPath: null,
};

interface ContextValue {
  state: InitialStateType;
  dispatch: Dispatch<ActionType>;
  registerRevealHandler: (handler: RevealHandler | null) => void;
  revealPathInTree: (path: string) => void;
}

const context = createContext<ContextValue>({
  state: initialState,
  dispatch: () => null,
  registerRevealHandler: () => null,
  revealPathInTree: () => null,
});

const { Provider } = context;

/* eslint-disable react/display-name */
export const StateProvider: FC<{ children: ReactElement }> = ({ children }) => {
  const handlerRef = useRef<RevealHandler | null>(null);

  const [state, dispatch] = useReducer((state: InitialStateType, action: ActionType): InitialStateType => {
    if (!action) {
      return state;
    }

    switch (action.type) {
      case fileTreeNavigationContextActions.REVEAL_PATH:
        return { ...state, revealedPath: action?.payload?.revealedPath ?? null };

      default:
        return state;
    }
  }, initialState);

  const registerRevealHandler = useCallback((handler: RevealHandler | null) => {
    handlerRef.current = handler;
  }, []);

  const revealPathInTree = useCallback((path: string) => {
    dispatch({ type: fileTreeNavigationContextActions.REVEAL_PATH, payload: { revealedPath: path } });
    handlerRef.current?.(path);
  }, []);

  return <Provider value={{ state, dispatch, registerRevealHandler, revealPathInTree }}>{children}</Provider>;
};

export const FileTreeNavigationProvider = StateProvider;

const withFileTreeNavigationContext = (WrappedComponent: FC<any>) => {
  return (props: any) => (
    <StateProvider>
      <WrappedComponent {...props} />
    </StateProvider>
  );
};

const useFileTreeNavigationContextStore = () => useContext(context);

export const useFileTreeNavigation = () => {
  const store = useContext(context);

  if (!store) {
    throw new Error('useFileTreeNavigation must be used within a FileTreeNavigationProvider');
  }

  return {
    revealedPath: store.state.revealedPath,
    revealPathInTree: store.revealPathInTree,
    registerRevealHandler: store.registerRevealHandler,
  };
};

export { fileTreeNavigationContextActions, useFileTreeNavigationContextStore, withFileTreeNavigationContext };
