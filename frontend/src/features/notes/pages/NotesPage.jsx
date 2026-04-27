import React, { useEffect, useMemo, useState } from "react";
import {
  addComment,
  createNote,
  deleteComment,
  deleteNote,
  fetchNotes,
  updateNote,
} from "../../../api/notes";
import "./NotesPage.css";

const T = {
  loadError: "\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044c \u0437\u0430\u043c\u0435\u0442\u043a\u0438.",
  loginToCreate: "\u0412\u043e\u0439\u0434\u0438\u0442\u0435, \u0447\u0442\u043e\u0431\u044b \u0441\u043e\u0437\u0434\u0430\u0432\u0430\u0442\u044c \u0437\u0430\u043c\u0435\u0442\u043a\u0438.",
  createError: "\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0441\u043e\u0437\u0434\u0430\u0442\u044c \u0437\u0430\u043c\u0435\u0442\u043a\u0443.",
  saveError: "\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0441\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c \u0438\u0437\u043c\u0435\u043d\u0435\u043d\u0438\u044f.",
  deleteNoteError: "\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0443\u0434\u0430\u043b\u0438\u0442\u044c \u0437\u0430\u043c\u0435\u0442\u043a\u0443.",
  loginToComment: "\u0412\u043e\u0439\u0434\u0438\u0442\u0435, \u0447\u0442\u043e\u0431\u044b \u043a\u043e\u043c\u043c\u0435\u043d\u0442\u0438\u0440\u043e\u0432\u0430\u0442\u044c.",
  addCommentError: "\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0434\u043e\u0431\u0430\u0432\u0438\u0442\u044c \u043a\u043e\u043c\u043c\u0435\u043d\u0442\u0430\u0440\u0438\u0439.",
  deleteCommentError: "\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0443\u0434\u0430\u043b\u0438\u0442\u044c \u043a\u043e\u043c\u043c\u0435\u043d\u0442\u0430\u0440\u0438\u0439.",
  adminTitle: "\u0410\u0434\u043c\u0438\u043d-\u043f\u0430\u043d\u0435\u043b\u044c \u0437\u0430\u043c\u0435\u0442\u043e\u043a",
  notesTitle: "\u0417\u0430\u043c\u0435\u0442\u043a\u0438 \u0441\u043e\u043e\u0431\u0449\u0435\u0441\u0442\u0432\u0430",
  notesSubtitleTail: "\u0437\u0430\u043c\u0435\u0442\u043e\u043a, \u0434\u0435\u043b\u0438\u0442\u0435\u0441\u044c \u043e\u043f\u044b\u0442\u043e\u043c \u0437\u0430\u0449\u0438\u0442\u044b \u0438 \u043f\u0440\u0430\u043a\u0442\u0438\u043a\u0430\u043c\u0438.",
  back: "\u041d\u0430\u0437\u0430\u0434 \u0432 \u043b\u0430\u0431\u043e\u0440\u0430\u0442\u043e\u0440\u0438\u044e",
  newNote: "\u041d\u043e\u0432\u0430\u044f \u0437\u0430\u043c\u0435\u0442\u043a\u0430",
  titlePlaceholder: "\u0417\u0430\u0433\u043e\u043b\u043e\u0432\u043e\u043a",
  contentPlaceholder: "\u041e\u043f\u0438\u0448\u0438 \u0432\u044b\u0432\u043e\u0434\u044b, \u043c\u0435\u0440\u044b \u0437\u0430\u0449\u0438\u0442\u044b, \u0441\u0441\u044b\u043b\u043a\u0438 \u043d\u0430 \u043a\u043e\u0434.",
  publish: "\u041e\u043f\u0443\u0431\u043b\u0438\u043a\u043e\u0432\u0430\u0442\u044c",
  loginHint: "\u0412\u043e\u0439\u0434\u0438\u0442\u0435, \u0447\u0442\u043e\u0431\u044b \u0441\u043e\u0437\u0434\u0430\u0432\u0430\u0442\u044c \u0437\u0430\u043c\u0435\u0442\u043a\u0438 \u0438 \u043a\u043e\u043c\u043c\u0435\u043d\u0442\u0430\u0440\u0438\u0438.",
  loading: "\u0417\u0430\u0433\u0440\u0443\u0437\u043a\u0430...",
  empty: "\u041f\u043e\u043a\u0430 \u043d\u0435\u0442 \u0437\u0430\u043c\u0435\u0442\u043e\u043a.",
  author: "\u0410\u0432\u0442\u043e\u0440",
  save: "\u0421\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c",
  cancel: "\u041e\u0442\u043c\u0435\u043d\u0430",
  edit: "\u0420\u0435\u0434\u0430\u043a\u0442\u0438\u0440\u043e\u0432\u0430\u0442\u044c",
  delete: "\u0423\u0434\u0430\u043b\u0438\u0442\u044c",
  comments: "\u041a\u043e\u043c\u043c\u0435\u043d\u0442\u0430\u0440\u0438\u0438",
  user: "\u041f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u044c",
  commentPlaceholder: "\u041e\u0441\u0442\u0430\u0432\u044c \u043a\u043e\u043c\u043c\u0435\u043d\u0442\u0430\u0440\u0438\u0439...",
  send: "\u041e\u0442\u043f\u0440\u0430\u0432\u0438\u0442\u044c",
};

