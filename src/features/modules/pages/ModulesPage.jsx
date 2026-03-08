import React, { useMemo, useState } from 'react';
import { owaspModules } from '../data/owaspModules';
import { ModuleCard } from '../components/ModuleCard';
import './ModulesPage.css';

export function ModulesPage({ modules = owaspModules, onNavigate }) {
  const [query, setQuery] = useState('');
  const moduleData = modules && modules.length ? modules : owaspModules;
  const [stage, setStage] = useState('Все');
  const stages = useMemo(
    () => ['Все', ...new Set(moduleData.map(module => module.lifecycleStage))],
    [moduleData]
  );

  const filtered = moduleData.filter(module => {
    const matchesStage = stage === '\u0412\u0441\u0435' || module.lifecycleStage === stage;
    const name = (module.name || module.title || '').toLowerCase();
    const shortName = (module.shortName || module.title || '').toLowerCase();
    const matchesQuery =
      name.includes(query.toLowerCase()) ||
      shortName.includes(query.toLowerCase());
    return matchesStage && matchesQuery;
  });

  return (
    <div className="modules-page">
      <div className="modules-page__header">
        <h1>Каталог модулей OWASP</h1>
        <p>
          Полный список уязвимостей и контрмер. Открой модуль, чтобы изучить
          детали.
        </p>
      </div>

      <div className="modules-page__filters">
        <input
          type="text"
          placeholder="Поиск по названию..."
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <div className="modules-page__stage">
          {stages.map(item => (
            <button
              key={item}
              className={stage === item ? 'is-active' : ''}
              onClick={() => setStage(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="modules-page__grid">
        {filtered.map((module, index) => (
          <ModuleCard
            key={module.id}
            module={module}
            index={index}
            onClick={() => onNavigate(`/modules/${module.id}`)}
          />
        ))}
      </div>
    </div>
  );
}
