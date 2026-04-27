import React from 'react';
import { motion } from 'framer-motion';
export function AchievementBadge({
  achievement,
  size = 'md',
  showDetails = false
}) {
  const sizeClasses = {
    sm: 'w-10 h-10 text-lg',
    md: 'w-14 h-14 text-2xl',
    lg: 'w-20 h-20 text-4xl'
  };
  return <motion.div className="relative group" initial={{
    scale: 0,
    rotate: -180
  }} animate={{
    scale: 1,
    rotate: 0
  }} transition={{
    type: 'spring',
    stiffness: 200,
    damping: 15,
    delay: Math.random() * 0.2
  }}>
      <motion.div className={`
          ${sizeClasses[size]}
          rounded-full flex items-center justify-center
          ${achievement.isUnlocked ? 'bg-gradient-to-br from-purple-500 to-blue-500 shadow-lg shadow-purple-500/30' : 'bg-slate-800/50 border border-slate-700/50'}
          transition-all duration-300
        `} whileHover={achievement.isUnlocked ? {
      scale: 1.1,
      boxShadow: '0 0 30px rgba(139, 92, 246, 0.5)'
    } : {}}>
        <span className={achievement.isUnlocked ? '' : 'opacity-30 grayscale'}>
          {achievement.icon}
        </span>

        {/* Glow effect for unlocked badges */}
        {achievement.isUnlocked && <motion.div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20" animate={{
        scale: [1, 1.2, 1],
        opacity: [0.5, 0, 0.5]
      }} transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut'
      }} />}
      </motion.div>

      {/* Tooltip */}
      {showDetails && <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
          <div className="glass rounded-lg px-3 py-2 text-center whitespace-nowrap">
            <p className="text-sm font-semibold text-white">
              {achievement.name}
            </p>
            <p className="text-xs text-slate-400">{achievement.description}</p>
            {!achievement.isUnlocked && <p className="text-xs text-purple-400 mt-1">🔒 Locked</p>}
          </div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800/80" />
        </div>}
    </motion.div>;
}
export function AchievementUnlockAnimation({
  achievement
}) {
  return <motion.div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none" initial={{
    opacity: 0
  }} animate={{
    opacity: 1
  }} exit={{
    opacity: 0
  }}>
      {/* Backdrop */}
      <motion.div className="absolute inset-0 bg-black/50 backdrop-blur-sm" initial={{
      opacity: 0
    }} animate={{
      opacity: 1
    }} />

      {/* Badge animation */}
      <motion.div className="relative" initial={{
      scale: 0,
      rotate: -180
    }} animate={{
      scale: [0, 1.5, 1],
      rotate: [180, 0, 0]
    }} transition={{
      duration: 0.8,
      times: [0, 0.6, 1],
      ease: 'easeOut'
    }}>
        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-2xl shadow-purple-500/50">
          <span className="text-6xl">{achievement.icon}</span>
        </div>

        {/* Confetti particles */}
        {[...Array(20)].map((_, i) => <motion.div key={i} className="absolute w-2 h-2 rounded-full" style={{
        background: ['#8B5CF6', '#3B82F6', '#06B6D4', '#EC4899', '#10B981'][i % 5],
        left: '50%',
        top: '50%'
      }} initial={{
        x: 0,
        y: 0,
        opacity: 1
      }} animate={{
        x: (Math.random() - 0.5) * 300,
        y: (Math.random() - 0.5) * 300,
        opacity: 0,
        scale: [1, 1.5, 0]
      }} transition={{
        duration: 1,
        delay: 0.3 + Math.random() * 0.2,
        ease: 'easeOut'
      }} />)}
      </motion.div>

      {/* Text */}
      <motion.div className="absolute mt-48 text-center" initial={{
      opacity: 0,
      y: 20
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      delay: 0.5
    }}>
        <p className="text-2xl font-bold gradient-text">
          Achievement Unlocked!
        </p>
        <p className="text-xl text-white mt-2">{achievement.name}</p>
        <p className="text-slate-400">{achievement.description}</p>
      </motion.div>
    </motion.div>;
}
