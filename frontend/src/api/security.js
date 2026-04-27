import { apiFetch } from "./client";

export const fetchOwaspSecurityStatus = async () =>
  apiFetch("/api/security/owasp", { auth: true });
