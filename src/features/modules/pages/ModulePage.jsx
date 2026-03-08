import React, { useState } from 'react';
import { owaspModules } from '../data/owaspModules';
import { AttackVisualization } from '../components/AttackVisualization';
import { SecurityDiagram } from '../components/SecurityDiagram';
import { HandbookSection } from '../components/HandbookSection';
import { ImplementationSection } from '../components/ImplementationSection';
import './ModulePage.css';

export function ModulePage({ moduleId, modules = owaspModules, onNavigate }) {
  const moduleData = modules && modules.length ? modules : owaspModules;
  const module = moduleData.find(item => item.id === moduleId || item.slug === moduleId);
  const moduleTitle = module?.name || module?.title || 'Модуль';
  const moduleTagline = module?.tagline || module?.description || '';
  const [copied, setCopied] = useState(null);

  const handleCopy = (code, type) => {
    navigator.clipboard.writeText(code);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  if (!module) {
    return (
      <div className="module-page">
        <h1>Модуль не найден</h1>
        <button onClick={() => onNavigate('/modules')}>Назад к каталогу</button>
      </div>
    );
  }

  return (
    <div className="module-page">
      <div className="module-page__header">
        <button className="module-page__back" onClick={() => onNavigate('/modules')}>
          ← Назад к модулям
        </button>
        <h1>{moduleTitle}</h1>
        <p>{moduleTagline}</p>
      </div>

      <div className="module-page__grid">
        <div className="module-page__card glass">
          <h2>Визуализация атаки</h2>
          <AttackVisualization moduleId={module.id} />
        </div>
        <div className="module-page__card glass">
          <h2>Архитектура и зоны риска</h2>
          <SecurityDiagram />
        </div>
      </div>

      <div className="module-page__section glass">
        <HandbookSection module={module} />
      </div>

      <div className="module-page__section glass">
        <ImplementationSection module={module} copied={copied} handleCopy={handleCopy} />
      </div>
    </div>
  );
}
