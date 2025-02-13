import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Session, Workspace } from 'types/api/auth.types';
import { MapAny } from 'types/commonTypes';

export type UserState = {
  user: Session | null;
  userAccessFlags: any;
  userSessionExpired?: boolean;
  isGodMode?: boolean;
  workspace: Workspace | null;
  configuration?: MapAny;
  merchantDetails?: MapAny;
  roles?: { id: string; name: string }[];
  dashboardLoader: boolean;
};

const initialState: UserState = {
  user: null,
  userAccessFlags: {},
  userSessionExpired: false,
  isGodMode: false,
  configuration: undefined,
  merchantDetails: {},
  workspace: null,
  dashboardLoader: false,
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserInfo: (state, action) => {
      state.user = action.payload;
      state.userSessionExpired = false;
    },
    setUserAccessFlags: (state, action) => {
      state.userAccessFlags = { ...state.userAccessFlags, ...action.payload };
    },
    setConfiguration: (state, action) => {
      state.configuration = action.payload;
    },
    setIsGodMode: (state, action) => {
      state.isGodMode = action.payload;
    },
    setMerchantDetails: (state, action) => {
      state.merchantDetails = action.payload;
    },
    setRoles: (state, action) => {
      state.roles = action.payload;
    },
    setUser: (state, action: PayloadAction<Session>) => {
      state.user = action.payload;

      return state;
    },
    setDashboardLoader: (state, action: PayloadAction<boolean>) => {
      state.dashboardLoader = action.payload;
    },

    setWorkspace: (state, action: PayloadAction<Workspace>) => {
      state.workspace = action.payload;

      return state;
    },
    resetUser: () => {
      return initialState;
    },
  },
});

export const {
  setUserInfo,
  setUserAccessFlags,
  resetUser,
  setIsGodMode,
  setConfiguration,
  setMerchantDetails,
  setRoles,
  setUser,
  setWorkspace,
  setDashboardLoader,
} = userSlice.actions;

export default userSlice.reducer;
