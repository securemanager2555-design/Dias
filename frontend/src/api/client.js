const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export const ACCESS_TOKEN_KEY = "sbd_access_token";
export const REFRESH_TOKEN_KEY = "sbd_refresh_token";

export const getAccessToken = () => localStorage.getItem(ACCESS_TOKEN_KEY);
export const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY);

export const setTokens = (accessToken, refreshToken) => {
  if (accessToken) {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  }
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
};

export const clearTokens = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

const parseResponseBody = async response => {
  const contentType = response.headers.get("content-type") || "";
  return contentType.includes("application/json")
    ? response.json()
    : response.text();
};

const refreshAccessToken = async () => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error("no_refresh_token");
  }

  const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refreshToken }),
  });
  const data = await parseResponseBody(response);

  if (!response.ok) {
    clearTokens();
    const message =
      typeof data === "object" && data?.error ? data.error : "refresh_failed";
    throw new Error(message);
  }

  setTokens(data.accessToken, data.refreshToken);
  return data.accessToken;
};

export const apiFetch = async (path, options = {}) => {
  const { auth = false, _retry = true, ...fetchOptions } = options;
  const headers = {
    "Content-Type": "application/json",
    ...(fetchOptions.headers || {}),
  };

  if (auth) {
    const token = getAccessToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...fetchOptions,
    headers,
  });

  if (auth && _retry && response.status === 401 && getRefreshToken()) {
    const accessToken = await refreshAccessToken();
    return apiFetch(path, {
      ...options,
      _retry: false,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${accessToken}`,
      },
    });
  }

  const data = await parseResponseBody(response);

  if (!response.ok) {
    const message =
      typeof data === "object" && data?.error ? data.error : "request_failed";
    const error = new Error(message);
    error.status = response.status;
    error.payload = data;
    throw error;
  }

  return data;
};
