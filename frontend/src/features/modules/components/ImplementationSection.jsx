import React from 'react';
import { motion } from 'framer-motion';
import { CheckIcon, CopyIcon, XIcon } from 'lucide-react';
import { securityControls } from '../data/securityControls';
import { ProtectionMap } from './ProtectionMap';
import { SecureByDesignTimeline } from './SecureByDesignTimeline';
import './ImplementationSection.css';

export function ImplementationSection({ module, copied, handleCopy }) {
  const controls = module.controlIds
    .map(id => securityControls.find(control => control.id === id))
    .filter(Boolean);

  return (
    <div className="implementation">
      <div className="implementation__grid">
        <div>
          <div className="implementation__codeHeader">
            <h4 className="implementation__codeTitle implementation__codeTitle--danger">
              <XIcon className="implementation__codeIcon" /> Уязвимый код
            </h4>
            <button
              onClick={() => handleCopy(module.examples.vulnerable, 'vulnerable')}
              className={`copy-button ${copied === 'vulnerable' ? 'copy-button--active' : ''}`}
            >
              {copied === 'vulnerable' ? (
                <CheckIcon className="copy-button__icon" />
              ) : (
                <CopyIcon className="copy-button__icon" />
              )}
              {copied === 'vulnerable' ? 'Скопировано' : 'Копировать'}
            </button>
          </div>
          <pre className="code-block implementation__codeBlock implementation__codeBlock--danger">
            <code>{module.examples.vulnerable}</code>
          </pre>
        </div>

        <div>
          <div className="implementation__codeHeader">
            <h4 className="implementation__codeTitle implementation__codeTitle--success">
              <CheckIcon className="implementation__codeIcon" /> Безопасный код
            </h4>
            <button
              onClick={() => handleCopy(module.examples.secure, 'secure')}
              className={`copy-button ${copied === 'secure' ? 'copy-button--active' : ''}`}
            >
              {copied === 'secure' ? (
                <CheckIcon className="copy-button__icon" />
              ) : (
                <CopyIcon className="copy-button__icon" />
              )}
              {copied === 'secure' ? 'Скопировано' : 'Копировать'}
            </button>
          </div>
          <pre className="code-block implementation__codeBlock implementation__codeBlock--success">
            <code>{module.examples.secure}</code>
          </pre>
        </div>
      </div>

      <div className="implementation__panel glass">
        <h4 className="implementation__panelTitle">Пояснение</h4>
        <p className="implementation__panelText">{module.examples.explanation}</p>
      </div>

      <div className="implementation__panel glass">
        <h3 className="implementation__panelHeader">Контрмеры и практики</h3>
        <div className="implementation__controls">
          {controls.map(control => (
            <div key={control.id} className="implementation__control">
              <div className="implementation__controlRow">
                <div>
                  <p className="implementation__controlTitle">{control.name}</p>
                  <p className="implementation__controlText">{control.description}</p>
                </div>
                <code className="implementation__controlCode">{control.codeSnippet}</code>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="implementation__defenses">
        <h3 className="implementation__panelHeader">Стратегии защиты</h3>
        {module.defense.strategies.map((defense, i) => (
          <motion.div
            key={i}
            className="implementation__defenseCard glass"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="implementation__defenseIndex">
              <span className="implementation__defenseIndexText">{i + 1}</span>
            </div>
            <p className="implementation__defenseText">{defense}</p>
          </motion.div>
        ))}
      </div>

      <div className="implementation__panel glass">
        <h3 className="implementation__panelHeader">Связанные фрагменты</h3>
        <div className="implementation__codeLinks">
          {module.codeLinks.map(link => (
            <div key={link.title} className="implementation__codeLink">
              <div className="implementation__codeLinkHeader">
                <div>
                  <p className="implementation__codeLinkTitle">{link.title}</p>
                  <p className="implementation__codeLinkPath">{link.file}</p>
                </div>
                <button
                  onClick={() => handleCopy(link.snippet, link.title)}
                  className={`copy-button ${copied === link.title ? 'copy-button--active' : ''}`}
                >
                  {copied === link.title ? (
                    <CheckIcon className="copy-button__icon" />
                  ) : (
                    <CopyIcon className="copy-button__icon" />
                  )}
                  {copied === link.title ? 'Скопировано' : 'Копировать'}
                </button>
              </div>
              <pre className="code-block implementation__codeBlock">
                <code>{link.snippet}</code>
              </pre>
            </div>
          ))}
        </div>
      </div>

      <ProtectionMap moduleId={module.id} />
      <SecureByDesignTimeline module={module} />
    </div>
  );
}
