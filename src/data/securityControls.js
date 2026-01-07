export const securityControls = [
  {
    id: 'rbac',
    name: 'RBAC',
    description: 'Role-Based Access Control с явными политиками доступа.',
    codeSnippet: `authorize('admin')`
  },
  {
    id: 'rate-limit',
    name: 'Rate Limiting',
    description: 'Ограничение частоты запросов для защиты критичных эндпоинтов.',
    codeSnippet: `rateLimiter({ max: 3, window: '1h' })`
  },
  {
    id: 'input-validation',
    name: 'Input Validation',
    description: 'Валидация и очистка входных данных на всех уровнях.',
    codeSnippet: `validateSchema(data, expectedSchema)`
  },
  {
    id: 'secure-logging',
    name: 'Security Logging',
    description: 'Логирование событий безопасности с алертингом.',
    codeSnippet: `securityLogger.log({ event: 'LOGIN_FAILURE' })`
  },
  {
    id: 'crypto',
    name: 'Crypto Hygiene',
    description: 'Современные алгоритмы шифрования и хранение ключей.',
    codeSnippet: `await bcrypt.hash(password, 12)`
  },
  {
    id: 'secure-config',
    name: 'Secure Configuration',
    description: 'Жёсткие настройки окружения и защитные заголовки.',
    codeSnippet: `app.use(helmet())`
  },
  {
    id: 'dependency-monitoring',
    name: 'Dependency Monitoring',
    description: 'Контроль уязвимостей в зависимостях и регулярные апдейты.',
    codeSnippet: `npm audit --production`
  },
  {
    id: 'session-hardening',
    name: 'Session Hardening',
    description: 'Безопасные сессии с регенерацией и secure cookie.',
    codeSnippet: `req.session.regenerate(() => {})`
  },
  {
    id: 'network-segmentation',
    name: 'Network Segmentation',
    description: 'Сегментация сети и запрет внутренних запросов.',
    codeSnippet: `if (isInternalIp(url.hostname)) return res.status(403)`
  },
  {
    id: 'integrity-checks',
    name: 'Integrity Checks',
    description: 'Проверка целостности обновлений и подписей.',
    codeSnippet: `verifySignature(payload, signature)`
  }
];
