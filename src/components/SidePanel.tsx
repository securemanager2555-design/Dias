import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserIcon, ShieldIcon, TrophyIcon, FlameIcon, ChevronLeftIcon, ChevronRightIcon, CheckCircleIcon } from 'lucide-react';
import { AchievementBadge } from './AchievementBadge';
import { achievements, owaspModules, userProgress } from '../data/owaspModules';
type Role = 'admin' | 'user';
type SidePanelProps = {
  isOpen: boolean;
  onToggle: () => void;
};
export function SidePanel({
  isOpen,
  onToggle
}: SidePanelProps) {
  const [role, setRole] = useState<Role>('user');
  const [isFlipping, setIsFlipping] = useState(false);
  const completedModules = owaspModules.filter(m => m.isCompleted).length;
  const totalProgress = Math.round(owaspModules.reduce((acc, m) => acc + m.completionPercentage, 0) / owaspModules.length);
  const handleRoleSwitch = () => {
    setIsFlipping(true);
    setTimeout(() => {
      setRole(r => r === 'admin' ? 'user' : 'admin');
      setIsFlipping(false);
    }, 300);
  };
  return <>
      {/* Toggle button */}
      <motion.button className="fixed top-4 right-4 z-50 w-10 h-10 rounded-xl glass flex items-center justify-center text-slate-300 hover:text-white transition-colors lg:hidden" onClick={onToggle} whileTap={{
      scale: 0.95
    }}>
        {isOpen ? <ChevronRightIcon className="w-5 h-5" /> : <ChevronLeftIcon className="w-5 h-5" />}
      </motion.button>

      {/* Backdrop for mobile */}
      <AnimatePresence>
        {isOpen && <motion.div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden" initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} exit={{
        opacity: 0
      }} onClick={onToggle} />}
      </AnimatePresence>

      {/* Panel */}
      <motion.aside className="fixed top-0 right-0 h-full w-80 glass-strong z-50 overflow-y-auto" initial={{
      x: '100%'
    }} animate={{
      x: isOpen ? 0 : '100%'
    }} transition={{
      type: 'spring',
      damping: 25,
      stiffness: 200
    }}>
        <div className="p-6 space-y-6">
          {/* Role Switcher */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Current Role
            </h3>
            <motion.div className="relative perspective-1000" style={{
            transformStyle: 'preserve-3d'
          }}>
              <motion.button className="w-full p-4 rounded-xl glass flex items-center gap-4 transition-all" onClick={handleRoleSwitch} animate={{
              rotateY: isFlipping ? 180 : 0
            }} transition={{
              duration: 0.3
            }} whileHover={{
              scale: 1.02
            }} whileTap={{
              scale: 0.98
            }}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${role === 'admin' ? 'bg-purple-500/20 border border-purple-500/50' : 'bg-blue-500/20 border border-blue-500/50'}`}>
                  {role === 'admin' ? <ShieldIcon className="w-6 h-6 text-purple-400" /> : <UserIcon className="w-6 h-6 text-blue-400" />}
                </div>
                <div className="text-left flex-1">
                  <p className="font-semibold text-white capitalize">{role}</p>
                  <p className="text-xs text-slate-400">
                    {role === 'admin' ? 'Full access' : 'Limited access'}
                  </p>
                </div>
                <div className="text-xs text-slate-500">Click to switch</div>
              </motion.button>
            </motion.div>
          </div>

          {/* Overall Progress */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Overall Progress
            </h3>
            <div className="glass rounded-xl p-4">
              <div className="flex items-center justify-center mb-4">
                <div className="relative w-28 h-28">
                  {/* Background circle */}
                  <svg className="w-full h-full -rotate-90">
                    <circle cx="56" cy="56" r="48" fill="none" stroke="rgba(148, 163, 184, 0.1)" strokeWidth="8" />
                    <motion.circle cx="56" cy="56" r="48" fill="none" stroke="url(#progressGradient)" strokeWidth="8" strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 48}`} initial={{
                    strokeDashoffset: 2 * Math.PI * 48
                  }} animate={{
                    strokeDashoffset: 2 * Math.PI * 48 * (1 - totalProgress / 100)
                  }} transition={{
                    duration: 1.5,
                    ease: 'easeOut'
                  }} />
                    <defs>
                      <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#8B5CF6" />
                        <stop offset="100%" stopColor="#3B82F6" />
                      </linearGradient>
                    </defs>
                  </svg>
                  {/* Center text */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <motion.span className="text-3xl font-bold gradient-text" initial={{
                      opacity: 0
                    }} animate={{
                      opacity: 1
                    }}>
                        {totalProgress}%
                      </motion.span>
                      <p className="text-xs text-slate-500">Complete</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="glass rounded-lg p-2">
                  <p className="text-lg font-bold text-white">
                    {completedModules}/10
                  </p>
                  <p className="text-xs text-slate-400">Modules</p>
                </div>
                <div className="glass rounded-lg p-2">
                  <p className="text-lg font-bold text-white flex items-center justify-center gap-1">
                    <FlameIcon className="w-4 h-4 text-orange-400" />
                    {userProgress.currentStreak}
                  </p>
                  <p className="text-xs text-slate-400">Day Streak</p>
                </div>
              </div>
            </div>
          </div>

          {/* Achievements */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <TrophyIcon className="w-4 h-4" />
              Achievements
            </h3>
            <div className="glass rounded-xl p-4">
              <div className="grid grid-cols-3 gap-3">
                {achievements.map(achievement => <AchievementBadge key={achievement.id} achievement={achievement} size="md" showDetails />)}
              </div>
              <p className="text-xs text-slate-500 text-center mt-3">
                {achievements.filter(a => a.isUnlocked).length}/
                {achievements.length} unlocked
              </p>
            </div>
          </div>

          {/* Module Checklist */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Module Checklist
            </h3>
            <div className="glass rounded-xl p-3 space-y-1 max-h-48 overflow-y-auto">
              {owaspModules.map((module, i) => <motion.div key={module.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-800/50 transition-colors" initial={{
              opacity: 0,
              x: -20
            }} animate={{
              opacity: 1,
              x: 0
            }} transition={{
              delay: i * 0.05
            }}>
                  <CheckCircleIcon className={`w-4 h-4 flex-shrink-0 ${module.isCompleted ? 'text-green-400' : 'text-slate-600'}`} />
                  <span className={`text-sm truncate ${module.isCompleted ? 'text-slate-300' : 'text-slate-500'}`}>
                    {module.shortName}
                  </span>
                  <span className="text-xs text-slate-600 ml-auto">
                    {module.completionPercentage}%
                  </span>
                </motion.div>)}
            </div>
          </div>

          {/* Stats */}
          <div className="glass rounded-xl p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Time Spent</span>
              <span className="text-white font-medium">
                {Math.floor(userProgress.totalTimeSpent / 60)}h{' '}
                {userProgress.totalTimeSpent % 60}m
              </span>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Desktop always-visible toggle */}
      <motion.button className="fixed top-1/2 -translate-y-1/2 z-40 hidden lg:flex items-center justify-center w-6 h-16 rounded-l-lg glass text-slate-400 hover:text-white transition-colors" style={{
      right: isOpen ? '320px' : 0
    }} onClick={onToggle} whileHover={{
      scale: 1.05
    }} whileTap={{
      scale: 0.95
    }}>
        {isOpen ? <ChevronRightIcon className="w-4 h-4" /> : <ChevronLeftIcon className="w-4 h-4" />}
      </motion.button>
    </>;
}