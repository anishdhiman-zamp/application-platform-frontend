import { createContext, Dispatch, FC, ReactElement, useContext, useEffect, useReducer } from 'react';
import { captureException } from '@sentry/browser';
import {
  getFromLocalStorage,
  LOCAL_STORAGE_KEYS,
  removeFromLocalStorage,
  setToLocalStorage,
} from '@/utils/localstorage';

interface CompletedField {
  rowId: string;
  columnId: string;
}

interface CompletedFieldsState {
  completedFields: Record<string, CompletedField[]>;
}

export enum CompletedFieldsActions {
  SET_COMPLETED_FIELDS = 'SET_COMPLETED_FIELDS',
  ADD_COMPLETED_FIELD = 'ADD_COMPLETED_FIELD',
  LOAD_FROM_STORAGE = 'LOAD_FROM_STORAGE',
  RESET_COMPLETED_FIELDS = 'RESET_COMPLETED_FIELDS',
}

interface CompletedFieldsAction {
  type: CompletedFieldsActions;
  payload?: {
    datasetId?: string;
    completedFields?: Record<string, CompletedField[]>;
    field?: CompletedField;
  };
}

const initialState: CompletedFieldsState = {
  completedFields: {},
};

const completedFieldsReducer = (state: CompletedFieldsState, action: CompletedFieldsAction): CompletedFieldsState => {
  switch (action.type) {
    case CompletedFieldsActions.SET_COMPLETED_FIELDS:
      return {
        ...state,
        completedFields: action.payload?.completedFields || {},
      };
    case CompletedFieldsActions.ADD_COMPLETED_FIELD: {
      if (!action.payload?.datasetId || !action.payload?.field) return state;

      const datasetId = action.payload.datasetId;
      const field = action.payload.field;
      const existingFields = state.completedFields[datasetId] || [];

      // Check if field already exists
      const fieldExists = existingFields.some((f) => f.rowId === field.rowId && f.columnId === field.columnId);

      if (fieldExists) return state;

      return {
        ...state,
        completedFields: {
          ...state.completedFields,
          [datasetId]: [...existingFields, field],
        },
      };
    }
    case CompletedFieldsActions.LOAD_FROM_STORAGE:
      return {
        ...state,
        completedFields: action.payload?.completedFields || {},
      };
    case CompletedFieldsActions.RESET_COMPLETED_FIELDS:
      return {
        ...state,
        completedFields: {},
      };
    default:
      return state;
  }
};

const CompletedFieldsContext = createContext<{
  state: CompletedFieldsState;
  dispatch: Dispatch<CompletedFieldsAction>;
}>({
  state: initialState,
  dispatch: () => null,
});

export const CompletedFieldsProvider: FC<{ children: ReactElement }> = ({ children }) => {
  const [state, dispatch] = useReducer(completedFieldsReducer, initialState);

  // Load from localStorage on mount
  useEffect(() => {
    const loadFromStorage = () => {
      const storedData = getFromLocalStorage(LOCAL_STORAGE_KEYS.COMPLETED_MISSING_FIELDS);

      if (storedData) {
        try {
          const parsedData = JSON.parse(storedData);

          dispatch({
            type: CompletedFieldsActions.LOAD_FROM_STORAGE,
            payload: { completedFields: parsedData },
          });
        } catch (error) {
          captureException(error);
        }
      }
    };

    loadFromStorage();
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    if (Object.keys(state.completedFields).length > 0) {
      setToLocalStorage(LOCAL_STORAGE_KEYS.COMPLETED_MISSING_FIELDS, JSON.stringify(state.completedFields));
    } else {
      // Remove from localStorage if no completed fields
      removeFromLocalStorage(LOCAL_STORAGE_KEYS.COMPLETED_MISSING_FIELDS);
    }
  }, [state.completedFields]);

  return <CompletedFieldsContext.Provider value={{ state, dispatch }}>{children}</CompletedFieldsContext.Provider>;
};

export const useCompletedFields = () => useContext(CompletedFieldsContext);
