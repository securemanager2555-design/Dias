import React, { useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ShieldCheckIcon } from 'lucide-react';
import './ModuleCard.css';

export function ModuleCard({ module, index, onClick }) {
  const [isHovered, setIsHovered] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x, {
    stiffness: 300,
    damping: 30,
  });
  const mouseYSpring = useSpring(y, {
    stiffness: 300,
    damping: 30,
  });
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['10deg', '-10deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-10deg', '10deg']);
  const handleMouseMove = e => {
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
  const riskLabel =
    module.riskLevel === 'Critical'
      ? 'Критический'
      : module.riskLevel === 'High'
      ? 'Высокий'
      : 'Средний';

  const riskClass =
    module.riskLevel === 'Critical'
      ? 'module-card__risk--critical'
      : module.riskLevel === 'High'
      ? 'module-card__risk--high'
      : 'module-card__risk--medium';

  return (
    <motion.div
      className="module-card"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.08,
        ease: [0.23, 1, 0.32, 1],
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      <motion.div
        className="module-card__inner"
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        whileHover={{ z: 50 }}
        transition={{ duration: 0.2 }}
      >
        {/* Card */}
        <motion.div
          className="module-card__panel"
          style={{
            background: `linear-gradient(135deg, ${module.color}15 0%, transparent 100%)`,
            borderColor: `${module.color}40`,
            boxShadow: `0 0 24px ${module.color}12`,
          }}
          animate={{
            boxShadow: isHovered
              ? `0 25px 50px -12px ${module.color}40, 0 0 0 1px ${module.color}30`
              : `0 10px 30px -10px ${module.color}20, 0 0 0 1px rgba(148, 163, 184, 0.1)`,
          }}
        >
          {/* Gradient border effect */}
          <motion.div
            className="module-card__glowBorder"
            style={{
              background: `linear-gradient(135deg, ${module.color}, transparent, ${module.color})`,
              padding: '1px',
            }}
            animate={{
              opacity: isHovered ? 1 : 0,
            }}
          />

          <div className="module-card__accent" style={{ background: module.color }} />

          {/* Content */}
          <div className="module-card__content glass-strong">
            {/* Header with icon and completion */}
            <div className="module-card__header">
              <motion.div
                className="module-card__icon"
                style={{
                  backgroundColor: `${module.color}20`,
                  border: `1px solid ${module.color}40`,
                }}
                animate={{
                  scale: isHovered ? 1.1 : 1,
                  rotate: isHovered ? 5 : 0,
                }}
              >
                <Icon className="module-card__iconSvg" style={{ color: module.color }} />
              </motion.div>

              {/* Completion indicator */}
              {module.isCompleted ? (
                <motion.div
                  className="module-card__completed"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.2 }}
                >
                  <ShieldCheckIcon className="module-card__completedIcon" />
                </motion.div>
              ) : (
                <div
                  className="module-card__badge"
                  style={{
                    backgroundColor: `${module.color}20`,
                    border: `1px solid ${module.color}40`,
                  }}
                >
                  <Icon className="module-card__badgeIcon" style={{ color: module.color }} />
                </div>
              )}
            </div>

            {/* Module info */}
            <div className="module-card__info">
              <h3 className="module-card__title">{module.shortName}</h3>
              <p className="module-card__tagline">{module.tagline}</p>
              <div className="module-card__meta">
                <span className="module-card__metaTag">{module.lifecycleStage}</span>
              </div>
            </div>

            {/* Secure by Design tags */}
            <motion.div
              className="module-card__secure"
              initial={{ opacity: 0, height: 0 }}
              animate={{
                opacity: isHovered ? 1 : 0,
                height: isHovered ? 'auto' : 0,
              }}
              transition={{ duration: 0.2 }}
            >
              <div className="module-card__secureTitle">Secure by Design</div>
              <div className="module-card__secureTags">
                {module.secureByDesign.map(item => (
                  <span key={item} className="module-card__secureTag">
                    {item}
                  </span>
                ))}
              </div>
              <div className="module-card__footerRow">
                <span
                  className="module-card__difficulty"
                  style={{
                    backgroundColor: `${module.color}20`,
                    color: module.color,
                  }}
                >
                  {module.difficulty === 'Easy'
                    ? 'Легко'
                    : module.difficulty === 'Medium'
                    ? 'Средне'
                    : 'Сложно'}
                </span>
                <span className={`module-card__risk ${riskClass}`}>
                  {riskLabel} риск
                </span>
              </div>
            </motion.div>

            {/* Shine effect */}
            <motion.div
              className="module-card__shine"
              style={{
                background:
                  'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.03) 45%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.03) 55%, transparent 60%)',
                backgroundSize: '200% 100%',
              }}
              animate={{
                backgroundPosition: isHovered ? ['200% 0', '-200% 0'] : '200% 0',
              }}
              transition={{
                duration: 1.5,
                ease: 'easeInOut',
              }}
            />
          </div>
        </motion.div>

        {/* 3D shadow layer */}
        <motion.div
          className="module-card__shadow"
          style={{
            background: module.color,
            filter: 'blur(30px)',
            transform: 'translateZ(-50px)',
          }}
          animate={{
            opacity: isHovered ? 0.3 : 0.1,
            scale: isHovered ? 1.1 : 1,
          }}
        />
      </motion.div>
    </motion.div>
  );
}
