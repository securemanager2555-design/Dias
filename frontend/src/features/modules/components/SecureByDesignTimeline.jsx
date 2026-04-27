import React from 'react';
import './SecureByDesignTimeline.css';

const stages = [
  {
    id: 'Design',
    title: 'Design',
    titleRu: 'Проектирование',
    description: 'Моделирование угроз и правила безопасности.',
  },
  {
    id: 'Build',
    title: 'Build',
    titleRu: 'Разработка',
    description: 'Валидация, безопасный код, зависимости.',
  },
  {
    id: 'Prevent',
    title: 'Prevent',
    titleRu: 'Предотвращение',
    description: 'Блокировка атак до исполнения.',
  },
  {
    id: 'Detect',
    title: 'Detect',
    titleRu: 'Обнаружение',
    description: 'Логи, алерты и мониторинг.',
  },
  {
    id: 'Respond',
    title: 'Respond',
    titleRu: 'Реагирование',
    description: 'Планирование ответа и действия.',
  },
  {
    id: 'Recover',
    title: 'Recover',
    titleRu: 'Восстановление',
    description: 'Бэкапы и возврат к норме.',
  },
];

export function SecureByDesignTimeline({ module }) {
  const activeStages = new Set(module.secureByDesign || []);

  return (
    <section className="sbd-timeline">
      <h3 className="sbd-timeline__title">Secure by Design: этапы</h3>
      <p className="sbd-timeline__subtitle">
        Для этого модуля важны следующие этапы и действия.
      </p>

      <div className="sbd-timeline__list">
        {stages.map(stage => {
          const isActive = activeStages.has(stage.id);
          return (
            <div
              key={stage.id}
              className={`sbd-timeline__item ${isActive ? 'sbd-timeline__item--active' : ''}`}
            >
              <div className="sbd-timeline__badge">{stage.title}</div>
              <div className="sbd-timeline__content">
                <h4 className="sbd-timeline__itemTitle">{stage.titleRu}</h4>
                <p className="sbd-timeline__itemText">{stage.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
