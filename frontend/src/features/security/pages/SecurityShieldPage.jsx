import React, { useEffect, useMemo, useState } from "react";
import { fetchOwaspSecurityStatus } from "../../../api/security";
import "./SecurityShieldPage.css";

const statusLabels = {
  implemented: "Реализовано",
  partial: "Частично",
  planned: "Запланировано",
};

const eventLabels = {
  auth_missing_token: "Запрос без токена",
  auth_invalid_token: "Неверный токен",
  auth_register_success: "Успешная регистрация",
  auth_login_rejected_format: "Отклонен формат логина",
  auth_login_failed: "Неудачная попытка входа",
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

export function SecurityShieldPage({ user, onNavigate }) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [isTop10Open, setIsTop10Open] = useState(false);
  const [expandedCodes, setExpandedCodes] = useState({});

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
        setError("Не удалось загрузить статус защиты OWASP.");
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [user]);

  const filteredEvidence = useMemo(() => {
    const query = search.trim().toLowerCase();
    return (data?.securityEvidence || []).filter(item => {
      if (statusFilter !== "all" && item.status !== statusFilter) {
        return false;
      }
      if (!query) {
        return true;
      }
      const haystack =
        `${item.threatId} ${item.owasp2025} ${item.controlName} ${item.threat}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [data?.securityEvidence, search, statusFilter]);

  const toggleCode = id => {
    setExpandedCodes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (!user) {
    return (
      <div className="security-shield">
        <div className="security-shield__locked glass">
          <h1>OWASP Shield</h1>
          <p>Войдите в аккаунт, чтобы увидеть карту реальных защит проекта.</p>
          <button onClick={() => onNavigate("/auth")}>Перейти ко входу</button>
        </div>
      </div>
    );
  }

  return (
    <div className="security-shield">
      <div className="security-shield__header">
        <h1>OWASP Shield</h1>
        <p>Карта реализованных мер защиты и их состояние в проекте.</p>
      </div>

      {error && <div className="security-shield__error">{error}</div>}

      {isLoading ? (
        <div className="security-shield__loading glass">Загрузка статуса защиты...</div>
      ) : (
        <>
          <div className="security-shield__stats">
            <article className="security-shield__stat glass">
              <div className="security-shield__statValue">{data?.counters?.failedLogins24h || 0}</div>
              <div className="security-shield__statLabel">Неудачных входов (24ч)</div>
            </article>
            <article className="security-shield__stat glass">
              <div className="security-shield__statValue">
                {data?.counters?.blockedRequests24h || 0}
              </div>
              <div className="security-shield__statLabel">Заблокировано защитой (24ч)</div>
            </article>
            <article className="security-shield__stat glass">
              <div className="security-shield__statValue">
                {Array.isArray(data?.top10)
                  ? data.top10.filter(item => item.status === "implemented").length
                  : 0}
                /10
              </div>
              <div className="security-shield__statLabel">Закрыто категорий OWASP</div>
            </article>
          </div>

          <section className="security-shield__evidence">
            <div className="security-shield__sectionHead">
              <h2>Карта угроз и защит</h2>
              <span>{filteredEvidence.length} записей</span>
            </div>

            <div className="security-shield__filters glass">
              <div className="security-shield__filterGroup">
                <button
                  className={`security-shield__chip ${statusFilter === "all" ? "security-shield__chip--active" : ""}`}
                  onClick={() => setStatusFilter("all")}
                >
                  Все
                </button>
                <button
                  className={`security-shield__chip ${statusFilter === "implemented" ? "security-shield__chip--active" : ""}`}
                  onClick={() => setStatusFilter("implemented")}
                >
                  Реализовано
                </button>
                <button
                  className={`security-shield__chip ${statusFilter === "partial" ? "security-shield__chip--active" : ""}`}
                  onClick={() => setStatusFilter("partial")}
                >
                  Частично
                </button>
              </div>
              <input
                value={search}
                onChange={event => setSearch(event.target.value)}
                className="security-shield__search"
                placeholder="Поиск по ID, OWASP, контролю..."
              />
            </div>

            <div className="security-shield__evidenceGrid">
              {filteredEvidence.map(item => (
                <article key={item.id} className="security-shield__evidenceCard glass">
                  <div className="security-shield__evidenceHead">
                    <strong>{item.threatId}</strong>
                    <span>{item.owasp2025}</span>
                  </div>
                  <div className="security-shield__evidenceStatus">
                    <span
                      className={`security-shield__badge security-shield__badge--${item.status || "implemented"}`}
                    >
                      {statusLabels[item.status] || "Реализовано"}
                    </span>
                  </div>
                  <h3>{item.controlName}</h3>
                  <p className="security-shield__evidenceThreat">{item.threat}</p>
                  <p className="security-shield__evidenceProtects">
                    <b>Защищает от:</b> {item.protectsAgainst}
                  </p>
                  {item.codeSnippet ? (
                    <div className="security-shield__codeWrap">
                      <button
                        className="security-shield__codeToggle"
                        onClick={() => toggleCode(item.id)}
                      >
                        {expandedCodes[item.id] ? "Скрыть код" : "Показать код"}
                      </button>
                      {expandedCodes[item.id] ? (
                        <pre className="security-shield__code">
                          <code>{item.codeSnippet}</code>
                        </pre>
                      ) : null}
                    </div>
                  ) : null}
                </article>
              ))}
            </div>

            {filteredEvidence.length === 0 ? (
              <div className="security-shield__empty">Совпадения не найдены.</div>
            ) : null}
          </section>

          <section className="security-shield__top10 glass">
            <button
              className="security-shield__accordionBtn"
              onClick={() => setIsTop10Open(prev => !prev)}
            >
              <span>OWASP Top 10 (сводка)</span>
              <span>{isTop10Open ? "Свернуть" : "Развернуть"}</span>
            </button>
            {isTop10Open ? (
              <div className="security-shield__grid">
                {(data?.top10 || []).map(item => (
                  <article key={item.id} className="security-shield__card">
                    <div className="security-shield__cardHeader">
                      <h2>
                        {item.id} - {item.title}
                      </h2>
                      <span
                        className={`security-shield__badge security-shield__badge--${item.status}`}
                      >
                        {statusLabels[item.status] || item.status}
                      </span>
                    </div>
                    <ul>
                      {(item.controls || []).map(control => (
                        <li key={control}>{control}</li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            ) : null}
          </section>

          <section className="security-shield__events glass">
            <h2>Последние события безопасности</h2>
            {(data?.recentSecurityEvents || []).length === 0 ? (
              <div className="security-shield__empty">События не найдены.</div>
            ) : (
              <div className="security-shield__eventList">
                {data.recentSecurityEvents.map(event => (
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
