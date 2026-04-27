import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangleIcon,
  BeakerIcon,
  LockIcon,
  ShieldCheckIcon,
  ShieldIcon,
  ZapIcon,
} from "lucide-react";
import { ModuleCard } from "../../modules/components/ModuleCard";
import { owaspModules } from "../../modules/data/owaspModules";
import { fetchOwaspSecurityStatus } from "../../../api/security";
import "./LabDashboard.css";

export function LabDashboard({
  modules = owaspModules,
  onModuleSelect,
  user,
  onNavigate,
}) {
  const [activeStage, setActiveStage] = useState("Все");
  const [shieldData, setShieldData] = useState(null);
  const moduleData = modules && modules.length ? modules : owaspModules;

  const lifecycleStages = useMemo(() => {
    const stages = Array.from(new Set(moduleData.map(module => module.lifecycleStage)));
    return ["Все", ...stages];
  }, [moduleData]);

  const filteredModules =
    activeStage === "Все"
      ? moduleData
      : moduleData.filter(module => module.lifecycleStage === activeStage);

  useEffect(() => {
    if (!user) {
      setShieldData(null);
      return;
    }

    let isMounted = true;
    fetchOwaspSecurityStatus()
      .then(payload => {
        if (isMounted) setShieldData(payload);
      })
      .catch(() => {
        if (isMounted) setShieldData(null);
      });

    return () => {
      isMounted = false;
    };
  }, [user]);

  const top10Total = Array.isArray(shieldData?.top10) ? shieldData.top10.length : 10;
  const top10Implemented = Array.isArray(shieldData?.top10)
    ? shieldData.top10.filter(item => item.status === "implemented").length
    : 0;
  const threatsTotal = Array.isArray(shieldData?.securityEvidence)
    ? shieldData.securityEvidence.length
    : 0;
  const threatsImplemented = Array.isArray(shieldData?.securityEvidence)
    ? shieldData.securityEvidence.filter(item => item.status === "implemented").length
    : 0;

  const summaryCards = [
    {
      id: "coverage",
      icon: ShieldCheckIcon,
      value: user ? `${top10Implemented}/${top10Total}` : "—",
      title: "Покрытие OWASP Top 10",
      description: "Сколько категорий OWASP Top 10 уже закрыто контролями проекта.",
      actionLabel: "Открыть контрмеры",
      route: "/controls",
      requiresAuth: false,
    },
    {
      id: "threats",
      icon: ShieldIcon,
      value: user ? (threatsTotal ? `${threatsImplemented}/${threatsTotal}` : "0/0") : "—",
      title: "Закрытые угрозы",
      description: "Связь угроз из таблицы с конкретными блоками защитного кода.",
      actionLabel: "Открыть карту угроз",
      route: "/security",
      requiresAuth: true,
    },
    {
      id: "blocked",
      icon: ZapIcon,
      value: user ? `${shieldData?.counters?.blockedRequests24h || 0}` : "—",
      title: "Блокировок за 24ч",
      description: "Срабатывания rate limit, CSRF и других блокирующих контролей.",
      actionLabel: "Открыть события Shield",
      route: "/security",
      requiresAuth: true,
    },
    {
      id: "failed",
      icon: AlertTriangleIcon,
      value: user ? `${shieldData?.counters?.failedLogins24h || 0}` : "—",
      title: "Неудачных входов за 24ч",
      description: "Оперативная метрика для Authentication Failures и brute force.",
      actionLabel: "Проверить аутентификацию",
      route: "/security",
      requiresAuth: true,
    },
  ];

  const handleCardAction = card => {
    if (card.requiresAuth && !user) {
      onNavigate?.("/auth");
      return;
    }
    onNavigate?.(card.route);
  };

  return (
    <div className="lab-dashboard">
      <div className="lab-dashboard__bg animated-bg" />
      <div className="lab-dashboard__overlay" />

      <div className="lab-dashboard__particles">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="lab-dashboard__particle"
            style={{
              background: ["#8B5CF6", "#3B82F6", "#06B6D4"][i % 3],
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0],
            }}
            transition={{
              duration: 5 + Math.random() * 5,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>

      <div className="lab-dashboard__content">
        <motion.header
          className="lab-dashboard__header"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="lab-dashboard__hero">
            <motion.div
              className="lab-dashboard__heroIcon"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <BeakerIcon className="lab-dashboard__heroIconSvg" />
            </motion.div>
            <div>
              <h1 className="lab-dashboard__title">
                <span className="gradient-text">Secure by Design</span>
              </h1>
              <p className="lab-dashboard__subtitle">
                OWASP Top 10 — практический курс по безопасности приложений
              </p>
            </div>
          </div>

          <motion.p
            className="lab-dashboard__lead"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Здесь собраны типовые уязвимости из OWASP Top 10 и показано, как они
            возникают, чем опасны и как их предотвращать на практике.
          </motion.p>

          <motion.div
            className="lab-dashboard__stats"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {summaryCards.map(card => {
              const Icon = card.icon;
              const isLocked = card.requiresAuth && !user;
              return (
                <div
                  key={card.id}
                  className={`lab-dashboard__stat glass ${isLocked ? "lab-dashboard__stat--locked" : ""}`}
                >
                  <div className="lab-dashboard__statTop">
                    <Icon className="lab-dashboard__statIcon lab-dashboard__statIcon--cyan" />
                    <strong className="lab-dashboard__statValue">{card.value}</strong>
                    {isLocked ? <LockIcon className="lab-dashboard__lockIcon" /> : null}
                  </div>
                  <div className="lab-dashboard__statTitle">{card.title}</div>
                  <p className="lab-dashboard__statText">{card.description}</p>
                  <button
                    className="lab-dashboard__statAction"
                    onClick={() => handleCardAction(card)}
                  >
                    {isLocked ? "Войти для доступа" : card.actionLabel}
                  </button>
                </div>
              );
            })}
          </motion.div>
        </motion.header>

        <div className="lab-dashboard__filters">
          <h2 className="lab-dashboard__filtersTitle">Этапы Secure by Design</h2>
          <div className="lab-dashboard__filterList">
            {lifecycleStages.map(stage => (
              <button
                key={stage}
                onClick={() => setActiveStage(stage)}
                className={`lab-dashboard__filter ${
                  activeStage === stage ? "lab-dashboard__filter--active" : ""
                }`}
              >
                {stage}
              </button>
            ))}
          </div>
        </div>

        <motion.section
          className="lab-dashboard__gridSection"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="lab-dashboard__gridHeader">
            <div className="lab-dashboard__pulseDot" />
            <h2 className="lab-dashboard__gridTitle">Активные модули лаборатории</h2>
          </div>

          <div className="lab-dashboard__grid">
            {filteredModules.map((module, index) => (
              <ModuleCard
                key={module.id}
                module={module}
                index={index}
                onClick={() => onModuleSelect(module.id)}
              />
            ))}
          </div>
        </motion.section>

        <motion.footer
          className="lab-dashboard__footer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <p className="lab-dashboard__footerText">
            Нажми на любой модуль, чтобы открыть подробности, примеры и защитные
            меры.
          </p>
          <p className="lab-dashboard__credits">
            Дипломный проект: Садыбеков Диас и Илья Трубников
          </p>
        </motion.footer>
      </div>
    </div>
  );
}
