import React from 'react';
import { motion } from 'framer-motion';
import { ModuleCard } from './ModuleCard';
import { owaspModules } from '../data/owaspModules';
import { BeakerIcon, SparklesIcon, ZapIcon } from 'lucide-react';
type LabDashboardProps = {
  onModuleSelect: (moduleId: string) => void;
};
export function LabDashboard({
  onModuleSelect
}: LabDashboardProps) {
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
      <div className="relative z-10 px-4 py-8 lg:px-8 lg:py-12 lg:pr-24">
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
                <span className="gradient-text">Security Lab</span>
              </h1>
              <p className="text-slate-400 text-sm">
                OWASP Top 10 Interactive Training
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
            Master web security through hands-on exploration. Each module covers
            a critical vulnerability with live examples, interactive sandboxes,
            and defense strategies.
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
              <span className="text-sm text-slate-300">10 Modules</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl glass">
              <ZapIcon className="w-4 h-4 text-cyan-400" />
              <span className="text-sm text-slate-300">
                Interactive Sandboxes
              </span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl glass">
              <BeakerIcon className="w-4 h-4 text-pink-400" />
              <span className="text-sm text-slate-300">
                Live Visualizations
              </span>
            </div>
          </motion.div>
        </motion.header>

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
              Laboratory Modules
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 lg:gap-6">
            {owaspModules.map((module, index) => <ModuleCard key={module.id} module={module} index={index} onClick={() => onModuleSelect(module.id)} />)}
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
            Click any module to explore vulnerabilities, test in sandbox, and
            learn defense strategies
          </p>
        </motion.footer>
      </div>
    </div>;
}