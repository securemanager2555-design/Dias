require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { prisma } = require("./prisma");

let nodemailer = null;
try {
  nodemailer = require("nodemailer");
} catch {
  nodemailer = null;
}

const app = express();
const port = process.env.PORT || 4000;
const jwtSecret = process.env.JWT_SECRET || "dias";
const jwtIssuer = process.env.JWT_ISSUER || "owasp-lab";
const jwtAudience = process.env.JWT_AUDIENCE || "owasp-lab-client";
const accessTokenTtlMinutes = Number(process.env.ACCESS_TOKEN_TTL_MINUTES || 15);
const refreshTokenTtlDays = Number(process.env.REFRESH_TOKEN_TTL_DAYS || 30);
const loginCodeTtlMinutes = Number(process.env.LOGIN_CODE_TTL_MINUTES || 10);
const isProduction = process.env.NODE_ENV === "production";
const adminMfaSecret = process.env.ADMIN_MFA_SECRET || "dias";
const lockoutThreshold = Number(process.env.LOGIN_LOCKOUT_THRESHOLD || 5);
const lockoutMinutes = Number(process.env.LOGIN_LOCKOUT_MINUTES || 15);
const smtpService = (process.env.SMTP_SERVICE || "gmail").trim().toLowerCase();
const smtpHost =
  process.env.SMTP_HOST || (smtpService === "gmail" ? "smtp.gmail.com" : "");
const smtpPort = Number(process.env.SMTP_PORT || (smtpService === "gmail" ? 465 : 587));
const smtpSecure = String(process.env.SMTP_SECURE || (smtpService === "gmail" ? "true" : "false")).toLowerCase() === "true";
const smtpUser = process.env.SMTP_USER || process.env.GMAIL_USER || "";
const smtpPass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || "";
const smtpFrom = process.env.SMTP_FROM || smtpUser || "no-reply@secure-by-design.local";
const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173")
  .split(",")
  .map(origin => origin.trim())
  .filter(Boolean);

const isWeakJwtSecret = value => {
  if (typeof value !== "string" || value.length < 32) {
    return true;
  }
  return /^(change_me|secret|jwt|password|123456|qwerty)$/i.test(value.trim());
};

if (isWeakJwtSecret(jwtSecret)) {
  if (isProduction) {
    throw new Error("JWT_SECRET is weak. Use a strong secret with length >= 32.");
  }
  console.warn("Security warning: weak JWT_SECRET for local development.");
}

if (isProduction && !process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be configured in production.");
}

if (isProduction && process.env.DATABASE_URL) {
  try {
    const parsedDbUrl = new URL(process.env.DATABASE_URL);
    const weakUser = /^(sa|admin|root|postgres)$/i.test(parsedDbUrl.username || "");
    const weakPass = /^(sa|admin|root|postgres|password|123456|qwerty)$/i.test(
      decodeURIComponent(parsedDbUrl.password || "")
    );
    if (weakUser || weakPass) {
      throw new Error("DATABASE_URL uses weak default credentials.");
    }
  } catch (error) {
    throw new Error(`Invalid DATABASE_URL configuration: ${error.message}`);
  }
}

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json({ limit: "100kb" }));
app.disable("x-powered-by");

app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; base-uri 'self'; frame-ancestors 'none'; object-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self'"
  );
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Cross-Origin-Resource-Policy", "same-site");
  if (isProduction) {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
  next();
});

const unsafeMethods = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const traversalPattern = /(?:\.\.|%2e%2e|%252e%252e)/i;

app.use((req, res, next) => {
  if (traversalPattern.test(req.originalUrl || "")) {
    void writeAuditLog(req, "request_blocked_path_traversal", { url: req.originalUrl });
    return res.status(400).json({ error: "invalid_path" });
  }
  return next();
});

app.use((req, res, next) => {
  if (!req.path.startsWith("/api/") || !unsafeMethods.has(req.method)) {
    return next();
  }
  const origin = req.get("origin");
  const fetchSite = req.get("sec-fetch-site");
  if (origin && !allowedOrigins.includes(origin)) {
    void writeAuditLog(req, "request_blocked_csrf_origin", { origin });
    return res.status(403).json({ error: "csrf_blocked_origin" });
  }
  if (fetchSite === "cross-site") {
    void writeAuditLog(req, "request_blocked_csrf_site", { fetchSite });
    return res.status(403).json({ error: "csrf_blocked_site" });
  }
  return next();
});

if (isProduction) {
  app.use((req, res, next) => {
    const proto = req.get("x-forwarded-proto");
    if (proto && proto !== "https") {
      void writeAuditLog(req, "request_blocked_insecure_transport", { proto });
      return res.status(400).json({ error: "https_required" });
    }
    return next();
  });
}

const sanitizeUser = user => ({
  id: user.id,
  email: user.email,
  role: user.role,
  displayName: user.displayName,
  bio: user.bio,
  avatarUrl: user.avatarUrl,
  createdAt: user.createdAt,
});

const sanitizeText = (value, maxLength) => {
  if (typeof value !== "string") return "";
  return value
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
};

const signAccessToken = user =>
  jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    jwtSecret,
    {
      expiresIn: `${accessTokenTtlMinutes}m`,
      algorithm: "HS256",
      issuer: jwtIssuer,
      audience: jwtAudience,
      jwtid: crypto.randomUUID(),
    }
  );

const generateRefreshToken = () => crypto.randomBytes(48).toString("hex");
const hashToken = token =>
  crypto.createHash("sha256").update(token).digest("hex");

const isAdmin = auth => auth?.role === "admin";

const normalizeLogText = value =>
  typeof value === "string"
    ? value.replace(/[\u0000-\u001f\u007f]/g, " ").slice(0, 160)
    : "";

const setNoStore = res => {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Pragma", "no-cache");
};

const passwordResetStore = new Map();
const loginFailureStore = new Map();
const pendingLoginStore = new Map();
const securityAlertStore = new Map();
let auditChainHead = "genesis";
let emailTransporterPromise = null;

const checkLoginLock = email => {
  const record = loginFailureStore.get(email);
  if (!record) return null;
  if (record.lockedUntil && record.lockedUntil > Date.now()) {
    return record.lockedUntil;
  }
  if (record.lockedUntil && record.lockedUntil <= Date.now()) {
    loginFailureStore.delete(email);
  }
  return null;
};

const registerFailedLogin = email => {
  const now = Date.now();
  const existing = loginFailureStore.get(email) || { count: 0, lockedUntil: 0 };
  const nextState = {
    count: existing.count + 1,
    lockedUntil: existing.lockedUntil,
  };
  if (nextState.count >= lockoutThreshold) {
    nextState.lockedUntil = now + lockoutMinutes * 60 * 1000;
    nextState.count = 0;
  }
  loginFailureStore.set(email, nextState);
  return nextState.lockedUntil || null;
};

const clearFailedLogin = email => {
  loginFailureStore.delete(email);
};

const generateEmailCode = () =>
  String(crypto.randomInt(0, 1000000)).padStart(6, "0");

const getEmailTransporter = async () => {
  if (!smtpHost || !smtpUser || !smtpPass || !nodemailer) {
    return null;
  }
  if (!emailTransporterPromise) {
    const transportConfig =
      smtpService === "gmail"
        ? {
            service: "gmail",
            auth: { user: smtpUser, pass: smtpPass },
          }
        : {
            host: smtpHost,
            port: smtpPort,
            secure: smtpSecure,
            auth: { user: smtpUser, pass: smtpPass },
          };
    emailTransporterPromise = Promise.resolve(
      nodemailer.createTransport(transportConfig)
    );
  }
  return emailTransporterPromise;
};

