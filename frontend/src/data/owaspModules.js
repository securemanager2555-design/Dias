import { ShieldX, LockKeyhole, Code2, FileWarning, SlidersHorizontal, Package, KeyRound, Database, FileText, Server } from 'lucide-react';
export const owaspModules = [{
  id: 'a01',
  name: 'Broken Access Control',
  shortName: 'Access Control',
  description: 'Контроль доступа гарантирует, что пользователи действуют в рамках своих прав. Ошибки приводят к утечкам, изменению или уничтожению данных.',
  tagline: 'Когда пользователи получают лишние права',
  icon: ShieldX,
  color: '#EF4444',
  bgColor: 'rgba(239, 68, 68, 0.1)',
  difficulty: 'Medium',
  riskLevel: 'Critical',
  completionPercentage: 75,
  secureByDesign: ['Design', 'Prevent', 'Detect'],
  isCompleted: false,
  examples: {
    vulnerable: `// Vulnerable: Direct object reference
app.get('/api/user/:id', (req, res) => {
  const user = db.findUser(req.params.id);
  res.json(user); // No authorization check!
});`,
    secure: `// Secure: Proper authorization
app.get('/api/user/:id', authorize, (req, res) => {
  if (req.user.id !== req.params.id && !req.user.isAdmin) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const user = db.findUser(req.params.id);
  res.json(user);
});`,
    explanation: 'Всегда проверяйте, что у аутентифицированного пользователя есть доступ к запрошенному ресурсу.'
  },
  defenses: ['Проверяйте доступ на каждом запросе', 'Запрещайте по умолчанию и выдавайте права явно', 'Используйте RBAC', 'Логируйте отказы доступа и уведомляйте администраторов', 'Включайте rate limiting для API'],
  realWorldImpact: 'В 2019 году банк раскрыл 100 млн записей клиентов из-за неверно настроенного контроля доступа в облаке.',
  attackFlow: ['Атакующий находит эндпоинт', 'Меняет идентификатор пользователя', 'Обходит авторизацию', 'Получает чужие данные'],
  lifecycleStage: 'Design',
  attack: {
    description: 'Контроль доступа гарантирует, что пользователи действуют в рамках своих прав. Ошибки приводят к утечкам, изменению или уничтожению данных.',
    flow: ['Атакующий находит эндпоинт', 'Меняет идентификатор пользователя', 'Обходит авторизацию', 'Получает чужие данные'],
    impact: 'В 2019 году банк раскрыл 100 млн записей клиентов из-за неверно настроенного контроля доступа в облаке.'
  },
  defense: {
    strategies: ['Проверяйте доступ на каждом запросе', 'Запрещайте по умолчанию и выдавайте права явно', 'Используйте RBAC', 'Логируйте отказы доступа и уведомляйте администраторов', 'Включайте rate limiting для API']
  },
  controlIds: ['rbac', 'rate-limit', 'secure-logging'],
  codeLinks: [{
    title: 'Authorization middleware',
    file: 'src/security/authorize.js',
    snippet: `// Secure: Proper authorization
app.get('/api/user/:id', authorize, (req, res) => {
  if (req.user.id !== req.params.id && !req.user.isAdmin) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const user = db.findUser(req.params.id);
  res.json(user);
});`
  }]
}, {
  id: 'a02',
  name: 'Cryptographic Failures',
  shortName: 'Crypto Failures',
  description: 'Ранее категория называлась Sensitive Data Exposure. Она описывает ошибки в криптографии, приводящие к утечкам или компрометации системы.',
  tagline: 'Когда секреты не остаются секретами',
  icon: LockKeyhole,
  color: '#F97316',
  bgColor: 'rgba(249, 115, 22, 0.1)',
  difficulty: 'Hard',
  riskLevel: 'Critical',
  completionPercentage: 30,
  secureByDesign: ['Design', 'Prevent', 'Recover'],
  isCompleted: false,
  examples: {
    vulnerable: `// Vulnerable: Weak hashing
const passwordHash = md5(password);
db.saveUser({ email, passwordHash });`,
    secure: `// Secure: Strong hashing with salt
const saltRounds = 12;
const passwordHash = await bcrypt.hash(password, saltRounds);
db.saveUser({ email, passwordHash });`,
    explanation: 'Используйте современные криптографические алгоритмы. MD5 и SHA1 небезопасны для хеширования паролей.'
  },
  defenses: ['Используйте современные алгоритмы шифрования (AES-256, RSA-2048+)', 'Хешируйте пароли через bcrypt/scrypt/Argon2', 'Шифруйте чувствительные данные в хранении и при передаче', 'Безопасно храните криптоключи', 'Отключайте кеширование для чувствительных ответов'],
  realWorldImpact: 'В 2013 году утечка Adobe раскрыла 153 млн записей с слабым шифрованием, что привело к массовому взлому паролей.',
  attackFlow: ['Атакующий перехватывает данные', 'Находит слабое шифрование', 'Взламывает или расшифровывает данные', 'Получает чувствительную информацию'],
  lifecycleStage: 'Build',
  attack: {
    description: 'Ранее категория называлась Sensitive Data Exposure. Она описывает ошибки в криптографии, приводящие к утечкам или компрометации системы.',
    flow: ['Атакующий перехватывает данные', 'Находит слабое шифрование', 'Взламывает или расшифровывает данные', 'Получает чувствительную информацию'],
    impact: 'В 2013 году утечка Adobe раскрыла 153 млн записей с слабым шифрованием, что привело к массовому взлому паролей.'
  },
  defense: {
    strategies: ['Используйте современные алгоритмы шифрования (AES-256, RSA-2048+)', 'Хешируйте пароли через bcrypt/scrypt/Argon2', 'Шифруйте чувствительные данные в хранении и при передаче', 'Безопасно храните криптоключи', 'Отключайте кеширование для чувствительных ответов']
  },
  controlIds: ['crypto', 'secure-logging'],
  codeLinks: [{
    title: 'Password hashing',
    file: 'src/security/passwords.js',
    snippet: `// Secure: Strong hashing with salt
const saltRounds = 12;
const passwordHash = await bcrypt.hash(password, saltRounds);
db.saveUser({ email, passwordHash });`
  }]
}, {
  id: 'a03',
  name: 'Injection',
  shortName: 'Injection',
  description: 'Injection возникает, когда недоверенные данные отправляются интерпретатору как часть команды или запроса. Частые векторы — SQL/NoSQL/OS/LDAP injection.',
  tagline: 'Когда ввод становится кодом',
  icon: Code2,
  color: '#EAB308',
  bgColor: 'rgba(234, 179, 8, 0.1)',
  difficulty: 'Medium',
  riskLevel: 'Critical',
  completionPercentage: 100,
  secureByDesign: ['Design', 'Prevent', 'Detect'],
  isCompleted: true,
  examples: {
    vulnerable: `// Vulnerable: SQL Injection
const query = \`SELECT * FROM users 
  WHERE email = '\${email}' 
  AND password = '\${password}'\`;
db.execute(query);`,
    secure: `// Secure: Parameterized query
const query = 'SELECT * FROM users WHERE email = ? AND password = ?';
db.execute(query, [email, hashedPassword]);`,
    explanation: 'Никогда не вставляйте пользовательский ввод напрямую в запросы. Используйте параметризацию или prepared statements.'
  },
  defenses: ['Используйте параметризованные запросы', 'Валидируйте и очищайте ввод', 'Применяйте ORM с экранированием', 'Минимизируйте права БД (least privilege)', 'Используйте WAF'],
  realWorldImpact: 'SQL Injection стал причиной множества утечек, включая инцидент Equifax 2017 года (147 млн пользователей).',
  attackFlow: ['Атакующий готовит вредный ввод', 'Ввод интерпретируется как код', 'База выполняет атаку', 'Данные извлекаются или изменяются'],
  lifecycleStage: 'Build',
  attack: {
    description: 'Injection возникает, когда недоверенные данные отправляются интерпретатору как часть команды или запроса. Частые векторы — SQL/NoSQL/OS/LDAP injection.',
    flow: ['Атакующий готовит вредный ввод', 'Ввод интерпретируется как код', 'База выполняет атаку', 'Данные извлекаются или изменяются'],
    impact: 'SQL Injection стал причиной множества утечек, включая инцидент Equifax 2017 года (147 млн пользователей).'
  },
  defense: {
    strategies: ['Используйте параметризованные запросы', 'Валидируйте и очищайте ввод', 'Применяйте ORM с экранированием', 'Минимизируйте права БД (least privilege)', 'Используйте WAF']
  },
  controlIds: ['input-validation', 'secure-logging'],
  codeLinks: [{
    title: 'Parameterized query',
    file: 'src/db/queries.js',
    snippet: `// Secure: Parameterized query
const query = 'SELECT * FROM users WHERE email = ? AND password = ?';
db.execute(query, [email, hashedPassword]);`
  }]
}, {
  id: 'a04',
  name: 'Insecure Design',
  shortName: 'Insecure Design',
  description: 'Категория про риски, связанные с ошибками дизайна. Insecure Design нельзя исправить «идественной реализацией» — безопасность должна быть встроена с начала.',
  tagline: 'Когда безопасность появляется слишком поздно',
  icon: FileWarning,
  color: '#F59E0B',
  bgColor: 'rgba(245, 158, 11, 0.1)',
  difficulty: 'Hard',
  riskLevel: 'High',
  completionPercentage: 45,
  secureByDesign: ['Design', 'Prevent'],
  isCompleted: false,
  examples: {
    vulnerable: `// Vulnerable: No rate limiting on password reset
app.post('/reset-password', (req, res) => {
  const token = generateToken();
  sendResetEmail(req.body.email, token);
  res.json({ success: true });
});`,
    secure: `// Secure: Rate limiting + CAPTCHA
app.post('/reset-password', 
  rateLimiter({ max: 3, window: '1h' }),
  verifyCaptcha,
  async (req, res) => {
    const token = generateSecureToken();
    await sendResetEmail(req.body.email, token);
    res.json({ success: true });
});`,
    explanation: 'Проектируйте безопасность с самого начала. Учитывайте сценарии злоупотреблений и внедряйте контрмеры на этапе архитектуры.'
  },
  defenses: ['Встраивайте безопасность в SDLC с самого начала', 'Проводите threat modeling на этапе дизайна', 'Используйте defense in depth', 'Проектируйте с учётом отказов (assume breach)', 'Регулярно пересматривайте архитектуру безопасности'],
  realWorldImpact: 'Многие инциденты возникают из фундаментальных ошибок дизайна, которые нельзя исправить патчами.',
  attackFlow: ['Атакующий анализирует дизайн системы', 'Находит архитектурную слабость', 'Эксплуатирует дизайн‑ошибку', 'Получает несанкционированный доступ'],
  lifecycleStage: 'Design',
  attack: {
    description: 'Категория про риски, связанные с ошибками дизайна. Insecure Design нельзя исправить «идественной реализацией» — безопасность должна быть встроена с начала.',
    flow: ['Атакующий анализирует дизайн системы', 'Находит архитектурную слабость', 'Эксплуатирует дизайн‑ошибку', 'Получает несанкционированный доступ'],
    impact: 'Многие инциденты возникают из фундаментальных ошибок дизайна, которые нельзя исправить патчами.'
  },
  defense: {
    strategies: ['Встраивайте безопасность в SDLC с самого начала', 'Проводите threat modeling на этапе дизайна', 'Используйте defense in depth', 'Проектируйте с учётом отказов (assume breach)', 'Регулярно пересматривайте архитектуру безопасности']
  },
  controlIds: ['rate-limit', 'secure-config'],
  codeLinks: [{
    title: 'Rate limiting + CAPTCHA',
    file: 'src/security/rate-limit.js',
    snippet: `// Secure: Rate limiting + CAPTCHA
app.post('/reset-password', 
  rateLimiter({ max: 3, window: '1h' }),
  verifyCaptcha,
  async (req, res) => {
    const token = generateSecureToken();
    await sendResetEmail(req.body.email, token);
    res.json({ success: true });
});`
  }]
}, {
  id: 'a05',
  name: 'Security Misconfiguration',
  shortName: 'Misconfiguration',
  description: 'Security Misconfiguration — самая частая проблема. Сюда входят небезопасные дефолтные настройки, неполные конфиги и подробные ошибки.',
  tagline: 'Когда настройки остаются небезопасными',
  icon: SlidersHorizontal,
  color: '#A855F7',
  bgColor: 'rgba(168, 85, 247, 0.1)',
  difficulty: 'Easy',
  riskLevel: 'High',
  completionPercentage: 60,
  secureByDesign: ['Prevent', 'Detect'],
  isCompleted: false,
  examples: {
    vulnerable: `// Vulnerable: Debug mode in production
app.use(errorHandler({ 
  showStack: true,
  showMessage: true 
}));

// Exposed admin panel
app.use('/admin', adminRoutes);`,
    secure: `// Secure: Production configuration
app.use(errorHandler({ 
  showStack: false,
  showMessage: false,
  log: errorLogger 
}));

// Protected admin panel
app.use('/admin', authenticate, authorize('admin'), adminRoutes);`,
    explanation: 'Всегда проверяйте и ужесточайте настройки перед релизом. Не используйте дефолтные конфигурации в production.'
  },
  defenses: ['Используйте надёжные повторяемые процессы деплоя', 'Удаляйте неиспользуемые компоненты и фичи', 'Регулярно обновляйте конфигурации', 'Используйте security headers (CSP, HSTS, X-Frame-Options)', 'Автоматизируйте сканирование конфигов'],
  realWorldImpact: 'Инцидент Capital One 2019 года произошёл из‑за неверно настроенного WAF и привёл к утечке 100 млн записей.',
  attackFlow: ['Атакующий сканирует конфигурации', 'Находит открытые сервисы/дебаг‑инфо', 'Эксплуатирует слабые настройки', 'Получает доступ к системе'],
  lifecycleStage: 'Build',
  attack: {
    description: 'Security Misconfiguration — самая частая проблема. Сюда входят небезопасные дефолтные настройки, неполные конфиги и подробные ошибки.',
    flow: ['Атакующий сканирует конфигурации', 'Находит открытые сервисы/дебаг‑инфо', 'Эксплуатирует слабые настройки', 'Получает доступ к системе'],
    impact: 'Инцидент Capital One 2019 года произошёл из‑за неверно настроенного WAF и привёл к утечке 100 млн записей.'
  },
  defense: {
    strategies: ['Используйте надёжные повторяемые процессы деплоя', 'Удаляйте неиспользуемые компоненты и фичи', 'Регулярно обновляйте конфигурации', 'Используйте security headers (CSP, HSTS, X-Frame-Options)', 'Автоматизируйте сканирование конфигов']
  },
  controlIds: ['secure-config', 'secure-logging'],
  codeLinks: [{
    title: 'Production configuration',
    file: 'src/config/security.js',
    snippet: `// Secure: Production configuration
app.use(errorHandler({ 
  showStack: false,
  showMessage: false,
  log: errorLogger 
}));

// Protected admin panel
app.use('/admin', authenticate, authorize('admin'), adminRoutes);`
  }]
}, {
  id: 'a06',
  name: 'Vulnerable Components',
  shortName: 'Vulnerable Deps',
  description: 'Компоненты (библиотеки, фреймворки, модули) работают с теми же привилегиями, что и приложение. Уязвимые компоненты подрывают безопасность.',
  tagline: 'Когда зависимости становятся риском',
  icon: Package,
  color: '#3B82F6',
  bgColor: 'rgba(59, 130, 246, 0.1)',
  difficulty: 'Easy',
  riskLevel: 'High',
  completionPercentage: 85,
  secureByDesign: ['Prevent', 'Detect', 'Recover'],
  isCompleted: false,
  examples: {
    vulnerable: `// package.json with vulnerable deps
{
  "dependencies": {
    "lodash": "4.17.15", // CVE-2020-8203
    "axios": "0.18.0",   // CVE-2019-10742
    "express": "4.16.0"  // Multiple CVEs
  }
}`,
    secure: `// Updated and monitored dependencies
{
  "dependencies": {
    "lodash": "^4.17.21",
    "axios": "^1.6.0",
    "express": "^4.18.2"
  },
  "scripts": {
    "audit": "npm audit --omit=dev --audit-level=high"
  }
}`,
    explanation: 'Регулярно обновляйте зависимости и используйте автоматические сканеры уязвимостей.'
  },
  defenses: ['Ведите инвентарь компонентов и версий', 'Постоянно мониторьте уязвимости (Snyk, Dependabot)', 'Используйте компоненты из доверенных источников', 'Удаляйте неиспользуемые зависимости', 'Подписывайтесь на security‑бюллетени стека'],
  realWorldImpact: 'Уязвимость Log4Shell (2021) затронула миллионы приложений на Log4j.',
  attackFlow: ['Атакующий находит уязвимую библиотеку', 'Находит известный эксплойт (CVE)', 'Готовит payload', 'Компрометирует приложение'],
  lifecycleStage: 'Monitor',
  attack: {
    description: 'Компоненты (библиотеки, фреймворки, модули) работают с теми же привилегиями, что и приложение. Уязвимые компоненты подрывают безопасность.',
    flow: ['Атакующий находит уязвимую библиотеку', 'Находит известный эксплойт (CVE)', 'Готовит payload', 'Компрометирует приложение'],
    impact: 'Уязвимость Log4Shell (2021) затронула миллионы приложений на Log4j.'
  },
  defense: {
    strategies: ['Ведите инвентарь компонентов и версий', 'Постоянно мониторьте уязвимости (Snyk, Dependabot)', 'Используйте компоненты из доверенных источников', 'Удаляйте неиспользуемые зависимости', 'Подписывайтесь на security‑бюллетени стека']
  },
  controlIds: ['dependency-monitoring'],
  codeLinks: [{
    title: 'Dependency audit',
    file: 'package.json',
    snippet: `// Updated and monitored dependencies
{
  "dependencies": {
    "lodash": "^4.17.21",
    "axios": "^1.6.0",
    "express": "^4.18.2"
  },
  "scripts": {
    "audit": "npm audit --omit=dev --audit-level=high"
  }
}`
  }]
}, {
  id: 'a07',
  name: 'Authentication Failures',
  shortName: 'Auth Failures',
  description: 'Подтверждение личности, аутентификация и управление сессиями критичны. Ошибки позволяют красть пароли, ключи и токены.',
  tagline: 'Когда личности нельзя доверять',
  icon: KeyRound,
  color: '#06B6D4',
  bgColor: 'rgba(6, 182, 212, 0.1)',
  difficulty: 'Medium',
  riskLevel: 'Critical',
  completionPercentage: 50,
  secureByDesign: ['Prevent', 'Detect', 'Recover'],
  isCompleted: false,
  examples: {
    vulnerable: `// Vulnerable: Weak session management
app.post('/login', (req, res) => {
  if (checkPassword(req.body)) {
    req.session.userId = user.id;
    // Session never expires
    // No protection against fixation
  }
});`,
    secure: `// Secure: Proper session management
app.post('/login', rateLimiter, async (req, res) => {
  if (await verifyPassword(req.body)) {
    req.session.regenerate(() => {
      req.session.userId = user.id;
      req.session.cookie.maxAge = 3600000; // 1 hour
      req.session.cookie.secure = true;
      req.session.cookie.httpOnly = true;
    });
  }
});`,
    explanation: 'Настройте безопасное управление сессиями: истечение, регенерация и secure cookie.'
  },
  defenses: ['Внедрите MFA', 'Используйте безопасные сессии', 'Блокируйте аккаунт после серии неудач', 'Применяйте строгие политики паролей', 'Защищайтесь от credential stuffing'],
  realWorldImpact: 'Credential stuffing ежегодно приносит бизнесу миллиардные потери. Взлом Twitter 2020 использовал social engineering для обхода аутентификации.',
  attackFlow: ['Атакующий получает учётные данные', 'Пробует credential stuffing', 'Обходит слабую аутентификацию', 'Захватывает сессию'],
  lifecycleStage: 'Build',
  attack: {
    description: 'Подтверждение личности, аутентификация и управление сессиями критичны. Ошибки позволяют красть пароли, ключи и токены.',
    flow: ['Атакующий получает учётные данные', 'Пробует credential stuffing', 'Обходит слабую аутентификацию', 'Захватывает сессию'],
    impact: 'Credential stuffing ежегодно приносит бизнесу миллиардные потери. Взлом Twitter 2020 использовал social engineering для обхода аутентификации.'
  },
  defense: {
    strategies: ['Внедрите MFA', 'Используйте безопасные сессии', 'Блокируйте аккаунт после серии неудач', 'Применяйте строгие политики паролей', 'Защищайтесь от credential stuffing']
  },
  controlIds: ['session-hardening', 'rate-limit', 'secure-logging'],
  codeLinks: [{
    title: 'Session regeneration',
    file: 'src/security/session.js',
    snippet: `// Secure: Proper session management
app.post('/login', rateLimiter, async (req, res) => {
  if (await verifyPassword(req.body)) {
    req.session.regenerate(() => {
      req.session.userId = user.id;
      req.session.cookie.maxAge = 3600000;
      req.session.cookie.secure = true;
      req.session.cookie.httpOnly = true;
    });
  }
});`
  }]
}, {
  id: 'a08',
  name: 'Data Integrity Failures',
  shortName: 'Integrity Failures',
  description: 'Ошибки целостности ПО и данных возникают, когда код и инфраструктура не защищают от подмены, включая небезопасную десериализацию.',
  tagline: 'Когда данным нельзя доверять',
  icon: Database,
  color: '#14B8A6',
  bgColor: 'rgba(20, 184, 166, 0.1)',
  difficulty: 'Hard',
  riskLevel: 'High',
  completionPercentage: 20,
  secureByDesign: ['Prevent', 'Detect', 'Recover'],
  isCompleted: false,
  examples: {
    vulnerable: `// Vulnerable: Insecure deserialization
app.post('/api/data', (req, res) => {
  const data = JSON.parse(req.body.serialized);
  // Or worse: eval(req.body.code)
  processData(data);
});`,
    secure: `// Secure: Validated deserialization
app.post('/api/data', (req, res) => {
  const data = JSON.parse(req.body.serialized);
  if (!validateSchema(data, expectedSchema)) {
    return res.status(400).json({ error: 'Invalid data' });
  }
  processData(sanitize(data));
});`,
    explanation: 'Всегда валидируйте и очищайте десериализованные данные. Используйте цифровые подписи для проверки целостности.'
  },
  defenses: ['Используйте цифровые подписи для критичных данных', 'Проверяйте целостность обновлений', 'Защищайте CI/CD', 'Применяйте code signing', 'Аудируйте сторонние интеграции'],
  realWorldImpact: 'Атака SolarWinds (2020) скомпрометировала обновления ПО и затронула более 18 000 организаций.',
  attackFlow: ['Атакующий компрометирует пайплайн обновлений', 'Внедряет вредоносный код', 'Жертвы ставят «доверенное» обновление', 'Разворачивается бэкдор'],
  lifecycleStage: 'Build',
  attack: {
    description: 'Ошибки целостности ПО и данных возникают, когда код и инфраструктура не защищают от подмены, включая небезопасную десериализацию.',
    flow: ['Атакующий компрометирует пайплайн обновлений', 'Внедряет вредоносный код', 'Жертвы ставят «доверенное» обновление', 'Разворачивается бэкдор'],
    impact: 'Атака SolarWinds (2020) скомпрометировала обновления ПО и затронула более 18 000 организаций.'
  },
  defense: {
    strategies: ['Используйте цифровые подписи для критичных данных', 'Проверяйте целостность обновлений', 'Защищайте CI/CD', 'Применяйте code signing', 'Аудируйте сторонние интеграции']
  },
  controlIds: ['integrity-checks', 'input-validation'],
  codeLinks: [{
    title: 'Validated deserialization',
    file: 'src/security/deserialize.js',
    snippet: `// Secure: Validated deserialization
app.post('/api/data', (req, res) => {
  const data = JSON.parse(req.body.serialized);
  if (!validateSchema(data, expectedSchema)) {
    return res.status(400).json({ error: 'Invalid data' });
  }
  processData(sanitize(data));
});`
  }]
}, {
  id: 'a09',
  name: 'Security Logging Failures',
  shortName: 'Logging Failures',
  description: 'Без логирования и мониторинга инциденты не обнаруживаются. Недостаточный контроль позволяет атакующим оставаться незамеченными.',
  tagline: 'Когда атаки остаются незамеченными',
  icon: FileText,
  color: '#22C55E',
  bgColor: 'rgba(34, 197, 94, 0.1)',
  difficulty: 'Easy',
  riskLevel: 'Medium',
  completionPercentage: 40,
  secureByDesign: ['Detect', 'Respond'],
  isCompleted: false,
  examples: {
    vulnerable: `// Vulnerable: No security logging
app.post('/login', (req, res) => {
  if (!authenticate(req.body)) {
    res.status(401).json({ error: 'Invalid' });
    // Failed attempt not logged!
  }
});`,
    secure: `// Secure: Comprehensive logging
app.post('/login', (req, res) => {
  const result = authenticate(req.body);
  securityLogger.log({
    event: result ? 'LOGIN_SUCCESS' : 'LOGIN_FAILURE',
    user: req.body.email,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    timestamp: new Date().toISOString()
  });
  if (!result) {
    alertOnThreshold(req.body.email, req.ip);
  }
});`,
    explanation: 'Логируйте все события безопасности и настраивайте алерты на подозрительные паттерны.'
  },
  defenses: ['Логируйте аутентификацию и доступ', 'Защитите логи от подмены', 'Включите real-time alerting', 'Опишите процедуры реагирования', 'Регулярно анализируйте логи'],
  realWorldImpact: 'Среднее время обнаружения инцидента — 287 дней. Хорошее логирование снижает его до часов.',
  attackFlow: ['Атакующий исследует систему', 'Активность не логируется', 'Атака проходит незаметно', 'Нарушение длится месяцами'],
  lifecycleStage: 'Monitor',
  attack: {
    description: 'Без логирования и мониторинга инциденты не обнаруживаются. Недостаточный контроль позволяет атакующим оставаться незамеченными.',
    flow: ['Атакующий исследует систему', 'Активность не логируется', 'Атака проходит незаметно', 'Нарушение длится месяцами'],
    impact: 'Среднее время обнаружения инцидента — 287 дней. Хорошее логирование снижает его до часов.'
  },
  defense: {
    strategies: ['Логируйте аутентификацию и доступ', 'Защитите логи от подмены', 'Включите real-time alerting', 'Опишите процедуры реагирования', 'Регулярно анализируйте логи']
  },
  controlIds: ['secure-logging'],
  codeLinks: [{
    title: 'Security logging',
    file: 'src/security/logging.js',
    snippet: `// Secure: Comprehensive logging
app.post('/login', (req, res) => {
  const result = authenticate(req.body);
  securityLogger.log({
    event: result ? 'LOGIN_SUCCESS' : 'LOGIN_FAILURE',
    user: req.body.email,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    timestamp: new Date().toISOString()
  });
});`
  }]
}, {
  id: 'a10',
  name: 'Server-Side Request Forgery',
  shortName: 'SSRF',
  description: 'SSRF возникает, когда приложение запрашивает ресурс без проверки пользовательского URL, позволяя атакующим обращаться к внутренним сервисам.',
  tagline: 'Когда серверы делают плохие запросы',
  icon: Server,
  color: '#EC4899',
  bgColor: 'rgba(236, 72, 153, 0.1)',
  difficulty: 'Hard',
  riskLevel: 'High',
  completionPercentage: 15,
  secureByDesign: ['Prevent', 'Detect'],
  isCompleted: false,
  examples: {
    vulnerable: `// Vulnerable: Unvalidated URL fetch
app.get('/fetch', async (req, res) => {
  const response = await fetch(req.query.url);
  // Attacker: ?url=http://169.254.169.254/metadata
  res.json(await response.json());
});`,
    secure: `// Secure: URL validation and allowlist
const ALLOWED_DOMAINS = ['api.trusted.com', 'cdn.trusted.com'];

app.get('/fetch', async (req, res) => {
  const url = new URL(req.query.url);
  if (!ALLOWED_DOMAINS.includes(url.hostname)) {
    return res.status(403).json({ error: 'Domain not allowed' });
  }
  if (url.hostname.match(/^(localhost|127\\.|10\\.|192\\.168\\.|172\\.(1[6-9]|2|3[01]))/)) {
    return res.status(403).json({ error: 'Internal addresses blocked' });
  }
  const response = await fetch(url.toString());
  res.json(await response.json());
});`,
    explanation: 'Всегда валидируйте URL. Используйте allowlist и блокируйте внутренние диапазоны.'
  },
  defenses: ['Валидируйте все пользовательские URL', 'Используйте allowlist доменов', 'Блокируйте запросы к внутренним IP', 'Отключайте ненужные схемы (file://, gopher://)', 'Используйте network segmentation'],
  realWorldImpact: 'Инцидент Capital One 2019 года использовал SSRF для доступа к AWS metadata и кражи 100 млн записей.',
  attackFlow: ['Атакующий находит параметр URL', 'Формирует запрос к внутреннему адресу', 'Сервер делает запрос во внутреннюю сеть', 'Раскрываются чувствительные данные'],
  lifecycleStage: 'Build',
  attack: {
    description: 'SSRF возникает, когда приложение запрашивает ресурс без проверки пользовательского URL, позволяя атакующим обращаться к внутренним сервисам.',
    flow: ['Атакующий находит параметр URL', 'Формирует запрос к внутреннему адресу', 'Сервер делает запрос во внутреннюю сеть', 'Раскрываются чувствительные данные'],
    impact: 'Инцидент Capital One 2019 года использовал SSRF для доступа к AWS metadata и кражи 100 млн записей.'
  },
  defense: {
    strategies: ['Валидируйте все пользовательские URL', 'Используйте allowlist доменов', 'Блокируйте запросы к внутренним IP', 'Отключайте ненужные схемы (file://, gopher://)', 'Используйте network segmentation']
  },
  controlIds: ['input-validation', 'network-segmentation'],
  codeLinks: [{
    title: 'URL allowlist',
    file: 'src/security/ssrf.js',
    snippet: `// Secure: URL validation and allowlist
const ALLOWED_DOMAINS = ['api.trusted.com', 'cdn.trusted.com'];

app.get('/fetch', async (req, res) => {
  const url = new URL(req.query.url);
  if (!ALLOWED_DOMAINS.includes(url.hostname)) {
    return res.status(403).json({ error: 'Domain not allowed' });
  }
  if (url.hostname.match(/^(localhost|127\\.|10\\.|192\\.168\\.|172\\.(1[6-9]|2|3[01]))/)) {
    return res.status(403).json({ error: 'Internal addresses blocked' });
  }
  const response = await fetch(url.toString());
  res.json(await response.json());
});`
  }]
}];
export const achievements = [{
  id: 'explorer',
  name: 'Explorer',
  description: 'View 3 different security modules',
  icon: '🔍',
  isUnlocked: true,
  requirement: 3,
  type: 'modules_viewed'
}, {
  id: 'defender',
  name: 'Defender',
  description: 'Complete 5 security modules',
  icon: '🛡️',
  isUnlocked: false,
  requirement: 5,
  type: 'modules_completed'
}, {
  id: 'expert',
  name: 'Security Expert',
  description: 'Complete 8 security modules',
  icon: '⚡',
  isUnlocked: false,
  requirement: 8,
  type: 'modules_completed'
}, {
  id: 'master',
  name: 'OWASP Master',
  description: 'Complete all 10 security modules',
  icon: '👑',
  isUnlocked: false,
  requirement: 10,
  type: 'modules_completed'
}, {
  id: 'streak3',
  name: 'Consistent Learner',
  description: '3-day learning streak',
  icon: '🔥',
  isUnlocked: true,
  requirement: 3,
  type: 'streak'
}, {
  id: 'streak7',
  name: 'Dedicated Student',
  description: '7-day learning streak',
  icon: '💪',
  isUnlocked: false,
  requirement: 7,
  type: 'streak'
}];
export const userProgress = {
  modulesViewed: 6,
  modulesCompleted: 1,
  currentStreak: 3,
  totalTimeSpent: 245,
  // minutes
  lastActive: new Date().toISOString()
};
