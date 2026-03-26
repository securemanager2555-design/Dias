import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ModuleCard } from './ModuleCard';
import { owaspModules } from '../data/owaspModules';
import { BeakerIcon, SparklesIcon, ZapIcon } from 'lucide-react';
export function LabDashboard({
  onModuleSelect
}) {
  const [activeStage, setActiveStage] = useState('Все');
  const lifecycleStages = useMemo(() => {
    const stages = Array.from(new Set(owaspModules.map(module => module.lifecycleStage)));
    return ['Все', ...stages];
  }, []);
  const filteredModules = activeStage === 'Все' ? owaspModules : owaspModules.filter(module => module.lifecycleStage === activeStage);
  return <div className="min-h-screen w-full">
      {/* Animated background */}
      <div className="fixed inset-0 animated-bg" />
      <div className="fixed inset-0 bg-gradient-to-b from-transparent via-slate-950/50 to-slate-950" />

      {/* Floating particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => <motion.div key={i} className="absolute w-1 h-1 rounded-full" style={{
        background: ['#8B5CF6', '#3B82F6', '#06B6D4'][i % 3],
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`
      }} animate={{
        y: [0, -100, 0],
        opacity: [0, 1, 0],
        scale: [0, 1.5, 0]
      }} transition={{
        duration: 5 + Math.random() * 5,
        repeat: Infinity,
        delay: Math.random() * 5
      }} />)}
      </div>

      {/* Content */}
      <div className="relative z-10 px-4 py-8 lg:px-8 lg:py-12 lg:pr-96">
        {/* Header */}
        <motion.header className="max-w-7xl mx-auto mb-12" initial={{
        opacity: 0,
        y: -30
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.6
      }}>
          <div className="flex items-center gap-3 mb-4">
            <motion.div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center" animate={{
            rotate: [0, 5, -5, 0]
          }} transition={{
            duration: 4,
            repeat: Infinity
          }}>
              <BeakerIcon className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold">
                <span className="gradient-text">Secure by Design</span>
              </h1>
              <p className="text-slate-400 text-sm">
                OWASP Top 10 — справочник защит
              </p>
            </div>
          </div>

          <motion.p className="text-slate-300 max-w-2xl text-lg" initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} transition={{
          delay: 0.3
        }}>
            Этот справочник показывает, какие части сайта защищены от атак
            OWASP Top 10, какими методами мы это сделали и какой код отвечает
            за защиту.
          </motion.p>

          {/* Quick stats */}
          <motion.div className="flex flex-wrap gap-4 mt-6" initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.4
        }}>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl glass">
              <SparklesIcon className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-slate-300">10 категорий защиты</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl glass">
              <ZapIcon className="w-4 h-4 text-cyan-400" />
              <span className="text-sm text-slate-300">
                Разбор уязвимостей
              </span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl glass">
              <BeakerIcon className="w-4 h-4 text-pink-400" />
              <span className="text-sm text-slate-300">
                Защитные паттерны кода
              </span>
            </div>
          </motion.div>
        </motion.header>

        {/* Filters */}
        <div className="max-w-7xl mx-auto mb-8">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Этап Secure by Design
          </h2>
          <div className="flex flex-wrap gap-2">
            {lifecycleStages.map(stage => <button key={stage} onClick={() => setActiveStage(stage)} className={`px-3 py-1 rounded-full text-xs font-medium transition ${activeStage === stage ? 'bg-purple-500/20 text-purple-200 border border-purple-500/40' : 'bg-slate-900/60 text-slate-400 border border-slate-700/60 hover:text-slate-200'}`}>
                {stage}
              </button>)}
          </div>
        </div>

        {/* Lab Table - Module Grid */}
        <motion.section className="max-w-7xl mx-auto" initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} transition={{
        delay: 0.2
      }}>
          <div className="flex items-center gap-2 mb-6">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
              Карта защиты приложения
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 lg:gap-6">
            {filteredModules.map((module, index) => <ModuleCard key={module.id} module={module} index={index} onClick={() => onModuleSelect(module.id)} />)}
          </div>
        </motion.section>

        {/* Footer hint */}
        <motion.footer className="max-w-7xl mx-auto mt-12 text-center" initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} transition={{
        delay: 1
      }}>
          <p className="text-sm text-slate-500">
            Выберите модуль, чтобы увидеть применённые защиты и связанные
            фрагменты кода
          </p>
        </motion.footer>
      </div>
    </div>;
}
