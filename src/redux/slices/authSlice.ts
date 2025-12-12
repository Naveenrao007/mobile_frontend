import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { REHYDRATE } from 'redux-persist';

interface User {
  Id: number;
  UserName: string;
  EmailId?: string;
  MobileNo?: string;
  tenantid: number;
}

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: User | null;
  email: string;
  password: string;
  tenantId: number | null;
  _persist?: {
    version: number;
    rehydrated: boolean;
  };
}

const initialState: AuthState = {
  isAuthenticated: false,
  token: null,
  user: null,
  email: '',
  password: '',
  tenantId: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setEmail: (state, action: PayloadAction<string>) => {
      state.email = action.payload;
    },
    setPassword: (state, action: PayloadAction<string>) => {
      state.password = action.payload;
    },
    setTenantId: (state, action: PayloadAction<number>) => {
      state.tenantId = action.payload;
    },
    setUserAndToken: (
      state,
      action: PayloadAction<{ user: User; token: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = !!(action.payload.token && action.payload.user);
    },
    // Rehydrate action for Redux Persist
    rehydrate: (state) => {
      // Ensure isAuthenticated is set correctly after rehydration
      state.isAuthenticated = !!(state.token && state.user);
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.token = null;
      state.user = null;
      state.email = '';
      state.password = '';
      state.tenantId = null;
    },
  },
  extraReducers: (builder) => {
    // Handle rehydration from redux-persist
    builder.addCase(REHYDRATE, (state, action: any) => {
      // When persistConfig key is 'root' and reducer is nested under 'auth',
      // the payload structure is: { auth: { token, user, ... } }
      if (action.payload?.auth) {
        const persistedAuth = action.payload.auth;
        const { token, user, tenantId, isAuthenticated } = persistedAuth;
        
        // Restore all persisted state
        if (token !== undefined && token !== null) state.token = token;
        if (user !== undefined && user !== null) state.user = user;
        if (tenantId !== undefined && tenantId !== null) state.tenantId = tenantId;
        
        // CRITICAL: Set isAuthenticated based on token and user presence
        // Use persisted value if available and valid, otherwise calculate
        if (isAuthenticated !== undefined) {
          state.isAuthenticated = isAuthenticated && !!(token && user);
        } else {
          state.isAuthenticated = !!(token && user);
        }
      }
      return state;
    });
  },
});

export const { setEmail, setPassword, setTenantId, setUserAndToken, logout } =
  authSlice.actions;

export default authSlice.reducer;

