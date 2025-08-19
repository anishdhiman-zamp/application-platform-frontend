import { createContext, Dispatch, FC, ReactElement, useContext, useReducer } from 'react';
import { ARTIFACT_TYPE } from 'modules/process/process.types';
import { MapAny } from 'types/commonTypes';

const enum artifactContextActions {
  SET_SEARCH_TERM = 'SET_SEARCH_TERM',
  SET_ARTIFACT_TYPE = 'SET_ARTIFACT_TYPE',
  SET_ARTIFACT_ID = 'SET_ARTIFACT_ID',
}

interface ArtifactContextStateType {
  searchTerm: string;
  artifactType: ARTIFACT_TYPE;
  artifactId: string;
}

export interface ArtifactActionType {
  type: keyof typeof artifactContextActions;
  payload?: MapAny;
}

const initialState: ArtifactContextStateType = {
  searchTerm: '',
  artifactType: ARTIFACT_TYPE.PDF_DATASET,
  artifactId: '',
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

        case artifactContextActions.SET_ARTIFACT_TYPE:
          return {
            ...state,
            artifactType: action?.payload?.artifactType || ARTIFACT_TYPE.PDF_DATASET,
          };

        case artifactContextActions.SET_ARTIFACT_ID:
          return {
            ...state,
            artifactId: action?.payload?.artifactId || '',
          };

        default:
          return state;
      }
    },
    initialState,
  );

  return <Provider value={{ state, dispatch }}>{children}</Provider>;
};

const useArtifactContextStore = () => useContext(context);

export { artifactContextActions, useArtifactContextStore };
