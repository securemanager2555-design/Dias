export const securityControls = [
  {
    id: 'rbac',
    name: 'RBAC',
    description: 'Ролевая модель доступа ограничивает действия пользователей по ролям и правам.',
    codeSnippet: `const requireAdmin = (req, res, next) => {
  if (!isAdmin(req.auth)) return res.status(403).json({ error: 'forbidden' });
  return next();
};`,
  },
  {
    id: 'rate-limit',
    name: 'Rate Limiting',
    description: 'Ограничение частоты запросов снижает риск brute-force и злоупотреблений.',
    codeSnippet: `const loginLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  keyFn: req => \`login:\${req.ip}:\${normalizeEmail(req.body?.email) || 'unknown'}\`
});`,
  },
  {
    id: 'input-validation',
    name: 'Input Validation',
    description: 'Санитизация и нормализация входа предотвращают вредоносные payload.',
    codeSnippet: `const sanitizeText = (value, maxLength) => {
  if (typeof value !== 'string') return '';
  return value.replace(/[\\u0000-\\u001f\\u007f]/g, ' ').trim().slice(0, maxLength);
};`,
  },
  {
    id: 'secure-logging',
    name: 'Security Logging',
    description: 'Централизованный аудит позволяет быстро выявлять и расследовать инциденты.',
    codeSnippet: `void writeAuditLog(req, 'auth_login_failed', { email, reason: 'invalid_password' });`,
  },
  {
    id: 'crypto',
    name: 'Crypto Hygiene',
    description: 'Пароли и токены должны храниться только в виде стойких хешей.',
    codeSnippet: `const passwordHash = await bcrypt.hash(password, 12);
const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');`,
  },
  {
    id: 'secure-config',
    name: 'Secure Configuration',
    description: 'Безопасные заголовки и выключенные лишние возможности уменьшают поверхность атаки.',
    codeSnippet: `app.disable('x-powered-by');
res.setHeader('X-Frame-Options', 'DENY');
res.setHeader('X-Content-Type-Options', 'nosniff');`,
  },
  {
    id: 'dependency-monitoring',
    name: 'Dependency Monitoring',
    description: 'Контроль зависимостей и регулярный аудит снижают риск известных CVE.',
    codeSnippet: `npm audit --omit=dev`,
  },
  {
    id: 'session-hardening',
    name: 'Session Hardening',
    description: 'Ротация и отзыв refresh-токенов защищают от повторного использования украденной сессии.',
    codeSnippet: `await prisma.refreshToken.update({
  where: { id: stored.id },
  data: { revokedAt: new Date() }
});`,
  },
  {
    id: 'network-segmentation',
    name: 'Network Segmentation',
    description: 'Ограничение доступа к внутренним ресурсам и проверка URL снижают риск SSRF.',
    codeSnippet: `const parsed = new URL(trimmed);
if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return null;`,
  },
  {
    id: 'integrity-checks',
    name: 'Integrity Checks',
    description: 'Ограничение формата и размера входных данных помогает сохранять целостность обработки.',
    codeSnippet: `app.use(express.json({ limit: '100kb' }));`,
  },
];
