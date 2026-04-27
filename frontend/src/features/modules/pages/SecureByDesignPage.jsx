import React, { useState } from 'react';
import { owaspModules } from '../data/owaspModules';
import { SecureByDesignTimeline } from '../components/SecureByDesignTimeline';
import './SecureByDesignPage.css';

export function SecureByDesignPage() {
  const [moduleId, setModuleId] = useState(owaspModules[0]?.id || '');
  const module = owaspModules.find(item => item.id === moduleId);

  return (
    <div className="sbd-page">
      <div className="sbd-page__header">
        <h1>Secure by Design</h1>
        <p>Принципы проектирования безопасных систем и их применение.</p>
      </div>

      <div className="sbd-page__select">
        <label>
          Модуль
          <select value={moduleId} onChange={e => setModuleId(e.target.value)}>
            {owaspModules.map(item => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {module && (
        <div className="sbd-page__content glass">
          <h2>{module.name}</h2>
          <p>{module.description}</p>
          <SecureByDesignTimeline module={module} />
        </div>
      )}
    </div>
  );
}
