'use client';

import {
  createContext,
  type FC,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react';
import { BaseEventPayload, EVENT_TYPE } from '@zamp-platform/utils';
import { useGetIntegrationsCatalogEnabledQuery, useLazyGetIntegrationsCatalogQuery } from '@/apis/integrations';
import { useEventBus } from '@/app/_providers/sse-provider';
import type { IntegrationConnection, IntegrationItem } from '@/types/api/integrations';
import { MapAny } from '@/types/commonTypes';

// ─── Constants ───────────────────────────────────────────────────────────────

const PAGE_SIZE = 100;

// ─── Reducer (internal) ─────────────────────────────────────────────────────

interface IntegrationsState {
  searchQuery: string;
  items: IntegrationItem[];
  page: number;
  totalPages: number;
  isInitialised: boolean;
}

interface IntegrationsContextValue {
  /** The current list of loaded integration items */
  items: IntegrationItem[];
  enabledItems: IntegrationItem[];
  /** The active search query */
  searchQuery: string;
  /** Whether a page is currently being fetched */
  isFetching: boolean;
  /** Whether more pages are available to load */
  hasMore: boolean;
  /** Whether at least one fetch has completed (prevents empty-state flash on initial render) */
  isInitialised: boolean;
  /** Update the search query — resets pagination and fetches page 1 */
  setSearchQuery: (query: string) => void;
  /** Request the next page of results (no-op when already fetching or at the end) */
  loadNextPage: () => void;
  /** Remove a connection from an integration item */
  removeConnection: (integrationName: string, connectionId: string) => void;
}

interface IntegrationsProviderProps {
  children: ReactNode;
}

const initialState: IntegrationsState = {
  searchQuery: '',
  items: [],
  page: 1,
  totalPages: 1,
  isInitialised: false,
};

const ActionType = {
  SetSearchQuery: 'SET_SEARCH_QUERY',
  FetchSuccess: 'FETCH_SUCCESS',
  LoadNextPage: 'LOAD_NEXT_PAGE',
  RemoveConnection: 'REMOVE_CONNECTION',
  UpsertConnection: 'UPSERT_CONNECTION',
} as const;

type IntegrationsAction =
  | { type: typeof ActionType.SetSearchQuery; payload: string }
  | { type: typeof ActionType.FetchSuccess; payload: { items: IntegrationItem[]; totalPages: number; page: number } }
  | { type: typeof ActionType.LoadNextPage }
  | { type: typeof ActionType.RemoveConnection; payload: { integrationName: string; connectionId: string } }
  | {
      type: typeof ActionType.UpsertConnection;
      payload: { integrationName: string; connection: IntegrationConnection };
    };

function integrationsReducer(state: IntegrationsState, action: IntegrationsAction): IntegrationsState {
  switch (action.type) {
    case ActionType.SetSearchQuery:
      return { ...state, searchQuery: action.payload, items: [], page: 1, totalPages: 1, isInitialised: false };

    case ActionType.FetchSuccess: {
      const { items: newItems, totalPages, page } = action.payload;

      if (page === 1) {
        return { ...state, items: newItems, totalPages, isInitialised: true };
      }

      const existingNames = new Set(state.items.map((item) => item.name));
      const uniqueNewItems = newItems.filter((item) => !existingNames.has(item.name));

      return { ...state, items: [...state.items, ...uniqueNewItems], totalPages, isInitialised: true };
    }

    case ActionType.LoadNextPage:
      return state.page >= state.totalPages ? state : { ...state, page: state.page + 1 };

    case ActionType.RemoveConnection: {
      const { integrationName, connectionId } = action.payload;

      return {
        ...state,
        items: state.items.map((item) =>
          item.name === integrationName
            ? { ...item, connections: item.connections.filter((conn) => conn.id !== connectionId) }
            : item,
        ),
      };
    }

    case ActionType.UpsertConnection: {
      const { integrationName, connection } = action.payload;

      return {
        ...state,
        items: state.items.map((item) => {
          if (item.name !== integrationName) return item;

          const existingIndex = item.connections.findIndex((conn) => conn.id === connection.id);

          if (existingIndex !== -1) {
            // Update existing connection
            const updatedConnections = [...item.connections];

            updatedConnections[existingIndex] = { ...updatedConnections[existingIndex], ...connection };

            return { ...item, connections: updatedConnections };
          }

          // Add new connection
          return { ...item, connections: [...item.connections, connection] };
        }),
      };
    }

    default:
      return state;
  }
}

// ─── Context ─────────────────────────────────────────────────────────────────

const IntegrationsContext = createContext<IntegrationsContextValue | null>(null);

/**
 * Returns the integrations context value, or `null` when rendered
 * outside an `IntegrationsProvider` (e.g. on the legacy settings page).
 */
export const useOptionalIntegrationsContext = (): IntegrationsContextValue | null => {
  return useContext(IntegrationsContext);
};

/**
 * Returns the integrations context value.
 * Throws if used outside an `IntegrationsProvider`.
 */
export const useIntegrationsContext = (): IntegrationsContextValue => {
  const context = useContext(IntegrationsContext);

  if (!context) {
    throw new Error('useIntegrationsContext must be used within an IntegrationsProvider');
  }

  return context;
};

// ─── Provider ────────────────────────────────────────────────────────────────

export const IntegrationsProvider: FC<IntegrationsProviderProps> = ({ children }) => {
  const [getIntegrationsCatalog, { isFetching }] = useLazyGetIntegrationsCatalogQuery();
  const [state, dispatch] = useReducer(integrationsReducer, initialState);
  const { sseEventBus } = useEventBus();

  const { searchQuery, page, totalPages, items, isInitialised } = state;

  const { data: integrationsCatalogEnabled, refetch: refetchIntegrationsCatalogEnabled } =
    useGetIntegrationsCatalogEnabledQuery({ page: 1, page_size: 100 });
  const hasMore = page < totalPages;

  // Keep a ref to the latest search query to discard stale responses
  const searchRef = useRef(searchQuery);

  searchRef.current = searchQuery;

  const fetchPage = useCallback(
    async (pageNumber: number, search: string) => {
      try {
        const result = await getIntegrationsCatalog({
          search,
          provider: '',
          page: pageNumber,
          page_size: PAGE_SIZE,
        }).unwrap();

        // Discard if the search query changed while the request was in-flight
        if (search !== searchRef.current) return;

        dispatch({
          type: ActionType.FetchSuccess,
          payload: { items: result.items, totalPages: result.total_pages, page: pageNumber },
        });
      } catch {
        // Error state is tracked by RTK Query (isError / error)
      }
    },
    [getIntegrationsCatalog],
  );

  useEffect(() => {
    const sub = sseEventBus.subscribe(EVENT_TYPE.CONNECTION_UPDATE, (data: BaseEventPayload) => {
      const payload = data?.payload as MapAny;
      const connection = payload?.connection as IntegrationConnection | undefined;

      if (!connection?.integration_name) return;
      refetchIntegrationsCatalogEnabled();

      dispatch({
        type: ActionType.UpsertConnection,
        payload: {
          integrationName: connection.integration_name as string,
          connection,
        },
      });
    });

    return () => {
      sub.unsubscribe();
    };
  }, [sseEventBus]);

  // Fetch page 1 whenever the search query changes (reducer resets page & items)
  useEffect(() => {
    fetchPage(1, searchQuery);
  }, [searchQuery, fetchPage]);

  // Fetch subsequent pages when `page` advances beyond 1
  useEffect(() => {
    if (page > 1) {
      fetchPage(page, searchQuery);
    }
    // `searchQuery` is intentionally omitted — the effect above handles query changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, fetchPage]);

  // ─── Public callbacks (stable references) ────────────────────────────────

  const setSearchQuery = useCallback((query: string) => {
    dispatch({ type: ActionType.SetSearchQuery, payload: query });
  }, []);

  const loadNextPage = useCallback(() => {
    dispatch({ type: ActionType.LoadNextPage });
  }, []);

  const removeConnection = useCallback((integrationName: string, connectionId: string) => {
    dispatch({ type: ActionType.RemoveConnection, payload: { integrationName, connectionId } });
  }, []);

  // ─── Memoised context value ──────────────────────────────────────────────

  const enabledItems = useMemo(() => integrationsCatalogEnabled?.items ?? [], [integrationsCatalogEnabled]);

  const value = useMemo<IntegrationsContextValue>(
    () => ({
      items,
      enabledItems,
      searchQuery,
      isFetching,
      hasMore,
      isInitialised,
      setSearchQuery,
      loadNextPage,
      removeConnection,
    }),
    [
      items,
      enabledItems,
      searchQuery,
      isFetching,
      hasMore,
      isInitialised,
      setSearchQuery,
      loadNextPage,
      removeConnection,
    ],
  );

  return <IntegrationsContext.Provider value={value}>{children}</IntegrationsContext.Provider>;
};
