import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XIcon, BookOpenIcon, CodeIcon } from 'lucide-react';
import { HandbookSection } from './HandbookSection';
import { ImplementationSection } from './ImplementationSection';
import './ModuleDetail.css';

export function ModuleDetail({ module, onClose }) {
  const [viewMode, setViewMode] = useState('handbook');
  const [copied, setCopied] = useState(null);
  const Icon = module.icon;

  const difficultyLabel =
    module.difficulty === 'Easy'
      ? 'Легко'
      : module.difficulty === 'Medium'
      ? 'Средне'
      : 'Сложно';

  const riskLabel =
    module.riskLevel === 'Critical'
      ? 'Критический'
      : module.riskLevel === 'High'
      ? 'Высокий'
      : 'Средний';

  const riskClass =
    module.riskLevel === 'Critical'
      ? 'module-detail__risk--critical'
      : module.riskLevel === 'High'
      ? 'module-detail__risk--high'
      : 'module-detail__risk--medium';

  const handleCopy = (code, type) => {
    navigator.clipboard.writeText(code);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <motion.div className="module-detail" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div className="module-detail__backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose} />

      <motion.div
        className="module-detail__modal glass-strong"
        onClick={event => event.stopPropagation()}
        initial={{ scale: 0.9, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 50 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      >
        <div
          className="module-detail__header"
          style={{ background: `linear-gradient(135deg, ${module.color}15 0%, transparent 100%)` }}
        >
          <button onClick={onClose} className="module-detail__close">
            <XIcon className="module-detail__closeIcon" />
          </button>

          <div className="module-detail__headerContent">
            <motion.div
              className="module-detail__icon"
              style={{ backgroundColor: `${module.color}20`, border: `2px solid ${module.color}` }}
              initial={{ rotate: -10, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: 'spring', delay: 0.1 }}
            >
              <Icon className="module-detail__iconSvg" style={{ color: module.color }} />
            </motion.div>

            <div className="module-detail__headerText">
              <h2 className="module-detail__title">{module.name}</h2>
              <p className="module-detail__tagline">{module.tagline}</p>
              <div className="module-detail__badges">
                <span className="module-detail__badge" style={{ backgroundColor: `${module.color}20`, color: module.color }}>
                  {difficultyLabel}
                </span>
                <span className={`module-detail__badge module-detail__risk ${riskClass}`}>
                  {riskLabel} риск
                </span>
                <span className="module-detail__badge module-detail__stage">{module.lifecycleStage}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="module-detail__tabs">
          <button
            onClick={() => setViewMode('handbook')}
            className={`module-detail__tab ${viewMode === 'handbook' ? 'module-detail__tab--active' : ''}`}
          >
            <BookOpenIcon className="module-detail__tabIcon" />
            Справочник
            {viewMode === 'handbook' && <motion.div className="module-detail__tabIndicator" layoutId="activeView" />}
          </button>
          <button
            onClick={() => setViewMode('implementation')}
            className={`module-detail__tab ${viewMode === 'implementation' ? 'module-detail__tab--active' : ''}`}
          >
            <CodeIcon className="module-detail__tabIcon" />
            Реализация
            {viewMode === 'implementation' && (
              <motion.div className="module-detail__tabIndicator" layoutId="activeView" />
            )}
          </button>
        </div>

        <div className="module-detail__content">
          <AnimatePresence mode="wait">
            <motion.div
              key={viewMode}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {viewMode === 'handbook' ? (
                <HandbookSection module={module} />
              ) : (
                <ImplementationSection module={module} copied={copied} handleCopy={handleCopy} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
