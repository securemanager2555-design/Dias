import React from 'react';
import { AlertTriangleIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import './HandbookSection.css';

export function HandbookSection({ module }) {
  return (
    <div className="handbook">
      <div>
        <h3 className="handbook__title">Описание атаки</h3>
        <p className="handbook__text">{module.attack.description}</p>
      </div>

      <div className="handbook__impact glass">
        <div className="handbook__impactRow">
          <AlertTriangleIcon className="handbook__impactIcon" />
          <div>
            <h4 className="handbook__impactTitle">Реальный ущерб</h4>
            <p className="handbook__impactText">{module.attack.impact}</p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="handbook__title">Сценарий атаки</h3>
        <div className="handbook__flow">
          {module.attack.flow.map((step, i) => (
            <motion.div
              key={i}
              className="handbook__step"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <span className="handbook__stepBadge">
                {i + 1}. {step}
              </span>
              {i < module.attack.flow.length - 1 && (
                <span className="handbook__stepArrow">→</span>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
