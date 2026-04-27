import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  MonitorIcon,
  ShieldIcon,
  ServerIcon,
  DatabaseIcon,
  LockIcon,
  AlertTriangleIcon,
} from 'lucide-react';
import './SecurityDiagram.css';

const nodes = [
  {
    id: 'client',
    label: 'Client',
    icon: MonitorIcon,
    x: 10,
    y: 50,
    color: '#06B6D4',
    securityMeasures: ['Input validation', 'HTTPS only', 'CSP headers'],
    vulnerabilities: ['XSS', 'Clickjacking', 'Data exposure'],
  },
  {
    id: 'waf',
    label: 'WAF',
    icon: ShieldIcon,
    x: 35,
    y: 50,
    color: '#8B5CF6',
    securityMeasures: ['SQL injection blocking', 'Rate limiting', 'Bot detection'],
    vulnerabilities: ['Bypass techniques', 'Misconfiguration'],
  },
  {
    id: 'api',
    label: 'API Server',
    icon: ServerIcon,
    x: 60,
    y: 50,
    color: '#3B82F6',
    securityMeasures: ['Authentication', 'Authorization', 'Input sanitization'],
    vulnerabilities: ['Broken access control', 'Injection', 'SSRF'],
  },
  {
    id: 'database',
    label: 'Database',
    icon: DatabaseIcon,
    x: 85,
    y: 50,
    color: '#10B981',
    securityMeasures: ['Encryption at rest', 'Access controls', 'Audit logging'],
    vulnerabilities: ['Data breach', 'SQL injection', 'Privilege escalation'],
  },
];
const connections = [
  { from: 'client', to: 'waf' },
  { from: 'waf', to: 'api' },
  { from: 'api', to: 'database' },
];

export function SecurityDiagram() {
  const [selectedNode, setSelectedNode] = useState(null);
  const [showAttackPath, setShowAttackPath] = useState(false);
  return (
    <div className="security-diagram glass">
      <div className="security-diagram__bg" />

      {/* Connection lines */}
      <svg className="security-diagram__lines">
        {connections.map((conn, i) => {
          const fromNode = nodes.find(n => n.id === conn.from);
          const toNode = nodes.find(n => n.id === conn.to);
          if (!fromNode || !toNode) {
            return null;
          }
          return (
            <motion.line
              key={i}
              x1={`${fromNode.x + 5}%`}
              y1={`${fromNode.y}%`}
              x2={`${toNode.x - 5}%`}
              y2={`${toNode.y}%`}
              stroke={showAttackPath ? '#EF4444' : '#4B5563'}
              strokeWidth="2"
              strokeDasharray={showAttackPath ? '8,4' : '0'}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, delay: i * 0.2 }}
            />
          );
        })}

        {/* Animated flow particles */}
        {showAttackPath &&
          connections.map((conn, i) => {
            const fromNode = nodes.find(n => n.id === conn.from);
            const toNode = nodes.find(n => n.id === conn.to);
            if (!fromNode || !toNode) {
              return null;
            }
            return (
              <motion.circle
                key={`particle-${i}`}
                r="4"
                fill="#EF4444"
                initial={{
                  cx: `${fromNode.x + 5}%`,
                  cy: `${fromNode.y}%`,
                  opacity: 1,
                }}
                animate={{
                  cx: [`${fromNode.x + 5}%`, `${toNode.x - 5}%`],
                  cy: [`${fromNode.y}%`, `${toNode.y}%`],
                }}
                transition={{
                  duration: 1,
                  delay: i * 0.3,
                  repeat: Infinity,
                  repeatDelay: 1,
                }}
              />
            );
          })}
      </svg>

      {/* Nodes */}
      {nodes.map((node, i) => (
        <motion.div
          key={node.id}
          className="security-diagram__node"
          style={{
            left: `${node.x}%`,
            top: `${node.y}%`,
            transform: 'translate(-50%, -50%)',
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: i * 0.1 }}
          whileHover={{ scale: 1.1 }}
          onClick={() => setSelectedNode(selectedNode?.id === node.id ? null : node)}
        >
          <motion.div
            className={`security-diagram__nodeCard ${
              selectedNode?.id === node.id ? 'security-diagram__nodeCard--active' : ''
            }`}
            style={{
              backgroundColor: `${node.color}20`,
              borderColor: node.color,
            }}
            animate={{
              boxShadow:
                selectedNode?.id === node.id
                  ? `0 0 30px ${node.color}50`
                  : `0 0 15px ${node.color}30`,
            }}
          >
            <node.icon className="security-diagram__nodeIcon" style={{ color: node.color }} />
          </motion.div>
          <p className="security-diagram__nodeLabel">{node.label}</p>
        </motion.div>
      ))}

      {/* Node details panel */}
      {selectedNode && (
        <motion.div
          className="security-diagram__panel glass"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="security-diagram__panelHeader">
            <h4 className="security-diagram__panelTitle">
              <selectedNode.icon
                className="security-diagram__panelIcon"
                style={{ color: selectedNode.color }}
              />
              {selectedNode.label}
            </h4>
            <button
              onClick={() => setSelectedNode(null)}
              className="security-diagram__panelClose"
              aria-label="Закрыть"
            >
              ×
            </button>
          </div>

          <div className="security-diagram__panelGrid">
            <div>
              <p className="security-diagram__panelSubtitle security-diagram__panelSubtitle--success">
                <LockIcon className="security-diagram__panelSubIcon" /> Security Measures
              </p>
              <ul className="security-diagram__panelList">
                {selectedNode.securityMeasures.map((m, i) => (
                  <li key={i}>• {m}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="security-diagram__panelSubtitle security-diagram__panelSubtitle--danger">
                <AlertTriangleIcon className="security-diagram__panelSubIcon" /> Vulnerabilities
              </p>
              <ul className="security-diagram__panelList">
                {selectedNode.vulnerabilities.map((v, i) => (
                  <li key={i}>• {v}</li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      )}

      {/* Attack path toggle */}
      <button
        onClick={() => setShowAttackPath(!showAttackPath)}
        className={`security-diagram__toggle ${
          showAttackPath ? 'security-diagram__toggle--active' : ''
        }`}
      >
        {showAttackPath ? 'Скрыть путь атаки' : 'Показать атаку'}
      </button>
    </div>
  );
}
