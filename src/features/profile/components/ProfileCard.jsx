import React from 'react';
import { motion } from 'framer-motion';
import { InfoIcon, ShieldIcon } from 'lucide-react';
import { logoutUser } from '../../../api/auth';
import './ProfileCard.css';

export function ProfileCard({ onNavigate, user, onLogout }) {
  const handleLogout = async () => {
    await logoutUser();
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <aside className="profile-card">
      <div className="profile-card__panel glass-strong">
        <div className="profile-card__header">
          <div>
            <p className="profile-card__eyebrow">Профиль и доступ</p>
            <h3 className="profile-card__title">
              {user?.displayName || user?.email || "\u0413\u043e\u0441\u0442\u044c"}
            </h3>
          </div>
          <div className="profile-card__brand">Secure by Design</div>
        </div>

        {user ? (
          <>
            <motion.button
              className="profile-card__cta"
              onClick={() => onNavigate && onNavigate('/account')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {'\u041f\u0440\u043e\u0444\u0438\u043b\u044c'}
            </motion.button>
            <button className="profile-card__logout" onClick={handleLogout}>
              {'\u0412\u044b\u0439\u0442\u0438'}
            </button>
          </>
        ) : (
          <motion.button
            className="profile-card__cta"
            onClick={() => onNavigate && onNavigate('/auth')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {'\u0412\u043e\u0439\u0442\u0438 / \u0420\u0435\u0433\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u044f'}
          </motion.button>
        )}

        <div className="profile-card__security glass">
          <div className="profile-card__securityHeader">
            <ShieldIcon className="profile-card__securityIcon" />
            Безопасность входа
          </div>
          <ul className="profile-card__securityList">
            <li>Двухфакторная проверка (MFA)</li>
            <li>Rate limiting против перебора</li>
            <li>Логирование подозрительных попыток</li>
          </ul>
        </div>

        <div className="profile-card__info glass">
          <div className="profile-card__infoHeader">
            <InfoIcon className="profile-card__infoIcon" />
            Краткая информация
          </div>
          <p className="profile-card__infoText">
            После входа здесь появится прогресс обучения, рекомендации и история
            активности по модулям безопасности.
          </p>
        </div>
      </div>
    </aside>
  );
}
