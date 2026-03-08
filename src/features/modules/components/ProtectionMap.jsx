import React, { useEffect, useState } from "react";
import { fetchOwaspSecurityStatus } from "../../../api/security";
import { systemComponents } from "../data/protectionMap";
import "./ProtectionMap.css";

const S = {
  protected: "\u0417\u0430\u0449\u0438\u0449\u0435\u043d\u043e",
  partial: "\u0427\u0430\u0441\u0442\u0438\u0447\u043d\u043e",
  none: "\u041d\u0435 \u0437\u0430\u0449\u0438\u0449\u0435\u043d\u043e",
  title: "\u041a\u0430\u0440\u0442\u0430 \u0437\u0430\u0449\u0438\u0442\u044b",
  subtitle:
    "\u0413\u0434\u0435 \u0438\u043c\u0435\u043d\u043d\u043e \u0432 \u0441\u0438\u0441\u0442\u0435\u043c\u0435 \u043f\u0440\u0438\u043c\u0435\u043d\u0435\u043d\u044b \u043c\u0435\u0440\u044b \u0437\u0430\u0449\u0438\u0442\u044b \u0438 \u043f\u043e\u0447\u0435\u043c\u0443 \u043e\u043d\u0438 \u044d\u0444\u0444\u0435\u043a\u0442\u0438\u0432\u043d\u044b.",
  whyTemplate:
    "\u041a\u043e\u043d\u0442\u0440\u043e\u043b\u0438 \u0441\u0438\u043d\u0445\u0440\u043e\u043d\u0438\u0437\u0438\u0440\u043e\u0432\u0430\u043d\u044b \u0441 OWASP Shield \u043f\u043e \u0443\u0433\u0440\u043e\u0437\u0430\u043c:",
  evidence: "\u041e\u0431\u043e\u0441\u043d\u043e\u0432\u0430\u043d\u0438\u0435:",
  empty:
    "\u0417\u0430\u0449\u0438\u0442\u0430 \u0434\u043b\u044f \u044d\u0442\u043e\u0433\u043e \u043a\u043e\u043c\u043f\u043e\u043d\u0435\u043d\u0442\u0430 \u0435\u0449\u0435 \u043d\u0435 \u043e\u043f\u0438\u0441\u0430\u043d\u0430.",
};

const componentThreatIds = {
  ui: ["T1", "I4", "AP2"],
  auth: ["L1", "L2", "L3", "L4", "L5", "T2", "T3", "T4", "I5"],
  api: ["AP1", "AP2", "AP3", "AP4", "AP5", "I2", "I3", "C1"],
  db: ["DB1", "DB2", "DB3", "DB4", "DB5"],
  storage: ["C3"],
  logging: ["JL1", "JL2", "JL3", "JL4", "JL5"],
  network: ["AP4", "I3", "C1", "C2"],
};

const unique = list => Array.from(new Set(list));

