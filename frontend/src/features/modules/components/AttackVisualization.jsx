import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import './AttackVisualization.css';

export function AttackVisualization({ moduleId, isPlaying = true }) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setStep(s => (s + 1) % 4);
    }, 2000);
    return () => clearInterval(interval);
  }, [isPlaying]);
  const visualizations = {
    a01: <AccessControlVisualization step={step} />,
    a02: <CryptoVisualization step={step} />,
    a03: <InjectionVisualization step={step} />,
    a04: <InsecureDesignVisualization step={step} />,
    a05: <MisconfigVisualization step={step} />,
    a06: <VulnerableComponentVisualization step={step} />,
    a07: <AuthFailureVisualization step={step} />,
    a08: <IntegrityVisualization step={step} />,
    a09: <LoggingVisualization step={step} />,
    a10: <SSRFVisualization step={step} />,
  };
  return (
    <div className="attack-viz glass">
      <div className="attack-viz__bg" />
      {visualizations[moduleId] || <DefaultVisualization step={step} />}

      {/* Step indicator */}
      <div className="attack-viz__steps">
        {[0, 1, 2, 3].map(i => (
          <motion.div
            key={i}
            className={`attack-viz__dot ${i === step ? 'attack-viz__dot--active' : ''}`}
            animate={{ scale: i === step ? 1.2 : 1 }}
          />
        ))}
      </div>
    </div>
  );
}

function InjectionVisualization({ step }) {
  const steps = ['Атакующий готовит payload', 'Вредный ввод отправлен', 'Запрос выполнен', 'Данные похищены'];
  return (
    <div className="viz-stage">
      {/* Attacker */}
      <motion.div className="viz-attacker" animate={{ x: step >= 1 ? 20 : 0 }}>
        <div className="viz-node viz-node--danger">
          <span className="viz-node__emoji">H</span>
        </div>
        <p className="viz-label viz-label--danger">Атакующий</p>
      </motion.div>

      {/* Malicious payload */}
      <motion.div
        className="viz-payload"
        initial={{ left: '15%', opacity: 0 }}
        animate={{
          left: step === 0 ? '15%' : step === 1 ? '40%' : step === 2 ? '65%' : '85%',
          opacity: step >= 1 ? 1 : 0,
          scale: step === 2 ? 1.2 : 1,
        }}
        transition={{ duration: 0.5 }}
      >
        <div className="viz-payload__chip">' OR 1=1 --</div>
      </motion.div>

      {/* Server */}
      <div className="viz-server">
        <motion.div
          className="viz-node viz-node--primary"
          animate={{
            borderColor: step === 2 ? '#EF4444' : '#3B82F6',
            boxShadow:
              step === 2
                ? '0 0 30px rgba(239, 68, 68, 0.5)'
                : '0 0 20px rgba(59, 130, 246, 0.3)',
          }}
        >
          <span className="viz-node__emoji">SRV</span>
        </motion.div>
        <p className="viz-label viz-label--primary">Сервер</p>
      </div>

      {/* Database */}
      <div className="viz-database">
        <motion.div
          className="viz-node viz-node--success"
          animate={{
            borderColor: step >= 3 ? '#EF4444' : '#10B981',
            scale: step === 3 ? 1.1 : 1,
          }}
        >
          <span className="viz-node__emoji">DB</span>
        </motion.div>
        <p className="viz-label viz-label--success">База</p>
      </div>

      {/* Data flow particles */}
      {step === 3 &&
        [...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="viz-particle"
            initial={{ right: '15%', top: '50%' }}
            animate={{
              right: ['15%', '85%'],
              top: ['50%', `${40 + i * 5}%`],
              opacity: [1, 0],
            }}
            transition={{ duration: 1, delay: i * 0.1, repeat: Infinity }}
          />
        ))}

      {/* Step label */}
      <motion.p
        key={step}
        className="viz-stepLabel"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {steps[step]}
      </motion.p>
    </div>
  );
}

