import { apiFetch } from "./client";

export const fetchModules = async () => apiFetch("/api/modules");

export const fetchModuleBySlug = async slug =>
  apiFetch(`/api/modules/${encodeURIComponent(slug)}`);
