import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MonitorIcon, ShieldIcon, ServerIcon, DatabaseIcon, LockIcon, AlertTriangleIcon } from 'lucide-react';
const nodes = [{
  id: 'client',
  label: 'Client',
  icon: MonitorIcon,
  x: 10,
  y: 50,
  color: '#06B6D4',
  securityMeasures: ['Input validation', 'HTTPS only', 'CSP headers'],
  vulnerabilities: ['XSS', 'Clickjacking', 'Data exposure']
}, {
  id: 'waf',
  label: 'WAF',
  icon: ShieldIcon,
  x: 35,
  y: 50,
  color: '#8B5CF6',
  securityMeasures: ['SQL injection blocking', 'Rate limiting', 'Bot detection'],
  vulnerabilities: ['Bypass techniques', 'Misconfiguration']
}, {
  id: 'api',
  label: 'API Server',
  icon: ServerIcon,
  x: 60,
  y: 50,
  color: '#3B82F6',
  securityMeasures: ['Authentication', 'Authorization', 'Input sanitization'],
  vulnerabilities: ['Broken access control', 'Injection', 'SSRF']
}, {
  id: 'database',
  label: 'Database',
  icon: DatabaseIcon,
  x: 85,
  y: 50,
  color: '#10B981',
  securityMeasures: ['Encryption at rest', 'Access controls', 'Audit logging'],
  vulnerabilities: ['Data breach', 'SQL injection', 'Privilege escalation']
}];
const connections = [{
  from: 'client',
  to: 'waf'
}, {
  from: 'waf',
  to: 'api'
}, {
  from: 'api',
  to: 'database'
}];
export function SecurityDiagram() {
  const [selectedNode, setSelectedNode] = useState(null);
  const [showAttackPath, setShowAttackPath] = useState(false);
  return <div className="relative w-full h-80 rounded-xl glass overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/50 to-slate-800/50" />

      {/* Connection lines */}
      <svg className="absolute inset-0 w-full h-full">
        {connections.map((conn, i) => {
        const fromNode = nodes.find(n => n.id === conn.from);
        const toNode = nodes.find(n => n.id === conn.to);
        if (!fromNode || !toNode) {
          return null;
        }
        return <motion.line key={i} x1={`${fromNode.x + 5}%`} y1={`${fromNode.y}%`} x2={`${toNode.x - 5}%`} y2={`${toNode.y}%`} stroke={showAttackPath ? '#EF4444' : '#4B5563'} strokeWidth="2" strokeDasharray={showAttackPath ? '8,4' : '0'} initial={{
          pathLength: 0
        }} animate={{
          pathLength: 1
        }} transition={{
          duration: 0.5,
          delay: i * 0.2
        }} />;
      })}

        {/* Animated flow particles */}
        {showAttackPath && connections.map((conn, i) => {
        const fromNode = nodes.find(n => n.id === conn.from);
        const toNode = nodes.find(n => n.id === conn.to);
        if (!fromNode || !toNode) {
          return null;
        }
        return <motion.circle key={`particle-${i}`} r="4" fill="#EF4444" initial={{
          cx: `${fromNode.x + 5}%`,
          cy: `${fromNode.y}%`,
          opacity: 1
        }} animate={{
          cx: [`${fromNode.x + 5}%`, `${toNode.x - 5}%`],
          cy: [`${fromNode.y}%`, `${toNode.y}%`]
        }} transition={{
          duration: 1,
          delay: i * 0.3,
          repeat: Infinity,
          repeatDelay: 1
        }} />;
      })}
      </svg>

      {/* Nodes */}
      {nodes.map((node, i) => <motion.div key={node.id} className="absolute cursor-pointer" style={{
      left: `${node.x}%`,
      top: `${node.y}%`,
      transform: 'translate(-50%, -50%)'
    }} initial={{
      scale: 0,
      opacity: 0
    }} animate={{
      scale: 1,
      opacity: 1
    }} transition={{
      delay: i * 0.1
    }} whileHover={{
      scale: 1.1
    }} onClick={() => setSelectedNode(selectedNode?.id === node.id ? null : node)}>
          <motion.div className={`w-16 h-16 rounded-xl flex items-center justify-center transition-all duration-300 ${selectedNode?.id === node.id ? 'ring-2 ring-offset-2 ring-offset-slate-900' : ''}`} style={{
        backgroundColor: `${node.color}20`,
        borderColor: node.color,
        borderWidth: 2,
        ringColor: node.color
      }} animate={{
        boxShadow: selectedNode?.id === node.id ? `0 0 30px ${node.color}50` : `0 0 15px ${node.color}30`
      }}>
            <node.icon className="w-8 h-8" style={{
          color: node.color
        }} />
          </motion.div>
          <p className="text-xs text-center mt-2 text-slate-300 font-medium">
            {node.label}
          </p>
        </motion.div>)}

      {/* Node details panel */}
      {selectedNode && <motion.div className="absolute bottom-4 left-4 right-4 glass rounded-lg p-4" initial={{
      opacity: 0,
      y: 20
    }} animate={{
      opacity: 1,
      y: 0
    }}>
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-semibold text-white flex items-center gap-2">
                <selectedNode.icon className="w-4 h-4" style={{
              color: selectedNode.color
            }} />
                {selectedNode.label}
              </h4>
            </div>
            <button onClick={() => setSelectedNode(null)} className="text-slate-400 hover:text-white">
              ✕
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-3">
            <div>
              <p className="text-xs text-green-400 flex items-center gap-1 mb-1">
                <LockIcon className="w-3 h-3" /> Security Measures
              </p>
              <ul className="text-xs text-slate-300 space-y-0.5">
                {selectedNode.securityMeasures.map((m, i) => <li key={i}>• {m}</li>)}
              </ul>
            </div>
            <div>
              <p className="text-xs text-red-400 flex items-center gap-1 mb-1">
                <AlertTriangleIcon className="w-3 h-3" /> Vulnerabilities
              </p>
              <ul className="text-xs text-slate-300 space-y-0.5">
                {selectedNode.vulnerabilities.map((v, i) => <li key={i}>• {v}</li>)}
              </ul>
            </div>
          </div>
        </motion.div>}

      {/* Attack path toggle */}
      <button onClick={() => setShowAttackPath(!showAttackPath)} className={`absolute top-4 right-4 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${showAttackPath ? 'bg-red-500/20 text-red-400 border border-red-500/50' : 'bg-slate-700/50 text-slate-300 border border-slate-600/50 hover:bg-slate-700'}`}>
        {showAttackPath ? '🔴 Attack Path' : '⚪ Show Attack'}
      </button>
    </div>;
}
