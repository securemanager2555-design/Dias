import React, { useEffect, useMemo, useState } from "react";
import { deleteNote } from "../../../api/notes";
import {
  fetchAdminOverview,
  fetchAdminUsers,
  updateUserRole,
} from "../../../api/admin";
import "./AdminPage.css";

export function AdminPage({ user, onNavigate }) {
  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState([]);
  const [latestNotes, setLatestNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyUserId, setBusyUserId] = useState("");

  const isAdmin = user?.role === "admin";

  useEffect(() => {
    if (!isAdmin) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    Promise.all([fetchAdminOverview(), fetchAdminUsers()])
      .then(([overviewData, usersData]) => {
        if (!isMounted) return;
        setOverview(overviewData);
        setUsers(Array.isArray(usersData) ? usersData : []);
        setLatestNotes(
          Array.isArray(overviewData?.recentNotes) ? overviewData.recentNotes : []
        );
        setError("");
      })
      .catch(() => {
        if (!isMounted) return;
        setError(
          "\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044c \u0434\u0430\u043d\u043d\u044b\u0435 \u0430\u0434\u043c\u0438\u043d-\u043f\u0430\u043d\u0435\u043b\u0438."
        );
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isAdmin]);

  const counters = overview?.counters || {};
  const counterItems = useMemo(
    () => [
      {
        label: "\u041f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u0438",
        value: counters.users || 0,
      },
      { label: "\u0410\u0434\u043c\u0438\u043d\u044b", value: counters.admins || 0 },
      { label: "\u041c\u043e\u0434\u0443\u043b\u0438", value: counters.modules || 0 },
      { label: "\u0417\u0430\u043c\u0435\u0442\u043a\u0438", value: counters.notes || 0 },
      {
        label: "\u041a\u043e\u043c\u043c\u0435\u043d\u0442\u0430\u0440\u0438\u0438",
        value: counters.comments || 0,
      },
      {
        label:
          "\u0410\u043a\u0442\u0438\u0432\u043d\u044b\u0435 \u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u0438",
        value: counters.activeUsers || 0,
      },
    ],
    [counters]
  );

  const handleRoleToggle = async targetUser => {
    const nextRole = targetUser.role === "admin" ? "user" : "admin";
    setBusyUserId(targetUser.id);
    setError("");
    try {
      const updated = await updateUserRole(targetUser.id, nextRole);
      setUsers(prev =>
        prev.map(entry =>
          entry.id === updated.id ? { ...entry, role: updated.role } : entry
        )
      );
    } catch (requestError) {
      if (requestError?.message === "cannot_demote_self") {
        setError(
          "\u041d\u0435\u043b\u044c\u0437\u044f \u0441\u043d\u044f\u0442\u044c \u0430\u0434\u043c\u0438\u043d\u0441\u043a\u0438\u0435 \u043f\u0440\u0430\u0432\u0430 \u0443 \u0441\u0430\u043c\u043e\u0433\u043e \u0441\u0435\u0431\u044f."
        );
      } else {
        setError(
          "\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0438\u0437\u043c\u0435\u043d\u0438\u0442\u044c \u0440\u043e\u043b\u044c \u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u044f."
        );
      }
    } finally {
      setBusyUserId("");
    }
  };

  const handleDeleteNote = async noteId => {
    setError("");
    try {
      await deleteNote(noteId);
      setLatestNotes(prev => prev.filter(note => note.id !== noteId));
    } catch {
      setError(
        "\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0443\u0434\u0430\u043b\u0438\u0442\u044c \u0437\u0430\u043c\u0435\u0442\u043a\u0443."
      );
    }
  };

  if (!isAdmin) {
    return (
      <div className="admin-page">
        <div className="admin-page__card glass">
          <h1>
            {
              "\u0414\u043e\u0441\u0442\u0443\u043f \u043e\u0433\u0440\u0430\u043d\u0438\u0447\u0435\u043d"
            }
          </h1>
          <p>
            {
              "\u041d\u0443\u0436\u043d\u0430 \u0440\u043e\u043b\u044c \u0430\u0434\u043c\u0438\u043d\u0438\u0441\u0442\u0440\u0430\u0442\u043e\u0440\u0430."
            }
          </p>
          <button onClick={() => onNavigate("/")}>
            {"\u041d\u0430\u0437\u0430\u0434"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <h1>{"\u0410\u0434\u043c\u0438\u043d-\u043f\u0430\u043d\u0435\u043b\u044c"}</h1>
          <p>
            {
              "\u0423\u043f\u0440\u0430\u0432\u043b\u0435\u043d\u0438\u0435 \u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u044f\u043c\u0438, \u0430\u043a\u0442\u0438\u0432\u043d\u043e\u0441\u0442\u044c\u044e \u0438 \u043a\u043e\u043d\u0442\u0435\u043d\u0442\u043e\u043c \u043f\u043b\u0430\u0442\u0444\u043e\u0440\u043c\u044b."
            }
          </p>
        </div>
        <div className="admin-page__actions">
          <button onClick={() => onNavigate("/notes")}>
            {"\u041e\u0442\u043a\u0440\u044b\u0442\u044c \u0437\u0430\u043c\u0435\u0442\u043a\u0438"}
          </button>
          <button onClick={() => onNavigate("/")}>
            {"\u0412 \u043b\u0430\u0431\u043e\u0440\u0430\u0442\u043e\u0440\u0438\u044e"}
          </button>
        </div>
      </div>

      {error && <div className="admin-page__error">{error}</div>}

      {isLoading ? (
        <div className="admin-page__empty glass">
          {
            "\u0417\u0430\u0433\u0440\u0443\u0437\u043a\u0430 \u0430\u0434\u043c\u0438\u043d-\u0434\u0430\u043d\u043d\u044b\u0445..."
          }
        </div>
      ) : (
        <>
          <section className="admin-page__stats">
            {counterItems.map(item => (
              <article key={item.label} className="admin-page__stat glass">
                <div className="admin-page__statValue">{item.value}</div>
                <div className="admin-page__statLabel">{item.label}</div>
              </article>
            ))}
          </section>

          <section className="admin-page__grid">
            <article className="admin-page__card glass">
              <h2>{"\u041f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u0438"}</h2>
              {users.length === 0 ? (
                <div className="admin-page__empty">
                  {
                    "\u041f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u0438 \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d\u044b."
                  }
                </div>
              ) : (
                <div className="admin-page__tableWrap">
                  <table className="admin-page__table">
                    <thead>
                      <tr>
                        <th>Email</th>
                        <th>{"\u0420\u043e\u043b\u044c"}</th>
                        <th>{"\u0410\u043a\u0442\u0438\u0432\u043d\u043e\u0441\u0442\u044c"}</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(entry => (
                        <tr key={entry.id}>
                          <td>{entry.email}</td>
                          <td>
                            <span
                              className={`admin-page__role admin-page__role--${entry.role}`}
                            >
                              {entry.role}
                            </span>
                          </td>
                          <td>
                            {entry._count?.notes || 0}{" "}
                            {"\u0437\u0430\u043c\u0435\u0442\u043e\u043a"} {"\u2022"}{" "}
                            {entry._count?.comments || 0}{" "}
                            {"\u043a\u043e\u043c\u043c\u0435\u043d\u0442\u0430\u0440\u0438\u0435\u0432"}
                          </td>
                          <td>
                            <button
                              className="admin-page__smallAction"
                              onClick={() => handleRoleToggle(entry)}
                              disabled={busyUserId === entry.id}
                            >
                              {busyUserId === entry.id
                                ? "..."
                                : entry.role === "admin"
                                ? "\u0421\u0434\u0435\u043b\u0430\u0442\u044c user"
                                : "\u0421\u0434\u0435\u043b\u0430\u0442\u044c admin"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </article>

            <article className="admin-page__card glass">
              <h2>
                {
                  "\u041c\u043e\u0434\u0435\u0440\u0430\u0446\u0438\u044f \u0437\u0430\u043c\u0435\u0442\u043e\u043a"
                }
              </h2>
              {latestNotes.length === 0 ? (
                <div className="admin-page__empty">
                  {
                    "\u041d\u0435\u0442 \u0437\u0430\u043c\u0435\u0442\u043e\u043a \u0434\u043b\u044f \u043c\u043e\u0434\u0435\u0440\u0430\u0446\u0438\u0438."
                  }
                </div>
              ) : (
                <ul className="admin-page__notes">
                  {latestNotes.map(note => (
                    <li key={note.id} className="admin-page__noteItem">
                      <div>
                        <strong>{note.title}</strong>
                        <p>
                          {note.user?.email ||
                            "\u0410\u0432\u0442\u043e\u0440"}{" "}
                          {"\u2022"}{" "}
                          {new Date(note.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        className="admin-page__smallAction admin-page__smallAction--danger"
                        onClick={() => handleDeleteNote(note.id)}
                      >
                        {"\u0423\u0434\u0430\u043b\u0438\u0442\u044c"}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          </section>
        </>
      )}
    </div>
  );
}
