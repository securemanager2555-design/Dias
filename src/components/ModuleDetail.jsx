import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XIcon, BookOpenIcon, CodeIcon, PlayIcon, ShieldIcon, ActivityIcon, AlertTriangleIcon, CheckIcon, CopyIcon } from 'lucide-react';
import { AttackVisualization } from './AttackVisualization';
import { SecurityDiagram } from './SecurityDiagram';
const tabs = [{
  id: 'overview',
  label: 'Overview',
  icon: BookOpenIcon
}, {
  id: 'example',
  label: 'Live Example',
  icon: CodeIcon
}, {
  id: 'sandbox',
  label: 'Sandbox',
  icon: PlayIcon
}, {
  id: 'defense',
  label: 'Defense',
  icon: ShieldIcon
}, {
  id: 'visualization',
  label: 'Visualization',
  icon: ActivityIcon
}];
export function ModuleDetail({
  module,
  onClose
}) {
  const [activeTab, setActiveTab] = useState('overview');
  const [copied, setCopied] = useState(null);
  const [sandboxInput, setSandboxInput] = useState('');
  const [sandboxOutput, setSandboxOutput] = useState(null);
  const Icon = module.icon;
  const handleCopy = (code, type) => {
    navigator.clipboard.writeText(code);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };
  const handleSandboxTest = () => {
    // Mock sandbox testing
    if (sandboxInput.toLowerCase().includes("' or") || sandboxInput.includes('--')) {
      setSandboxOutput('⚠️ SQL Injection detected! Your input would bypass authentication.');
    } else if (sandboxInput.includes('<script>')) {
      setSandboxOutput('⚠️ XSS attempt detected! Script tags are blocked.');
    } else if (sandboxInput.length > 0) {
      setSandboxOutput('✅ Input appears safe. No obvious attack patterns detected.');
    } else {
      setSandboxOutput('Enter some input to test for vulnerabilities.');
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
                  {module.difficulty}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${module.riskLevel === 'Critical' ? 'bg-red-500/20 text-red-400' : module.riskLevel === 'High' ? 'bg-orange-500/20 text-orange-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                  {module.riskLevel} Risk
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-700/50 overflow-x-auto">
          {tabs.map(tab => <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`relative flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap ${activeTab === tab.id ? 'text-white' : 'text-slate-400 hover:text-slate-200'}`}>
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {activeTab === tab.id && <motion.div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500" layoutId="activeTab" />}
            </button>)}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{
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
              {activeTab === 'overview' && <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">
                      Description
                    </h3>
                    <p className="text-slate-300 leading-relaxed">
                      {module.description}
                    </p>
                  </div>

                  <div className="glass rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangleIcon className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-white">
                          Real-World Impact
                        </h4>
                        <p className="text-sm text-slate-400 mt-1">
                          {module.realWorldImpact}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">
                      Attack Flow
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {module.attackFlow.map((step, i) => <motion.div key={i} className="flex items-center gap-2" initial={{
                    opacity: 0,
                    y: 10
                  }} animate={{
                    opacity: 1,
                    y: 0
                  }} transition={{
                    delay: i * 0.1
                  }}>
                          <span className="px-3 py-2 rounded-lg glass text-sm text-slate-300">
                            {i + 1}. {step}
                          </span>
                          {i < module.attackFlow.length - 1 && <span className="text-slate-600">→</span>}
                        </motion.div>)}
                    </div>
                  </div>
                </div>}

              {activeTab === 'example' && <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Vulnerable code */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-semibold text-red-400 flex items-center gap-2">
                          <XIcon className="w-4 h-4" /> Vulnerable Code
                        </h4>
                        <button onClick={() => handleCopy(module.examples.vulnerable, 'vulnerable')} className="text-xs text-slate-400 hover:text-white flex items-center gap-1">
                          {copied === 'vulnerable' ? <CheckIcon className="w-3 h-3" /> : <CopyIcon className="w-3 h-3" />}
                          {copied === 'vulnerable' ? 'Copied!' : 'Copy'}
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
                          <CheckIcon className="w-4 h-4" /> Secure Code
                        </h4>
                        <button onClick={() => handleCopy(module.examples.secure, 'secure')} className="text-xs text-slate-400 hover:text-white flex items-center gap-1">
                          {copied === 'secure' ? <CheckIcon className="w-3 h-3" /> : <CopyIcon className="w-3 h-3" />}
                          {copied === 'secure' ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                      <pre className="code-block p-4 overflow-x-auto text-green-300/80">
                        <code>{module.examples.secure}</code>
                      </pre>
                    </div>
                  </div>

                  <div className="glass rounded-xl p-4">
                    <h4 className="font-semibold text-white mb-2">
                      Explanation
                    </h4>
                    <p className="text-sm text-slate-300">
                      {module.examples.explanation}
                    </p>
                  </div>
                </div>}

              {activeTab === 'sandbox' && <div className="space-y-6">
                  <div className="glass rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">
                      Test Input Validation
                    </h3>
                    <p className="text-sm text-slate-400 mb-4">
                      Enter potentially malicious input to see how it would be
                      detected. Try SQL injection patterns like{' '}
                      <code className="text-purple-400">' OR 1=1 --</code> or
                      XSS like{' '}
                      <code className="text-purple-400">&lt;script&gt;</code>
                    </p>

                    <div className="flex gap-3">
                      <input type="text" value={sandboxInput} onChange={e => setSandboxInput(e.target.value)} placeholder="Enter test input..." className="flex-1 px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors font-mono" />
                      <motion.button onClick={handleSandboxTest} className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white font-medium" whileHover={{
                    scale: 1.02
                  }} whileTap={{
                    scale: 0.98
                  }}>
                        Test
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
                    <p className="text-xs text-slate-500 text-center">
                      ⚠️ This is a simulated sandbox for educational purposes
                      only. No actual attacks are performed.
                    </p>
                  </div>
                </div>}

              {activeTab === 'defense' && <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-white">
                    Mitigation Strategies
                  </h3>
                  <div className="space-y-3">
                    {module.defenses.map((defense, i) => <motion.div key={i} className="flex items-start gap-3 p-4 rounded-xl glass" initial={{
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
                </div>}

              {activeTab === 'visualization' && <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">
                      Attack Animation
                    </h3>
                    <AttackVisualization moduleId={module.id} />
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">
                      Security Architecture
                    </h3>
                    <SecurityDiagram />
                  </div>
                </div>}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>;
}
