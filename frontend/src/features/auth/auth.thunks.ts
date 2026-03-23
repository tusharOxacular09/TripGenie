import { authApi } from "../../services/api/auth.api";
import { authStorage } from "../../lib/auth";
import { requestAccessTokenRefresh } from "../../services/api/client";
import { AppDispatch } from "../../store";
import { logout, setCredentials, setUser } from "../../store/auth.slice";

export const loginFlow =
  (payload: { email: string; password: string }) =>
  async (dispatch: AppDispatch): Promise<void> => {
    const data = await authApi.login(payload);
    authStorage.setRefreshToken(data.refreshToken);
    dispatch(setCredentials({ accessToken: data.accessToken, user: data.user }));
  };

export const registerFlow =
  (payload: { name: string; email: string; password: string }) =>
  async (dispatch: AppDispatch): Promise<void> => {
    const data = await authApi.register(payload);
    authStorage.setRefreshToken(data.refreshToken);
    dispatch(setCredentials({ accessToken: data.accessToken, user: data.user }));
  };

export const bootstrapAuth = () => async (dispatch: AppDispatch): Promise<void> => {
  const refreshToken = authStorage.getRefreshToken();
  if (!refreshToken) {
    dispatch(logout());
    return;
  }
  try {
    const accessToken = await requestAccessTokenRefresh();
    dispatch(setCredentials({ accessToken, user: null }));
    const user = await authApi.me();
    dispatch(setUser(user));
  } catch {
    authStorage.clearRefreshToken();
    dispatch(logout());
  }
};