const sendLoginCodeEmail = async ({ email, code }) => {
  const transporter = await getEmailTransporter();
  if (!transporter) {
    console.info(`[DEV] Login code for ${email}: ${code}`);
    return false;
  }
  await transporter.sendMail({
    from: smtpFrom,
    to: email,
    subject: "Код подтверждения входа в Secure by Design",
    text: `Ваш код подтверждения: ${code}. Код действует ${loginCodeTtlMinutes} минут.`,
    html: `<p>Ваш код подтверждения: <strong>${code}</strong>.</p><p>Код действует ${loginCodeTtlMinutes} минут.</p>`,
  });
  return true;
};

const createPendingLogin = async ({ user, email }) => {
  const challengeId = crypto.randomUUID();
  const code = generateEmailCode();
  const codeHash = hashToken(code);
  const expiresAt = Date.now() + loginCodeTtlMinutes * 60 * 1000;
  pendingLoginStore.set(challengeId, {
    userId: user.id,
    email,
    codeHash,
    expiresAt,
    attemptsLeft: 5,
  });
  const emailSent = await sendLoginCodeEmail({ email, code });
  return {
    challengeId,
    expiresAt: new Date(expiresAt).toISOString(),
    emailSent,
    demoCode: !isProduction && !emailSent ? code : undefined,
  };
};

const buildTotpCode = (secret, timestampMs) => {
  const timeStep = Math.floor(timestampMs / 1000 / 30);
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(timeStep));
  const hmac = crypto.createHmac("sha1", secret).update(counter).digest();
  const offset = hmac[hmac.length - 1] & 0xf;
  const binary =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);
  return String(binary % 1000000).padStart(6, "0");
};

const verifyAdminMfaCode = value => {
  if (!adminMfaSecret) return true;
  if (typeof value !== "string" || !/^\d{6}$/.test(value.trim())) {
    return false;
  }
  const candidate = value.trim();
  const now = Date.now();
  const windows = [-30000, 0, 30000];
  return windows.some(offset => buildTotpCode(adminMfaSecret, now + offset) === candidate);
};

const requireAdminMfa = (req, res, next) => {
  if (!isAdmin(req.auth)) {
    return next();
  }
  if (verifyAdminMfaCode(req.get("x-admin-mfa"))) {
    return next();
  }
  void writeAuditLog(req, "admin_mfa_failed", {});
  return res.status(403).json({ error: "mfa_required" });
};

const requireAdmin = (req, res, next) => {
  if (!isAdmin(req.auth)) {
    return res.status(403).json({ error: "forbidden" });
  }
  return next();
};

const issueTokens = async (user, req) => {
  const refreshToken = generateRefreshToken();
  const tokenHash = hashToken(refreshToken);
  const expiresAt = new Date(
    Date.now() + refreshTokenTtlDays * 24 * 60 * 60 * 1000
  );

  await prisma.refreshToken.create({
    data: {
      tokenHash,
      userId: user.id,
      expiresAt,
      userAgent: req.get("user-agent"),
      ip: req.ip,
    },
  });

  return {
    accessToken: signAccessToken(user),
    refreshToken,
  };
};

const authRequired = (req, res, next) => {
  const header = req.headers.authorization || "";
  const [type, token] = header.split(" ");
  if (type !== "Bearer" || !token) {
    void writeAuditLog(req, "auth_missing_token", {});
    return res.status(401).json({ error: "unauthorized" });
  }
  try {
    const payload = jwt.verify(token, jwtSecret, {
      algorithms: ["HS256"],
      issuer: jwtIssuer,
      audience: jwtAudience,
    });
    req.auth = payload;
    return next();
  } catch (error) {
    void writeAuditLog(req, "auth_invalid_token", {});
    return res.status(401).json({ error: "invalid_token" });
  }
};

const requireNoteAccess = (note, auth) =>
  note.userId === auth.sub || isAdmin(auth);

const normalizeEmail = value =>
  typeof value === "string" ? value.trim().toLowerCase() : "";

const validateEmail = value =>
  typeof value === "string" &&
  value.length <= 255 &&
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const validatePasswordPolicy = value =>
  typeof value === "string" &&
  value.length >= 10 &&
  value.length <= 128 &&
  /[a-z]/i.test(value) &&
  /\d/.test(value);

const validatePasswordInput = value =>
  typeof value === "string" && value.length >= 8 && value.length <= 128;

const validateAvatarUrl = value => {
  if (typeof value !== "string" || value.length > 500) {
    return null;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return null;
    }
    return trimmed;
  } catch {
    return null;
  }
};

const sanitizeAuditMeta = value => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }
  const masked = {};
  const secretKeyPattern = /(password|token|secret|authorization|cookie)/i;
  for (const [key, raw] of Object.entries(value)) {
    const safeKey = normalizeLogText(key);
    if (secretKeyPattern.test(safeKey)) {
      masked[safeKey] = "[redacted]";
      continue;
    }
    if (typeof raw === "string") {
      masked[safeKey] = normalizeLogText(raw).slice(0, 300);
    } else {
      masked[safeKey] = raw;
    }
  }
  return masked;
};

const writeAuditLog = async (req, action, meta = {}) => {
  try {
    const safeAction = normalizeLogText(action) || "unknown_action";
    const safeMeta = sanitizeAuditMeta(meta);
    const chainHash = crypto
      .createHash("sha256")
      .update(
        JSON.stringify({
          prev: auditChainHead,
          action: safeAction,
          ip: req.ip || "",
          meta: safeMeta,
          at: Date.now(),
        })
      )
      .digest("hex");

    await prisma.auditLog.create({
      data: {
        userId: req.auth?.sub || null,
        action: safeAction,
        ip: req.ip,
        userAgent: req.get("user-agent"),
        meta: {
          ...safeMeta,
          _chainPrev: auditChainHead,
          _chainHash: chainHash,
        },
      },
    });
    auditChainHead = chainHash;
  } catch {
    // Logging must never break request flow.
  }
};

const tryRaiseSecurityAlert = (req, key, payload) => {
  const now = Date.now();
  const previous = securityAlertStore.get(key) || 0;
  if (now - previous < 5 * 60 * 1000) {
    return;
  }
  securityAlertStore.set(key, now);
  void writeAuditLog(req, "security_alert", payload);
};

const rateLimitStore = new Map();
const createRateLimiter = ({ windowMs, max, keyFn, errorCode = "too_many_requests" }) => {
  return (req, res, next) => {
    const now = Date.now();
    const key = keyFn(req);
    const current = rateLimitStore.get(key);

    if (!current || current.resetAt <= now) {
      rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (current.count >= max) {
      const retryAfterSeconds = Math.max(
        1,
        Math.ceil((current.resetAt - now) / 1000)
      );
      res.setHeader("Retry-After", String(retryAfterSeconds));
      void writeAuditLog(req, "rate_limit_blocked", { key, retryAfterSeconds });
      return res.status(429).json({ error: errorCode });
    }

    current.count += 1;
    return next();
  };
};

setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetAt <= now) {
      rateLimitStore.delete(key);
    }
  }
}, 60 * 1000).unref();

