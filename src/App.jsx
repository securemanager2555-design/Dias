import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { LabDashboard } from './components/LabDashboard';
import { ModuleDetail } from './components/ModuleDetail';
import { ProfileCard } from './components/ProfileCard';
import { owaspModules } from './data/owaspModules';
export function App() {
  const [selectedModuleId, setSelectedModuleId] = useState(null);
<<<<<<< HEAD
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(true);
=======
>>>>>>> codex/migrate-project-from-typescript-to-javascript-5zd82n
  const selectedModule = selectedModuleId ? owaspModules.find(m => m.id === selectedModuleId) : null;
  return <div className="min-h-screen w-full bg-slate-950">
      {/* Main Dashboard */}
      <LabDashboard onModuleSelect={setSelectedModuleId} />

      {/* Profile */}
      <ProfileCard />

      {/* Module Detail Modal */}
      <AnimatePresence>
        {selectedModule && <ModuleDetail module={selectedModule} onClose={() => setSelectedModuleId(null)} />}
      </AnimatePresence>
    </div>;
}
