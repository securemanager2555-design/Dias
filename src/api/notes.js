import { apiFetch } from "./client";

export const fetchNotes = async () => apiFetch("/api/notes", { auth: true });

export const createNote = async payload =>
  apiFetch("/api/notes", {
    method: "POST",
    auth: true,
    body: JSON.stringify(payload),
  });

export const updateNote = async (id, payload) =>
  apiFetch(`/api/notes/${id}`, {
    method: "PUT",
    auth: true,
    body: JSON.stringify(payload),
  });

export const deleteNote = async id =>
  apiFetch(`/api/notes/${id}`, {
    method: "DELETE",
    auth: true,
  });

export const addComment = async (noteId, payload) =>
  apiFetch(`/api/notes/${noteId}/comments`, {
    method: "POST",
    auth: true,
    body: JSON.stringify(payload),
  });

export const deleteComment = async id =>
  apiFetch(`/api/comments/${id}`, {
    method: "DELETE",
    auth: true,
  });
