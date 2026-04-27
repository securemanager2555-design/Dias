import { apiFetch } from "./client";

export const fetchAdminOverview = async () =>
  apiFetch("/api/admin/overview", { auth: true });

export const fetchAdminUsers = async () =>
  apiFetch("/api/admin/users", { auth: true });

export const updateUserRole = async (userId, role) =>
  apiFetch(`/api/admin/users/${userId}/role`, {
    method: "PATCH",
    auth: true,
    body: JSON.stringify({ role }),
  });
