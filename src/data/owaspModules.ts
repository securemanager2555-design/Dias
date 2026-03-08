import { ShieldX, LockKeyhole, Code2, FileWarning, SlidersHorizontal, Package, KeyRound, Database, FileText, Server } from 'lucide-react';
export type OwaspModule = {
  id: string;
  name: string;
  shortName: string;
  description: string;
  tagline: string;
  icon: typeof ShieldX;
  color: string;
  bgColor: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  riskLevel: 'Critical' | 'High' | 'Medium';
  completionPercentage: number;
  isCompleted: boolean;
  examples: {
    vulnerable: string;
    secure: string;
    explanation: string;
  };
  defenses: string[];
  realWorldImpact: string;
  attackFlow: string[];
};
export type Achievement = {
  id: string;
  name: string;
  description: string;
  icon: string;
  isUnlocked: boolean;
  requirement: number;
  type: 'modules_viewed' | 'modules_completed' | 'streak';
};
export const owaspModules: OwaspModule[] = [{
  id: 'a01',
  name: 'Broken Access Control',
  shortName: 'Access Control',
  description: 'Access control enforces policy such that users cannot act outside of their intended permissions. Failures typically lead to unauthorized information disclosure, modification, or destruction of data.',
  tagline: "When users can do what they shouldn't",
  icon: ShieldX,
  color: '#EF4444',
  bgColor: 'rgba(239, 68, 68, 0.1)',
  difficulty: 'Medium',
  riskLevel: 'Critical',
  completionPercentage: 75,
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
    explanation: 'Always verify that the authenticated user has permission to access the requested resource.'
  },
  defenses: ['Implement proper access control checks on every request', 'Deny by default - require explicit grants', 'Use role-based access control (RBAC)', 'Log access control failures and alert admins', 'Rate limit API access to minimize automated attacks'],
  realWorldImpact: 'In 2019, a major bank exposed 100M customer records due to misconfigured access controls on their cloud storage.',
  attackFlow: ['Attacker identifies endpoint', 'Modifies user ID parameter', 'Bypasses authorization', 'Accesses unauthorized data']
}, {
  id: 'a02',
  name: 'Cryptographic Failures',
  shortName: 'Crypto Failures',
  description: 'Previously known as Sensitive Data Exposure, this focuses on failures related to cryptography which often leads to sensitive data exposure or system compromise.',
  tagline: "When secrets aren't kept secret",
  icon: LockKeyhole,
  color: '#F97316',
  bgColor: 'rgba(249, 115, 22, 0.1)',
  difficulty: 'Hard',
  riskLevel: 'Critical',
  completionPercentage: 30,
  isCompleted: false,
  examples: {
    vulnerable: `// Vulnerable: Weak hashing
const passwordHash = md5(password);
db.saveUser({ email, passwordHash });`,
    secure: `// Secure: Strong hashing with salt
const saltRounds = 12;
const passwordHash = await bcrypt.hash(password, saltRounds);
db.saveUser({ email, passwordHash });`,
    explanation: 'Use modern, battle-tested cryptographic algorithms. MD5 and SHA1 are broken for password hashing.'
  },
  defenses: ['Use strong, up-to-date encryption algorithms (AES-256, RSA-2048+)', 'Hash passwords with bcrypt, scrypt, or Argon2', 'Encrypt sensitive data at rest and in transit', 'Properly manage cryptographic keys', 'Disable caching for sensitive data responses'],
  realWorldImpact: 'The 2013 Adobe breach exposed 153M user records with weak encryption, leading to mass password cracking.',
  attackFlow: ['Attacker intercepts data', 'Identifies weak encryption', 'Cracks or decrypts data', 'Exposes sensitive information']
}, {
  id: 'a03',
  name: 'Injection',
  shortName: 'Injection',
  description: 'Injection flaws occur when untrusted data is sent to an interpreter as part of a command or query. SQL, NoSQL, OS, and LDAP injection are common attack vectors.',
  tagline: 'When input becomes code',
  icon: Code2,
  color: '#EAB308',
  bgColor: 'rgba(234, 179, 8, 0.1)',
  difficulty: 'Medium',
  riskLevel: 'Critical',
  completionPercentage: 100,
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
    explanation: 'Never concatenate user input into queries. Always use parameterized queries or prepared statements.'
  },
  defenses: ['Use parameterized queries / prepared statements', 'Validate and sanitize all user inputs', 'Use ORM frameworks that handle escaping', 'Apply least privilege to database accounts', 'Implement Web Application Firewall (WAF)'],
  realWorldImpact: 'SQL injection has been responsible for countless breaches, including the 2017 Equifax breach affecting 147M people.',
  attackFlow: ['Attacker crafts malicious input', 'Input interpreted as code', 'Database executes attack', 'Data exfiltrated or modified']
}, {
  id: 'a04',
  name: 'Insecure Design',
  shortName: 'Insecure Design',
  description: 'A new category focusing on risks related to design flaws. Insecure design cannot be fixed by a perfect implementation - security must be built in from the start.',
  tagline: 'When security is an afterthought',
  icon: FileWarning,
  color: '#F59E0B',
  bgColor: 'rgba(245, 158, 11, 0.1)',
  difficulty: 'Hard',
  riskLevel: 'High',
  completionPercentage: 45,
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
    explanation: 'Design with security in mind. Consider abuse cases and implement controls from the architecture phase.'
  },
  defenses: ['Integrate security into the SDLC from the start', 'Use threat modeling during design phase', 'Implement defense in depth', 'Design for failure - assume breaches will happen', 'Regular security architecture reviews'],
  realWorldImpact: 'Many breaches stem from fundamental design flaws that no amount of patching can fix.',
  attackFlow: ['Attacker analyzes system design', 'Identifies architectural weakness', 'Exploits design flaw', 'Achieves unauthorized access']
}, {
  id: 'a05',
  name: 'Security Misconfiguration',
  shortName: 'Misconfiguration',
  description: 'Security misconfiguration is the most common issue. This includes insecure default configurations, incomplete configurations, and verbose error messages.',
  tagline: "When defaults aren't secure",
  icon: SlidersHorizontal,
  color: '#A855F7',
  bgColor: 'rgba(168, 85, 247, 0.1)',
  difficulty: 'Easy',
  riskLevel: 'High',
  completionPercentage: 60,
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
    explanation: 'Always review and harden configurations before deployment. Never use defaults in production.'
  },
  defenses: ['Implement hardened, repeatable deployment processes', 'Remove unused features and frameworks', 'Review and update configurations regularly', 'Use security headers (CSP, HSTS, X-Frame-Options)', 'Automated configuration scanning'],
  realWorldImpact: 'The 2019 Capital One breach was caused by a misconfigured WAF, exposing 100M customer records.',
  attackFlow: ['Attacker scans for misconfigurations', 'Finds exposed service/debug info', 'Exploits weak settings', 'Gains system access']
}, {
  id: 'a06',
  name: 'Vulnerable Components',
  shortName: 'Vulnerable Deps',
  description: 'Components such as libraries, frameworks, and software modules run with the same privileges as the application. Vulnerable components can undermine application security.',
  tagline: 'When dependencies become liabilities',
  icon: Package,
  color: '#3B82F6',
  bgColor: 'rgba(59, 130, 246, 0.1)',
  difficulty: 'Easy',
  riskLevel: 'High',
  completionPercentage: 85,
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
    "audit": "npm audit --production"
  }
}`,
    explanation: 'Regularly update dependencies and use automated tools to scan for known vulnerabilities.'
  },
  defenses: ['Maintain an inventory of all components and versions', 'Continuously monitor for vulnerabilities (Snyk, Dependabot)', 'Only use components from trusted sources', 'Remove unused dependencies', 'Subscribe to security bulletins for your stack'],
  realWorldImpact: 'The Log4Shell vulnerability (2021) affected millions of applications using the Log4j library.',
  attackFlow: ['Attacker identifies vulnerable library', 'Finds known exploit (CVE)', 'Crafts attack payload', 'Compromises application']
}, {
  id: 'a07',
  name: 'Authentication Failures',
  shortName: 'Auth Failures',
  description: 'Confirmation of user identity, authentication, and session management is critical. Weaknesses allow attackers to compromise passwords, keys, or session tokens.',
  tagline: "When identity can't be trusted",
  icon: KeyRound,
  color: '#06B6D4',
  bgColor: 'rgba(6, 182, 212, 0.1)',
  difficulty: 'Medium',
  riskLevel: 'Critical',
  completionPercentage: 50,
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
    explanation: 'Implement secure session management with proper expiration, regeneration, and cookie flags.'
  },
  defenses: ['Implement multi-factor authentication (MFA)', 'Use secure session management', 'Implement account lockout after failed attempts', 'Use secure password policies', 'Protect against credential stuffing'],
  realWorldImpact: 'Credential stuffing attacks cost businesses billions annually. The 2020 Twitter hack used social engineering to bypass authentication.',
  attackFlow: ['Attacker obtains credentials', 'Attempts credential stuffing', 'Bypasses weak auth', 'Hijacks user session']
}, {
  id: 'a08',
  name: 'Data Integrity Failures',
  shortName: 'Integrity Failures',
  description: 'Software and data integrity failures relate to code and infrastructure that does not protect against integrity violations, including insecure deserialization.',
  tagline: "When data can't be trusted",
  icon: Database,
  color: '#14B8A6',
  bgColor: 'rgba(20, 184, 166, 0.1)',
  difficulty: 'Hard',
  riskLevel: 'High',
  completionPercentage: 20,
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
    explanation: 'Always validate and sanitize deserialized data. Use digital signatures to verify integrity.'
  },
  defenses: ['Use digital signatures for critical data', 'Verify integrity of software updates', 'Use secure CI/CD pipelines', 'Implement code signing', 'Review and audit third-party integrations'],
  realWorldImpact: 'The SolarWinds attack (2020) compromised software updates, affecting 18,000+ organizations including government agencies.',
  attackFlow: ['Attacker compromises update pipeline', 'Injects malicious code', 'Victims install "trusted" update', 'Backdoor deployed']
}, {
  id: 'a09',
  name: 'Security Logging Failures',
  shortName: 'Logging Failures',
  description: 'Without logging and monitoring, breaches cannot be detected. Insufficient logging, detection, monitoring, and active response allows attackers to persist.',
  tagline: 'When attacks go unnoticed',
  icon: FileText,
  color: '#22C55E',
  bgColor: 'rgba(34, 197, 94, 0.1)',
  difficulty: 'Easy',
  riskLevel: 'Medium',
  completionPercentage: 40,
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
    explanation: 'Log all security-relevant events and implement alerting for suspicious patterns.'
  },
  defenses: ['Log all authentication and access control events', 'Ensure logs are tamper-proof', 'Implement real-time alerting', 'Create incident response procedures', 'Regular log review and analysis'],
  realWorldImpact: 'The average time to detect a breach is 287 days. Proper logging can reduce this to hours.',
  attackFlow: ['Attacker probes system', 'No logging captures activity', 'Attack succeeds undetected', 'Breach persists for months']
}, {
  id: 'a10',
  name: 'Server-Side Request Forgery',
  shortName: 'SSRF',
  description: 'SSRF flaws occur when a web application fetches a remote resource without validating the user-supplied URL, allowing attackers to access internal services.',
  tagline: 'When servers make bad requests',
  icon: Server,
  color: '#EC4899',
  bgColor: 'rgba(236, 72, 153, 0.1)',
  difficulty: 'Hard',
  riskLevel: 'High',
  completionPercentage: 15,
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
    explanation: 'Always validate and sanitize URLs. Use allowlists and block internal IP ranges.'
  },
  defenses: ['Validate and sanitize all user-supplied URLs', 'Use allowlists for permitted domains', 'Block requests to internal IP ranges', 'Disable unnecessary URL schemes (file://, gopher://)', 'Implement network segmentation'],
  realWorldImpact: 'The 2019 Capital One breach used SSRF to access AWS metadata and steal 100M customer records.',
  attackFlow: ['Attacker identifies URL parameter', 'Crafts internal URL request', 'Server fetches internal resource', 'Sensitive data exposed']
}];
export const achievements: Achievement[] = [{
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