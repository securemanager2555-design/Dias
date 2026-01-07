import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { LabDashboard } from './components/LabDashboard';
import { ModuleDetail } from './components/ModuleDetail';
import { SidePanel } from './components/SidePanel';
import { owaspModules } from './data/owaspModules';
export function App() {
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(true);
  const selectedModule = selectedModuleId ? owaspModules.find(m => m.id === selectedModuleId) : null;
  return <div className="min-h-screen w-full bg-slate-950">
      {/* Main Dashboard */}
      <LabDashboard onModuleSelect={setSelectedModuleId} />

      {/* Side Panel */}
      <SidePanel isOpen={isSidePanelOpen} onToggle={() => setIsSidePanelOpen(!isSidePanelOpen)} />

      {/* Module Detail Modal */}
      <AnimatePresence>
        {selectedModule && <ModuleDetail module={selectedModule} onClose={() => setSelectedModuleId(null)} />}
      </AnimatePresence>
    </div>;
}