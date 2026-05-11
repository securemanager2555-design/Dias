import { apiFetch } from "./client";

export const fetchProfile = async () => {
  const data = await apiFetch("/api/profile", { auth: true });
  return data.user;
};

export const fetchSecurityEvents = async () => {
  const data = await apiFetch("/api/profile/security-events", { auth: true });
  return data.events || [];
};

export const updateProfile = async payload => {
  const data = await apiFetch("/api/profile", {
    method: "PUT",
    auth: true,
    body: JSON.stringify(payload),
  });
  return data.user;
};

export const changePassword = async payload =>
  apiFetch("/api/profile/password", {
    method: "PUT",
    auth: true,
    body: JSON.stringify(payload),
  });