setInterval(() => {
  const now = Date.now();
  for (const [key, value] of passwordResetStore.entries()) {
    if (value.expiresAt <= now) {
      passwordResetStore.delete(key);
    }
  }
  for (const [email, state] of loginFailureStore.entries()) {
    if (state.lockedUntil && state.lockedUntil <= now) {
      loginFailureStore.delete(email);
    }
  }
  for (const [challengeId, pending] of pendingLoginStore.entries()) {
    if (pending.expiresAt <= now) {
      pendingLoginStore.delete(challengeId);
    }
  }
}, 60 * 1000).unref();

const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 60,
  keyFn: req => `auth:${req.ip}`,
  errorCode: "too_many_auth_attempts",
});

const loginLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  keyFn: req => `login:${req.ip}:${normalizeEmail(req.body?.email) || "unknown"}`,
  errorCode: "too_many_login_attempts",
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

app.post("/api/auth/register", authLimiter, async (req, res, next) => {
  try {
    const { password } = req.body || {};
    const email = normalizeEmail(req.body?.email);
    if (!validateEmail(email) || !validatePasswordPolicy(password)) {
      return res.status(400).json({ error: "invalid_credentials" });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: "email_exists" });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email, passwordHash },
    });

    const tokens = await issueTokens(user, req);
    void writeAuditLog(req, "auth_register_success", { email });
    setNoStore(res);
    return res.json({ user: sanitizeUser(user), tokenType: "Bearer", ...tokens });
  } catch (error) {
    return next(error);
  }
});

app.post("/api/auth/login", authLimiter, loginLimiter, async (req, res, next) => {
  try {
    const { password } = req.body || {};
    const email = normalizeEmail(req.body?.email);
    if (!validateEmail(email) || !validatePasswordInput(password)) {
      void writeAuditLog(req, "auth_login_rejected_format", { email });
      return res.status(400).json({ error: "invalid_credentials" });
    }

    const lockedUntil = checkLoginLock(email);
    if (lockedUntil) {
      tryRaiseSecurityAlert(req, `login_lock:${email}`, {
        type: "login_lockout_active",
        email,
      });
      return res.status(423).json({
        error: "account_temporarily_locked",
        lockedUntil: new Date(lockedUntil).toISOString(),
      });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
      const newLock = registerFailedLogin(email);
      if (newLock) {
        tryRaiseSecurityAlert(req, `login_lock:${email}`, {
          type: "login_lockout_triggered",
          email,
          lockedUntil: new Date(newLock).toISOString(),
        });
      }
      void writeAuditLog(req, "auth_login_failed", { email, reason: "not_found" });
      return res.status(401).json({ error: "invalid_credentials" });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      const newLock = registerFailedLogin(email);
      if (newLock) {
        tryRaiseSecurityAlert(req, `login_lock:${email}`, {
          type: "login_lockout_triggered",
          email,
          lockedUntil: new Date(newLock).toISOString(),
        });
      }
      void writeAuditLog(req, "auth_login_failed", { email, reason: "invalid_password" });
      return res.status(401).json({ error: "invalid_credentials" });
    }

    clearFailedLogin(email);
    const pendingLogin = await createPendingLogin({ user, email });
    void writeAuditLog(req, "auth_login_code_sent", {
      email,
      challengeId: pendingLogin.challengeId,
    });
    setNoStore(res);
    return res.status(202).json({
      status: "code_required",
      challengeId: pendingLogin.challengeId,
      expiresAt: pendingLogin.expiresAt,
      email,
      emailSent: pendingLogin.emailSent,
      demoCode: pendingLogin.demoCode,
    });
  } catch (error) {
    return next(error);
  }
});

app.post("/api/auth/login/verify", authLimiter, async (req, res, next) => {
  try {
    const challengeId =
      typeof req.body?.challengeId === "string" ? req.body.challengeId.trim() : "";
    const code = typeof req.body?.code === "string" ? req.body.code.trim() : "";
    if (!challengeId || !/^\d{6}$/.test(code)) {
      return res.status(400).json({ error: "invalid_verification_payload" });
    }

    const pending = pendingLoginStore.get(challengeId);
    if (!pending || pending.expiresAt <= Date.now()) {
      pendingLoginStore.delete(challengeId);
      void writeAuditLog(req, "auth_login_code_expired", { challengeId });
      return res.status(400).json({ error: "login_code_expired" });
    }

    if (pending.codeHash !== hashToken(code)) {
      pending.attemptsLeft -= 1;
      if (pending.attemptsLeft <= 0) {
        pendingLoginStore.delete(challengeId);
        void writeAuditLog(req, "auth_login_code_failed", {
          challengeId,
          email: pending.email,
          reason: "attempts_exhausted",
        });
        return res.status(401).json({ error: "invalid_login_code" });
      }
      void writeAuditLog(req, "auth_login_code_failed", {
        challengeId,
        email: pending.email,
        attemptsLeft: pending.attemptsLeft,
      });
      return res.status(401).json({
        error: "invalid_login_code",
        attemptsLeft: pending.attemptsLeft,
      });
    }

    pendingLoginStore.delete(challengeId);
    const user = await prisma.user.findUnique({ where: { id: pending.userId } });
    if (!user) {
      void writeAuditLog(req, "auth_login_code_failed", {
        challengeId,
        email: pending.email,
        reason: "user_not_found",
      });
      return res.status(401).json({ error: "invalid_login_code" });
    }

    const tokens = await issueTokens(user, req);
    req.auth = { sub: user.id, role: user.role };
    void writeAuditLog(req, "auth_login_success", { email: pending.email, challengeId });
    setNoStore(res);
    return res.json({ user: sanitizeUser(user), tokenType: "Bearer", ...tokens });
  } catch (error) {
    return next(error);
  }
});

app.post("/api/auth/login/resend", authLimiter, async (req, res, next) => {
  try {
    const challengeId =
      typeof req.body?.challengeId === "string" ? req.body.challengeId.trim() : "";
    if (!challengeId) {
      return res.status(400).json({ error: "invalid_challenge_id" });
    }
    const pending = pendingLoginStore.get(challengeId);
    if (!pending || pending.expiresAt <= Date.now()) {
      pendingLoginStore.delete(challengeId);
      return res.status(400).json({ error: "login_code_expired" });
    }

    const code = generateEmailCode();
    pending.codeHash = hashToken(code);
    pending.expiresAt = Date.now() + loginCodeTtlMinutes * 60 * 1000;
    pending.attemptsLeft = 5;
    const emailSent = await sendLoginCodeEmail({ email: pending.email, code });
    void writeAuditLog(req, "auth_login_code_resent", {
      email: pending.email,
      challengeId,
    });
    setNoStore(res);
    return res.json({
      status: "code_resent",
      challengeId,
      expiresAt: new Date(pending.expiresAt).toISOString(),
      email: pending.email,
      emailSent,
      demoCode: !isProduction && !emailSent ? code : undefined,
    });
  } catch (error) {
    return next(error);
  }
});

