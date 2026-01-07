import React from 'react';
import { AlertTriangleIcon } from 'lucide-react';
import { motion } from 'framer-motion';

export function HandbookSection({ module }) {
  return <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">
          Описание угрозы
        </h3>
        <p className="text-slate-300 leading-relaxed">
          {module.attack.description}
        </p>
      </div>

      <div className="glass rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertTriangleIcon className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-white">
              Реальный ущерб
            </h4>
            <p className="text-sm text-slate-400 mt-1">
              {module.attack.impact}
            </p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-3">
          Attack Flow
        </h3>
        <div className="flex flex-wrap gap-2">
          {module.attack.flow.map((step, i) => <motion.div key={i} className="flex items-center gap-2" initial={{
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
            {i < module.attack.flow.length - 1 && <span className="text-slate-600">→</span>}
          </motion.div>)}
        </div>
      </div>
    </div>;
}
