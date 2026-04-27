import {
  ShieldX,
  LockKeyhole,
  Code2,
  FileWarning,
  SlidersHorizontal,
  Package,
  KeyRound,
  Database,
  FileText,
  Server,
} from 'lucide-react';

export const owaspModules = [
  {
    id: 'a01',
    name: 'Нарушение контроля доступа',
    shortName: 'Контроль доступа',
    description: 'Ошибки авторизации позволяют читать или изменять чужие данные.',
    tagline: 'Проверка прав на каждый запрос.',
    icon: ShieldX,
    color: '#EF4444',
    bgColor: 'rgba(239, 68, 68, 0.1)',
    difficulty: 'Medium',
    riskLevel: 'Critical',
    completionPercentage: 75,
    secureByDesign: ['Design', 'Prevent', 'Detect'],
    isCompleted: false,
    examples: {
      vulnerable: `app.get('/api/admin/users', (req, res) => {
  return res.json(users);
});`,
      secure: `const requireAdmin = (req, res, next) => {
  if (!isAdmin(req.auth)) return res.status(403).json({ error: 'forbidden' });
  return next();
};`,
      explanation: 'Приватные и админские маршруты должны быть закрыты middleware-ограничениями.',
    },
    defenses: ['RBAC/ABAC', 'Проверка владельца ресурса', 'Логи отказов доступа'],
    realWorldImpact: 'Утечка персональных данных и эскалация привилегий.',
    attackFlow: ['Подмена ID', 'Запрос чужого ресурса', 'Чтение/изменение данных'],
    lifecycleStage: 'Design',
    attack: {
      description: 'Атакующий подбирает идентификатор и получает доступ к чужому объекту.',
      flow: ['Подмена параметра', 'Обход проверки', 'Доступ к данным'],
      impact: 'Компрометация данных пользователей.',
    },
    defense: {
      strategies: ['Least privilege', 'Единая политика доступа', 'Регулярный аудит прав'],
    },
    controlIds: ['rbac', 'secure-logging'],
    codeLinks: [
      {
        title: 'Authorization guard',
        file: 'backend/src/server.js',
        snippet: `const authRequired = (req, res, next) => {
  const [type, token] = (req.headers.authorization || '').split(' ');
  if (type !== 'Bearer' || !token) return res.status(401).json({ error: 'unauthorized' });
  req.auth = jwt.verify(token, jwtSecret);
  return next();
};`,
      },
    ],
  },
  {
    id: 'a02',
    name: 'Криптографические ошибки',
    shortName: 'Криптография',
    description: 'Слабое хеширование и хранение секретов ведут к компрометации аккаунтов.',
    tagline: 'bcrypt и безопасное хранение токенов.',
    icon: LockKeyhole,
    color: '#F97316',
    bgColor: 'rgba(249, 115, 22, 0.1)',
    difficulty: 'Hard',
    riskLevel: 'Critical',
    completionPercentage: 30,
    secureByDesign: ['Design', 'Prevent', 'Recover'],
    isCompleted: false,
    examples: {
      vulnerable: `const passwordHash = md5(password);`,
      secure: `const passwordHash = await bcrypt.hash(password, 12);
const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');`,
      explanation: 'Пароли и refresh-токены должны храниться только в виде стойких хешей.',
    },
    defenses: ['bcrypt/argon2', 'Хеширование токенов', 'Ротация секретов'],
    realWorldImpact: 'Кража аккаунтов после утечки базы.',
    attackFlow: ['Доступ к БД', 'Взлом слабых хешей', 'Захват аккаунта'],
    lifecycleStage: 'Build',
    attack: {
      description: 'Слабые алгоритмы позволяют быстро восстановить исходные пароли.',
      flow: ['Экспорт хешей', 'Брутфорс', 'Компрометация'],
      impact: 'Массовый захват учетных записей.',
    },
    defense: {
      strategies: ['Современные алгоритмы', 'Корректные параметры cost', 'Периодический аудит'],
    },
    controlIds: ['crypto', 'secure-logging'],
    codeLinks: [
      {
        title: 'Password and token hashing',
        file: 'backend/src/server.js',
        snippet: `const passwordHash = await bcrypt.hash(password, 12);
const hashToken = token => crypto.createHash('sha256').update(token).digest('hex');`,
      },
    ],
  },
  {
    id: 'a03',
    name: 'Инъекции',
    shortName: 'Инъекции',
    description: 'Непроверенный ввод может изменить логику запроса или команды.',
    tagline: 'Санитизация и ORM-подход.',
    icon: Code2,
    color: '#EAB308',
    bgColor: 'rgba(234, 179, 8, 0.1)',
    difficulty: 'Medium',
    riskLevel: 'Critical',
    completionPercentage: 100,
    secureByDesign: ['Design', 'Prevent', 'Detect'],
    isCompleted: true,
    examples: {
      vulnerable: "const query = `SELECT * FROM users WHERE email='${email}'`;",
      secure: `const safeTitle = sanitizeText(title, 120);
const safeContent = sanitizeText(content, 5000);
await prisma.note.create({ data: { title: safeTitle, content: safeContent, userId: req.auth.sub } });`,
      explanation: 'Приводим вход к безопасному виду и сохраняем через ORM, а не строковые SQL.',
    },
    defenses: ['Санитизация', 'Параметризованные запросы', 'Ограничение длины'],
    realWorldImpact: 'Чтение, изменение или удаление данных.',
    attackFlow: ['Ввод payload', 'Выполнение запроса', 'Компрометация БД'],
    lifecycleStage: 'Build',
    attack: {
      description: 'Payload проходит в слой данных и меняет исполняемый запрос.',
      flow: ['Подготовка payload', 'Отправка формы', 'Выполнение'],
      impact: 'Утечка и повреждение данных.',
    },
    defense: {
      strategies: ['Валидация входа', 'ORM', 'Аудит небезопасных точек'],
    },
    controlIds: ['input-validation', 'secure-logging'],
    codeLinks: [
      {
        title: 'Sanitized create with Prisma',
        file: 'backend/src/server.js',
        snippet: `if (!safeTitle || !safeContent) return res.status(400).json({ error: 'invalid_payload' });
await prisma.note.create({ data: { title: safeTitle, content: safeContent, userId: req.auth.sub } });`,
      },
    ],
  },
  {
    id: 'a04',
    name: 'Небезопасный дизайн',
    shortName: 'Дизайн',
    description: 'Риск формируется архитектурными решениями, не только кодом.',
    tagline: 'Проектируй защиту заранее.',
    icon: FileWarning,
    color: '#F59E0B',
    bgColor: 'rgba(245, 158, 11, 0.1)',
    difficulty: 'Hard',
    riskLevel: 'High',
    completionPercentage: 45,
    secureByDesign: ['Design', 'Prevent'],
    isCompleted: false,
    examples: {
      vulnerable: `// refresh-token используется повторно без ротации`,
      secure: `await prisma.refreshToken.update({ where: { id: stored.id }, data: { revokedAt: new Date() } });
const tokens = await issueTokens(user, req);`,
      explanation: 'Ротация refresh-токенов уменьшает окно компрометации сессии.',
    },
    defenses: ['Threat modeling', 'Защита auth-flow', 'Минимальные привилегии'],
    realWorldImpact: 'Системные уязвимости на уровне бизнес-логики.',
    attackFlow: ['Анализ сценариев', 'Поиск слабого места', 'Эксплуатация'],
    lifecycleStage: 'Design',
    attack: {
      description: 'Ошибки в логике аутентификации или восстановления сессии.',
      flow: ['Разведка', 'Обход логики', 'Закрепление доступа'],
      impact: 'Устойчивый несанкционированный доступ.',
    },
    defense: {
      strategies: ['Security review на этапе дизайна', 'Zero trust', 'Регулярные ревизии'],
    },
    controlIds: ['rate-limit', 'secure-logging'],
    codeLinks: [
      {
        title: 'Refresh token rotation',
        file: 'backend/src/server.js',
        snippet: `if (!stored || stored.revokedAt || stored.expiresAt < new Date()) return res.status(401).json({ error: 'invalid_refresh_token' });
await prisma.refreshToken.update({ where: { id: stored.id }, data: { revokedAt: new Date() } });`,
      },
    ],
  },
  {
    id: 'a05',
    name: 'Ошибки конфигурации безопасности',
    shortName: 'Конфигурация',
    description: 'Неверные настройки среды и заголовков открывают поверхность атаки.',
    tagline: 'Безопасные дефолты и заголовки.',
    icon: SlidersHorizontal,
    color: '#0EA5E9',
    bgColor: 'rgba(14, 165, 233, 0.1)',
    difficulty: 'Medium',
    riskLevel: 'High',
    completionPercentage: 55,
    secureByDesign: ['Build', 'Detect'],
    isCompleted: false,
    examples: {
      vulnerable: `app.disable('helmet'); // пример небезопасной настройки`,
      secure: `app.disable('x-powered-by');
res.setHeader('X-Frame-Options', 'DENY');
res.setHeader('X-Content-Type-Options', 'nosniff');`,
      explanation: 'Базовые security headers должны выставляться для каждого ответа.',
    },
    defenses: ['Security headers', 'CORS allowlist', 'HSTS в production'],
    realWorldImpact: 'Упрощенный exploit через misconfiguration.',
    attackFlow: ['Скан конфигов', 'Поиск небезопасных настроек', 'Эксплуатация'],
    lifecycleStage: 'Build',
    attack: {
      description: 'Небезопасные дефолты упрощают атаки без сложного payload.',
      flow: ['Сканирование', 'Фингерпринтинг', 'Эксплуатация'],
      impact: 'Рост вероятности компрометации.',
    },
    defense: {
      strategies: ['Базовый security baseline', 'Проверки в CI', 'Контроль env-переменных'],
    },
    controlIds: ['secure-config', 'secure-logging'],
    codeLinks: [
      {
        title: 'Security headers setup',
        file: 'backend/src/server.js',
        snippet: `app.use((req, res, next) => {
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});`,
      },
    ],
  },
  {
    id: 'a06',
    name: 'Уязвимые и устаревшие компоненты',
    shortName: 'Компоненты',
    description: 'Старые версии библиотек содержат известные уязвимости.',
    tagline: 'Обновляй зависимости и запускай аудит.',
    icon: Package,
    color: '#8B5CF6',
    bgColor: 'rgba(139, 92, 246, 0.1)',
    difficulty: 'Medium',
    riskLevel: 'High',
    completionPercentage: 60,
    secureByDesign: ['Build', 'Detect', 'Recover'],
    isCompleted: false,
    examples: {
      vulnerable: `const lodash = require('lodash@4.17.10');`,
      secure: `// lockfile фиксирует версии пакетов
// npm audit запускается регулярно в CI`,
      explanation: 'Управление версиями и аудит зависимостей должны быть процессом, а не разовой задачей.',
    },
    defenses: ['SCA-сканирование', 'Политика обновлений', 'Lockfile discipline'],
    realWorldImpact: 'Эксплуатация известных CVE.',
    attackFlow: ['Определение версии', 'Подбор CVE', 'Эксплуатация'],
    lifecycleStage: 'Build',
    attack: {
      description: 'Атакующий использует публичный эксплойт к устаревшему компоненту.',
      flow: ['Определение стека', 'Подбор CVE', 'Атака'],
      impact: 'Полная компрометация сервиса.',
    },
    defense: {
      strategies: ['Регулярные обновления', 'Автоматический аудит', 'Контроль release-процесса'],
    },
    controlIds: ['dependency-monitoring'],
    codeLinks: [
      {
        title: 'Dependency audit command',
        file: 'backend/package.json',
        snippet: `npm audit --omit=dev`,
      },
    ],
  },
  {
    id: 'a07',
    name: 'Сбои идентификации и аутентификации',
    shortName: 'Аутентификация',
    description: 'Слабые проверки входа позволяют перебирать и захватывать аккаунты.',
    tagline: 'Policy + rate limiting + корректная сессия.',
    icon: KeyRound,
    color: '#A855F7',
    bgColor: 'rgba(168, 85, 247, 0.1)',
    difficulty: 'Hard',
    riskLevel: 'High',
    completionPercentage: 35,
    secureByDesign: ['Prevent', 'Detect'],
    isCompleted: false,
    examples: {
      vulnerable: `if (password.length < 6) allowLogin();`,
      secure: `const loginLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  keyFn: req => \`login:\${req.ip}:\${normalizeEmail(req.body?.email) || 'unknown'}\`
});`,
      explanation: 'Лимиты и строгая валидация credentials снижают риск brute-force.',
    },
    defenses: ['Rate limiting', 'Политика паролей', 'Revocation refresh-токенов'],
    realWorldImpact: 'Захват аккаунтов пользователей.',
    attackFlow: ['Сбор логинов', 'Перебор паролей', 'Успешный вход'],
    lifecycleStage: 'Build',
    attack: {
      description: 'Автоматический перебор учетных данных на endpoint входа.',
      flow: ['Автоматизация', 'Брутфорс', 'Доступ'],
      impact: 'Компрометация учетных записей.',
    },
    defense: {
      strategies: ['Ограничение попыток', 'Безопасная проверка формата', 'Сильная парольная политика'],
    },
    controlIds: ['session-hardening', 'rate-limit', 'secure-logging'],
    codeLinks: [
      {
        title: 'Login rate limiter',
        file: 'backend/src/server.js',
        snippet: `app.post('/api/auth/login', authLimiter, loginLimiter, async (req, res) => {
  if (!validateEmail(email) || !validatePasswordInput(password)) {
    return res.status(400).json({ error: 'invalid_credentials' });
  }
});`,
      },
    ],
  },
  {
    id: 'a08',
    name: 'Нарушение целостности ПО и данных',
    shortName: 'Целостность',
    description: 'Проблемы в цепочке поставок и обработке данных приводят к подмене.',
    tagline: 'Контроль входа и отказ от runtime-подгрузок.',
    icon: Database,
    color: '#14B8A6',
    bgColor: 'rgba(20, 184, 166, 0.1)',
    difficulty: 'Hard',
    riskLevel: 'High',
    completionPercentage: 20,
    secureByDesign: ['Prevent', 'Detect', 'Recover'],
    isCompleted: false,
    examples: {
      vulnerable: `const data = JSON.parse(req.body.serialized); processData(data);`,
      secure: `app.use(express.json({ limit: '100kb' }));
const sanitizeText = (value, maxLength) => {
  if (typeof value !== 'string') return '';
  return value.replace(/[\\u0000-\\u001f\\u007f]/g, ' ').trim().slice(0, maxLength);
};`,
      explanation: 'Ограничение тела запроса и санитизация снижают риск некорректной обработки данных.',
    },
    defenses: ['Валидация формата', 'Контроль pipeline', 'Отсутствие runtime code loading'],
    realWorldImpact: 'Подмена артефактов и данных.',
    attackFlow: ['Подмена данных', 'Доставка в сервис', 'Эксплуатация'],
    lifecycleStage: 'Build',
    attack: {
      description: 'Подмена или внедрение некорректных данных в жизненный цикл обработки.',
      flow: ['Подмена payload', 'Принятие сервисом', 'Нарушение целостности'],
      impact: 'Порча данных и цепочки поставок.',
    },
    defense: {
      strategies: ['Схемы и санитизация', 'Проверки в CI/CD', 'Контроль целостности'],
    },
    controlIds: ['integrity-checks', 'input-validation'],
    codeLinks: [
      {
        title: 'Safe request body handling',
        file: 'backend/src/server.js',
        snippet: `app.use(express.json({ limit: '100kb' }));
const sanitizeText = (value, maxLength) => {
  if (typeof value !== 'string') return '';
  return value.replace(/[\\u0000-\\u001f\\u007f]/g, ' ').trim().slice(0, maxLength);
};`,
      },
    ],
  },
  {
    id: 'a09',
    name: 'Сбои логирования и мониторинга',
    shortName: 'Логирование',
    description: 'Без аудита инциденты обнаруживаются слишком поздно.',
    tagline: 'Централизованный security audit log.',
    icon: FileText,
    color: '#22C55E',
    bgColor: 'rgba(34, 197, 94, 0.1)',
    difficulty: 'Easy',
    riskLevel: 'Medium',
    completionPercentage: 40,
    secureByDesign: ['Detect', 'Respond'],
    isCompleted: false,
    examples: {
      vulnerable: `app.post('/login', () => {/* no security log */});`,
      secure: `const writeAuditLog = async (req, action, meta = {}) => {
  await prisma.auditLog.create({
    data: { userId: req.auth?.sub || null, action, ip: req.ip, meta }
  });
};`,
      explanation: 'События auth/admin/content должны логироваться в одном формате.',
    },
    defenses: ['Audit log', 'Мониторинг событий', 'Быстрый разбор инцидентов'],
    realWorldImpact: 'Позднее обнаружение атак и рост ущерба.',
    attackFlow: ['Атака', 'Нет сигнала', 'Поздняя реакция'],
    lifecycleStage: 'Monitor',
    attack: {
      description: 'Без телеметрии атака проходит незаметно.',
      flow: ['Эксплуатация', 'Отсутствие алерта', 'Ущерб'],
      impact: 'Длительное присутствие злоумышленника.',
    },
    defense: {
      strategies: ['Единый аудит', 'Корреляция событий', 'Ретенция логов'],
    },
    controlIds: ['secure-logging'],
    codeLinks: [
      {
        title: 'Audit logger',
        file: 'backend/src/server.js',
        snippet: `void writeAuditLog(req, 'auth_login_failed', { email, reason: 'invalid_password' });
void writeAuditLog(req, 'note_deleted', { noteId: note.id });`,
      },
    ],
  },
  {
    id: 'a10',
    name: 'SSRF',
    shortName: 'SSRF',
    description: 'Сервер может быть использован для доступа к внутренним ресурсам.',
    tagline: 'Валидируй URL и ограничивай протоколы.',
    icon: Server,
    color: '#EC4899',
    bgColor: 'rgba(236, 72, 153, 0.1)',
    difficulty: 'Hard',
    riskLevel: 'High',
    completionPercentage: 15,
    secureByDesign: ['Prevent', 'Detect'],
    isCompleted: false,
    examples: {
      vulnerable: `const response = await fetch(req.query.url);`,
      secure: `const validateAvatarUrl = value => {
  const parsed = new URL(value.trim());
  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return null;
  return value.trim();
};`,
      explanation: 'Даже для простых URL-полей нужна строгая валидация протокола.',
    },
    defenses: ['Валидация URL', 'Блок внутренних адресов', 'Сегментация сети'],
    realWorldImpact: 'Доступ к внутренним сервисам и метаданным.',
    attackFlow: ['Подмена URL', 'Внутренний запрос', 'Утечка'],
    lifecycleStage: 'Build',
    attack: {
      description: 'Пользователь передает URL, который инициирует серверный запрос к внутренней цели.',
      flow: ['Передача URL', 'Запрос от сервера', 'Получение внутренних данных'],
      impact: 'Компрометация внутренней инфраструктуры.',
    },
    defense: {
      strategies: ['Allowlist/валидация', 'Запрет внутренних сетей', 'Логирование исходящих вызовов'],
    },
    controlIds: ['input-validation', 'network-segmentation'],
    codeLinks: [
      {
        title: 'Avatar URL validation',
        file: 'backend/src/server.js',
        snippet: `try {
  const parsed = new URL(trimmed);
  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return null;
  return trimmed;
} catch { return null; }`,
      },
    ],
  },
];