app.post("/api/auth/refresh", authLimiter, async (req, res, next) => {
  try {
    const { refreshToken } = req.body || {};
    if (typeof refreshToken !== "string" || refreshToken.length < 10) {
      return res.status(400).json({ error: "invalid_refresh_token" });
    }

    const tokenHash = hashToken(refreshToken);
    const stored = await prisma.refreshToken.findUnique({
      where: { tokenHash },
    });
    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      void writeAuditLog(req, "auth_refresh_failed", { reason: "invalid_or_expired" });
      return res.status(401).json({ error: "invalid_refresh_token" });
    }

    await prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    const user = await prisma.user.findUnique({ where: { id: stored.userId } });
    if (!user) {
      void writeAuditLog(req, "auth_refresh_failed", { reason: "user_not_found" });
      return res.status(401).json({ error: "invalid_refresh_token" });
    }

    const tokens = await issueTokens(user, req);
    req.auth = { sub: user.id, role: user.role };
    void writeAuditLog(req, "auth_refresh_success", {});
    setNoStore(res);
    return res.json({ user: sanitizeUser(user), tokenType: "Bearer", ...tokens });
  } catch (error) {
    return next(error);
  }
});

app.post("/api/auth/logout", authLimiter, async (req, res, next) => {
  try {
    const { refreshToken } = req.body || {};
    if (typeof refreshToken !== "string" || refreshToken.length < 10) {
      return res.status(400).json({ error: "invalid_refresh_token" });
    }
    const tokenHash = hashToken(refreshToken);
    await prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    void writeAuditLog(req, "auth_logout", {});
    return res.json({ status: "ok" });
  } catch (error) {
    return next(error);
  }
});

app.post("/api/auth/request-password-reset", authLimiter, async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body?.email);
    if (!validateEmail(email)) {
      return res.status(200).json({ status: "ok" });
    }
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(200).json({ status: "ok" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = hashToken(resetToken);
    passwordResetStore.set(tokenHash, {
      userId: user.id,
      expiresAt: Date.now() + 15 * 60 * 1000,
    });
    void writeAuditLog(req, "password_reset_requested", { email });
    if (!isProduction) {
      return res.status(200).json({ status: "ok", demoResetToken: resetToken });
    }
    return res.status(200).json({ status: "ok" });
  } catch (error) {
    return next(error);
  }
});

app.post("/api/auth/reset-password", authLimiter, async (req, res, next) => {
  try {
    const { token, newPassword } = req.body || {};
    if (typeof token !== "string" || !validatePasswordPolicy(newPassword)) {
      return res.status(400).json({ error: "invalid_payload" });
    }
    const tokenHash = hashToken(token);
    const record = passwordResetStore.get(tokenHash);
    if (!record || record.expiresAt <= Date.now()) {
      return res.status(400).json({ error: "invalid_or_expired_reset_token" });
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: record.userId },
      data: { passwordHash },
    });
    await prisma.refreshToken.updateMany({
      where: { userId: record.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    passwordResetStore.delete(tokenHash);
    void writeAuditLog(req, "password_reset_completed", { userId: record.userId });
    return res.status(200).json({ status: "ok" });
  } catch (error) {
    return next(error);
  }
});

app.get("/api/auth/me", authRequired, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.auth.sub },
    });
    if (!user) {
      return res.status(404).json({ error: "not_found" });
    }
    return res.json({ user: sanitizeUser(user) });
  } catch (error) {
    return next(error);
  }
});

app.get("/api/profile", authRequired, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.auth.sub },
    });
    if (!user) {
      return res.status(404).json({ error: "not_found" });
    }
    return res.json({ user: sanitizeUser(user) });
  } catch (error) {
    return next(error);
  }
});

app.put("/api/profile", authRequired, async (req, res, next) => {
  try {
    const { displayName, bio, avatarUrl } = req.body || {};
    const updated = await prisma.user.update({
      where: { id: req.auth.sub },
      data: {
        displayName: sanitizeText(displayName, 80) || null,
        bio: sanitizeText(bio, 500) || null,
        avatarUrl: validateAvatarUrl(avatarUrl),
      },
    });
    void writeAuditLog(req, "profile_updated", {});
    return res.json({ user: sanitizeUser(updated) });
  } catch (error) {
    return next(error);
  }
});

app.put("/api/profile/password", authRequired, requireAdminMfa, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body || {};
    if (!validatePasswordPolicy(newPassword) || !currentPassword) {
      return res.status(400).json({ error: "invalid_password" });
    }
    const user = await prisma.user.findUnique({
      where: { id: req.auth.sub },
    });
    if (!user || !user.passwordHash) {
      return res.status(404).json({ error: "not_found" });
    }
    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) {
      void writeAuditLog(req, "password_change_failed", { reason: "invalid_current_password" });
      return res.status(401).json({ error: "invalid_credentials" });
    }
    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });
    void writeAuditLog(req, "password_changed", {});
    return res.json({ status: "ok" });
  } catch (error) {
    return next(error);
  }
});

app.get("/api/modules", async (req, res, next) => {
  try {
    const modules = await prisma.module.findMany({
      orderBy: { title: "asc" },
    });
    res.json(modules);
  } catch (error) {
    next(error);
  }
});

app.get("/api/modules/:slug", async (req, res, next) => {
  try {
    const module = await prisma.module.findUnique({
      where: { slug: req.params.slug },
    });
    if (!module) {
      return res.status(404).json({ error: "not_found" });
    }
    return res.json(module);
  } catch (error) {
    return next(error);
  }
});

app.get("/api/admin/overview", authRequired, requireAdmin, requireAdminMfa, async (req, res, next) => {
  try {
    const [
      usersCount,
      adminsCount,
      modulesCount,
      notesCount,
      commentsCount,
      evidenceCount,
      progressCount,
      activeUsersTokens,
      recentUsers,
      recentNotes,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "admin" } }),
      prisma.module.count(),
      prisma.note.count(),
      prisma.comment.count(),
      prisma.protectionEvidence.count(),
      prisma.progress.count(),
      prisma.refreshToken.findMany({
        where: {
          revokedAt: null,
          expiresAt: { gt: new Date() },
        },
        distinct: ["userId"],
        select: { userId: true },
      }),
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, email: true, role: true, createdAt: true },
      }),
      prisma.note.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          title: true,
          createdAt: true,
          user: { select: { email: true } },
          _count: { select: { comments: true } },
        },
      }),
    ]);

    const activeUsersCount = activeUsersTokens.length;

    return res.json({
      counters: {
        users: usersCount,
        admins: adminsCount,
        modules: modulesCount,
        notes: notesCount,
        comments: commentsCount,
        evidence: evidenceCount,
        progressRecords: progressCount,
        activeUsers: activeUsersCount,
      },
      recentUsers,
      recentNotes,
    });
  } catch (error) {
    return next(error);
  }
});

app.get("/api/admin/users", authRequired, requireAdmin, requireAdminMfa, async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: [{ role: "desc" }, { createdAt: "asc" }],
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            notes: true,
            comments: true,
            progress: true,
            evidence: true,
            refreshTokens: true,
          },
        },
      },
    });
    return res.json(users);
  } catch (error) {
    return next(error);
  }
});

app.patch("/api/admin/users/:id/role", authRequired, requireAdmin, requireAdminMfa, async (req, res, next) => {
  try {
    const { role } = req.body || {};
    if (role !== "admin" && role !== "user") {
      return res.status(400).json({ error: "invalid_role" });
    }
    if (req.params.id === req.auth.sub && role !== "admin") {
      return res.status(400).json({ error: "cannot_demote_self" });
    }

    const existing = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ error: "not_found" });
    }

    const updated = await prisma.user.update({
      where: { id: existing.id },
      data: { role },
      select: { id: true, email: true, role: true, createdAt: true },
    });
    void writeAuditLog(req, "admin_role_updated", {
      targetUserId: updated.id,
      targetEmail: updated.email,
      role: updated.role,
    });

    return res.json(updated);
  } catch (error) {
    return next(error);
  }
});

