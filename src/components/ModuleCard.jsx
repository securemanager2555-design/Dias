import React, { useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ShieldCheckIcon } from 'lucide-react';
export function ModuleCard({
  module,
  index,
  onClick
}) {
  const [isHovered, setIsHovered] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x, {
    stiffness: 300,
    damping: 30
  });
  const mouseYSpring = useSpring(y, {
    stiffness: 300,
    damping: 30
  });
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['10deg', '-10deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-10deg', '10deg']);
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };
  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    setIsHovered(false);
  };
  const Icon = module.icon;
  return <motion.div className="perspective-1000 cursor-pointer" initial={{
    opacity: 0,
    y: 50
  }} animate={{
    opacity: 1,
    y: 0
  }} transition={{
    duration: 0.5,
    delay: index * 0.08,
    ease: [0.23, 1, 0.32, 1]
  }} onMouseMove={handleMouseMove} onMouseEnter={() => setIsHovered(true)} onMouseLeave={handleMouseLeave} onClick={onClick}>
      <motion.div className="relative transform-style-3d" style={{
      rotateX,
      rotateY,
      transformStyle: 'preserve-3d'
    }} whileHover={{
      z: 50
    }} transition={{
      duration: 0.2
    }}>
        {/* Card */}
        <motion.div className="relative rounded-2xl overflow-hidden" style={{
        background: `linear-gradient(135deg, ${module.color}15 0%, transparent 100%)`
      }} animate={{
        boxShadow: isHovered ? `0 25px 50px -12px ${module.color}40, 0 0 0 1px ${module.color}30` : `0 10px 30px -10px ${module.color}20, 0 0 0 1px rgba(148, 163, 184, 0.1)`
      }}>
          {/* Gradient border effect */}
          <motion.div className="absolute inset-0 rounded-2xl opacity-0" style={{
          background: `linear-gradient(135deg, ${module.color}, transparent, ${module.color})`,
          padding: '1px'
        }} animate={{
          opacity: isHovered ? 1 : 0
        }} />

          {/* Content */}
          <div className="relative glass-strong rounded-2xl p-5 h-full">
            {/* Header with icon and completion */}
            <div className="flex items-start justify-between mb-4">
              <motion.div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{
              backgroundColor: `${module.color}20`,
              border: `1px solid ${module.color}40`
            }} animate={{
              scale: isHovered ? 1.1 : 1,
              rotate: isHovered ? 5 : 0
            }}>
                <Icon className="w-7 h-7" style={{
                color: module.color
              }} />
              </motion.div>

              {/* Completion indicator */}
              {module.isCompleted ? <motion.div className="w-8 h-8 rounded-full bg-green-500/20 border border-green-500/50 flex items-center justify-center" initial={{
              scale: 0
            }} animate={{
              scale: 1
            }} transition={{
              type: 'spring',
              delay: 0.2
            }}>
                  <ShieldCheckIcon className="w-4 h-4 text-green-400" />
                </motion.div> : <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{
              backgroundColor: `${module.color}20`,
              border: `1px solid ${module.color}40`
            }}>
                  <Icon className="w-4 h-4" style={{
                color: module.color
              }} />
                </div>}
            </div>

            {/* Module info */}
            <div className="space-y-2">
              <h3 className="font-bold text-white text-lg leading-tight">
                {module.shortName}
              </h3>
              <p className="text-sm text-slate-400 line-clamp-2">
                {module.tagline}
              </p>
              <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                <span className="px-2 py-1 rounded-full bg-slate-800/60 text-slate-300 border border-slate-700/60">
                  {module.lifecycleStage}
                </span>
              </div>
            </div>

            {/* Secure by Design tags */}
            <motion.div className="mt-4 pt-4 border-t border-slate-700/50" initial={{
            opacity: 0,
            height: 0
          }} animate={{
            opacity: isHovered ? 1 : 0,
            height: isHovered ? 'auto' : 0
          }} transition={{
            duration: 0.2
          }}>
              <div className="text-xs text-slate-500 mb-2">
                Secure by Design
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                {module.secureByDesign.map(item => <span key={item} className="px-2 py-1 rounded-full bg-slate-800/60 text-slate-300 border border-slate-700/60">
                    {item}
                  </span>)}
              </div>
              <div className="flex items-center justify-between text-xs mt-3">
                <span className="px-2 py-1 rounded-full" style={{
                backgroundColor: `${module.color}20`,
                color: module.color
              }}>
                  {module.difficulty === 'Easy' ? 'Лёгкий' : module.difficulty === 'Medium' ? 'Средний' : 'Сложный'}
                </span>
                <span className={`px-2 py-1 rounded-full ${module.riskLevel === 'Critical' ? 'bg-red-500/20 text-red-400' : module.riskLevel === 'High' ? 'bg-orange-500/20 text-orange-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                  {module.riskLevel} риск
                </span>
              </div>
            </motion.div>

            {/* Shine effect */}
            <motion.div className="absolute inset-0 pointer-events-none" style={{
            background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.03) 45%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.03) 55%, transparent 60%)',
            backgroundSize: '200% 100%'
          }} animate={{
            backgroundPosition: isHovered ? ['200% 0', '-200% 0'] : '200% 0'
          }} transition={{
            duration: 1.5,
            ease: 'easeInOut'
          }} />
          </div>
        </motion.div>

        {/* 3D shadow layer */}
        <motion.div className="absolute inset-0 rounded-2xl -z-10" style={{
        background: module.color,
        filter: 'blur(30px)',
        transform: 'translateZ(-50px)'
      }} animate={{
        opacity: isHovered ? 0.3 : 0.1,
        scale: isHovered ? 1.1 : 1
      }} />
      </motion.div>
    </motion.div>;
}
