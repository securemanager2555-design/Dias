import { apiFetch, clearTokens, getRefreshToken, setTokens } from "./client";

export const registerUser = async (email, password) => {
  const data = await apiFetch("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  setTokens(data.accessToken, data.refreshToken);
  return data;
};

export const loginUser = async (email, password) => {
  const data = await apiFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  setTokens(data.accessToken, data.refreshToken);
  return data;
};

export const refreshSession = async () => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    clearTokens();
    throw new Error("no_refresh_token");
  }
  const data = await apiFetch("/api/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
  });
  setTokens(data.accessToken, data.refreshToken);
  return data;
};

export const logoutUser = async () => {
  const refreshToken = getRefreshToken();
  if (refreshToken) {
    await apiFetch("/api/auth/logout", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    });
  }
  clearTokens();
};

export const fetchMe = async () => {
  const data = await apiFetch("/api/auth/me", { auth: true });
  return data.user;
};