app.get("/api/notes", authRequired, async (req, res, next) => {
  try {
    const notes = await prisma.note.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, email: true, role: true } },
        comments: {
          orderBy: { createdAt: "asc" },
          include: { user: { select: { id: true, email: true, role: true } } },
        },
      },
    });
    return res.json(notes);
  } catch (error) {
    return next(error);
  }
});

app.post("/api/notes", authRequired, async (req, res, next) => {
  try {
    const { title, content } = req.body || {};
    const safeTitle = sanitizeText(title, 120);
    const safeContent = sanitizeText(content, 5000);
    if (!safeTitle || !safeContent) {
      return res.status(400).json({ error: "invalid_payload" });
    }
    const note = await prisma.note.create({
      data: {
        title: safeTitle,
        content: safeContent,
        userId: req.auth.sub,
      },
      include: {
        user: { select: { id: true, email: true, role: true } },
        comments: { include: { user: { select: { id: true, email: true, role: true } } } },
      },
    });
    void writeAuditLog(req, "note_created", { noteId: note.id });
    return res.status(201).json(note);
  } catch (error) {
    return next(error);
  }
});

app.put("/api/notes/:id", authRequired, async (req, res, next) => {
  try {
    const { title, content } = req.body || {};
    const note = await prisma.note.findUnique({ where: { id: req.params.id } });
    if (!note) {
      return res.status(404).json({ error: "not_found" });
    }
    if (!requireNoteAccess(note, req.auth)) {
      return res.status(403).json({ error: "forbidden" });
    }
    const updated = await prisma.note.update({
      where: { id: note.id },
      data: {
        title: title ? sanitizeText(title, 120) || note.title : note.title,
        content: content ? sanitizeText(content, 5000) || note.content : note.content,
      },
      include: {
        user: { select: { id: true, email: true, role: true } },
        comments: {
          orderBy: { createdAt: "asc" },
          include: { user: { select: { id: true, email: true, role: true } } },
        },
      },
    });
    void writeAuditLog(req, "note_updated", { noteId: note.id });
    return res.json(updated);
  } catch (error) {
    return next(error);
  }
});

app.delete("/api/notes/:id", authRequired, async (req, res, next) => {
  try {
    const note = await prisma.note.findUnique({ where: { id: req.params.id } });
    if (!note) {
      return res.status(404).json({ error: "not_found" });
    }
    if (!requireNoteAccess(note, req.auth)) {
      return res.status(403).json({ error: "forbidden" });
    }
    await prisma.note.delete({ where: { id: note.id } });
    void writeAuditLog(req, "note_deleted", { noteId: note.id });
    return res.json({ status: "deleted" });
  } catch (error) {
    return next(error);
  }
});

app.post("/api/notes/:id/comments", authRequired, async (req, res, next) => {
  try {
    const { content } = req.body || {};
    const safeContent = sanitizeText(content, 2000);
    if (!safeContent) {
      return res.status(400).json({ error: "invalid_payload" });
    }
    const note = await prisma.note.findUnique({ where: { id: req.params.id } });
    if (!note) {
      return res.status(404).json({ error: "note_not_found" });
    }
    const comment = await prisma.comment.create({
      data: {
        noteId: note.id,
        userId: req.auth.sub,
        content: safeContent,
      },
      include: { user: { select: { id: true, email: true, role: true } } },
    });
    void writeAuditLog(req, "comment_created", { commentId: comment.id, noteId: note.id });
    return res.status(201).json(comment);
  } catch (error) {
    return next(error);
  }
});

app.delete("/api/comments/:id", authRequired, async (req, res, next) => {
  try {
    const comment = await prisma.comment.findUnique({
      where: { id: req.params.id },
    });
    if (!comment) {
      return res.status(404).json({ error: "not_found" });
    }
    if (comment.userId !== req.auth.sub && !isAdmin(req.auth)) {
      return res.status(403).json({ error: "forbidden" });
    }
    await prisma.comment.delete({ where: { id: comment.id } });
    void writeAuditLog(req, "comment_deleted", { commentId: comment.id });
    return res.json({ status: "deleted" });
  } catch (error) {
    return next(error);
  }
});

app.get("/api/progress", authRequired, async (req, res, next) => {
  try {
    const progress = await prisma.progress.findMany({
      where: { userId: req.auth.sub },
      include: { module: true },
    });
    return res.json(progress);
  } catch (error) {
    return next(error);
  }
});

app.post("/api/progress", authRequired, async (req, res, next) => {
  try {
    const { moduleSlug, status, completion } = req.body || {};
    if (!moduleSlug) {
      return res.status(400).json({ error: "module_required" });
    }
    const module = await prisma.module.findUnique({
      where: { slug: moduleSlug },
    });
    if (!module) {
      return res.status(404).json({ error: "module_not_found" });
    }

    const safeCompletion =
      typeof completion === "number"
        ? Math.max(0, Math.min(100, Math.round(completion)))
        : 0;

    const progress = await prisma.progress.upsert({
      where: {
        userId_moduleId: {
          userId: req.auth.sub,
          moduleId: module.id,
        },
      },
      update: {
        status: status || "in_progress",
        completion: safeCompletion,
      },
      create: {
        userId: req.auth.sub,
        moduleId: module.id,
        status: status || "in_progress",
        completion: safeCompletion,
      },
      include: { module: true },
    });

    return res.json(progress);
  } catch (error) {
    return next(error);
  }
});

app.get("/api/evidence", authRequired, async (req, res, next) => {
  try {
    const moduleSlug = req.query.moduleSlug;
    const where = { userId: req.auth.sub };
    if (moduleSlug) {
      const module = await prisma.module.findUnique({
        where: { slug: moduleSlug },
      });
      if (!module) {
        return res.status(404).json({ error: "module_not_found" });
      }
      where.moduleId = module.id;
    }
    const evidence = await prisma.protectionEvidence.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
    return res.json(evidence);
  } catch (error) {
    return next(error);
  }
});

app.post("/api/evidence", authRequired, async (req, res, next) => {
  try {
    const { moduleSlug, title, details, location, controlType } = req.body || {};
    if (!moduleSlug || !title) {
      return res.status(400).json({ error: "invalid_payload" });
    }
    const module = await prisma.module.findUnique({
      where: { slug: moduleSlug },
    });
    if (!module) {
      return res.status(404).json({ error: "module_not_found" });
    }

    const evidence = await prisma.protectionEvidence.create({
      data: {
        moduleId: module.id,
        userId: req.auth.sub,
        title,
        details,
        location,
        controlType,
      },
    });
    return res.status(201).json(evidence);
  } catch (error) {
    return next(error);
  }
});

