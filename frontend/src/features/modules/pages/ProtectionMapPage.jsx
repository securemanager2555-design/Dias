import React, { useState } from "react";
import { owaspModules } from "../data/owaspModules";
import { ProtectionMap } from "../components/ProtectionMap";
import "./ProtectionMapPage.css";

export function ProtectionMapPage() {
  const [moduleId, setModuleId] = useState(owaspModules[0]?.id || "");

  return (
    <div className="protection-page">
      <div className="protection-page__header">
        <h1>Карта защиты</h1>
        <p>Выбери модуль и посмотри, какие части системы защищены.</p>
      </div>

      <div className="protection-page__select">
        <label>
          Модуль
          <select value={moduleId} onChange={e => setModuleId(e.target.value)}>
            {owaspModules.map(module => (
              <option key={module.id} value={module.id}>
                {module.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <ProtectionMap moduleId={moduleId} />
    </div>
  );
}
