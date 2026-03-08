export const systemComponents = [
  {
    id: "ui",
    name: "Web UI",
    description: "Формы, ввод данных, клиентские сценарии.",
  },
  {
    id: "auth",
    name: "Auth Service",
    description: "Аутентификация, управление сессиями, MFA.",
  },
  {
    id: "api",
    name: "API Layer",
    description: "Маршруты, контроллеры, бизнес-логика.",
  },
  {
    id: "db",
    name: "Database",
    description: "Хранение данных, запросы и права доступа.",
  },
  {
    id: "storage",
    name: "Storage",
    description: "Файлы, артефакты, внешние ресурсы.",
  },
  {
    id: "logging",
    name: "Security Logs",
    description: "Журналы безопасности и мониторинг.",
  },
  {
    id: "network",
    name: "Network",
    description: "Сегментация, ограничения и сетевые фильтры.",
  },
];

export const protectionMap = {
  a01: [
    {
      componentId: "api",
      status: "protected",
      controls: ["RBAC", "Проверка владельца"],
      why: "Доступ к ресурсам проверяется по роли и принадлежности записи.",
      evidence: "authRequired + requireAdmin + requireNoteAccess.",
    },
    {
      componentId: "db",
      status: "protected",
      controls: ["Access checks"],
      why: "Запросы выполняются только после проверки прав доступа.",
      evidence: "Проверки userId/admin перед read/update/delete.",
    },
    {
      componentId: "logging",
      status: "protected",
      controls: ["Security Logging"],
      why: "Попытки несанкционированного доступа фиксируются в audit log.",
      evidence: "Логи 401/403 и security events.",
    },
  ],
  a02: [
    {
      componentId: "auth",
      status: "protected",
      controls: ["bcrypt", "Token hashing"],
      why: "Секретные данные не сохраняются в открытом виде.",
      evidence: "bcrypt.hash(password) + sha256(token).",
    },
    {
      componentId: "db",
      status: "protected",
      controls: ["Hashing", "No plaintext secrets"],
      why: "Пароли и refresh token защищены криптографически.",
      evidence: "passwordHash и tokenHash в базе.",
    },
    {
      componentId: "network",
      status: "protected",
      controls: ["TLS", "HSTS"],
      why: "Передача данных защищена транспортным шифрованием.",
      evidence: "HTTPS required + Strict-Transport-Security.",
    },
  ],
  a03: [
    {
      componentId: "api",
      status: "protected",
      controls: ["Input validation", "ORM parameterization"],
      why: "Опасный ввод очищается, а запросы не собираются строками.",
      evidence: "sanitizeText + Prisma ORM.",
    },
    {
      componentId: "db",
      status: "protected",
      controls: ["Prisma ORM"],
      why: "Параметризованные запросы снижают риск injection.",
      evidence: "CRUD через Prisma без raw SQL.",
    },
  ],
  a04: [
    {
      componentId: "auth",
      status: "protected",
      controls: ["Refresh token rotation", "Password reset token"],
      why: "Сценарии сессий и восстановления пароля спроектированы безопасно.",
      evidence: "rotation/revocation + reset token with TTL.",
    },
    {
      componentId: "api",
      status: "protected",
      controls: ["Rate limiting", "Business rules"],
      why: "Злоупотребление логикой ограничено на уровне endpoint.",
      evidence: "createRateLimiter + server-side validation.",
    },
  ],
  a05: [
    {
      componentId: "api",
      status: "protected",
      controls: ["Security headers", "CORS allowlist"],
      why: "Небезопасные дефолтные настройки устранены.",
      evidence: "X-Frame-Options, CSP, CORS allowlist.",
    },
    {
      componentId: "network",
      status: "protected",
      controls: ["HTTPS enforcement"],
      why: "Insecure transport в production блокируется.",
      evidence: "x-forwarded-proto check.",
    },
  ],
  a06: [
    {
      componentId: "storage",
      status: "partial",
      controls: ["Dependency monitoring"],
      why: "Есть базовый контроль зависимостей, но нужен процесс в CI.",
      evidence: "lockfile + запланированный audit pipeline.",
    },
    {
      componentId: "api",
      status: "partial",
      controls: ["Pinned versions"],
      why: "Фиксация версий снижает дрейф зависимостей.",
      evidence: "package-lock.json.",
    },
  ],
  a07: [
    {
      componentId: "auth",
      status: "protected",
      controls: ["Rate limiting", "Lockout", "MFA", "JWT hardening"],
      why: "Защищает от brute force, credential stuffing и token abuse.",
      evidence: "login limiter + lockout + requireAdminMfa + jwt.verify options.",
    },
    {
      componentId: "ui",
      status: "protected",
      controls: ["Password policy hints"],
      why: "Клиент подталкивает пользователя к сильному паролю.",
      evidence: "Валидация и подсказки в форме.",
    },
  ],
  a08: [
    {
      componentId: "api",
      status: "partial",
      controls: ["Integrity checks (process)"],
      why: "Часть защиты зависит от CI/CD и процессов сборки.",
      evidence: "Runtime code loading отсутствует, но нужен CI control.",
    },
    {
      componentId: "storage",
      status: "partial",
      controls: ["Artifact policy"],
      why: "Требуется формальный pipeline подписи/проверки артефактов.",
      evidence: "Запланировано для CI.",
    },
  ],
  a09: [
    {
      componentId: "logging",
      status: "protected",
      controls: ["Audit log", "Redaction", "Hash chain", "Alerts"],
      why: "События безопасности фиксируются и защищены от утечки/подмены.",
      evidence: "sanitizeAuditMeta + _chainHash + security_alert.",
    },
  ],
  a10: [
    {
      componentId: "api",
      status: "protected",
      controls: ["URL validation", "Path traversal block"],
      why: "Ограничен доступ к опасным URL и traversal-паттернам.",
      evidence: "validateAvatarUrl + traversalPattern guard.",
    },
    {
      componentId: "network",
      status: "protected",
      controls: ["Origin checks", "CORS policy"],
      why: "Cross-site злоупотребления ограничены сетевой политикой.",
      evidence: "Origin + Sec-Fetch-Site checks.",
    },
  ],
};
