import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XIcon, BookOpenIcon, CodeIcon } from 'lucide-react';
import { HandbookSection } from './HandbookSection';
import { ImplementationSection } from './ImplementationSection';
export function ModuleDetail({
  module,
  onClose
}) {
  const [viewMode, setViewMode] = useState('handbook');
  const [copied, setCopied] = useState(null);
  const [sandboxInput, setSandboxInput] = useState('');
  const [sandboxOutput, setSandboxOutput] = useState(null);
  const Icon = module.icon;
  const difficultyLabel = module.difficulty === 'Easy' ? 'Лёгкий' : module.difficulty === 'Medium' ? 'Средний' : 'Сложный';
  const riskLabel = module.riskLevel === 'Critical' ? 'Критический' : module.riskLevel === 'High' ? 'Высокий' : 'Средний';
  const handleCopy = (code, type) => {
    navigator.clipboard.writeText(code);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };
  const handleSandboxTest = () => {
    // Mock sandbox testing
    if (sandboxInput.toLowerCase().includes("' or") || sandboxInput.includes('--')) {
      setSandboxOutput('⚠️ Обнаружен SQL Injection! Ввод обходит аутентификацию.');
    } else if (sandboxInput.includes('<script>')) {
      setSandboxOutput('⚠️ Обнаружен XSS! Теги script заблокированы.');
    } else if (sandboxInput.length > 0) {
      setSandboxOutput('✅ Ввод выглядит безопасным. Опасные паттерны не найдены.');
    } else {
      setSandboxOutput('Введите данные для проверки уязвимостей.');
    }
  };
  return <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{
    opacity: 0
  }} animate={{
    opacity: 1
  }} exit={{
    opacity: 0
  }}>
      {/* Backdrop */}
      <motion.div className="absolute inset-0 bg-black/80 backdrop-blur-md" initial={{
      opacity: 0
    }} animate={{
      opacity: 1
    }} onClick={onClose} />

      {/* Modal */}
      <motion.div className="relative w-full max-w-5xl max-h-[90vh] glass-strong rounded-2xl overflow-hidden" initial={{
      scale: 0.9,
      y: 50
    }} animate={{
      scale: 1,
      y: 0
    }} exit={{
      scale: 0.9,
      y: 50
    }} transition={{
      type: 'spring',
      damping: 25,
      stiffness: 200
    }}>
        {/* Header */}
        <div className="relative p-6 border-b border-slate-700/50" style={{
        background: `linear-gradient(135deg, ${module.color}15 0%, transparent 100%)`
      }}>
          <button onClick={onClose} className="absolute top-4 right-4 w-10 h-10 rounded-xl glass flex items-center justify-center text-slate-400 hover:text-white transition-colors">
            <XIcon className="w-5 h-5" />
          </button>

          <div className="flex items-start gap-4">
            <motion.div className="w-16 h-16 rounded-xl flex items-center justify-center" style={{
            backgroundColor: `${module.color}20`,
            border: `2px solid ${module.color}`
          }} initial={{
            rotate: -10,
            scale: 0
          }} animate={{
            rotate: 0,
            scale: 1
          }} transition={{
            type: 'spring',
            delay: 0.1
          }}>
              <Icon className="w-8 h-8" style={{
              color: module.color
            }} />
            </motion.div>

            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white">{module.name}</h2>
              <p className="text-slate-400 mt-1">{module.tagline}</p>
              <div className="flex items-center gap-3 mt-3">
                <span className="px-3 py-1 rounded-full text-xs font-medium" style={{
                backgroundColor: `${module.color}20`,
                color: module.color
              }}>
                  {difficultyLabel}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${module.riskLevel === 'Critical' ? 'bg-red-500/20 text-red-400' : module.riskLevel === 'High' ? 'bg-orange-500/20 text-orange-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                  {riskLabel} риск
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-800/70 text-slate-300">
                  {module.lifecycleStage}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* View switch */}
        <div className="flex border-b border-slate-700/50 overflow-x-auto">
          <button onClick={() => setViewMode('handbook')} className={`relative flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap ${viewMode === 'handbook' ? 'text-white' : 'text-slate-400 hover:text-slate-200'}`}>
            <BookOpenIcon className="w-4 h-4" />
            Справочник
            {viewMode === 'handbook' && <motion.div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500" layoutId="activeView" />}
          </button>
          <button onClick={() => setViewMode('implementation')} className={`relative flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap ${viewMode === 'implementation' ? 'text-white' : 'text-slate-400 hover:text-slate-200'}`}>
            <CodeIcon className="w-4 h-4" />
            Реализация
            {viewMode === 'implementation' && <motion.div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500" layoutId="activeView" />}
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <AnimatePresence mode="wait">
            <motion.div key={viewMode} initial={{
            opacity: 0,
            x: 20
          }} animate={{
            opacity: 1,
            x: 0
          }} exit={{
            opacity: 0,
            x: -20
          }} transition={{
            duration: 0.2
          }}>
              {viewMode === 'handbook' ? <HandbookSection module={module} /> : <ImplementationSection module={module} copied={copied} handleCopy={handleCopy} sandboxInput={sandboxInput} setSandboxInput={setSandboxInput} sandboxOutput={sandboxOutput} handleSandboxTest={handleSandboxTest} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>;
}
