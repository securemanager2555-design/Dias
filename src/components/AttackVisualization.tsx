import React, { useEffect, useState, Component } from 'react';
import { motion } from 'framer-motion';
type AttackVisualizationProps = {
  moduleId: string;
  isPlaying?: boolean;
};
export function AttackVisualization({
  moduleId,
  isPlaying = true
}: AttackVisualizationProps) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setStep(s => (s + 1) % 4);
    }, 2000);
    return () => clearInterval(interval);
  }, [isPlaying]);
  const visualizations: Record<string, React.ReactNode> = {
    a01: <AccessControlVisualization step={step} />,
    a02: <CryptoVisualization step={step} />,
    a03: <InjectionVisualization step={step} />,
    a04: <InsecureDesignVisualization step={step} />,
    a05: <MisconfigVisualization step={step} />,
    a06: <VulnerableComponentVisualization step={step} />,
    a07: <AuthFailureVisualization step={step} />,
    a08: <IntegrityVisualization step={step} />,
    a09: <LoggingVisualization step={step} />,
    a10: <SSRFVisualization step={step} />
  };
  return <div className="relative w-full h-64 md:h-80 rounded-xl overflow-hidden glass">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/50 to-slate-800/50" />
      {visualizations[moduleId] || <DefaultVisualization step={step} />}

      {/* Step indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {[0, 1, 2, 3].map(i => <motion.div key={i} className={`w-2 h-2 rounded-full ${i === step ? 'bg-purple-500' : 'bg-slate-600'}`} animate={{
        scale: i === step ? 1.2 : 1
      }} />)}
      </div>
    </div>;
}
function InjectionVisualization({
  step
}: {
  step: number;
}) {
  const steps = ['Attacker crafts payload', 'Malicious input sent', 'Query executed', 'Data exfiltrated'];
  return <div className="relative w-full h-full flex items-center justify-center p-8">
      {/* Attacker */}
      <motion.div className="absolute left-8 top-1/2 -translate-y-1/2" animate={{
      x: step >= 1 ? 20 : 0
    }}>
        <div className="w-16 h-16 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center">
          <span className="text-2xl">👤</span>
        </div>
        <p className="text-xs text-center mt-2 text-red-400">Attacker</p>
      </motion.div>

      {/* Malicious payload */}
      <motion.div className="absolute" initial={{
      left: '15%',
      opacity: 0
    }} animate={{
      left: step === 0 ? '15%' : step === 1 ? '40%' : step === 2 ? '65%' : '85%',
      opacity: step >= 1 ? 1 : 0,
      scale: step === 2 ? 1.2 : 1
    }} transition={{
      duration: 0.5
    }}>
        <div className="px-3 py-1 rounded bg-red-500/30 border border-red-500 font-mono text-xs text-red-300">
          ' OR 1=1 --
        </div>
      </motion.div>

      {/* Server */}
      <motion.div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2" animate={{
      borderColor: step === 2 ? '#EF4444' : '#3B82F6',
      boxShadow: step === 2 ? '0 0 30px rgba(239, 68, 68, 0.5)' : '0 0 20px rgba(59, 130, 246, 0.3)'
    }}>
        <div className="w-20 h-20 rounded-lg bg-blue-500/20 border-2 border-blue-500 flex items-center justify-center">
          <span className="text-3xl">🖥️</span>
        </div>
        <p className="text-xs text-center mt-2 text-blue-400">Server</p>
      </motion.div>

      {/* Database */}
      <motion.div className="absolute right-8 top-1/2 -translate-y-1/2" animate={{
      borderColor: step >= 3 ? '#EF4444' : '#10B981',
      scale: step === 3 ? 1.1 : 1
    }}>
        <div className="w-16 h-16 rounded-lg bg-green-500/20 border-2 border-green-500 flex items-center justify-center">
          <span className="text-2xl">🗄️</span>
        </div>
        <p className="text-xs text-center mt-2 text-green-400">Database</p>
      </motion.div>

      {/* Data flow particles */}
      {step === 3 && [...Array(5)].map((_, i) => <motion.div key={i} className="absolute w-2 h-2 rounded-full bg-red-500" initial={{
      right: '15%',
      top: '50%'
    }} animate={{
      right: ['15%', '85%'],
      top: ['50%', `${40 + i * 5}%`],
      opacity: [1, 0]
    }} transition={{
      duration: 1,
      delay: i * 0.1,
      repeat: Infinity
    }} />)}

      {/* Step label */}
      <motion.p key={step} className="absolute bottom-12 left-1/2 -translate-x-1/2 text-sm text-slate-300" initial={{
      opacity: 0,
      y: 10
    }} animate={{
      opacity: 1,
      y: 0
    }}>
        {steps[step]}
      </motion.p>
    </div>;
}
function AccessControlVisualization({
  step
}: {
  step: number;
}) {
  return <div className="relative w-full h-full flex items-center justify-center p-8">
      {/* User */}
      <motion.div className="absolute left-8" animate={{
      x: step >= 1 ? 30 : 0
    }}>
        <div className="w-14 h-14 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center">
          <span className="text-xl">👤</span>
        </div>
      </motion.div>

      {/* Shield barrier */}
      <motion.div className="absolute left-1/3" animate={{
      opacity: step === 2 ? 0.3 : 1,
      scale: step === 2 ? 0.9 : 1
    }}>
        <div className="w-4 h-32 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full" />
      </motion.div>

      {/* Protected resource */}
      <motion.div className="absolute right-8" animate={{
      borderColor: step >= 3 ? '#EF4444' : '#10B981'
    }}>
        <div className="w-16 h-16 rounded-lg bg-green-500/20 border-2 border-green-500 flex items-center justify-center">
          <span className="text-2xl">📁</span>
        </div>
        <p className="text-xs text-center mt-2 text-slate-400">Admin Data</p>
      </motion.div>

      {/* Bypass arrow */}
      {step >= 2 && <motion.svg className="absolute left-1/4 top-1/4" width="200" height="100" initial={{
      pathLength: 0,
      opacity: 0
    }} animate={{
      pathLength: 1,
      opacity: 1
    }}>
          <motion.path d="M 0 50 Q 100 -30 200 50" fill="none" stroke="#EF4444" strokeWidth="2" strokeDasharray="5,5" initial={{
        pathLength: 0
      }} animate={{
        pathLength: 1
      }} transition={{
        duration: 0.5
      }} />
        </motion.svg>}
    </div>;
}
function CryptoVisualization({
  step
}: {
  step: number;
}) {
  return <div className="relative w-full h-full flex items-center justify-center">
      <motion.div className="relative" animate={{
      rotateY: step >= 2 ? 180 : 0
    }} transition={{
      duration: 0.5
    }}>
        <div className={`w-24 h-24 rounded-xl flex items-center justify-center ${step >= 2 ? 'bg-red-500/20 border-red-500' : 'bg-blue-500/20 border-blue-500'} border-2`}>
          <span className="text-4xl">{step >= 2 ? '🔓' : '🔒'}</span>
        </div>
      </motion.div>

      {/* Breaking particles */}
      {step === 2 && [...Array(8)].map((_, i) => <motion.div key={i} className="absolute w-3 h-3 bg-orange-500 rounded" style={{
      left: '50%',
      top: '50%'
    }} initial={{
      x: 0,
      y: 0,
      opacity: 1,
      rotate: 0
    }} animate={{
      x: (Math.random() - 0.5) * 150,
      y: (Math.random() - 0.5) * 150,
      opacity: 0,
      rotate: Math.random() * 360
    }} transition={{
      duration: 0.8
    }} />)}
    </div>;
}
function SSRFVisualization({
  step
}: {
  step: number;
}) {
  return <div className="relative w-full h-full flex items-center justify-between p-8">
      {/* External attacker */}
      <div className="text-center">
        <div className="w-14 h-14 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center mx-auto">
          <span className="text-xl">👤</span>
        </div>
        <p className="text-xs mt-2 text-red-400">Attacker</p>
      </div>

      {/* Web server */}
      <motion.div className="text-center" animate={{
      borderColor: step >= 1 ? '#F59E0B' : '#3B82F6'
    }}>
        <div className="w-16 h-16 rounded-lg bg-blue-500/20 border-2 border-blue-500 flex items-center justify-center mx-auto">
          <span className="text-2xl">🌐</span>
        </div>
        <p className="text-xs mt-2 text-blue-400">Web Server</p>
      </motion.div>

      {/* Internal service */}
      <motion.div className="text-center" animate={{
      borderColor: step >= 2 ? '#EF4444' : '#10B981',
      scale: step === 3 ? 1.1 : 1
    }}>
        <div className="w-14 h-14 rounded-lg bg-green-500/20 border-2 border-green-500 flex items-center justify-center mx-auto">
          <span className="text-xl">🔒</span>
        </div>
        <p className="text-xs mt-2 text-green-400">Internal API</p>
      </motion.div>

      {/* Request arrows */}
      <motion.div className="absolute top-1/2 left-[20%] w-[25%] h-0.5 bg-red-500" initial={{
      scaleX: 0
    }} animate={{
      scaleX: step >= 1 ? 1 : 0
    }} style={{
      transformOrigin: 'left'
    }} />
      <motion.div className="absolute top-1/2 left-[55%] w-[25%] h-0.5 bg-yellow-500" initial={{
      scaleX: 0
    }} animate={{
      scaleX: step >= 2 ? 1 : 0
    }} style={{
      transformOrigin: 'left'
    }} />
    </div>;
}
// Placeholder visualizations for other modules
function InsecureDesignVisualization({
  step
}: {
  step: number;
}) {
  return <DefaultVisualization step={step} icon="📐" label="Insecure Design" />;
}
function MisconfigVisualization({
  step
}: {
  step: number;
}) {
  return <DefaultVisualization step={step} icon="⚙️" label="Misconfiguration" />;
}
function VulnerableComponentVisualization({
  step
}: {
  step: number;
}) {
  return <DefaultVisualization step={step} icon="📦" label="Vulnerable Component" />;
}
function AuthFailureVisualization({
  step
}: {
  step: number;
}) {
  return <DefaultVisualization step={step} icon="🔑" label="Auth Failure" />;
}
function IntegrityVisualization({
  step
}: {
  step: number;
}) {
  return <DefaultVisualization step={step} icon="🗃️" label="Integrity Failure" />;
}
function LoggingVisualization({
  step
}: {
  step: number;
}) {
  return <DefaultVisualization step={step} icon="📝" label="Logging Failure" />;
}
function DefaultVisualization({
  step,
  icon = '🛡️',
  label = 'Security'
}: {
  step: number;
  icon?: string;
  label?: string;
}) {
  return <div className="relative w-full h-full flex items-center justify-center">
      <motion.div animate={{
      scale: [1, 1.1, 1],
      rotate: step * 90
    }} transition={{
      duration: 0.5
    }} className="w-24 h-24 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/50 flex items-center justify-center">
        <span className="text-4xl">{icon}</span>
      </motion.div>
      <p className="absolute bottom-16 text-sm text-slate-400">
        {label} - Step {step + 1}
      </p>
    </div>;
}