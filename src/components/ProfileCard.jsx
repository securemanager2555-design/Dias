import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldIcon, UserIcon, InfoIcon } from 'lucide-react';

const roles = {
  admin: {
    label: 'Admin',
    description: 'Полный доступ к модулям защиты',
    icon: ShieldIcon,
    accent: 'from-purple-500/20 to-purple-500/10 border-purple-500/40 text-purple-300'
  },
  user: {
    label: 'User',
    description: 'Режим проверки защищенных страниц',
    icon: UserIcon,
    accent: 'from-blue-500/20 to-blue-500/10 border-blue-500/40 text-blue-300'
  }
};

export function ProfileCard() {
  const [role, setRole] = useState('user');
  const currentRole = roles[role];
  const RoleIcon = currentRole.icon;

  return <aside className="fixed right-6 top-6 z-40 hidden w-80 lg:block">
      <div className="glass-strong rounded-2xl p-6 space-y-5 shadow-lg shadow-slate-950/40">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Current Role
            </p>
            <h3 className="text-lg font-semibold text-white">
              Профиль безопасности
            </h3>
          </div>
          <div className="text-xs text-slate-500">
            Secure by Design
          </div>
        </div>

        <motion.button className={`w-full rounded-xl border bg-gradient-to-br p-4 text-left transition ${currentRole.accent}`} onClick={() => setRole(role === 'admin' ? 'user' : 'admin')} whileHover={{
        scale: 1.02
      }} whileTap={{
        scale: 0.98
      }}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-950/40 flex items-center justify-center border border-white/10">
              <RoleIcon className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">{currentRole.label}</p>
              <p className="text-xs text-slate-300">
                {currentRole.description}
              </p>
            </div>
            <span className="text-[10px] uppercase tracking-widest text-slate-400">
              switch
            </span>
          </div>
        </motion.button>

        <div className="glass rounded-xl p-4 text-sm text-slate-300 space-y-2">
          <div className="flex items-center gap-2 text-slate-400 text-xs uppercase tracking-wider">
            <InfoIcon className="w-4 h-4" />
            Зачем это нужно
          </div>
          <p>
            Профиль показывает, какие разделы сайта защищены и какие механизмы
            активны для выбранной роли.
          </p>
        </div>
      </div>
    </aside>;
}
