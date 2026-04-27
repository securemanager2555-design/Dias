import React from 'react';
import { securityControls } from '../data/securityControls';
import './ControlsPage.css';

export function ControlsPage() {
  return (
    <div className="controls-page">
      <div className="controls-page__header">
        <h1>Каталог контрмер</h1>
        <p>Базовые практики и технические меры защиты.</p>
      </div>

      <div className="controls-page__grid">
        {securityControls.map(control => (
          <article key={control.id} className="controls-page__card glass">
            <div className="controls-page__cardHeader">
              <h3>{control.name}</h3>
              <span className="controls-page__badge">{control.id}</span>
            </div>
            <p>{control.description}</p>
            <code>{control.codeSnippet}</code>
          </article>
        ))}
      </div>
    </div>
  );
}
