import { createContext, Dispatch, FC, ReactElement, useContext, useReducer } from 'react';
import { MapAny } from 'types/commonTypes';

const enum artifactContextActions {
  SET_SEARCH_TERM = 'SET_SEARCH_TERM',
}

interface ArtifactContextStateType {
  searchTerm: string;
}

export interface ArtifactActionType {
  type: keyof typeof artifactContextActions;
  payload?: MapAny;
}

const initialState: ArtifactContextStateType = {
  searchTerm: '',
};

const context = createContext<{
  state: ArtifactContextStateType;
  dispatch: Dispatch<ArtifactActionType>;
}>({
  state: initialState,
  dispatch: () => null,
});

const { Provider } = context;

interface ArtifactStateProviderProps {
  children: ReactElement;
}

/* eslint-disable react/display-name */
export const ArtifactStateProvider: FC<ArtifactStateProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(
    (state: ArtifactContextStateType, action: ArtifactActionType): ArtifactContextStateType => {
      switch (action.type) {
        case artifactContextActions.SET_SEARCH_TERM:
          return {
            ...state,
            searchTerm: action?.payload?.searchTerm || '',
          };

        default:
          return state;
      }
    },
    initialState,
  );

  return <Provider value={{ state, dispatch }}>{children}</Provider>;
};

const withArtifactContext = <T extends MapAny>(WrappedComponent: FC<T>) => {
  return (props: T) => (
    <ArtifactStateProvider>
      <WrappedComponent {...props} />
    </ArtifactStateProvider>
  );
};

const useArtifactContextStore = () => useContext(context);

export { artifactContextActions, useArtifactContextStore, withArtifactContext };