app.get("/api/security/owasp", authRequired, async (req, res, next) => {
  try {
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const [failedLogins24h, blockedRequests24h, securityEvents] = await Promise.all([
      prisma.auditLog.count({
        where: { action: "auth_login_failed", createdAt: { gte: last24h } },
      }),
      prisma.auditLog.count({
        where: {
          action: {
            in: [
              "auth_login_rejected_format",
              "auth_refresh_failed",
              "rate_limit_blocked",
              "request_blocked_csrf_origin",
              "request_blocked_csrf_site",
              "request_blocked_path_traversal",
              "request_blocked_insecure_transport",
            ],
          },
          createdAt: { gte: last24h },
        },
      }),
      prisma.auditLog.findMany({
        where: { createdAt: { gte: last24h } },
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          action: true,
          createdAt: true,
          user: { select: { email: true } },
          ip: true,
        },
      }),
    ]);

    const securityEvidence = [
      {
        id: "shield-L1",
        threatId: "L1",
        status: "implemented",
        threat: "Массовый перебор и credential stuffing",
        owasp2025: "A07:2025 - Authentication Failures",
        controlName: "Rate limiting + временная блокировка аккаунта",
        protectsAgainst: "Снижает риск автоматического подбора паролей и захвата аккаунта.",
        codeSnippet:
          "const loginLimiter = createRateLimiter({ max: 10, windowMs: 15 * 60 * 1000, ... });\nconst newLock = registerFailedLogin(email);",
      },
      {
        id: "shield-L2",
        threatId: "L2",
        status: "implemented",
        threat: "Хранение паролей в открытом виде",
        owasp2025: "A04:2025 - Cryptographic Failures",
        controlName: "Хэширование паролей через bcrypt",
        protectsAgainst: "При утечке БД исходные пароли не раскрываются напрямую.",
        codeSnippet:
          "const passwordHash = await bcrypt.hash(password, 12);\nconst valid = await bcrypt.compare(password, user.passwordHash);",
      },
      {
        id: "shield-L3",
        threatId: "L3",
        status: "implemented",
        threat: "Слабые пароли по умолчанию",
        owasp2025: "A07:2025 - Authentication Failures",
        controlName: "Password policy",
        protectsAgainst: "Запрещает короткие и предсказуемые пароли.",
        codeSnippet:
          "const validatePasswordPolicy = value => value.length >= 10 && /[a-z]/i.test(value) && /\\d/.test(value);",
      },
      {
        id: "shield-L4",
        threatId: "L4",
        status: "implemented",
        threat: "Небезопасное восстановление пароля через секретные вопросы",
        owasp2025: "A07:2025 - Authentication Failures",
        controlName: "Token-based password reset",
        protectsAgainst: "Исключает угадываемые секретные вопросы и использует короткоживущий токен.",
        codeSnippet:
          "app.post('/api/auth/request-password-reset', ...)\napp.post('/api/auth/reset-password', ...)\npasswordResetStore.set(tokenHash, { userId, expiresAt });",
      },
      {
        id: "shield-L5",
        threatId: "L5",
        status: "implemented",
        threat: "Отсутствие MFA для критичных действий",
        owasp2025: "A07:2025 - Authentication Failures",
        controlName: "Admin MFA check (TOTP)",
        protectsAgainst: "Даже при компрометации пароля блокирует доступ к admin-операциям без второго фактора.",
        codeSnippet:
          "const requireAdminMfa = (req, res, next) => {\n  if (!isAdmin(req.auth) || verifyAdminMfaCode(req.get('x-admin-mfa'))) return next();\n  return res.status(403).json({ error: 'mfa_required' });\n};",
      },
      {
        id: "shield-T1",
        threatId: "T1",
        status: "implemented",
        threat: "Угон сессии через XSS",
        owasp2025: "A05:2025 - Injection",
        controlName: "CSP + санитизация пользовательского текста",
        protectsAgainst: "Снижает вероятность исполнения внедренного script-кода и кражи токенов.",
        codeSnippet:
          "res.setHeader('Content-Security-Policy', \"default-src 'self'; ... script-src 'self'; ...\");\nconst safeContent = sanitizeText(content, 5000);",
      },
      {
        id: "shield-T2",
        threatId: "T2",
        status: "implemented",
        threat: "Фиксация сессии",
        owasp2025: "A07:2025 - Authentication Failures",
        controlName: "Refresh token rotation",
        protectsAgainst: "Каждое обновление сессии выдает новый refresh token и отзывает старый.",
        codeSnippet:
          "await prisma.refreshToken.update({ where: { id: stored.id }, data: { revokedAt: new Date() } });\nconst tokens = await issueTokens(user, req);",
      },
      {
        id: "shield-T3",
        threatId: "T3",
        status: "implemented",
        threat: "Подмена JWT claims и слабая подпись",
        owasp2025: "A01:2025 - Broken Access Control",
        controlName: "Жесткая проверка JWT algorithm/issuer/audience",
        protectsAgainst: "Отклоняет токены с неподдерживаемым algorithm и неверными параметрами подписи.",
        codeSnippet:
          "jwt.verify(token, jwtSecret, { algorithms: ['HS256'], issuer: jwtIssuer, audience: jwtAudience });",
      },
      {
        id: "shield-T4",
        threatId: "T4",
        status: "implemented",
        threat: "Токены остаются активными после logout",
        owasp2025: "A07:2025 - Authentication Failures",
        controlName: "Revocation refresh token",
        protectsAgainst: "Отключает ранее выданные refresh token после logout/rotation/reset password.",
        codeSnippet:
          "await prisma.refreshToken.updateMany({ where: { tokenHash, revokedAt: null }, data: { revokedAt: new Date() } });",
      },
      {
        id: "shield-DB1",
        threatId: "DB1",
        status: "implemented",
        threat: "SQL injection в запросах к БД",
        owasp2025: "A05:2025 - Injection",
        controlName: "Prisma ORM + валидация входа",
        protectsAgainst: "Использует параметризованные запросы и отсекает опасный ввод.",
        codeSnippet:
          "const note = await prisma.note.create({ data: { title: safeTitle, content: safeContent, userId: req.auth.sub } });",
      },
      {
        id: "shield-DB2",
        threatId: "DB2",
        status: "implemented",
        threat: "Доступ к чужим записям через ID",
        owasp2025: "A01:2025 - Broken Access Control",
        controlName: "Проверка владельца записи",
        protectsAgainst: "Запрещает читать/менять чужие данные без роли admin.",
        codeSnippet:
          "const requireNoteAccess = (note, auth) => note.userId === auth.sub || isAdmin(auth);",
      },
      {
        id: "shield-DB3",
        threatId: "DB3",
        status: "implemented",
        threat: "Небезопасная конфигурация БД и дефолтные credentials",
        owasp2025: "A02:2025 - Security Misconfiguration",
        controlName: "Проверка DATABASE_URL в production",
        protectsAgainst: "Блокирует запуск с weak/default DB credentials.",
        codeSnippet:
          "if (isProduction && weakUserOrPassword) {\n  throw new Error('DATABASE_URL uses weak default credentials.');\n}",
      },
      {
        id: "shield-DB4",
        threatId: "DB4",
        status: "implemented",
        threat: "Устаревшая СУБД с известными CVE",
        owasp2025: "A03:2025 - Software Supply Chain Failures",
        controlName: "Startup DB version check",
        protectsAgainst: "Подсвечивает риск использования старой major-версии PostgreSQL.",
        codeSnippet:
          "const result = await prisma.$queryRaw`SELECT version()`;\nif (major > 0 && major < 14) console.warn('... may contain unpatched CVEs');",
      },
      {
        id: "shield-DB5",
        threatId: "DB5",
        status: "implemented",
        threat: "Отсутствие защиты чувствительных данных",
        owasp2025: "A04:2025 - Cryptographic Failures",
        controlName: "Хэширование паролей и хэш refresh token",
        protectsAgainst: "Пароли и refresh token не сохраняются в открытом виде.",
        codeSnippet:
          "const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');",
      },
      {
        id: "shield-AP1",
        threatId: "AP1",
        status: "implemented",
        threat: "Отсутствие авторизации на защищенных API",
        owasp2025: "A01:2025 - Broken Access Control",
        controlName: "authRequired middleware",
        protectsAgainst: "Доступ к защищенным API только с валидным Bearer token.",
        codeSnippet:
          "if (type !== 'Bearer' || !token) return res.status(401).json({ error: 'unauthorized' });",
      },
      {
        id: "shield-AP2",
        threatId: "AP2",
        status: "implemented",
        threat: "Injection через параметры и body",
        owasp2025: "A05:2025 - Injection",
        controlName: "Санитизация и лимиты длины",
        protectsAgainst: "Снижает риск SQL/NoSQL/Log injection и переполнений payload.",
        codeSnippet:
          "const safeTitle = sanitizeText(title, 120);\napp.use(express.json({ limit: '100kb' }));",
      },
      {
        id: "shield-AP3",
        threatId: "AP3",
        status: "implemented",
        threat: "Избыточное раскрытие данных и stack trace",
        owasp2025: "A02:2025 - Security Misconfiguration",
        controlName: "Generic error response",
        protectsAgainst: "Клиенту не отдаются stack trace и внутренние детали.",
        codeSnippet:
          "res.status(500).json({ error: 'internal_error', errorId });",
      },
      {
        id: "shield-AP4",
        threatId: "AP4",
        status: "implemented",
        threat: "Передача данных без TLS",
        owasp2025: "A04:2025 - Cryptographic Failures",
        controlName: "HSTS + HTTPS enforcement",
        protectsAgainst: "Запрещает insecure transport в production.",
        codeSnippet:
          "if (isProduction && proto && proto !== 'https') return res.status(400).json({ error: 'https_required' });",
      },
      {
        id: "shield-AP5",
        threatId: "AP5",
        status: "implemented",
        threat: "Отсутствие Rate Limiting",
        owasp2025: "A10:2025 - Mishandling of Exceptional Conditions",
        controlName: "Rate limit на auth API",
        protectsAgainst: "Снижает риск DoS и автоматизированных атак.",
        codeSnippet:
          "const authLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 60, keyFn: req => `auth:${req.ip}` });",
      },
      {
        id: "shield-JL1",
        threatId: "JL1",
        status: "implemented",
        threat: "Недостаточный мониторинг",
        owasp2025: "A09:2025 - Security Logging & Alerting Failures",
        controlName: "Audit log критичных действий",
        protectsAgainst: "Сохраняет трассировку security-событий и действий пользователей.",
        codeSnippet:
          "await prisma.auditLog.create({ data: { userId: req.auth?.sub || null, action, ip: req.ip, meta } });",
      },
      {
        id: "shield-JL2",
        threatId: "JL2",
        status: "implemented",
        threat: "Отсутствие алертов",
        owasp2025: "A09:2025 - Security Logging & Alerting Failures",
        controlName: "Security alert event при lockout/rate limit",
        protectsAgainst: "Фиксирует подозрительные серии событий отдельным action.",
        codeSnippet:
          "tryRaiseSecurityAlert(req, `login_lock:${email}`, { type: 'login_lockout_triggered', email });",
      },
      {
        id: "shield-JL3",
        threatId: "JL3",
        status: "implemented",
        threat: "Логирование паролей и токенов",
        owasp2025: "A09:2025 - Security Logging & Alerting Failures",
        controlName: "Redaction секретов в логах",
        protectsAgainst: "Удаляет password/token/secret из audit metadata.",
        codeSnippet:
          "const secretKeyPattern = /(password|token|secret|authorization|cookie)/i;\nif (secretKeyPattern.test(safeKey)) masked[safeKey] = '[redacted]';",
      },
      {
        id: "shield-JL4",
        threatId: "JL4",
        status: "implemented",
        threat: "Нарушение целостности логов",
        owasp2025: "A09:2025 - Security Logging & Alerting Failures",
        controlName: "Hash-chain для audit events",
        protectsAgainst: "Позволяет выявлять подмену/удаление записей журнала.",
        codeSnippet:
          "const chainHash = crypto.createHash('sha256').update(JSON.stringify({ prev: auditChainHead, ... })).digest('hex');\nmeta: { ...safeMeta, _chainPrev: auditChainHead, _chainHash: chainHash }",
      },
      {
        id: "shield-JL5",
        threatId: "JL5",
        status: "implemented",
        threat: "Log injection через управляющие символы",
        owasp2025: "A09:2025 - Security Logging & Alerting Failures",
        controlName: "Очистка action/meta перед записью",
        protectsAgainst: "Исключает внедрение фальшивых строк и команд в лог.",
        codeSnippet:
          "const normalizeLogText = value => value.replace(/[\\u0000-\\u001f\\u007f]/g, ' ').slice(0, 160);",
      },
      {
        id: "shield-I1",
        threatId: "I1",
        status: "implemented",
        threat: "Слабые учетные данные администратора",
        owasp2025: "A02:2025 - Security Misconfiguration",
        controlName: "Сильная password policy + lockout",
        protectsAgainst: "Снижает риск входа с простыми/угадываемыми паролями.",
        codeSnippet:
          "if (!validatePasswordPolicy(password)) return res.status(400).json({ error: 'invalid_credentials' });",
      },
      {
        id: "shield-I2",
        threatId: "I2",
        status: "implemented",
        threat: "Доступ к admin-функциям по URL",
        owasp2025: "A01:2025 - Broken Access Control",
        controlName: "RBAC для admin endpoints",
        protectsAgainst: "URL сам по себе не дает привилегий без роли admin.",
        codeSnippet:
          "app.get('/api/admin/users', authRequired, requireAdmin, requireAdminMfa, ...);",
      },
      {
        id: "shield-I3",
        threatId: "I3",
        status: "implemented",
        threat: "CSRF атаки на admin-действия",
        owasp2025: "A01:2025 - Broken Access Control",
        controlName: "Origin / Sec-Fetch-Site проверка",
        protectsAgainst: "Блокирует cross-site state-changing запросы.",
        codeSnippet:
          "if (origin && !allowedOrigins.includes(origin)) return res.status(403).json({ error: 'csrf_blocked_origin' });\nif (fetchSite === 'cross-site') return res.status(403).json({ error: 'csrf_blocked_site' });",
      },
      {
        id: "shield-I4",
        threatId: "I4",
        status: "implemented",
        threat: "XSS в admin-панели",
        owasp2025: "A05:2025 - Injection",
        controlName: "CSP и очистка пользовательского контента",
        protectsAgainst: "Снижает риск выполнения внедренного script в интерфейсе.",
        codeSnippet:
          "res.setHeader('Content-Security-Policy', \"default-src 'self'; ...\");\nconst safeContent = sanitizeText(content, 2000);",
      },
      {
        id: "shield-I5",
        threatId: "I5",
        status: "implemented",
        threat: "Нет MFA для критичных функций",
        owasp2025: "A07:2025 - Authentication Failures",
        controlName: "MFA для admin/password операций",
        protectsAgainst: "Требует второй фактор для чувствительных действий.",
        codeSnippet:
          "app.patch('/api/admin/users/:id/role', authRequired, requireAdmin, requireAdminMfa, ...);",
      },
      {
        id: "shield-C1",
        threatId: "C1",
        status: "implemented",
        threat: "Path traversal",
        owasp2025: "A02:2025 - Security Misconfiguration",
        controlName: "Блокировка traversal-паттернов в URL",
        protectsAgainst: "Предотвращает попытки доступа к файловой системе через ../",
        codeSnippet:
          "if (traversalPattern.test(req.originalUrl || '')) return res.status(400).json({ error: 'invalid_path' });",
      },
      {
        id: "shield-C2",
        threatId: "C2",
        status: "implemented",
        threat: "Уязвимые компоненты",
        owasp2025: "A03:2025 - Software Supply Chain Failures",
        controlName: "Проверка версии PostgreSQL при запуске",
        protectsAgainst: "Подсвечивает риск старых компонентов с известными CVE.",
        codeSnippet:
          "if (major > 0 && major < 14) console.warn('Security warning: PostgreSQL major version ...');",
      },
      {
        id: "shield-C3",
        threatId: "C3",
        status: "partial",
        threat: "Supply Chain атаки через зависимости",
        owasp2025: "A08:2025 - Software or Data Integrity Failures",
        controlName: "Policy: pinned lockfile + CI audit",
        protectsAgainst: "Снижает риск подмены пакетов, но требует CI-процедур вне runtime.",
        codeSnippet:
          "// Требуется CI: npm ci + npm audit + проверка lockfile в pull request.",
      },
      {
        id: "shield-C4",
        threatId: "C4",
        status: "implemented",
        threat: "Hardcoded secrets в коде",
        owasp2025: "A04:2025 - Cryptographic Failures",
        controlName: "Запрет weak/default secrets в production",
        protectsAgainst: "Не позволяет запускать backend с предсказуемыми секретами.",
        codeSnippet:
          "if (isWeakJwtSecret(jwtSecret) && isProduction) throw new Error('JWT_SECRET is weak.');",
      },
    ];

    return res.json({
      generatedAt: new Date().toISOString(),
      counters: {
        failedLogins24h,
        blockedRequests24h,
      },
      securityEvidence,
      top10: [
        {
          id: "A01",
          title: "Broken Access Control",
          status: "implemented",
          codeSnippet:
            "const requireAdmin = (req, res, next) => {\n  if (!isAdmin(req.auth)) {\n    return res.status(403).json({ error: \"forbidden\" });\n  }\n  return next();\n};",
          controls: [
            "middleware authRequired защищает приватные эндпоинты",
            "админские маршруты закрыты через requireAdmin",
            "проверка владельца для заметок и комментариев",
          ],
        },
        {
          id: "A02",
          title: "Cryptographic Failures",
          status: "implemented",
          codeSnippet:
            "const passwordHash = await bcrypt.hash(password, 12);\nconst tokenHash = crypto\n  .createHash(\"sha256\")\n  .update(refreshToken)\n  .digest(\"hex\");",
          controls: [
            "хеширование паролей через bcrypt (cost 12)",
            "подписанные JWT access-токены",
            "refresh-токены хранятся в БД только в виде хеша",
          ],
        },
        {
          id: "A03",
          title: "Injection",
          status: "implemented",
          codeSnippet:
            "const safeTitle = sanitizeText(title, 120);\nconst note = await prisma.note.create({\n  data: { title: safeTitle, content: safeContent, userId: req.auth.sub }\n});",
          controls: [
            "Prisma ORM использует параметризованные запросы",
            "нормализация и очистка входных текстовых данных",
            "валидация payload и лимиты длины",
          ],
        },
        {
          id: "A04",
          title: "Insecure Design",
          status: "implemented",
          codeSnippet:
            "await prisma.refreshToken.update({\n  where: { id: stored.id },\n  data: { revokedAt: new Date() }\n});\nconst tokens = await issueTokens(user, req);",
          controls: [
            "ротация токенов при refresh",
            "защитные проверки в auth flow",
            "ролевой доступ по принципу least privilege",
          ],
        },
        {
          id: "A05",
          title: "Security Misconfiguration",
          status: "implemented",
          codeSnippet:
            "app.disable(\"x-powered-by\");\nres.setHeader(\"X-Frame-Options\", \"DENY\");\nres.setHeader(\"X-Content-Type-Options\", \"nosniff\");",
          controls: [
            "security headers (frame, sniffing, referrer, permissions)",
            "настраиваемый CORS allowlist",
            "защита от слабого JWT_SECRET в production",
          ],
        },
        {
          id: "A06",
          title: "Vulnerable and Outdated Components",
          status: "partial",
          codeSnippet:
            "// Dependencies are pinned via package-lock.json\n// TODO: run npm audit in CI on a schedule.",
          controls: [
            "зависимости фиксируются через package-lock",
            "нужен регулярный процесс npm audit и обновлений",
          ],
        },
        {
          id: "A07",
          title: "Identification and Authentication Failures",
          status: "implemented",
          codeSnippet:
            "const loginLimiter = createRateLimiter({\n  windowMs: 15 * 60 * 1000,\n  max: 10,\n  keyFn: req => `login:${req.ip}:${normalizeEmail(req.body?.email) || \"unknown\"}`\n});",
          controls: [
            "rate limit для auth-эндпоинтов",
            "password policy для регистрации и смены пароля",
            "revocation refresh-токенов при ротации и logout",
          ],
        },
        {
          id: "A08",
          title: "Software and Data Integrity Failures",
          status: "partial",
          codeSnippet:
            "// No runtime code loading from remote sources\napp.use(express.json({ limit: \"100kb\" }));\n// Integrity hardening is handled in CI/CD.",
          controls: [
            "целостность зависит от защищенного CI/CD и секретов",
            "в backend нет runtime-подгрузки кода",
          ],
        },
        {
          id: "A09",
          title: "Security Logging and Monitoring Failures",
          status: "implemented",
          codeSnippet:
            "await prisma.auditLog.create({\n  data: {\n    userId: req.auth?.sub || null,\n    action,\n    ip: req.ip,\n    meta\n  }\n});",
          controls: [
            "audit logs для auth/profile/admin/content действий",
            "security-события доступны в dashboard API",
          ],
        },
        {
          id: "A10",
          title: "Server-Side Request Forgery (SSRF)",
          status: "partial",
          codeSnippet:
            "const parsed = new URL(trimmed);\nif (parsed.protocol !== \"https:\" && parsed.protocol !== \"http:\") {\n  return null;\n}",
          controls: [
            "валидация avatar URL (только http/https)",
            "в backend нет фичи запроса произвольных удаленных URL",
          ],
        },
      ],
      recentSecurityEvents: securityEvents,
    });
  } catch (error) {
    return next(error);
  }
});

app.use((err, req, res, next) => {
  const errorId = crypto.randomUUID();
  console.error(`[${errorId}]`, err);
  res.status(500).json({ error: "internal_error", errorId });
});

const runStartupSecurityChecks = async () => {
  try {
    const result = await prisma.$queryRaw`SELECT version()`;
    const versionText = Array.isArray(result)
      ? Object.values(result[0] || {}).join(" ")
      : "";
    if (typeof versionText === "string" && versionText) {
      const majorMatch = versionText.match(/PostgreSQL\s+(\d+)/i);
      const major = Number(majorMatch?.[1] || 0);
      if (major > 0 && major < 14) {
        console.warn(
          `Security warning: PostgreSQL major version ${major} may contain unpatched CVEs.`
        );
      }
    }
  } catch (error) {
    console.warn("Security warning: failed to run DB version check.", error.message);
  }
};

runStartupSecurityChecks().finally(() => {
  app.listen(port, () => {
    console.log(`Backend listening on http://localhost:${port}`);
  });
});