export function NotesPage({ user, onNavigate, isAdminView = false }) {
  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingContent, setEditingContent] = useState("");
  const [commentDrafts, setCommentDrafts] = useState({});

  const isAdmin = user?.role === "admin";

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    fetchNotes()
      .then(data => {
        if (isMounted) {
          setNotes(Array.isArray(data) ? data : []);
          setError("");
        }
      })
      .catch(() => {
        if (isMounted) setError(T.loadError);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const canEditNote = note => user && (note.userId === user.id || user.role === "admin");

  const handleCreateNote = async event => {
    event.preventDefault();
    setError("");
    if (!user) return setError(T.loginToCreate);
    try {
      const note = await createNote({ title, content });
      setNotes(prev => [note, ...prev]);
      setTitle("");
      setContent("");
    } catch {
      setError(T.createError);
    }
  };

  const handleEditStart = note => {
    setEditingId(note.id);
    setEditingTitle(note.title);
    setEditingContent(note.content);
  };

  const handleEditSave = async note => {
    setError("");
    try {
      const updated = await updateNote(note.id, { title: editingTitle, content: editingContent });
      setNotes(prev => prev.map(item => (item.id === note.id ? updated : item)));
      setEditingId(null);
    } catch {
      setError(T.saveError);
    }
  };

  const handleDeleteNote = async note => {
    setError("");
    try {
      await deleteNote(note.id);
      setNotes(prev => prev.filter(item => item.id !== note.id));
    } catch {
      setError(T.deleteNoteError);
    }
  };

  const handleCommentChange = (noteId, value) => {
    setCommentDrafts(prev => ({ ...prev, [noteId]: value }));
  };

  const handleAddComment = async note => {
    setError("");
    if (!user) return setError(T.loginToComment);
    const text = commentDrafts[note.id];
    if (!text) return;
    try {
      const comment = await addComment(note.id, { content: text });
      setNotes(prev =>
        prev.map(item =>
          item.id === note.id ? { ...item, comments: [...item.comments, comment] } : item
        )
      );
      setCommentDrafts(prev => ({ ...prev, [note.id]: "" }));
    } catch {
      setError(T.addCommentError);
    }
  };

  const handleDeleteComment = async (noteId, comment) => {
    setError("");
    try {
      await deleteComment(comment.id);
      setNotes(prev =>
        prev.map(item =>
          item.id === noteId
            ? { ...item, comments: item.comments.filter(entry => entry.id !== comment.id) }
            : item
        )
      );
    } catch {
      setError(T.deleteCommentError);
    }
  };

  const notesCount = useMemo(() => notes.length, [notes]);

  return (
    <div className="notes-page">
      <div className="notes-page__header">
        <div>
          <h1 className="notes-page__title">{isAdminView ? T.adminTitle : T.notesTitle}</h1>
          <p className="notes-page__subtitle">
            {notesCount} {T.notesSubtitleTail}
          </p>
        </div>
        <button className="notes-page__back" onClick={() => onNavigate("/")}>
          {T.back}
        </button>
      </div>

      <div className="notes-page__content">
        <div className="notes-page__form glass">
          <h2>{T.newNote}</h2>
          <form onSubmit={handleCreateNote}>
            <input
              type="text"
              placeholder={T.titlePlaceholder}
              value={title}
              onChange={event => setTitle(event.target.value)}
              maxLength={120}
            />
            <textarea
              placeholder={T.contentPlaceholder}
              value={content}
              onChange={event => setContent(event.target.value)}
              rows={4}
              maxLength={5000}
            />
            <button type="submit">{T.publish}</button>
          </form>
          {!user && <p className="notes-page__hint">{T.loginHint}</p>}
        </div>

        {error && <div className="notes-page__error">{error}</div>}

        {isLoading ? (
          <div className="notes-page__empty">{T.loading}</div>
        ) : notes.length === 0 ? (
          <div className="notes-page__empty">{T.empty}</div>
        ) : (
          <div className="notes-page__list">
            {notes.map(note => (
              <div key={note.id} className="notes-page__card glass-strong">
                <div className="notes-page__cardHeader">
                  <div>
                    <div className="notes-page__cardTitle">
                      {editingId === note.id ? (
                        <input
                          type="text"
                          value={editingTitle}
                          onChange={event => setEditingTitle(event.target.value)}
                          maxLength={120}
                        />
                      ) : (
                        note.title
                      )}
                    </div>
                    <div className="notes-page__meta">
                      {note.user?.email || T.author} {" - "}{" "}
                      {new Date(note.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  {canEditNote(note) && (
                    <div className="notes-page__actions">
                      {editingId === note.id ? (
                        <>
                          <button onClick={() => handleEditSave(note)}>{T.save}</button>
                          <button onClick={() => setEditingId(null)}>{T.cancel}</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => handleEditStart(note)}>{T.edit}</button>
                          <button onClick={() => handleDeleteNote(note)}>{T.delete}</button>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <div className="notes-page__cardBody">
                  {editingId === note.id ? (
                    <textarea
                      value={editingContent}
                      onChange={event => setEditingContent(event.target.value)}
                      rows={4}
                      maxLength={5000}
                    />
                  ) : (
                    <p>{note.content}</p>
                  )}
                </div>

                <div className="notes-page__comments">
                  <div className="notes-page__commentsHeader">
                    {T.comments} ({note.comments.length})
                  </div>
                  <div className="notes-page__commentsList">
                    {note.comments.map(comment => (
                      <div key={comment.id} className="notes-page__comment">
                        <div>
                          <strong>{comment.user?.email || T.user}</strong>{" "}
                          <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p>{comment.content}</p>
                        {(isAdmin || comment.userId === user?.id) && (
                          <button
                            className="notes-page__commentDelete"
                            onClick={() => handleDeleteComment(note.id, comment)}
                          >
                            {T.delete}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="notes-page__commentForm">
                    <input
                      type="text"
                      placeholder={T.commentPlaceholder}
                      value={commentDrafts[note.id] || ""}
                      onChange={event => handleCommentChange(note.id, event.target.value)}
                    />
                    <button onClick={() => handleAddComment(note)}>{T.send}</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
