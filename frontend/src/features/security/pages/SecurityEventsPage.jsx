import React, { useEffect, useMemo, useState } from "react";
import { fetchOwaspSecurityStatus } from "../../../api/security";
import "./SecurityShieldPage.css";

const eventLabels = {
  auth_missing_token: "Запрос без токена",
  auth_invalid_token: "Неверный токен",
  auth_register_success: "Успешная регистрация",
  auth_login_rejected_format: "Отклонен формат логина",
  auth_login_failed: "Неудачная попытка входа",
  auth_login_code_sent: "Код входа отправлен",
  auth_login_code_resent: "Код входа отправлен повторно",
  auth_login_code_expired: "Код входа истек",
  auth_login_code_failed: "Неверный код входа",
  auth_login_code_resend_blocked: "Повторная отправка кода ограничена",
  rate_limit_blocked: "Rate limit: запрос заблокирован",
  security_alert: "Security alert",
  admin_mfa_failed: "MFA проверка не пройдена",
  request_blocked_csrf_origin: "CSRF: блок по Origin",
  request_blocked_csrf_site: "CSRF: блок по Sec-Fetch-Site",
  request_blocked_path_traversal: "Path traversal: запрос заблокирован",
  request_blocked_insecure_transport: "TLS: insecure transport заблокирован",
  password_reset_requested: "Запрос на сброс пароля",
  password_reset_completed: "Пароль сброшен",
  auth_login_success: "Успешный вход",
  auth_refresh_failed: "Неудачное обновление сессии",
  auth_refresh_success: "Сессия успешно обновлена",
  auth_logout: "Выход из аккаунта",
  profile_updated: "Обновлен профиль",
  password_change_failed: "Неудачная смена пароля",
  password_changed: "Пароль изменен",
  admin_role_updated: "Изменена роль пользователя",
  note_created: "Создана заметка",
  note_updated: "Обновлена заметка",
  note_deleted: "Удалена заметка",
  comment_created: "Добавлен комментарий",
  comment_deleted: "Удален комментарий",
};

export function SecurityEventsPage({ user, onNavigate }) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    fetchOwaspSecurityStatus()
      .then(payload => {
        if (!isMounted) return;
        setData(payload);
        setError("");
      })
      .catch(() => {
        if (!isMounted) return;
        setError("Не удалось загрузить последние события безопасности.");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [user]);

  const events = data?.recentSecurityEvents || [];
  const filteredEvents = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return events;
    return events.filter(event => {
      const label = eventLabels[event.action] || event.action;
      const haystack = `${label} ${event.user?.email || ""} ${event.ip || ""} ${
        event.userAgent || ""
      }`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [events, query]);

  if (!user) {
    return (
      <div className="security-shield">
        <div className="security-shield__locked glass">
          <h1>События безопасности</h1>
          <p>Войдите в аккаунт, чтобы увидеть историю входов и защитных событий.</p>
          <button onClick={() => onNavigate("/auth")}>Перейти ко входу</button>
        </div>
      </div>
    );
  }

  return (
    <div className="security-shield">
      <div className="security-shield__header">
        <h1>События безопасности</h1>
        <p>История входов, отправки кодов, блокировок, обновлений сессии и действий в сервисе.</p>
      </div>

      {error && <div className="security-shield__error">{error}</div>}

      {isLoading ? (
        <div className="security-shield__loading glass">Загрузка событий...</div>
      ) : (
        <>
          <div className="security-shield__stats">
            <article className="security-shield__stat glass">
              <div className="security-shield__statValue">
                {data?.counters?.blockedRequests24h || 0}
              </div>
              <div className="security-shield__statLabel">Блокировок за 24ч</div>
            </article>
            <article className="security-shield__stat glass">
              <div className="security-shield__statValue">
                {data?.counters?.failedLogins24h || 0}
              </div>
              <div className="security-shield__statLabel">Неудачных входов за 24ч</div>
            </article>
            <article className="security-shield__stat glass">
              <div className="security-shield__statValue">{events.length}</div>
              <div className="security-shield__statLabel">Последних событий</div>
            </article>
          </div>

          <section className="security-shield__events glass">
            <div className="security-shield__eventsHeader">
              <h2>Журнал событий</h2>
              <input
                value={query}
                onChange={event => setQuery(event.target.value)}
                className="security-shield__search"
                placeholder="Поиск по событию, email, IP..."
              />
            </div>

            {filteredEvents.length === 0 ? (
              <div className="security-shield__empty">События не найдены.</div>
            ) : (
              <div className="security-shield__eventList">
                {filteredEvents.map(event => (
                  <div key={event.id} className="security-shield__event">
                    <strong>{eventLabels[event.action] || event.action}</strong>
                    <span>{event.user?.email || "system"}</span>
                    <span>{event.ip || "IP не определен"}</span>
                    <span>{new Date(event.createdAt).toLocaleString()}</span>
                    <span>{event.userAgent || "Устройство не определено"}</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
