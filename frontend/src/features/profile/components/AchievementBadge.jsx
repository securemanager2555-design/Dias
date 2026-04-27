import React from 'react';
import { motion } from 'framer-motion';
import './AchievementBadge.css';

export function AchievementBadge({ achievement, size = 'md', showDetails = false }) {
  const sizeClass =
    size === 'sm'
      ? 'achievement-badge__icon--sm'
      : size === 'lg'
      ? 'achievement-badge__icon--lg'
      : 'achievement-badge__icon--md';

  return (
    <motion.div
      className="achievement-badge"
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{
        type: 'spring',
        stiffness: 200,
        damping: 15,
        delay: Math.random() * 0.2,
      }}
    >
      <motion.div
        className={`achievement-badge__icon ${sizeClass} ${
          achievement.isUnlocked ? 'achievement-badge__icon--unlocked' : 'achievement-badge__icon--locked'
        }`}
        whileHover={
          achievement.isUnlocked
            ? { scale: 1.1, boxShadow: '0 0 30px rgba(139, 92, 246, 0.5)' }
            : {}
        }
      >
        <span className={achievement.isUnlocked ? '' : 'achievement-badge__icon--dim'}>
          {achievement.icon}
        </span>

        {/* Glow effect for unlocked badges */}
        {achievement.isUnlocked && (
          <motion.div
            className="achievement-badge__glow"
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
      </motion.div>

      {/* Tooltip */}
      {showDetails && (
        <div className="achievement-badge__tooltip">
          <div className="achievement-badge__tooltipCard glass">
            <p className="achievement-badge__tooltipTitle">{achievement.name}</p>
            <p className="achievement-badge__tooltipText">{achievement.description}</p>
            {!achievement.isUnlocked && (
              <p className="achievement-badge__tooltipLocked">Заблокировано</p>
            )}
          </div>
          <div className="achievement-badge__tooltipArrow" />
        </div>
      )}
    </motion.div>
  );
}

export function AchievementUnlockAnimation({ achievement }) {
  return (
    <motion.div
      className="achievement-unlock"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <motion.div
        className="achievement-unlock__backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      />

      {/* Badge animation */}
      <motion.div
        className="achievement-unlock__badge"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: [0, 1.5, 1], rotate: [180, 0, 0] }}
        transition={{ duration: 0.8, times: [0, 0.6, 1], ease: 'easeOut' }}
      >
        <div className="achievement-unlock__badgeIcon">
          <span className="achievement-unlock__badgeEmoji">{achievement.icon}</span>
        </div>

        {/* Confetti particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="achievement-unlock__confetti"
            style={{
              background: ['#8B5CF6', '#3B82F6', '#06B6D4', '#EC4899', '#10B981'][i % 5],
              left: '50%',
              top: '50%',
            }}
            initial={{ x: 0, y: 0, opacity: 1 }}
            animate={{
              x: (Math.random() - 0.5) * 300,
              y: (Math.random() - 0.5) * 300,
              opacity: 0,
              scale: [1, 1.5, 0],
            }}
            transition={{
              duration: 1,
              delay: 0.3 + Math.random() * 0.2,
              ease: 'easeOut',
            }}
          />
        ))}
      </motion.div>

      {/* Text */}
      <motion.div
        className="achievement-unlock__text"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <p className="achievement-unlock__title gradient-text">Достижение открыто!</p>
        <p className="achievement-unlock__name">{achievement.name}</p>
        <p className="achievement-unlock__desc">{achievement.description}</p>
      </motion.div>
    </motion.div>
  );
}