function AccessControlVisualization({ step }) {
  return (
    <div className="viz-stage">
      {/* User */}
      <motion.div className="viz-attacker" animate={{ x: step >= 1 ? 30 : 0 }}>
        <div className="viz-node viz-node--danger">
          <span className="viz-node__emoji">H</span>
        </div>
      </motion.div>

      {/* Shield barrier */}
      <motion.div
        className="viz-barrier"
        animate={{ opacity: step === 2 ? 0.3 : 1, scale: step === 2 ? 0.9 : 1 }}
      >
        <div className="viz-barrier__line" />
      </motion.div>

      {/* Protected resource */}
      <div className="viz-database">
        <motion.div
          className="viz-node viz-node--success"
          animate={{ borderColor: step >= 3 ? '#EF4444' : '#10B981' }}
        >
          <span className="viz-node__emoji">DATA</span>
        </motion.div>
        <p className="viz-label viz-label--muted">Админ-данные</p>
      </div>

      {/* Bypass arrow */}
      {step >= 2 && (
        <motion.svg
          className="viz-bypass"
          width="200"
          height="100"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
        >
          <motion.path
            d="M 0 50 Q 100 -30 200 50"
            fill="none"
            stroke="#EF4444"
            strokeWidth="2"
            strokeDasharray="5,5"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5 }}
          />
        </motion.svg>
      )}
    </div>
  );
}

function CryptoVisualization({ step }) {
  return (
    <div className="viz-stage viz-stage--center">
      <motion.div
        className="viz-flip"
        animate={{ rotateY: step >= 2 ? 180 : 0 }}
        transition={{ duration: 0.5 }}
      >
        <div
          className={`viz-crypto ${step >= 2 ? 'viz-crypto--danger' : 'viz-crypto--primary'}`}
        >
          <span className="viz-crypto__emoji">{step >= 2 ? 'X' : 'LOCK'}</span>
        </div>
      </motion.div>

      {/* Breaking particles */}
      {step === 2 &&
        [...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="viz-fragment"
            style={{ left: '50%', top: '50%' }}
            initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
            animate={{
              x: (Math.random() - 0.5) * 150,
              y: (Math.random() - 0.5) * 150,
              opacity: 0,
              rotate: Math.random() * 360,
            }}
            transition={{ duration: 0.8 }}
          />
        ))}
    </div>
  );
}

function SSRFVisualization({ step }) {
  return (
    <div className="viz-stage viz-stage--between">
      {/* External attacker */}
      <div className="viz-column">
        <div className="viz-node viz-node--danger">
          <span className="viz-node__emoji">H</span>
        </div>
        <p className="viz-label viz-label--danger">Атакующий</p>
      </div>

      {/* Web server */}
      <div className="viz-column">
        <motion.div
          className="viz-node viz-node--primary"
          animate={{ borderColor: step >= 1 ? '#F59E0B' : '#3B82F6' }}
        >
          <span className="viz-node__emoji">WEB</span>
        </motion.div>
        <p className="viz-label viz-label--primary">Веб-сервер</p>
      </div>

      {/* Internal service */}
      <div className="viz-column">
        <motion.div
          className="viz-node viz-node--success"
          animate={{
            borderColor: step >= 2 ? '#EF4444' : '#10B981',
            scale: step === 3 ? 1.1 : 1,
          }}
        >
          <span className="viz-node__emoji">API</span>
        </motion.div>
        <p className="viz-label viz-label--success">Внутренний API</p>
      </div>

      {/* Request arrows */}
      <motion.div
        className="viz-arrow viz-arrow--first"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: step >= 1 ? 1 : 0 }}
      />
      <motion.div
        className="viz-arrow viz-arrow--second"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: step >= 2 ? 1 : 0 }}
      />
    </div>
  );
}

// Placeholder visualizations for other modules
function InsecureDesignVisualization({ step }) {
  return <DefaultVisualization step={step} icon="DES" label="Небезопасный дизайн" />;
}
function MisconfigVisualization({ step }) {
  return <DefaultVisualization step={step} icon="CFG" label="Ошибки настроек" />;
}
function VulnerableComponentVisualization({ step }) {
  return <DefaultVisualization step={step} icon="PKG" label="Устаревшие компоненты" />;
}
function AuthFailureVisualization({ step }) {
  return <DefaultVisualization step={step} icon="AUTH" label="Сбой аутентификации" />;
}
function IntegrityVisualization({ step }) {
  return <DefaultVisualization step={step} icon="INT" label="Нарушение целостности" />;
}
function LoggingVisualization({ step }) {
  return <DefaultVisualization step={step} icon="LOG" label="Проблемы логирования" />;
}
function DefaultVisualization({ step, icon = 'SEC', label = 'Безопасность' }) {
  return (
    <div className="viz-stage viz-stage--center">
      <motion.div
        className="viz-default"
        animate={{ scale: [1, 1.1, 1], rotate: step * 90 }}
        transition={{ duration: 0.5 }}
      >
        <span className="viz-default__emoji">{icon}</span>
      </motion.div>
      <p className="viz-default__label">
        {label} - Step {step + 1}
      </p>
    </div>
  );
}
