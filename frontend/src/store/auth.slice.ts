import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AuthUser } from "../types/api";

type AuthState = {
  user: AuthUser | null;
  accessToken: string;
  isAuthenticated: boolean;
};

const initialState: AuthState = {
  user: null,
  accessToken: "",
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ accessToken: string; user: AuthUser | null }>) => {
      state.accessToken = action.payload.accessToken;
      state.user = action.payload.user;
      state.isAuthenticated = Boolean(action.payload.accessToken);
    },
    setUser: (state, action: PayloadAction<AuthUser | null>) => {
      state.user = action.payload;
      state.isAuthenticated = Boolean(state.accessToken);
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = "";
      state.isAuthenticated = false;
    },
  },
});

export const { setCredentials, setUser, logout } = authSlice.actions;
export const authReducer = authSlice.reducer;