export const achievements = [
  { id: 'explorer', name: 'Исследователь', description: 'Открыть 3 модуля', icon: '🧭', isUnlocked: true, requirement: 3, type: 'modules_viewed' },
  { id: 'defender', name: 'Защитник', description: 'Завершить 5 модулей', icon: '🛡️', isUnlocked: false, requirement: 5, type: 'modules_completed' },
  { id: 'expert', name: 'Эксперт по безопасности', description: 'Завершить 8 модулей', icon: '🎯', isUnlocked: false, requirement: 8, type: 'modules_completed' },
  { id: 'master', name: 'Мастер OWASP', description: 'Завершить все 10 модулей', icon: '🏆', isUnlocked: false, requirement: 10, type: 'modules_completed' },
  { id: 'streak3', name: 'Постоянный ученик', description: 'Серия 3 дня', icon: '🔥', isUnlocked: true, requirement: 3, type: 'streak' },
  { id: 'streak7', name: 'Упорный студент', description: 'Серия 7 дней', icon: '⚡', isUnlocked: false, requirement: 7, type: 'streak' },
];

export const userProgress = {
  modulesViewed: 6,
  modulesCompleted: 1,
  currentStreak: 3,
  totalTimeSpent: 245,
  lastActive: new Date().toISOString(),
};