const fallbackBaseline = {
  ui: {
    componentId: "ui",
    status: "protected",
    controls: ["Input validation", "CSP"],
    why: "\u0418\u0441\u043f\u043e\u043b\u044c\u0437\u0443\u0435\u0442\u0441\u044f \u0432\u0430\u043b\u0438\u0434\u0430\u0446\u0438\u044f \u0432\u0432\u043e\u0434\u0430 \u0438 \u043f\u043e\u043b\u0438\u0442\u0438\u043a\u0430 CSP \u0434\u043b\u044f \u0441\u043d\u0438\u0436\u0435\u043d\u0438\u044f XSS-\u0440\u0438\u0441\u043a\u043e\u0432.",
    evidence: "A05:2025 - Injection | A01:2025 - Broken Access Control",
  },
  auth: {
    componentId: "auth",
    status: "protected",
    controls: ["bcrypt", "JWT hardening", "Token rotation", "MFA"],
    why: "\u0410\u0443\u0442\u0435\u043d\u0442\u0438\u0444\u0438\u043a\u0430\u0446\u0438\u044f \u0437\u0430\u0449\u0438\u0449\u0435\u043d\u0430 \u0445\u044d\u0448\u0438\u0440\u043e\u0432\u0430\u043d\u0438\u0435\u043c, \u0432\u0430\u043b\u0438\u0434\u0430\u0446\u0438\u0435\u0439 \u0442\u043e\u043a\u0435\u043d\u043e\u0432 \u0438 MFA \u0434\u043b\u044f \u043a\u0440\u0438\u0442\u0438\u0447\u043d\u044b\u0445 \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0439.",
    evidence: "A07:2025 - Authentication Failures | A04:2025 - Cryptographic Failures",
  },
  api: {
    componentId: "api",
    status: "protected",
    controls: ["RBAC", "Rate limiting", "CSRF checks"],
    why: "API \u0437\u0430\u043a\u0440\u044b\u0442\u043e \u043f\u043e \u0440\u043e\u043b\u044f\u043c \u0438 \u043e\u0433\u0440\u0430\u043d\u0438\u0447\u0435\u043d\u043e \u043e\u0442 abuse/CSRF.",
    evidence: "A01:2025 - Broken Access Control | A10:2025 - Mishandling of Exceptional Conditions",
  },
  db: {
    componentId: "db",
    status: "protected",
    controls: ["Prisma ORM", "Access checks", "Hashing"],
    why: "\u0417\u0430\u043f\u0440\u043e\u0441\u044b \u043f\u0430\u0440\u0430\u043c\u0435\u0442\u0440\u0438\u0437\u0443\u044e\u0442\u0441\u044f ORM, \u0434\u043e\u0441\u0442\u0443\u043f \u0438 \u0441\u0435\u043a\u0440\u0435\u0442\u044b \u043a\u043e\u043d\u0442\u0440\u043e\u043b\u0438\u0440\u0443\u044e\u0442\u0441\u044f \u043d\u0430 \u0441\u0435\u0440\u0432\u0435\u0440\u0435.",
    evidence: "A05:2025 - Injection | A04:2025 - Cryptographic Failures",
  },
  storage: {
    componentId: "storage",
    status: "partial",
    controls: ["Supply chain policy"],
    why: "\u0415\u0441\u0442\u044c \u0431\u0430\u0437\u043e\u0432\u0430\u044f \u043f\u043e\u043b\u0438\u0442\u0438\u043a\u0430, \u043d\u043e \u043f\u043e\u043b\u043d\u044b\u0439 CI-integrity pipeline \u0432 \u0440\u0430\u0437\u0432\u0438\u0442\u0438\u0438.",
    evidence: "A08:2025 - Software or Data Integrity Failures",
  },
  logging: {
    componentId: "logging",
    status: "protected",
    controls: ["Audit log", "Redaction", "Hash chain"],
    why: "\u0416\u0443\u0440\u043d\u0430\u043b\u044b \u0437\u0430\u0449\u0438\u0449\u0435\u043d\u044b \u043e\u0442 \u0443\u0442\u0435\u0447\u043a\u0438 \u0447\u0443\u0432\u0441\u0442\u0432\u0438\u0442\u0435\u043b\u044c\u043d\u044b\u0445 \u0434\u0430\u043d\u043d\u044b\u0445 \u0438 \u043f\u043e\u0434\u043c\u0435\u043d\u044b.",
    evidence: "A09:2025 - Security Logging & Alerting Failures",
  },
  network: {
    componentId: "network",
    status: "protected",
    controls: ["CORS allowlist", "HTTPS enforcement"],
    why: "\u0421\u0435\u0442\u0435\u0432\u043e\u0439 \u043f\u0435\u0440\u0438\u043c\u0435\u0442\u0440 \u043e\u0433\u0440\u0430\u043d\u0438\u0447\u0438\u0432\u0430\u0435\u0442 \u043d\u0435\u0434\u043e\u0432\u0435\u0440\u0435\u043d\u043d\u044b\u0435 \u0438\u0441\u0442\u043e\u0447\u043d\u0438\u043a\u0438 \u0438 insecure transport.",
    evidence: "A02:2025 - Security Misconfiguration | A04:2025 - Cryptographic Failures",
  },
};

const buildShieldBaseline = securityEvidence => {
  const byId = new Map((securityEvidence || []).map(item => [item.threatId, item]));
  const result = {};

  for (const [componentId, threatIds] of Object.entries(componentThreatIds)) {
    const items = threatIds.map(id => byId.get(id)).filter(Boolean);
    if (items.length === 0) continue;

    const implementedCount = items.filter(item => item.status === "implemented").length;
    const status =
      implementedCount === items.length
        ? "protected"
        : implementedCount > 0
          ? "partial"
          : "none";

    result[componentId] = {
      componentId,
      status,
      controls: unique(items.map(item => item.controlName)).slice(0, 6),
      why: `${S.whyTemplate} ${items.map(item => item.threatId).join(", ")}.`,
      evidence: unique(items.map(item => item.owasp2025)).join(" | "),
    };
  }

  return result;
};

export function ProtectionMap({ moduleId }) {
  void moduleId;
  const [shieldBaseline, setShieldBaseline] = useState(fallbackBaseline);

  useEffect(() => {
    let isMounted = true;
    fetchOwaspSecurityStatus()
      .then(payload => {
        if (!isMounted) return;
        const liveBaseline = buildShieldBaseline(payload?.securityEvidence || []);
        setShieldBaseline(Object.keys(liveBaseline).length ? liveBaseline : fallbackBaseline);
      })
      .catch(() => {
        if (!isMounted) return;
        setShieldBaseline(fallbackBaseline);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const getDetails = componentId => {
    const fromShield = shieldBaseline[componentId];
    if (!fromShield) return null;
    return fromShield;
  };

  return (
    <section className="protection-map">
      <div className="protection-map__header">
        <h3 className="protection-map__title">{S.title}</h3>
        <p className="protection-map__subtitle">{S.subtitle}</p>
      </div>

      <div className="protection-map__grid">
        {systemComponents.map(component => {
          const details = getDetails(component.id);
          const status = details?.status || "none";

          return (
            <article key={component.id} className="protection-map__card">
              <div className="protection-map__cardHeader">
                <div>
                  <h4 className="protection-map__cardTitle">{component.name}</h4>
                  <p className="protection-map__cardDesc">{component.description}</p>
                </div>
                <span className={`protection-map__status protection-map__status--${status}`}>
                  {S[status]}
                </span>
              </div>

              {details ? (
                <div className="protection-map__details">
                  <p className="protection-map__why">{details.why}</p>
                  <div className="protection-map__controls">
                    {(details.controls || []).map(control => (
                      <span key={control} className="protection-map__controlTag">
                        {control}
                      </span>
                    ))}
                  </div>
                  <p className="protection-map__evidence">
                    {S.evidence} {details.evidence}
                  </p>
                </div>
              ) : (
                <p className="protection-map__empty">{S.empty}</p>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
