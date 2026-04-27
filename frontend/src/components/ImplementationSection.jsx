import React from 'react';
import { motion } from 'framer-motion';
import { CheckIcon, CopyIcon, XIcon } from 'lucide-react';
import { securityControls } from '../data/securityControls';

export function ImplementationSection({
  module,
  copied,
  handleCopy,
  sandboxInput,
  setSandboxInput,
  sandboxOutput,
  handleSandboxTest
}) {
  const controls = module.controlIds.map(id => securityControls.find(control => control.id === id)).filter(Boolean);

  return <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        {/* Vulnerable code */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-red-400 flex items-center gap-2">
              <XIcon className="w-4 h-4" /> Уязвимый код
            </h4>
            <button onClick={() => handleCopy(module.examples.vulnerable, 'vulnerable')} className="text-xs text-slate-400 hover:text-white flex items-center gap-1">
              {copied === 'vulnerable' ? <CheckIcon className="w-3 h-3" /> : <CopyIcon className="w-3 h-3" />}
              {copied === 'vulnerable' ? 'Скопировано' : 'Копировать'}
            </button>
          </div>
          <pre className="code-block p-4 overflow-x-auto text-red-300/80">
            <code>{module.examples.vulnerable}</code>
          </pre>
        </div>

        {/* Secure code */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-green-400 flex items-center gap-2">
              <CheckIcon className="w-4 h-4" /> Безопасный код
            </h4>
            <button onClick={() => handleCopy(module.examples.secure, 'secure')} className="text-xs text-slate-400 hover:text-white flex items-center gap-1">
              {copied === 'secure' ? <CheckIcon className="w-3 h-3" /> : <CopyIcon className="w-3 h-3" />}
              {copied === 'secure' ? 'Скопировано' : 'Копировать'}
            </button>
          </div>
          <pre className="code-block p-4 overflow-x-auto text-green-300/80">
            <code>{module.examples.secure}</code>
          </pre>
        </div>
      </div>

      <div className="glass rounded-xl p-4">
        <h4 className="font-semibold text-white mb-2">
          Пояснение
        </h4>
        <p className="text-sm text-slate-300">
          {module.examples.explanation}
        </p>
      </div>

      <div className="glass rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Проверка ввода
        </h3>
        <p className="text-sm text-slate-400 mb-4">
          Введите потенциально опасный ввод, чтобы увидеть реакцию защиты.
        </p>

        <div className="flex gap-3">
          <input type="text" value={sandboxInput} onChange={e => setSandboxInput(e.target.value)} placeholder="Введите тестовый ввод..." className="flex-1 px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors font-mono" />
          <motion.button onClick={handleSandboxTest} className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white font-medium" whileHover={{
          scale: 1.02
        }} whileTap={{
          scale: 0.98
        }}>
            Проверить
          </motion.button>
        </div>

        {sandboxOutput && <motion.div className={`mt-4 p-4 rounded-xl ${sandboxOutput.includes('⚠️') ? 'bg-red-500/10 border border-red-500/30' : sandboxOutput.includes('✅') ? 'bg-green-500/10 border border-green-500/30' : 'bg-slate-800/50 border border-slate-700'}`} initial={{
        opacity: 0,
        y: 10
      }} animate={{
        opacity: 1,
        y: 0
      }}>
            <p className="text-sm">{sandboxOutput}</p>
          </motion.div>}
      </div>

      <div className="glass rounded-xl p-4">
        <h3 className="text-lg font-semibold text-white mb-3">
          Библиотека Controls
        </h3>
        <div className="space-y-3">
          {controls.map(control => <div key={control.id} className="rounded-xl border border-slate-700/60 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-white">{control.name}</p>
                  <p className="text-sm text-slate-400">{control.description}</p>
                </div>
                <code className="text-xs text-purple-300 bg-slate-900/70 px-2 py-1 rounded">
                  {control.codeSnippet}
                </code>
              </div>
            </div>)}
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-white">
          Стратегии защиты
        </h3>
        {module.defense.strategies.map((defense, i) => <motion.div key={i} className="flex items-start gap-3 p-4 rounded-xl glass" initial={{
        opacity: 0,
        x: -20
      }} animate={{
        opacity: 1,
        x: 0
      }} transition={{
        delay: i * 0.1
      }}>
            <div className="w-8 h-8 rounded-lg bg-green-500/20 border border-green-500/50 flex items-center justify-center flex-shrink-0">
              <span className="text-green-400 font-bold text-sm">
                {i + 1}
              </span>
            </div>
            <p className="text-slate-300">{defense}</p>
          </motion.div>)}
      </div>

      <div className="glass rounded-xl p-4">
        <h3 className="text-lg font-semibold text-white mb-3">
          Код защиты
        </h3>
        <div className="space-y-4">
          {module.codeLinks.map(link => <div key={link.title} className="rounded-xl border border-slate-700/60 p-3">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-semibold text-white">{link.title}</p>
                  <p className="text-xs text-slate-500">{link.file}</p>
                </div>
                <button onClick={() => handleCopy(link.snippet, link.title)} className="text-xs text-slate-400 hover:text-white flex items-center gap-1">
                  {copied === link.title ? <CheckIcon className="w-3 h-3" /> : <CopyIcon className="w-3 h-3" />}
                  {copied === link.title ? 'Скопировано' : 'Копировать'}
                </button>
              </div>
              <pre className="code-block p-3 overflow-x-auto text-slate-300/80">
                <code>{link.snippet}</code>
              </pre>
            </div>)}
        </div>
      </div>
    </div>;
}
